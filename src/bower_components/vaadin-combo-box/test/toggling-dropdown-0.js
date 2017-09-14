
  describe('toggling the dropdown', function() {
    var combobox;
    var comboboxLight;

    function fire(elm, type) {
      Polymer.Base.fire(type, {}, {
        bubbles: true,
        node: elm
      });
    }

    function tapLabel() {
      fire(combobox.$.label, 'tap');
    }

    function tapInput() {
      fire(combobox.inputElement, 'tap');
    }

    function tapToggleIcon() {
      fire(combobox.$$('paper-input-container #toggleIcon'), 'tap');
    }

    beforeEach(function() {
      combobox = fixture('combobox');
      comboboxLight = fixture('combobox-light');
    });

    describe('opening', function() {
      it('should open asynchronously by tapping label', function(done) {
        expect(combobox.opened).to.be.false;
        tapLabel();

        Polymer.Base.async(function() {
          expect(combobox.opened).to.be.true;
          done();
        }, 1);
      });

      it('should open asynchronously by clicking input', function(done) {
        tapInput();

        expect(combobox.opened).to.be.false;
        Polymer.Base.async(function() {
          expect(combobox.opened).to.be.true;
          done();
        }, 1);
      });

      it('should open by clicking icon', function() {
        tapToggleIcon();

        expect(combobox.opened).to.be.true;
      });

      it('should open on function call', function() {
        combobox.open();

        expect(combobox.opened).to.be.true;
      });

      it('should set body `pointer-events: none` on open and restore initial value on close', function() {
        document.body.style.pointerEvents = 'painted';
        combobox.open();
        expect(getComputedStyle(document.body).pointerEvents).to.be.equal('none');
        expect(getComputedStyle(combobox).pointerEvents).to.be.equal('auto');
        expect(getComputedStyle(combobox.$.overlay).pointerEvents).to.be.equal('auto');
        combobox.close();
        expect(getComputedStyle(document.body).pointerEvents).to.be.equal('painted');
      });

      it('should not close an open popup', function() {
        combobox.open();

        combobox.open();

        expect(combobox.opened).to.be.true;
      });

      it('should be hidden with null items', function() {
        combobox.items = null;

        combobox.open();

        expect(combobox.opened);
        expect(combobox.$.overlay.hidden).to.be.true;
      });

      it('should be hidden with no items', function() {
        combobox.items = [];

        combobox.open();

        expect(combobox.opened);
        expect(combobox.$.overlay.hidden).to.be.true;
      });

      // When using Shadow DOM polyfill, the style scope of the combobox might
      // not get removed from the overlay after it's moved to the body. The
      // following test ensures that the overlay doesn't keep the style scope
      // of the combobox when moved during open.
      it('should not leak combobox style scope to the overlay', function() {
        // Test only when style scope classes are used
        if (combobox.$.overlay.classList.contains('style-scope') &&
            combobox.$.overlay.classList.contains('vaadin-combo-box')) {
          combobox.open();
          Polymer.dom.flush();

          expect(combobox.$.overlay.classList.contains('style-scope')).to.be.false;
          expect(combobox.$.overlay.classList.contains('vaadin-combo-box')).to.be.false;
        }
      });

      describe('after opening', function() {
        beforeEach(function() {
          combobox.open();
        });

        function createMouseDown(preventDefaultSpy) {
          var mouseDownEvent = new CustomEvent('mousedown', {
            bubbles: true,
            cancelable: true
          });
          mouseDownEvent.preventDefault = preventDefaultSpy;
          return mouseDownEvent;
        }

        if (touchDevice) {
          it('should not focus input on dropdown open', function() {
            var focusedInput = Polymer.dom(combobox.root).querySelector('input:focus');
            expect(focusedInput).to.be.null;
          });

          it('should not refocus the input field when closed from icon', function() {
            tapToggleIcon();

            var focusedInput = Polymer.dom(combobox.root).querySelector('input:focus');

            expect(focusedInput).to.be.null;
          });
        } else {
          it('should focus input on dropdown open', function() {
            var focusedInput = Polymer.dom(combobox.root).querySelector('input');
            var activeElement = combobox.root.activeElement || document.activeElement;
            expect(focusedInput.outerHTML).to.equal(activeElement.outerHTML);
            expect(focusedInput).to.equal(combobox.inputElement);
          });

          it('should refocus the input field when closed from icon', function() {
            tapToggleIcon();

            var focusedInput = Polymer.dom(combobox.root).querySelector('input');
            var activeElement = combobox.root.activeElement || document.activeElement;
            expect(focusedInput.outerHTML).to.equal(activeElement.outerHTML);
            expect(focusedInput).to.equal(combobox.inputElement);
          });
        }

        if (!touchDevice) {

          it('should prevent default on overlay mousedown', function() {
            var preventDefaultSpy = sinon.spy();
            combobox.$.overlay.dispatchEvent(createMouseDown(preventDefaultSpy));

            expect(preventDefaultSpy).to.have.been.called;
          });

          it('should prevent default on overlay mousedown (vaadin-combo-box-light)', function() {
            var preventDefaultSpy = sinon.spy();
            comboboxLight.open();
            comboboxLight.$.overlay.dispatchEvent(createMouseDown(preventDefaultSpy));

            expect(preventDefaultSpy).to.have.been.called;
          });
        }
      });
    });

    describe('closing', function() {
      if (touchDevice) {
        it('should close popup when tapping outside overlay', function() {
          combobox.open();

          Polymer.Base.fire('tap', {}, {
            bubbles: true,
            node: document.body
          });

          expect(combobox.opened).to.be.false;
        });
      } else {
        it('should close popup when clicking outside overlay', function() {
          combobox.open();

          document.body.click();

          expect(combobox.opened).to.be.false;
        });
      }

      it('should not close when tapping on the overlay', function() {
        combobox.open();

        combobox.$.overlay.fire('tap');

        expect(combobox.opened).to.be.true;
      });

      it('should not close popup when clicking on any overlay children', function() {
        combobox.open();

        combobox.$.overlay.$.scroller.click();

        expect(combobox.opened).to.be.true;
      });

      it('should close on clicking icon', function() {
        combobox.open();

        tapToggleIcon();

        expect(combobox.opened).to.be.false;
      });

      it('should close the overlay when focus is lost', function() {
        combobox.open();

        fire(combobox.inputElement, 'blur');

        expect(combobox.opened).to.equal(false);
      });

      // When using Shadow DOM polyfill, the style scope of the combobox might
      // not get added to the overlay after it's moved back to the combobox.
      // The following test ensures that the overlay doesn't keep the style
      // scope of the combobox when moved during close.
      it('should add combobox style scope to the overlay', function() {
        // Test only when style scope classes are used
        if (combobox.$.overlay.classList.contains('style-scope') &&
            combobox.$.overlay.classList.contains('vaadin-combo-box')) {
          combobox.open();

          combobox.close();

          Polymer.dom.flush();
          expect(combobox.$.overlay.classList.contains('style-scope')).to.be.true;
          expect(combobox.$.overlay.classList.contains('vaadin-combo-box')).to.be.true;
        }
      });

    });

    describe('disabled', function() {

      beforeEach(function() {
        combobox.disabled = true;
      });

      it('toggleIcon should be hidden when disabled', function() {
        expect(getComputedStyle(combobox.$.toggleIcon).display).to.equal('none');
      });

      it('clearIcon should be hidden when disabled', function() {
        expect(getComputedStyle(combobox.$.clearIcon).display).to.equal('none');
      });

      it('dropdown should not be shown when disabled', function() {
        combobox.inputElement.dispatchEvent(new CustomEvent('tap'));
        expect(combobox.opened).to.be.false;
      });
    });

    describe('read-only', function() {

      beforeEach(function() {
        combobox.readonly = true;
      });

      it('toggleIcon should be hidden when read-only', function() {
        expect(getComputedStyle(combobox.$.toggleIcon).display).to.equal('none');
      });

      it('clearIcon should be hidden when read-only', function() {
        expect(getComputedStyle(combobox.$.clearIcon).display).to.equal('none');
      });

      it('dropdown should not be shown when read-only', function() {
        combobox.inputElement.dispatchEvent(new CustomEvent('tap'));
        expect(combobox.opened).to.be.false;
      });
    });
  });



  describe('Accessible Rich Internet Applications (ARIA)', function() {
    var comboBox;

    function getInput() {
      return comboBox.inputElement;
    }
    function getToggleIcon() {
      return comboBox.$.toggleIcon;
    }
    function getClearIcon() {
      return comboBox.$.clearIcon;
    }
    function getItemElement(i) {
      return comboBox.$.overlay.$.selector.querySelectorAll('vaadin-combo-box-item')[i];
    }

    function arrowDown() {
      MockInteractions.keyDownOn(getInput(), 40);
    }
    function esc() {
      MockInteractions.keyDownOn(getInput(), 27);
    }

    beforeEach(function() {
      comboBox = fixture('combobox');
      comboBox.items = ['foo', 'bar', 'baz'];
    });

    afterEach(function() {
      comboBox.opened = false;
    });

    describe('when combo-box is attached', function() {
      it('should contain appropriate aria attributes', function() {
        expect(getInput().getAttribute('role')).to.equal('combobox');
        expect(getInput().getAttribute('aria-label')).to.equal('my label');
        expect(getInput().getAttribute('aria-autocomplete')).to.equal('list');
        expect(getToggleIcon().getAttribute('role')).to.equal('button');
        expect(getToggleIcon().getAttribute('aria-label')).to.equal('Toggle');
        expect(getClearIcon().getAttribute('role')).to.equal('button');
        expect(getClearIcon().getAttribute('aria-label')).to.equal('Clear');
      });
    });

    describe('when overlay opens or close', function() {
      beforeEach(function() {
        arrowDown();
      });

      it('iron-list should have role listbox', function() {
        expect(comboBox.$.overlay.$.selector.getAttribute('role')).to.equal('listbox');
      });

      it('should set aria-expanded attribute when opened', function() {
        expect(getInput().getAttribute('aria-expanded')).to.equal('true');
        expect(getToggleIcon().getAttribute('aria-expanded')).to.equal('true');
      });

      it('should unset aria-expanded attribute when closed', function() {
        esc();

        expect(getInput().getAttribute('aria-expanded')).to.equal('false');
        expect(getToggleIcon().getAttribute('aria-expanded')).to.equal('false');
      });
    });

    describe('navigating the items', function() {
      beforeEach(function() {
        arrowDown();
      });

      afterEach(function(done) {
        // IE11 randomly breaks during the teardown process when
        // fixture.restore() is called, most likely because the arrowDown()
        // functions are still partly running.
        // Delaying the teardown by a micro task seems to help.
        comboBox.async(done);
      });

      it('should set selection aria attributes when focusing an item', function() {
        comboBox.value = 'foo';
        arrowDown(); // 'focus moves to 2nd item'

        expect(getItemElement(0).getAttribute('role')).to.equal('option');
        expect(getItemElement(0).getAttribute('aria-selected')).to.equal('false');
        expect(getItemElement(1).getAttribute('aria-selected')).to.equal('true');
      });
    });

  });

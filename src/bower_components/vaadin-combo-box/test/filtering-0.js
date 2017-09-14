
  describe('filtering items', function() {
    var comboBox;

    function getFilteredItems() {
      return comboBox.$.overlay._items;
    }

    function setInputValue(value) {
      comboBox.inputElement.value = value;
      comboBox.inputElement.dispatchEvent(new CustomEvent('input'));
    }

    function getInputValue() {
      return comboBox.inputElement.value;
    }

    beforeEach(function() {
      comboBox = fixture('combobox');
      comboBox.items = ['foo', 'bar', 'baz'];

      // make iron-input pick up child input
      if (comboBox._bindableInput._initSlottedInput) {
        comboBox._bindableInput._initSlottedInput();
      }
    });

    describe('setting the input field value', function() {
      it('should open the popup if closed', function() {
        comboBox.close();

        setInputValue('foo');

        expect(comboBox.opened).to.equal(true);
      });

      it('should open the popup when input field is cleared', function() {
        comboBox.value = 'foo';
        comboBox.close();
        expect(comboBox.opened).to.equal(false);

        setInputValue('');

        expect(comboBox.opened).to.equal(true);
      });

      it('should not change the value of the combobox', function() {
        comboBox.value = 'foo';
        setInputValue('bar');
        expect(comboBox.value).to.equal('foo');
      });

      it('should set the combobox value when closing', function() {
        comboBox.value = 'foo';
        setInputValue('bar');

        comboBox.close();

        expect(comboBox.value).to.equal('bar');
      });

      it('should set the combobox value when closing case insensitively', function() {
        comboBox.value = 'foo';
        setInputValue('BAR');

        comboBox.close();

        expect(comboBox.value).to.equal('bar');
      });

      it('should be reverted to the combobox value when cancelled', function() {
        comboBox.value = 'foo';

        setInputValue('b');
        comboBox.cancel();

        expect(getInputValue()).to.equal('foo');
      });

      it('should be revert to the combobox value when selecting the same value', function() {
        comboBox.value = 'foo';

        setInputValue('FOO');
        comboBox.close();

        expect(getInputValue()).to.equal('foo');
      });
    });

    describe('focusing items while filtering', function() {
      it('should focus on an exact match', function() {
        setInputValue('bar');

        expect(comboBox._focusedIndex).to.eql(0);
      });

      it('should not scroll to selected value when filtering', function(done) {
        comboBox.value = 'baz';

        var spy = sinon.spy(comboBox.$.overlay, '_scrollIntoView');

        setInputValue('ba');
        setInputValue('b');

        // first scroll after open is async
        comboBox.async(function() {
          expect(spy.callCount).to.eql(1); // scrolls once on open
          done();
        });
      });
    });

    describe('filtering items', function() {
      it('should filter items using contains', function() {
        setInputValue('a');

        expect(getFilteredItems()).to.eql(['bar', 'baz']);
      });

      it('should filter out all items with a invalid filter', function() {
        setInputValue('qux');

        expect(getFilteredItems()).to.be.empty;
      });

      it('should be reset after closing the dropdown', function() {
        setInputValue('foo');

        comboBox.close();

        expect(comboBox.filter).to.be.empty;
      });

      it('should filter boolean', function() {
        comboBox.items = [true, false];

        setInputValue('t');

        expect(getFilteredItems()).to.eql([true]);
      });

      it('should show initial selection', function() {
        comboBox.value = 'foo';
        comboBox.open();

        expect(comboBox.$.overlay._selectedItem).to.eql('foo');
      });

      it('should not lose the selected value', function() {
        comboBox.value = 'foo';
        setInputValue('bar');

        expect(comboBox.$.overlay._selectedItem).to.eql('foo');
      });

      it('should ignore case', function() {
        setInputValue('FOO');

        expect(getFilteredItems()).to.eql(['foo']);
      });

      it('should focus filtered items on match case insensitively', function() {
        setInputValue('BA');

        expect(comboBox._focusedIndex).to.equal(-1);

        setInputValue('BAR');

        expect(comboBox._focusedIndex).to.equal(0);
      });

      it('should reset focus when filter changes', function() {
        setInputValue('BAR');
        setInputValue('BA');

        expect(comboBox._focusedIndex).to.equal(-1);
      });

      it('should not filter with a null filter', function() {
        setInputValue(null);

        expect(getFilteredItems()).to.eql(['foo', 'bar', 'baz']);
      });

      it('should not throw an error when items arent set', function() {
        comboBox.items = null;

        setInputValue('foo');

        expect(getFilteredItems()).to.be.null;
      });

      it('should hide overlay when filtered items length is 0', function() {
        setInputValue('THIS IS NOT FOUND');

        expect(comboBox.opened && comboBox.$.overlay.hidden).to.be.true;
      });
    });

    describe('external filtering', function() {
      beforeEach(function() {
        comboBox.items = undefined;
        comboBox.filteredItems = ['foo', 'bar', 'baz'];
      });

      it('should set items to filteredItems', function() {
        comboBox.items = ['foo'];

        expect(comboBox.filteredItems).to.eql(['foo']);
      });

      it('should not filter items', function() {
        setInputValue('foo');

        expect(getFilteredItems()).to.eql(['foo', 'bar', 'baz']);
      });

      it('should remove focus while loading', function() {
        setInputValue('foo');
        comboBox.filteredItems = ['foo'];
        expect(comboBox._focusedIndex).to.eql(0);

        comboBox.loading = true;

        expect(comboBox._focusedIndex).to.eql(-1);
      });

      it('should focus on filtered value', function() {
        setInputValue('bar');
        expect(comboBox._focusedIndex).to.eql(-1);

        comboBox.filteredItems = ['foo', 'bar', 'baz'];

        expect(comboBox._focusedIndex).to.eql(1);
      });

      it('should focus on value when filter is empty', function() {
        comboBox.value = 'bar';

        comboBox.filteredItems = ['foo', 'bar', 'baz'];

        expect(comboBox._focusedIndex).to.eql(1);
      });

      it('should not hide the overlay while loading', function() {
        setInputValue('foo');

        comboBox.loading = true;

        expect(comboBox.opened).to.be.true;
        expect(comboBox.$.overlay.hidden).to.be.false;
      });

      it('should not show the overlay while closed and loading', function() {
        comboBox.opened = false;

        comboBox.loading = true;

        expect(window.getComputedStyle(comboBox.$.overlay).display).to.eql('none');
      });

      it('should hide the scroller while loading', function() {
        setInputValue('foo');

        comboBox.loading = true;

        expect(comboBox.opened).to.be.true;
        expect(comboBox.$.overlay.$.scroller.hidden).to.be.true;
      });

      it('should refresh items after reassignment', function() {
        comboBox.filteredItems = ['foo'];

        expect(getFilteredItems()).to.eql(['foo']);
      });
    });
  });

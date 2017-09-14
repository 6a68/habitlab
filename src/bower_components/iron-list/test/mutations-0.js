void(0)

    suite('mutations to the collection of items', function() {
      var list, container;

      setup(function() {
        container = fixture('trivialList');
        list = container.list;
      });

      test('update physical item', function() {
        var setSize = 100;
        var phrase = 'It works!';

        list.items = buildDataSet(setSize);
        list.set('items.0.index', phrase);
        PolymerFlush();
        assert.equal(getFirstItemFromList(list).textContent, phrase);
      });

      test('update virtual item', function(done) {
        var setSize = 100;
        var phrase = 'It works!';

        list.items = buildDataSet(setSize);

        function scrollBackUp() {
          simulateScroll({
            list: list,
            contribution: 200,
            target: 0,
            onScrollEnd: function() {
             assert.isTrue(getFirstItemFromList(list).textContent.indexOf(phrase) >= 0);
             done();
            }
          });
        }

        PolymerFlush();
        var rowHeight = getFirstItemFromList(list).offsetHeight;
        // scroll down
        simulateScroll({
          list: list,
          contribution: 200,
          target: setSize*rowHeight,
          onScrollEnd: function() {
            list.set('items.0.index', phrase);
            scrollBackUp();
          }
        });
      });

      test('push', function(done) {
        var setSize = 100;
        list.items = buildDataSet(setSize);
        setSize = list.items.length;
        list.push('items', buildItem(setSize));
        assert.equal(list.items.length, setSize + 1);

        PolymerFlush();

        var rowHeight = list._physicalItems[0].offsetHeight;
        var viewportHeight = list.offsetHeight;
        var itemsPerViewport = Math.floor(viewportHeight/rowHeight);

        assert.equal(getFirstItemFromList(list).textContent, 0);

        simulateScroll({
          list: list,
          contribution: 200,
          target: list.items.length*rowHeight,
          onScrollEnd: function() {
            assert.equal(getFirstItemFromList(list).textContent,
              list.items.length - itemsPerViewport);
            done();
          }
        });
      });

      test('push and scroll to bottom', function() {
        list.items = [buildItem(0)];

        PolymerFlush();
        var rowHeight = getFirstItemFromList(list).offsetHeight;
        var viewportHeight = list.offsetHeight;
        var itemsPerViewport = Math.floor(viewportHeight/rowHeight);

        while (list.items.length < 200) {
          list.push('items', buildItem(list.items.length));
        }

        list.scrollToIndex(list.items.length - 1);
        PolymerFlush();
        assert.isTrue(isFullOfItems(list));
        assert.equal(getFirstItemFromList(list).textContent.trim(),
            list.items.length - itemsPerViewport);
      });

      test('pop', function(done) {
        var setSize = 100;
        list.items = buildDataSet(setSize);
        PolymerFlush();
        var rowHeight = getFirstItemFromList(list).offsetHeight;
        simulateScroll({
          list: list,
          contribution: 200,
          target: setSize*rowHeight,
          onScrollEnd: function() {
            var viewportHeight = list.offsetHeight;
            var itemsPerViewport = Math.floor(viewportHeight/rowHeight);
            list.pop('items');
            PolymerFlush();
            assert.equal(list.items.length, setSize-1);
            assert.equal(getFirstItemFromList(list).textContent, setSize - 3 - 1);
            done();
          }
        });
      });

      test('splice', function() {
        var setSize = 45;
        var phrase = 'It works!'
        list.items = buildDataSet(setSize);
        list.splice('items', 0, setSize, buildItem(phrase));
        PolymerFlush();
        assert.equal(list.items.length, 1);
        assert.equal(getFirstItemFromList(list).textContent, phrase);
      });

      test('delete item and scroll to bottom', function() {
        var setSize = 100, index;
        list.items = buildDataSet(setSize);
        while (list.items.length > 10) {
          index = parseInt(list.items.length * Math.random());
          list.arrayDelete('items',  list.items[index]);
          list.scrollToIndex(list.items.length - 1);
          PolymerFlush();
          assert.isTrue(/^[0-9]*$/.test(getFirstItemFromList(list).textContent));
        }
      });

      test('Issue #389: delete some items from the top and scroll back to the top', function(done) {
        list.items = buildDataSet(64);
        Polymer.dom.flush();
        list.scrollToIndex(63);

        for (var i = 0; i < 16; i++ ) {
          list.shift('items');
        }
        Polymer.dom.flush();
        list.scroll(0, 100);
        requestAnimationFrame(function() {
          setTimeout(function() {
            assert.equal(list.firstVisibleIndex, 1);
            done();
          });
        });
      });

      test('Issue #389: delete some items from the top and scroll to index', function(done) {
        list.items = buildDataSet(64);
        Polymer.dom.flush();
        list.scrollToIndex(63);
        for (var i = 0; i < 16; i++ ) {
          list.shift('items');
        }
        Polymer.dom.flush();
        list.scrollToIndex(1);
        requestAnimationFrame(function() {
          setTimeout(function() {
            assert.equal(list.firstVisibleIndex, 1);
            done();
          });
        });
      });

      test('reassign items', function(done) {
        list.items = buildDataSet(100);
        container.itemHeight = 'auto';
        PolymerFlush();
        var itemHeight = getFirstItemFromList(list).offsetHeight;
        var hasRepeatedItems = checkRepeatedItems(list);

        simulateScroll({
          list: list,
          contribution: 200,
          target: itemHeight * list.items.length,
          onScrollEnd: function() {
            list.items = list.items.slice(0);
            // NOTE(keanulee): you shouldn't need to call Polymer.flush() here (#475).
            requestAnimationFrame(function() {
              assert.equal(getFirstItemFromList(list).textContent, '0');

              simulateScroll({
                list: list,
                contribution: itemHeight,
                target: itemHeight * list.items.length,
                onScroll: function() {
                  assert.isFalse(hasRepeatedItems(), 'List should not have repeated items');
                },
                onScrollEnd: done
              });
            });
          }
        });
      });

      test('Issue #468: forwardItemPath updates correct item', function(done) {
        list.items = buildDataSet(100);
        container.itemHeight = 'auto';
        PolymerFlush();
        var itemHeight = getFirstItemFromList(list).offsetHeight;
        var hasRepeatedItems = checkRepeatedItems(list);

        simulateScroll({
          list: list,
          target: itemHeight * 40,
          onScrollEnd: function() {
            assert.doesNotThrow(function() {
              list.set('items.43.index', '43a');
            });
            done();
          }
        });
      });

      test('Issue #463: scroller size is updated', function() {
        list.items = buildDataSet(2);
        PolymerFlush();

        assert.equal(list.$.items.style.height, '200px');

        list.items = buildDataSet(7);
        PolymerFlush();

        assert.equal(list.$.items.style.height, '700px');

        list.items = buildDataSet(11);
        PolymerFlush();

        assert.equal(list.$.items.style.height, '1100px');
      });

      test('empty items array', function() {
        list.items = buildDataSet(100);
        PolymerFlush();
        assert.equal(getFirstItemFromList(list).textContent, '0');
        list.items = [];
        PolymerFlush();
        assert.notEqual(getFirstItemFromList(list).textContent, '0');
      });

      test('should notify path to the right physical item', function() {
        list.items = buildDataSet(100);
        PolymerFlush();
        var idx = list._physicalCount + 1;
        list.scrollToIndex(idx);
        PolymerFlush();
        list.notifyPath('items.1.index', 'bad');
        assert.equal(getFirstItemFromList(list).textContent, idx);
      });

      test('should update items off the screen', function() {
        container.listHeight = 50;
        list.items = buildDataSet(100);
        PolymerFlush();
        list.scrollToIndex(40);
        PolymerFlush();
        container.listHeight = 300;
        container.fire('iron-resize');
        PolymerFlush();
        list._didFocus({target: list._physicalItems[list._getPhysicalIndex(40)]});
        list.scrollToIndex(80);
        PolymerFlush();
        list.set('items.40.index', 'correct');
        list.scrollToIndex(40);
        PolymerFlush();
        assert.equal(getFirstItemFromList(list).textContent, 'correct');
      });
    });

    suite('mutableData', function() {
      var container, list;

      setup(function() {
        container = fixture('mutableList');
        list = container.list;
      });

      test('should not use dirty checking if mutableData is true', function() {
        /**
         * This feature and Polymer.OptionalMutableDataBehavior is only available
         * with Polymer 2.0. 
         */
        if (!Polymer.OptionalMutableDataBehavior.properties) {
          return;
        }

        list.items = buildDataSet(100);
        PolymerFlush();

        assert.equal(getFirstItemFromList(list).textContent, '0');

        var phrase = 'It works!';
        list.items[0].index = phrase;
        list.items = list.items;
        PolymerFlush();

        assert.equal(getFirstItemFromList(list).textContent, phrase);
      });
    });

    suite('mutations of primitive type items', function() {
      var container, list;

      setup(function() {
        container = fixture('trivialListPrimitiveItem');
        list = container.list;
      });

      test('push item = polymer', function() {
        list.items = [];
        list.push('items', 'polymer');
        PolymerFlush();
        assert.equal(getFirstItemFromList(list).textContent, 'polymer');
      });

      test('push item = 0', function() {
        list.items = [];
        list.push('items', 0);
        PolymerFlush();
        assert.equal(getFirstItemFromList(list).textContent, '0');
      });

      test('push item = false', function() {
        list.items = [];
        list.push('items', false);
        PolymerFlush();
        assert.equal(getFirstItemFromList(list).textContent, 'false');
      });
    });

  
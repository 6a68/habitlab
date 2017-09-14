
    function afterNextRenderAll(elements, callback) {
      var renderedCount = 0;

      function elementRendered() {
        renderedCount++;
        if (renderedCount === elements.length) {
          callback();
        }
      }

      elements.forEach(function(element) {
        Polymer.RenderStatus.afterNextRender(element, elementRendered);
      });
    }

    suite('defaults', function() {
      var c1;

      setup(function() {
        c1 = fixture('NoLabel');
      });

      test('check checkbox via click', function(done) {
        c1.addEventListener('click', function() {
          assert.isTrue(c1.getAttribute('aria-checked') == 'true');
          assert.isTrue(c1.checked);
          done();
        });
        MockInteractions.tap(c1);
      });

      test('toggle checkbox via click', function(done) {
        c1.checked = true;
        c1.addEventListener('click', function() {
          assert.isFalse(c1.getAttribute('aria-checked') != 'false');
          assert.isFalse(c1.checked);
          done();
        });
        MockInteractions.tap(c1);
      });

      test('disabled checkbox cannot be clicked', function(done) {
        c1.disabled = true;
        c1.checked = true;
        MockInteractions.tap(c1);
        setTimeout(function() {
          assert.isTrue(c1.getAttribute('aria-checked') == 'true');
          assert.isTrue(c1.checked);
          done();
        }, 1);
      });

      test('checkbox can be validated', function() {
        c1.required = true;
        assert.isFalse(c1.validate());

        c1.checked = true;
        assert.isTrue(c1.validate());
      });

      test('disabled checkbox is always valid', function() {
        c1.disabled = true;
        c1.required = true;
        assert.isTrue(c1.validate());

        c1.checked = true;
        assert.isTrue(c1.validate());
      });

      test('checkbox can check sizes', function(done) {
        var checkboxes = fixture('WithDifferentSizes');
        // Wait for all checkboxes to set their default ink sizes, if any.
        // See polymer#4009 for more details.
        afterNextRenderAll(checkboxes, function() {
          var normal = checkboxes[0].getBoundingClientRect();
          var giant = checkboxes[1].getBoundingClientRect();
          var tiny = checkboxes[2].getBoundingClientRect();

          assert.isTrue(5 === tiny.height);
          assert.isTrue(tiny.height < normal.height);
          assert.isTrue(normal.height < giant.height);
          assert.isTrue(giant.height <= 50);

          assert.isTrue(5 === tiny.width);
          assert.isTrue(tiny.width < normal.width);
          assert.isTrue(normal.width < giant.width);
          assert.isTrue(giant.width === 50);
          done();
        });
      });

      suite('checkbox line-height', function() {
        var large;
        var small;

        setup(function() {
          var checkboxes = fixture('WithLineHeight');
          large = checkboxes[0];
          small = checkboxes[1];
        });

        test('checkboxes with >1 line-height have an equal height', function() {
          var largeRect = large.getBoundingClientRect();
          var largeStyle = getComputedStyle(large);

          assert.isTrue(largeRect.height === 3 * parseFloat(largeStyle.fontSize));
        });

        test('checkbox with <1 line-height are at least 1em tall', function() {
          var smallRect = small.getBoundingClientRect();
          var smallStyle = getComputedStyle(small);

          assert.isTrue(smallRect.height >= 1 * parseFloat(smallStyle.fontSize));
        });
      });

      suite('ink size', function() {
        function cssLengthToPx(cssLengthText) {
          var div = document.createElement('div');
          div.style.width = cssLengthText;
          document.body.appendChild(div);
          var lengthPx = div.getBoundingClientRect().width;
          document.body.removeChild(div);
          return lengthPx;
        }

        var checkboxes;

        setup(function(done) {
          checkboxes = fixture('WithDifferentSizes2');
          // Wait for all checkboxes to set their default ink sizes, if any.
          // See polymer#4009 for more details.
          afterNextRenderAll(checkboxes, done);
        });

        test('`--paper-checkbox-ink-size` sets the ink size', function() {
          var checkbox = fixture('CustomInkSize');
          assert.equal(checkbox.getComputedStyleValue('--calculated-paper-checkbox-size').trim(), '25px');
          assert.equal(checkbox.getComputedStyleValue('--calculated-paper-checkbox-ink-size').trim(), '30px');
        });

        test('ink sizes are near (8/3 * checkbox size) by default', function() {
          checkboxes.forEach(function(checkbox) {
            var size = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-size'));
            var inkSize = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-ink-size'));
            assert.approximately(inkSize / size, 8 / 3, 0.1);
          });
        });

        test('ink sizes are near (8/3 * checkbox size) when using non-px sizes', function(done) {
          var checkboxes = fixture('WithNonPxSizes');
          afterNextRenderAll(checkboxes, function() {
            checkboxes.forEach(function(checkbox) {
              var size = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-size'));
              var inkSize = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-ink-size'));
              assert.approximately(inkSize / size, 8 / 3, 0.1);
            });
            done();
          });
        });

        test('ink sizes are integers', function() {
          checkboxes.forEach(function(checkbox) {
            var inkSize = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-ink-size'));
            assert.equal(inkSize, Math.floor(inkSize));
          });
        });

        test('ink size parity matches checkbox size parity (centers are aligned)', function() {
          checkboxes.forEach(function(checkbox) {
            var size = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-size'));
            var inkSize = cssLengthToPx(checkbox.getComputedStyleValue('--calculated-paper-checkbox-ink-size'));
            assert.equal(size % 2, inkSize % 2);
          });
        });
      });
    });

    suite('a11y', function() {
      var c1;
      var c2;

      setup(function() {
        c1 = fixture('NoLabel');
        c2 = fixture('WithLabel');
      });

      test('has aria role "checkbox"', function() {
        assert.isTrue(c1.getAttribute('role') == 'checkbox');
        assert.isTrue(c2.getAttribute('role') == 'checkbox');
      });

      test('checkbox with no label has no aria label', function() {
        assert.isTrue(!c1.getAttribute('aria-label'));
      });

      test('checkbox respects the user set aria-label', function() {
        var c = fixture('AriaLabel');
        assert.isTrue(c.getAttribute('aria-label') == "Batman");
      });

      a11ySuite('NoLabel');
      a11ySuite('WithLabel');
      a11ySuite('AriaLabel');
    });
  
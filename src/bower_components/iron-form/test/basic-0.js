
    suite('serialization', function() {
      var f;
      var server;

      suiteSetup(function () {
        Polymer({is: 'x-input-wrapper'});
      });

      setup(function() {
        f = fixture('serialization');

        server = sinon.fakeServer.create();
        server.respondWith(
          'GET',
          /\/get.*/,
          [
            200,
            '{"Content-Type":"application/json"}',
            '{"success":true}'
          ]
        );
      });

      teardown(function() {
        server.restore();
      });

      test('serializes native checkboxes', function(done) {
        var form = f.querySelector('#native-checkboxes');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?check1=on&check1=2&check2=3');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes native radio buttons', function(done) {
        var form = f.querySelector('#native-radios');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?radio1=on&radio2=3');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes native buttons', function(done) {
        var form = f.querySelector('#native-buttons');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes native selects', function(done) {
        var form = f.querySelector('#native-selects');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?select1=1&select1=2&select2=1');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes native inputs', function(done) {
        var form = f.querySelector('#native-inputs');

        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?input1=&input1=foo&input1=zag&input2=bar&pass1=pass&number1=35&empty=&empty=');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes empty native inputs', function(done) {
        var form = f.querySelector('#native-inputs-empty');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?input1=');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes custom checkboxes', function(done) {
        var form = f.querySelector('#custom-checkboxes');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?check1=on&check1=2&check2=3');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes custom inputs', function(done) {
        var form = f.querySelector('#custom-inputs');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?input1=&input1=foo&input1=zag&input2=bar&pass1=pass&number1=35&empty=&empty=&check_wrapped=foo');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes elements deeply nested in divs', function(done) {
        var form = f.querySelector('#nested-elements');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?input1=i1&paper-input1=p1&input2=i2&paper-input2=p2');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });
        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('serializes elements with duplicate names', function(done) {
        var form = f.querySelector('#duplicate-names');
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?input1=&input1=foo&input1=&input1=bar&empty=&empty=&empty=&empty=');
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });
        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });
    });


    suite('validation', function() {
      var f;
      var server;

      setup(function() {
        f = fixture('validation');

        server = sinon.fakeServer.create();
        server.respondWith(
          'GET',
          /\/get.*/,
          [
            200,
            '{"Content-Type":"application/json"}',
            '{"success":true}'
          ]
        );
      });

      teardown(function() {
        server.restore();
      });

      test('fires iron-form-invalid if it can\'t submit', function(done) {
        var form = f.querySelector('#mixed-invalid');
        form.addEventListener('iron-form-invalid', function(event) {
          expect(form.validate()).to.be.equal(false);
          done();
        });
        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          expect(form.validate()).to.be.equal(false);
          form.submit();
          server.respond();
        });
      });

      test('<input required> is validated and does not submit the form', function(done) {
        var form = f.querySelector('#native-required');

        var responses = 0;
        form.addEventListener('iron-form-response', function(event) {
          responses++;
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          expect(form.validate()).to.be.equal(false);
          form.submit();
          server.respond();
        });

        setTimeout(function() {
          expect(responses).to.be.equal(0);
          done();
        },  200);
      });

      test('invalid <input> but not required is validated and does not submit the form', function(done) {
        var form = f.querySelector('#native-invalid');

        var responses = 0;
        form.addEventListener('iron-form-response', function(event) {
          responses++;
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          expect(form.validate()).to.be.equal(false);
          form.submit();
          server.respond();
        });

        setTimeout(function() {
          expect(responses).to.be.equal(0);
          done();
        },  200);
      });

      test('<paper-input required> is validated and does not submit the form', function(done) {
        var form = f.querySelector('#custom-required');

        var responses = 0;
        form.addEventListener('iron-form-response', function(event) {
          responses++;
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.validate();
          expect(form.validate()).to.be.equal(false);
          form.submit();
          server.respond();
        });

        setTimeout(function() {
          expect(responses).to.be.equal(0);
          done();
        },  200);
      });

      test('invalid <paper-input> but not required is validated and does not submit the form', function(done) {
        var form = f.querySelector('#custom-invalid');

        var responses = 0;
        form.addEventListener('iron-form-response', function(event) {
          responses++;
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          expect(form.validate()).to.be.equal(false);
          form.submit();
          server.respond();
        });

        setTimeout(function() {
          expect(responses).to.be.equal(0);
          done();
        },  200);
      });
    });

    suite('submission', function() {
      var form;
      var server;

      setup(function() {
        form = fixture('submission');

        server = sinon.fakeServer.create();
        server.respondWith(
          'GET',
          /\/get.*/,
          [
            200,
            '{"Content-Type":"application/json"}',
            '{"success":true}'
          ]
        );
        server.respondWith(
          'POST',
          /\/post.*/,
          [
            200,
            '{"Content-Type":"application/json"}',
            '{"success":true}'
          ]
        );
        server.respondWith(
          'GET',
          /\/error.*/,
          [
            404,
            '{"Content-Type":"application/text"}',
            '{"success":false}'
          ]
        );
      });

      teardown(function() {
        server.restore();
      });

      test('calling submit() on a form with method=get', function(done) {
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('calling submit() on a form with method=post', function(done) {
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form._form.setAttribute('method', 'POST');
          form._form.setAttribute('action', '/post');
          form.submit();
          server.respond();
        });
      });

      test('calling submit() on a form with method unset', function(done) {
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form._form.removeAttribute('method');
          form.submit();
          server.respond();
        });
      });

      test('pressing an <input type=submit> submits the form', function(done) {
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form._form.querySelector('input[type=submit]').click();
          server.respond();
        });
      });

      test('pressing an <input type=button> with an event handler submits the form', function(done) {
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          var button = form._form.querySelector('input[type=button]');
          button.addEventListener('click', function() {
            form.submit();
          });
          button.click();

          server.respond();
        });
      });

      test('pressing a paper-button with an event handler submits the form', function(done) {
        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          var button = form._form.querySelector('paper-button');
          button.addEventListener('click', function() {
            form.submit();
          });
          button.click();

          server.respond();
        });
      });

      test('can modify the request in the presubmit', function(done) {
        var submitted = false;
        var presubmitted = false;

        form.addEventListener('iron-form-submit', function() {
          submitted = true;
        });
        form.addEventListener('iron-form-presubmit', function() {
          presubmitted = true;
          this.request.params = {batman: true};
        });

        form.addEventListener('iron-form-response', function(event) {
          expect(submitted).to.be.equal(true);
          expect(presubmitted).to.be.equal(true);

          // We have changed the json parameters
          expect(event.detail.url).to.contain('batman=true');

          var response = event.detail.response;
          expect(response).to.be.ok;
          expect(response).to.be.an('object');
          expect(response.success).to.be.equal(true);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
          server.respond();
        });
      });

      test('can do a custom submission in the presubmit', function(done) {
        var presubmitted = false;
        // Since we are not using the normal form submission, these events should
        // never be called.
        var formResponseHandler = sinon.spy();
        form.addEventListener('iron-form-response', formResponseHandler);
        var formSubmitHandler = sinon.spy();
        form.addEventListener('iron-form-submit', formSubmitHandler);

        form.addEventListener('iron-form-presubmit', function(event) {
          presubmitted = true;
          event.preventDefault();
          // Your custom submission logic could go here (like using Firebase).
          // In this case, fire a custom event as a an example.
          this.fire('custom-form-submit');
        });
        form.addEventListener('custom-form-submit', function(event) {
          expect(presubmitted).to.be.equal(true);
          expect(formResponseHandler.callCount).to.be.equal(0);
          expect(formSubmitHandler.callCount).to.be.equal(0);
          done();
        });
        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form.submit();
        });
      });

      test('can relay errors', function(done) {
        form.addEventListener('iron-form-error', function(event) {
          var error = event.detail;
          expect(error).to.be.ok;
          expect(error).to.be.an('object');
          expect(error.error).to.be.ok;
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          form._form.setAttribute('action', '/error');
          form.submit();
          server.respond();
        });
      });
    });

    suite('resetting', function() {
      test('can reset a form', function(done) {
        var form = fixture('resetting');

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          var initial = form.serializeForm();
          expect(JSON.stringify(initial)).to.be.equal('{"input1":"input1","input2":"","check1":"on","radio1":"on","papercheck1":"on","paper1":"paper1","paper2":""}');

          // Modify all the values, flip all the inputs.
          document.getElementById('input1').value = 'input1++';
          document.getElementById('input2').value = 'input2++';
          document.getElementById('check1').checked = false;
          document.getElementById('check2').checked = true;
          document.getElementById('radio1').checked = false;
          document.getElementById('radio2').checked = true;
          document.getElementById('papercheck1').checked = false;
          document.getElementById('papercheck2').checked = true;
          document.getElementById('paper1').value = 'paper1++';
          document.getElementById('paper2').value = 'paper2++';

          var updated = form.serializeForm();
          expect(JSON.stringify(updated)).to.not.be.equal(initial);
          form.reset();
          var final = form.serializeForm();
          expect(JSON.stringify(initial)).to.be.equal(JSON.stringify(final));
          done();
        });
      });
    });

    suite('dynamically created', function() {
      var server;

      setup(function() {
        server = sinon.fakeServer.create();
        server.respondWith(
          'GET',
          /\/get.*/,
          [
            200,
            '{"Content-Type":"application/json"}',
            '{"success":true}'
          ]
        );
      });

      teardown(function() {
        server.restore();
      });

      test('submits a form', function(done) {
        var form = document.createElement('iron-form');
        // Need to add to the document so observeNodes runs.
        document.body.appendChild(form);

        var nativeForm = document.createElement('form');
        nativeForm.action = '/get';
        nativeForm.method = 'get';

        var input = document.createElement('input');
        nativeForm.appendChild(input);
        input.required = true;
        input.name = 'foo';
        Polymer.dom(form).appendChild(nativeForm);

        form.addEventListener('iron-form-response', function(event) {
          expect(event.detail.url).to.equal('/get?foo=bar');
          expect(event.detail.response.success).to.be.equal(true);
          document.body.removeChild(form);
          done();
        });

        // Wait one tick for observeNodes.
        Polymer.Base.async(function() {
          expect(form.validate()).to.be.equal(false);
          input.value = 'bar';
          expect(form.validate()).to.be.equal(true);
          form.submit();
          server.respond();
        }, 1);
      });
    });

    suite('content type', function() {
      var server;
      var f;

      setup(function() {
        server = sinon.fakeServer.create();
        f = fixture('content-type');
      });

      teardown(function() {
        server.restore();
      });

      test('submits a form with text/plain', function(done) {
        var form = f.querySelector('#simple-form');

        server.respondWith(
          'POST',
          /\/valid\/url.*/,
          function (request) {
            expect(request.requestHeaders).to.deep.equal({
                "Content-Type": "text/plain;charset=utf-8",
                "accept": "application/json"});
            expect(request.requestBody).to.deep.equal({
                "paper1": "value1",
                "paper2": "value2"});
            done();
          }
        );

          // Wait one tick for observeNodes.
          Polymer.Base.async(function() {
            form.submit();
            server.respond();
          });
      });
      test('submits a form with application/json', function(done) {
          var form = f.querySelector('#json-form');

          server.respondWith(
            'POST',
            /\/valid\/url.*/,
            function (request) {
              expect(request.requestHeaders).to.deep.equal({
                  "content-type": "application/json;charset=utf-8",
                  "accept": "application/json"});
              expect(request.requestBody).to.equal(
                  '{"paper1":"value1","paper2":"value2"}');
              done();
            }
          );

          // Wait one tick for observeNodes.
          Polymer.Base.async(function() {
            form.submit();
            server.respond();
          });
      });
    });
  
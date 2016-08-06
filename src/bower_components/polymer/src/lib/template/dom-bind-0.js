

  Polymer({

    /**
     * Fired whenever DOM is stamped by this template (rendering
     * will be deferred until all HTML imports have resolved).
     *
     * @event dom-change
     */

    is: 'dom-bind',

    extends: 'template',
    _template: null,

    created: function() {
      // Ensure dom-bind doesn't stamp until all possible dependencies
      // have resolved
      var self = this;
      Polymer.RenderStatus.whenReady(function() {
        if (document.readyState == 'loading') {
          document.addEventListener('DOMContentLoaded', function() {
            self._markImportsReady();
          });
        } else {
          self._markImportsReady();
        }
      });
    },

    _ensureReady: function() {
      if (!this._readied) {
        this._readySelf();
      }
    },

    _markImportsReady: function() {
      this._importsReady = true;
      this._ensureReady();
    },

    _registerFeatures: function() {
      this._prepConstructor();
    },

    _insertChildren: function() {
      var parentDom = Polymer.dom(Polymer.dom(this).parentNode);
      parentDom.insertBefore(this.root, this);
    },

    _removeChildren: function() {
      if (this._children) {
        for (var i=0; i<this._children.length; i++) {
          this.root.appendChild(this._children[i]);
        }
      }
    },

    _initFeatures: function() {
      // defer _initFeatures and stamping until after attached, to support
      // document.createElement('template', 'dom-bind') use case,
      // where template content is filled in after creation
    },

    // avoid scoping elements as we expect dom-bind output to be in the main
    // document
    _scopeElementClass: function(element, selector) {
      if (this.dataHost) {
        return this.dataHost._scopeElementClass(element, selector);
      } else {
        return selector;
      }
    },

    _configureInstanceProperties: function() {
      // We use the _prepConfigure code below to read instance values before
      // creating instance accessors, rather than the standard method here
    },

    _prepConfigure: function() {
      var config = {};
      for (var prop in this._propertyEffects) {
        config[prop] = this[prop];
      }
      // Pass values set before attached as initialConfig to _setupConfigure
      var setupConfigure = this._setupConfigure;
      this._setupConfigure = function() {
        setupConfigure.call(this, config);
      };
    },

    attached: function() {
      if (this._importsReady) {
        this.render();
      }
    },

    detached: function() {
      this._removeChildren();
    },

    /**
     * Forces the element to render its content. This is typically only
     * necessary to call if HTMLImports with the async attribute are used.
     */
    render: function() {
      this._ensureReady();
      if (!this._children) {
        this._template = this;
        this._prepAnnotations();
        this._prepEffects();
        this._prepBehaviors();
        this._prepConfigure();
        this._prepBindings();
        this._prepPropertyInfo();
        Polymer.Base._initFeatures.call(this);
        this._children = Polymer.TreeApi.arrayCopyChildNodes(this.root);
      }
      this._insertChildren();
      this.fire('dom-change');
    }

  });


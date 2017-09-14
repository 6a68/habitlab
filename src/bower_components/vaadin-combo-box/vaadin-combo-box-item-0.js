
  Polymer({
    is: 'vaadin-combo-box-item',

    properties: {
      /**
       * The index of the item
       */
      index: Number,

      /**
       * The item to render
       * @type {(String|Object)}
       */
      item: Object,

      /**
       * The text label corresponding to the item
       */
      label: String,

      /**
       * True when item is selected
       */
      selected: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * True when item is focused
       */
      focused: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },

      /**
       * The template instance corresponding to the item
       */
      _itemTemplateInstance: Object
    },

    observers: [
      '_updateTemplateInstanceVariable("index", index, _itemTemplateInstance)',
      '_updateTemplateInstanceVariable("item", item, _itemTemplateInstance)',
      '_updateTemplateInstanceVariable("selected", selected, _itemTemplateInstance)',
      '_updateTemplateInstanceVariable("focused", focused, _itemTemplateInstance)'
    ],

    attached: function() {
      if (!this._itemTemplateInstance) {
        // 2.0 has __dataHost
        var comboBox = this.domHost.dataHost || this.domHost.__dataHost;
        comboBox._ensureTemplatized();
        if (comboBox._itemTemplate) {
          this._itemTemplateInstance = comboBox.stamp({});
          Polymer.dom(this.root).removeChild(this.$.content);
          Polymer.dom(this.root).appendChild(this._itemTemplateInstance.root);
        }
      }
    },

    _updateTemplateInstanceVariable: function(variable, value, _itemTemplateInstance) {
      if (variable === undefined || value === undefined || _itemTemplateInstance === undefined) {
        return;
      }
      _itemTemplateInstance[variable] = value;
    }
  });

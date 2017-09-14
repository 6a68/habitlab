
        class PaperRangeSlider extends Polymer.GestureEventListeners(Polymer.Element) {
            static get is() { return 'paper-range-slider' }

            // -----------------------------------------------------------------------------------------------------------
            // properties
            // -----------------------------------------------------------------------------------------------------------
            static get properties() {
                return  {
                  /**
                   * the width of the element in pixels.
                   */
                  sliderWidth: {
                      type: String,
                      value: "",
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * the style attribute of the element.
                   */
                  mainDivStyle: {
                      type: String,
                      value: "",
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * the minimal value (lower range) of the slider.
                   */
                  min: {
                      type: Number,
                      value: 0,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * the maximal value (upper range) of the slider.
                   */
                  max: {
                      type: Number,
                      value: 100,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * the current value of the lower range of the slider.
                   */
                  valueMin: {
                      type: Number,
                      value: 0,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * the current value of the upper range of the slider.
                   */
                  valueMax: {
                      type: Number,
                      value: 100,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * the minimal step-change of a knob on the slider
                   */
                  step: {
                      type: Number,
                      value: 1,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * optional minimal value for the difference between valueMin and valueMax
                   * by default this is negative (valueDiffMin is ignored)
                   */
                  valueDiffMin: {
                      type: Number,
                      value: 0,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * optional maximal value for the difference between valueMin and valueMax
                   * by default this is negative (valueDiffMax is ignored)
                   */
                  valueDiffMax: {
                      type: Number,
                      value: 0,
                      notify: true,
                      reflectToAttribute: true
                  },

                  /**
                   * if true, pins with numeric value label are shown when the slider thumb
                   * is pressed. Use for settings for which users need to know the exact
                   * value of the setting.
                   */
                  alwaysShowPin: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },

                  /**
                   * if true, pins with numeric value label are shown when the slider thumb
                   * is pressed. Use for settings for which users need to know the exact
                   * value of the setting.
                   */
                  pin: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },

                  /**
                   * if true, the slider thumb snaps to tick marks evenly spaced based
                   * on the `step` property value.
                   */
                  snaps: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },

                  /**
                   * if true, the slider is disabled.
                   */
                  disabled: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },

                  /**
                   * an option to "revert" from the paper-range-slider to a single paper-single-range-slider.
                   */
                  singleSlider: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },

                  /**
                   * time-window (in msec) to keep the slider._setTransiting(true) for the
                   * two paper-single-range-slider elements, when using the setValues() method to change the
                   * selected range. This should be slightly higher than the transition time defined for the
                   * paper-single-range-slider (which, as of paper-single-range-slider-v1.0.11, is 0.08s/0.18s).
                   */
                  transDuration: {
                      type: Number,
                      value: 250,
                  },

                  /**
                   * if set to true, tapping the slider below or above the selected range
                   * will update the selected range.
                   */
                  tapValueExtend: {
                      type: Boolean,
                      value: true,
                      notify: true
                  },

                  /**
                   * if set to true, tapping the slider inside the selected range
                   * will update the selected range.
                   */
                  tapValueReduce: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },

                  /**
                   * if set to true, tapping the slider will update the selected range,
                   * while keeping the same difference between valueMin and valueMax.
                   * tapValueMove supersedes tapValueExtend and tapValueReduce
                   */
                  tapValueMove: {
                      type: Boolean,
                      value: false,
                      notify: true
                  },
              }
            }


            // -----------------------------------------------------------------------------------------------------------
            // initial settings
            // -----------------------------------------------------------------------------------------------------------
            ready() {
                // this._boundListener = this._myLocationListener.bind(this);
                super.ready();
                var _this = this;
                setTimeout(function() { _this._ready(); }.bind(this), 0);
            }

            // initialization
            _ready() {
                function _hasVar(varIn) { return (varIn != undefined && varIn != null); }

                if(!_hasVar(this._nInitTries)) this._nInitTries = 0;

                // it may take a little time for polymer to decide to render the paper-single-range-slider elements,
                // we therefore wait until they're ready before we proceed with the initialization
                var sliderContainer = this.shadowRoot.querySelector("#sliderMax").getEle('#sliderContainer');
                if(_hasVar(sliderContainer)) { sliderContainer = (sliderContainer.offsetWidth > 0); }
                if(_hasVar(sliderContainer)) { sliderContainer = this.shadowRoot.querySelector("#sliderMin").getEle('#sliderContainer'); }
                if(_hasVar(sliderContainer)) { sliderContainer = (sliderContainer.offsetWidth > 0); }
                // finally, may go through with the initialization
                if(_hasVar(sliderContainer)) {
                    this._renderedReady();
                }
                // if not, try again in a few msec
                else {
                    if(this._nInitTries < 1000) {
                        var this_ = this;
                        setTimeout(function() { this_._ready(); }, 10);
                    }
                    else {
                        console.error("could not properly initialize the underlying paper-single-range-slider elements ...");
                    }
                    this._nInitTries++;
                }

                return;
            }

            // initialization once the paper-single-range-slider elements have been rendered
            _renderedReady() {
                // some initializations
                this.init();

                // setup listeners for updating everything whenever a knob is affected 
                var this_ = this;

                this.shadowRoot.querySelector("#sliderMin").addEventListener('immediate-value-change', function(customEvent) {
                    this_._setValueMinMax(this_._getValuesMinMax(this.immediateValue,null));
                });
                
                this.shadowRoot.querySelector("#sliderMax").addEventListener('immediate-value-change', function(customEvent) {
                    this_._setValueMinMax(this_._getValuesMinMax(null,this.immediateValue));
                });

                this.shadowRoot.querySelector("#sliderMin").addEventListener('change', function(customEvent) {
                    this_._setValueMinMax(this_._getValuesMinMax(this.immediateValue,null));

                    if(this_.alwaysShowPin) {
                        this_.$.sliderMin._expandKnob();
                    }
                });
            
                this.shadowRoot.querySelector("#sliderMax").addEventListener('change', function(customEvent) {
                    this_._setValueMinMax(this_._getValuesMinMax(null,this.immediateValue));

                    if(this_.alwaysShowPin) {
                        this_.$.sliderMax._expandKnob();
                    }
                });

                return;
            }


            /**
             * initialize basic properties (can be called again by the user)
             * @method init
             */
            init() {
                this.setSingleSlider(this.singleSlider);
                this.setDisabled(this.disabled);

                // some basic properties
                if(this.alwaysShowPin) { this.pin = true; }

                this.shadowRoot.querySelector("#sliderMin").pin   = this.pin;
                this.shadowRoot.querySelector("#sliderMax").pin   = this.pin;
                this.shadowRoot.querySelector("#sliderMin").snaps = this.snaps;
                this.shadowRoot.querySelector("#sliderMax").snaps = this.snaps;

                if(this.sliderWidth != "") {
                    this.updateStyles({
                      '--paper-range-slider-width': this.sliderWidth,
                    });
                }

                // since the two single sliders are overlaid, we need to remove foreground color
                var sliderBar = this.shadowRoot.querySelector("#sliderMin").getEle('#sliderBar');
                if(sliderBar) {
                    var progressContainer = sliderBar.$$('#progressContainer');
                    if(progressContainer) progressContainer.style.background = "transparent";
                }

                // internal variable to prevent unneeded fire on updates
                this._prevUpdateValues = [this.min, this.max]

                // set internal variables to control the minimal and maximal difference between selected values
                this._setValueDiff();

                // initial setting after verifying this._valueDiffMin, this._valueDiffMax
                this._setValueMinMax(this._getValuesMinMax(this.valueMin, this.valueMax));

                // activate the pins, and never hide
                if(this.alwaysShowPin) {
                    this.shadowRoot.querySelector("#sliderMin")._expandKnob();
                    this.shadowRoot.querySelector("#sliderMax")._expandKnob();
                }

                return;
            }

            // internal variables for minimal/maximal difference between this.valueMin, this.valueMax
            // each one is between zero and the maximal difference available in the range, and
            // the this._valueDiffMin can not be larger than this._valueDiffMax
            _setValueDiff() {
                this._valueDiffMax = Math.max(this.valueDiffMax, 0);
                this._valueDiffMin = Math.max(this.valueDiffMin, 0);

                return;
            }

            // get a new set of min/max values, following predefined rules for overlap of the two
            _getValuesMinMax(valueMin,valueMax) {
                var hasMin = (valueMin != null && valueMin >= this.min && valueMin <= this.max);
                var hasMax = (valueMax != null && valueMax >= this.min && valueMax <= this.max);

                if(!hasMin && !hasMax) { return [this.valueMin,this.valueMax]; }

                var valueNowMin = hasMin ? valueMin : this.valueMin;
                var valueNowMax = hasMax ? valueMax : this.valueMax;

                valueNowMin = Math.min(Math.max(valueNowMin, this.min), this.max)
                valueNowMax = Math.min(Math.max(valueNowMax, this.min), this.max)

                var diffNow  = valueNowMax - valueNowMin;

                // the anchor is the valueMin if it is explicitly provided
                if(hasMin) {
                    if(diffNow < this._valueDiffMin) {
                        valueNowMax = Math.min(this.max, valueNowMin + this._valueDiffMin);
                        diffNow  = valueNowMax - valueNowMin;
                        if(diffNow < this._valueDiffMin) {
                            valueNowMin = valueNowMax - this._valueDiffMin;
                        }
                    }
                    else if(diffNow > this._valueDiffMax && this._valueDiffMax > 0) {
                        valueNowMax = valueNowMin + this._valueDiffMax;
                    }
                }
                // if no valueMin given, decide the anchor is valueMax
                else {
                    if(diffNow < this._valueDiffMin) {
                        valueNowMin = Math.max(this.min, valueNowMax - this._valueDiffMin);
                        diffNow  = valueNowMax - valueNowMin;
                        if(diffNow < this._valueDiffMin) {
                            valueNowMax = valueNowMin + this._valueDiffMin;
                        }
                    }
                    else if(diffNow > this._valueDiffMax && this._valueDiffMax > 0) {
                        valueNowMin = valueNowMax - this._valueDiffMax;
                    }
                }

                return [valueNowMin, valueNowMax];
            }

            // set the value of the low edge of the selected range
            _setValueMin(value) {
                value = Math.max(value, this.min);
                this.shadowRoot.querySelector("#sliderMin").value = value;
                this.valueMin = value;
                return;
            }

            // set the value of the high edge of the selected range
            _setValueMax(value) {
                value = Math.min(value, this.max);
                this.shadowRoot.querySelector("#sliderMax").value = value;
                this.valueMax               = value;

                return;
            }

            // set the values of the low/high edges of the selected range and broadcast the change
            _setValueMinMax(valuesMinMax) {
                this._setValueMin(valuesMinMax[0]);
                this._setValueMax(valuesMinMax[1]);

                // fire to indicate an update of this.valueMin and/or this.valueMax
                this.updateValues();

                return;
            }

            // set this.valueMin and/or this.valueMax (can input null values or out-of-range
            // values in order to set only one of the two)
            _setValues(valueMin,valueMax) {
                // some sanity checks/changes
                if(valueMin != null) {
                    if(valueMin < this.min || valueMin > this.max) valueMin = null;
                }
                if(valueMax != null) {
                    if(valueMax < this.min || valueMax > this.max) valueMax = null;
                }
                if(valueMin != null && valueMax != null) {
                    valueMin = Math.min(valueMin,valueMax);
                }

                // now update the values
                this._setValueMinMax(this._getValuesMinMax(valueMin,valueMax));

                return;
            }

            // interface for functions to control the draggable invisible div which
            // spans the distance between the knobs
            _backDivOnTrack(event) {
                event.stopPropagation();
              
                switch (event.detail.state) {
                    case 'start':
                        this._backDivTrackStart(event);
                        break;
                    case 'track':
                        this._backDivTrackDuring(event);
                        break;
                    case 'end':
                        this._backDivTrackEnd();
                        break;
                }

              return;
            }

            // place-holder function for possible later implementation
            _backDivTrackStart(event) { return; }

            // function to enable dragging both knobs by using the invisible
            // div which spans the distance in between
            _backDivTrackDuring(e) {
                var sliderMin = this.shadowRoot.querySelector("#sliderMin");
                var sliderMax = this.shadowRoot.querySelector("#sliderMax");

                this._x1_Min = this._x0_Min + e.detail.dx;
                var immediateValueMin = sliderMin._calcStep(this._getRatioPos(sliderMin, this._x1_Min/this._xWidth));

                this._x1_Max = this._x0_Max + e.detail.dx;
                var immediateValueMax = sliderMax._calcStep(this._getRatioPos(sliderMax, this._x1_Max/this._xWidth));

                if(immediateValueMin >= this.min && immediateValueMax <= this.max) {
                    this._setValuesWithCurrentDiff(immediateValueMin, immediateValueMax, false);
                }

                return;
            }

            _setValuesWithCurrentDiff(valueMin, valueMax, useTrans) {
                var diffMin = this._valueDiffMin;
                var diffMax = this._valueDiffMax;

                this._valueDiffMin = this.valueMax - this.valueMin;
                this._valueDiffMax = this.valueMax - this.valueMin;

                if(useTrans) this.setValues(valueMin, valueMax);
                else         this._setValues(valueMin, valueMax);

                this._valueDiffMin = diffMin;
                this._valueDiffMax = diffMax;

                return;
            }
            
            // place-holder function for at the end of the dragging event, so the following
            _backDivTrackEnd() { return; }

            // _sliderMinDown, _sliderMaxDown, _sliderMinUp, _sliderMaxUp
            //      show/hide pins (if defined) for one knob, when the other knob is pressed
            _sliderMinDown() {
                this.shadowRoot.querySelector("#sliderMax")._expandKnob();
                
                return;
            }

            _sliderMaxDown(event) {
                if(!this.singleSlider) {
                    this.shadowRoot.querySelector("#sliderMin")._expandKnob();
                }
                else {
                    this._setValues(null,this._getEventValue(event));
                }

                return;
            }

            _sliderMinUp() {
                if(this.alwaysShowPin) this.shadowRoot.querySelector("#sliderMin")._expandKnob();
                else                   this.shadowRoot.querySelector("#sliderMax")._resetKnob();
                
                return;
            }

            _sliderMaxUp() {
                if(this.alwaysShowPin) this.shadowRoot.querySelector("#sliderMax")._expandKnob();
                else {
                    this.shadowRoot.querySelector("#sliderMin")._resetKnob();
                    if(this.singleSlider) this.shadowRoot.querySelector("#sliderMax")._resetKnob();
                }
                
                return;
            }

            // function to calculate the value from an event
            _getEventValue(event) {
                var width = this.shadowRoot.querySelector("#sliderMax").getEle('#sliderContainer').offsetWidth;
                var rect  = this.shadowRoot.querySelector("#sliderMax").getEle('#sliderContainer').getBoundingClientRect();
                var ratio = (event.detail.x - rect.left) / width;
                var value = this.min + ratio * (this.max - this.min);

                return value;
            }


            // set the value if tapping the slider below or above the selected range
            _backDivTap(event) {
                this._setValueNow = function(valueMin,valueMax) {
                    if(this.tapValueMove) { this._setValuesWithCurrentDiff(valueMin,valueMax,true); }
                    else                  { this.setValues(valueMin,valueMax);                      }
                    return;
                }
                
                var value = this._getEventValue(event);
                if(value > this.valueMin && value < this.valueMax) {
                    if(this.tapValueReduce) {
                        var isLow = value < (this.valueMin + (this.valueMax - this.valueMin)/2);
                        if(isLow) { this._setValueNow(value,null); }
                        else      { this._setValueNow(null,value); }
                    }
                }
                else if(this.tapValueExtend || this.tapValueMove) {
                    if(value < this.valueMin) { this._setValueNow(value,null); }
                    if(value > this.valueMax) { this._setValueNow(null,value); }
                }

                return;
            }

            // initialization before starting the dragging of the invisible
            // div which spans the distance in between
            _backDivDown(event) {
                // show pins if defined
                this._sliderMinDown();
                this._sliderMaxDown();

                // get the initial positions of knobs before dragging starts
                this._xWidth =  this.shadowRoot.querySelector("#sliderMin").getEle('#sliderBar').offsetWidth;
                this._x0_Min = (this.shadowRoot.querySelector("#sliderMin").ratio / 100.) * this._xWidth;
                this._x0_Max = (this.shadowRoot.querySelector("#sliderMax").ratio / 100.) * this._xWidth;

                return;
            }

            // finalization after ending the dragging of the invisible
            // div which spans the distance in between
            _backDivUp() {
                // hide pins if defined
                this._sliderMinUp();
                this._sliderMaxUp();

                return;
            }

            // place-holder function for possible later implementation
            _backDivTransEnd(event) { return; }

            // the position of the knob for a given single slider, for a given ratio
            _getRatioPos(slider, ratio) {
                return Math.max(slider.min, Math.min(slider.max, (slider.max - slider.min) * ratio + slider.min));
            }

            // helper function to cast to a boolean
            _toBool(valIn) { return (valIn === "false" || valIn === "0") ? false : Boolean(valIn); }

            /**
             * set this.valueMin and/or this.valueMax (can input null values or out-of-range
             * values in order to set only one of the two) - this is just a public
             * wrapper for this._setValues(), but including transition animation
             * @method setValues
             */
            setValues(valueMin,valueMax) {
                this.shadowRoot.querySelector("#sliderMin")._setTransiting(true);
                this.shadowRoot.querySelector("#sliderMax")._setTransiting(true);

                this._setValues(valueMin,valueMax);

                var this_ = this;
                setTimeout(function() {
                    this_.$.sliderMin._setTransiting(false);
                    this_.$.sliderMax._setTransiting(false);
                }, this_.transDuration);

                return;
            }

            /**
             * fire whenever this.valueMin or this.valueMax are changed
             * @method updateValues
             */
            updateValues() {
                if(this._prevUpdateValues[0] != this.valueMin || this._prevUpdateValues[1] != this.valueMax) {
                    this._prevUpdateValues = [this.valueMin, this.valueMax];

                    // fire the event
                    this.dispatchEvent(new CustomEvent('updateValues', { bubbles:true, composed:true, detail:{} }));
                }
                return;
            }

            /**
             * set the minimal value (lower range) of the slider
             * @method setMin
             */
            setMin(minIn) {
                // paper-single-range-slider needs a safety check that the min value we are going to set is
                // not larger than the max value which is already set
                if(this.max < minIn) this.max = minIn;

                this.min = minIn;
                this._prevUpdateValues = [this.min, this.max];

                // update the selected value if it is now outside of the lower bound,
                // or just update the position of the overlay divs for the min/max knobs
                if(this.valueMin < this.min) this._setValues(this.min,null);

                return;
            }

            /**
             * set the maximal value (upper range) of the slider
             * @method setMax
             */
            setMax(maxIn) {
                // paper-single-range-slider needs a safety check that the min value we are going to set is
                // not larger than the max value which is already set
                if(this.min > maxIn) this.min = maxIn;

                this.max = maxIn;
                this._prevUpdateValues = [this.min, this.max];

                // update the selected value if it is now outside of the upper bound,
                // or just update the position of the overlay divs for the min/max knobs
                if(this.valueMax > this.max) this._setValues(null,this.max);

                return;
            }

            /**
             * set the minimal step-change of a knob on the slider
             * @method setMax
             */
            setStep(stepIn) {
                this.step = stepIn;
                return;
            }

            /**
             * set the minimal difference between selected values
             * @method setValueDiffMin
             */
            setValueDiffMin(valueDiffMin) {
                this._valueDiffMin = valueDiffMin;
                return;
            }

            /**
             * set the maximal difference between selected values
             * @method setValueDiffMax
             */
            setValueDiffMax(valueDiffMax) {
                this._valueDiffMax = valueDiffMax;
                return;
            }

            /**
             * set the tapValueExtend property
             * @method setValueDiffMax
             */
            setTapValueExtend(isTapValueExtend) {
                this.tapValueExtend = this._toBool(isTapValueExtend);
                return;
            }

            /**
             * set the tapValueReduce property
             * @method setValueDiffMax
             */
            setTapValueReduce(isTapValueReduce) {
                this.tapValueReduce = this._toBool(isTapValueReduce);
                return;
            }

            /**
             * set the tapValueMove property
             * @method setValueDiffMax
             */
            setTapValueMove(isTapValueMove) {
                this.tapValueMove = this._toBool(isTapValueMove);
                return;
            }

            /**
             * set the disabled parameter
             * @method setValueDiffMax
             */
            setDisabled(isDisabled) {
                this.disabled = this._toBool(isDisabled);
                var pointEvt  = this.disabled ? "none" : "auto";

                this.shadowRoot.querySelector("#sliderMax").getEle('#sliderKnob').style.pointerEvents = pointEvt;
                this.shadowRoot.querySelector("#sliderMin").getEle('#sliderKnob').style.pointerEvents = pointEvt;
                this.shadowRoot.querySelector("#sliderOuterDiv_1").style.pointerEvents                = pointEvt;

                return;
            }

            /**
             * change the slider between the default paper-range-slider and a paper-single-range-slider
             * @method setValueDiffMax
             */
            setSingleSlider(isSingle) {
                this.singleSlider = this._toBool(isSingle);

                var sliderMin = this.shadowRoot.querySelector("#sliderMin");
                var sliderMax = this.shadowRoot.querySelector("#sliderMax");
                var backDiv   = this.shadowRoot.querySelector("#backDiv");
                var knobMin   = sliderMin.getEle('#sliderKnob');
                var knobMax   = sliderMax.getEle('#sliderKnob');

                if(isSingle) {
                    backDiv.style.display         = 'none';
                    sliderMax.style.pointerEvents = 'auto';
                    sliderMax.style.display       = '';
                    sliderMin.style.display       = 'none';
                    backDiv.style.cursor          = 'default';
                    knobMax.style.cursor          = 'default';
                    knobMin.style.cursor          = 'default';
                }
                else {
                    backDiv.style.display         = 'block';
                    sliderMax.style.pointerEvents = 'none';
                    sliderMax.style.display       = '';
                    sliderMin.style.display       = '';
                    backDiv.style.cursor          = 'ew-resize';
                    knobMax.style.cursor          = 'col-resize';
                    knobMin.style.cursor          = 'col-resize';
                }

                // disable some of the interface of the two single sliders,
                // but keep the knobs active if not disabled
                sliderMax.getEle('#sliderContainer').style.pointerEvents = this.singleSlider ? "auto" : "none";
                sliderMin.getEle('#sliderContainer').style.pointerEvents = "none";

                return;
            }
        }
        customElements.define(PaperRangeSlider.is, PaperRangeSlider);
    
    Polymer({
      is: 'paper-single-range-slider',

      behaviors: [
        Polymer.IronA11yKeysBehavior,
        Polymer.IronFormElementBehavior,
        Polymer.PaperInkyFocusBehavior,
        Polymer.IronRangeBehavior
      ],

      properties: {
        /**
         * If true, the slider thumb snaps to tick marks evenly spaced based
         * on the `step` property value.
         */
        snaps: {
          type: Boolean,
          value: false,
          notify: true
        },

        /**
         * If true, a pin with numeric value label is shown when the slider thumb
         * is pressed. Use for settings for which users need to know the exact
         * value of the setting.
         */
        pin: {
          type: Boolean,
          value: false,
          notify: true
        },

        /**
         * The number that represents the current secondary progress.
         */
        secondaryProgress: {
          type: Number,
          value: 0,
          notify: true,
          observer: '_secondaryProgressChanged'
        },

        /**
         * If true, an input is shown and user can use it to set the slider value.
         */
        editable: {
          type: Boolean,
          value: false
        },

        /**
         * The immediate value of the slider.  This value is updated while the user
         * is dragging the slider.
         */
        immediateValue: {
          type: Number,
          value: 0,
          readOnly: true,
          notify: true
        },

        /**
         * The maximum number of markers
         */
        maxMarkers: {
          type: Number,
          value: 0,
          notify: true
        },

        /**
         * If true, the knob is expanded
         */
        expand: {
          type: Boolean,
          value: false,
          readOnly: true
        },

        /**
         * True when the user is dragging the slider.
         */
        dragging: {
          type: Boolean,
          value: false,
          readOnly: true
        },

        transiting: {
          type: Boolean,
          value: false,
          readOnly: true
        },

        markers: {
          type: Array,
          readOnly: true,
          value: function() {
              return [];
          }
        },
      },

      observers: [
        '_updateKnob(value, min, max, snaps, step)',
        '_valueChanged(value)',
        '_immediateValueChanged(immediateValue)',
        '_updateMarkers(maxMarkers, min, max, snaps)'
      ],

      hostAttributes: {
        role: 'slider',
        tabindex: 0
      },

      keyBindings: {
        'left': '_leftKey',
        'right': '_rightKey',
        'down pagedown home': '_decrementKey',
        'up pageup end': '_incrementKey'
      },

      /**
       * Increases value by `step` but not above `max`.
       * @method increment
       */
      increment: function() {
        this.value = this._clampValue(this.value + this.step);
      },

      /**
       * Decreases value by `step` but not below `min`.
       * @method decrement
       */
      decrement: function() {
        this.value = this._clampValue(this.value - this.step);
      },

      _updateKnob: function(value, min, max, snaps, step) {
        this.setAttribute('aria-valuemin', min);
        this.setAttribute('aria-valuemax', max);
        this.setAttribute('aria-valuenow', value);

        this._positionKnob(this._calcRatio(value) * 100);
      },

      _valueChanged: function() {
        this.fire('value-change', {composed: true});
      },

      _immediateValueChanged: function() {
        if (this.dragging) {
          this.fire('immediate-value-change', {composed: true});
        } else {
          this.value = this.immediateValue;
        }
      },

      _secondaryProgressChanged: function() {
        this.secondaryProgress = this._clampValue(this.secondaryProgress);
      },

      _expandKnob: function() {
        this._setExpand(true);
      },

      _resetKnob: function() {
        this.cancelDebouncer('expandKnob');
        this._setExpand(false);
      },

      _positionKnob: function(ratio) {
        this._setImmediateValue(this._calcStep(this._calcKnobPosition(ratio)));
        this._setRatio(this._calcRatio(this.immediateValue) * 100);

        this.$.sliderKnob.style.left = this.ratio + '%';
        if (this.dragging) {
          this._knobstartx = (this.ratio * this._w) / 100;
          this.translate3d(0, 0, 0, this.$.sliderKnob);
        }
      },

      _calcKnobPosition: function(ratio) {
        return (this.max - this.min) * ratio / 100 + this.min;
      },

      _onTrack: function(event) {
        event.stopPropagation();
        switch (event.detail.state) {
          case 'start':
            this._trackStart(event);
            break;
          case 'track':
            this._trackX(event);
            break;
          case 'end':
            this._trackEnd();
            break;
        }
      },

      _trackStart: function(event) {
        this._setTransiting(false);
        this._w = this.$.sliderBar.offsetWidth;
        this._x = this.ratio * this._w / 100;
        this._startx = this._x;
        this._knobstartx = this._startx;
        this._minx = - this._startx;
        this._maxx = this._w - this._startx;
        this.$.sliderKnob.classList.add('dragging');
        this._setDragging(true);
      },

      _trackX: function(event) {
        if (!this.dragging) {
          this._trackStart(event);
        }

        var direction = this._isRTL ? -1 : 1;
        var dx = Math.min(
            this._maxx, Math.max(this._minx, event.detail.dx * direction));
        this._x = this._startx + dx;

        var immediateValue = this._calcStep(this._calcKnobPosition(this._x / this._w * 100));
        this._setImmediateValue(immediateValue);

        // update knob's position
        var translateX = ((this._calcRatio(this.immediateValue) * this._w) - this._knobstartx);
        this.translate3d(translateX + 'px', 0, 0, this.$.sliderKnob);
      },

      _trackEnd: function() {
        var s = this.$.sliderKnob.style;

        this.$.sliderKnob.classList.remove('dragging');
        this._setDragging(false);
        this._resetKnob();
        this.value = this.immediateValue;

        s.transform = s.webkitTransform = '';

        this.fire('change', {composed: true});
      },

      _knobdown: function(event) {
        this._expandKnob();

        // cancel selection
        event.preventDefault();

        // set the focus manually because we will called prevent default
        this.focus();
      },

      _bardown: function(event) {
        this._w = this.$.sliderBar.offsetWidth;
        var rect = this.$.sliderBar.getBoundingClientRect();
        var ratio = (event.detail.x - rect.left) / this._w * 100;
        if (this._isRTL) {
          ratio = 100 - ratio;
        }
        var prevRatio = this.ratio;

        this._setTransiting(true);

        this._positionKnob(ratio);

        this.debounce('expandKnob', this._expandKnob, 60);

        // if the ratio doesn't change, sliderKnob's animation won't start
        // and `_knobTransitionEnd` won't be called
        // Therefore, we need to manually update the `transiting` state

        if (prevRatio === this.ratio) {
          this._setTransiting(false);
        }

        this.async(function() {
          this.fire('change', {composed: true});
        });

        // cancel selection
        event.preventDefault();

        // set the focus manually because we will called prevent default
        this.focus();
      },

      _knobTransitionEnd: function(event) {
        if (event.target === this.$.sliderKnob) {
          this._setTransiting(false);
        }
      },

      _updateMarkers: function(maxMarkers, min, max, snaps) {
        if (!snaps) {
          this._setMarkers([]);
        }
        var steps = Math.round((max - min) / this.step);
        if (steps > maxMarkers) {
          steps = maxMarkers;
        }
        if (steps < 0 || !isFinite(steps)) {
          steps = 0;
        }
        this._setMarkers(new Array(steps));
      },

      _mergeClasses: function(classes) {
        return Object.keys(classes).filter(
          function(className) {
            return classes[className];
          }).join(' ');
      },

      _getClassNames: function() {
        return this._mergeClasses({
          disabled: this.disabled,
          pin: this.pin,
          snaps: this.snaps,
          ring: this.immediateValue <= this.min,
          expand: this.expand,
          dragging: this.dragging,
          transiting: this.transiting,
          editable: this.editable
        });
      },

      get _isRTL() {
        if (this.__isRTL === undefined) {
          this.__isRTL = window.getComputedStyle(this)['direction'] === 'rtl';
        }
        return this.__isRTL;
      },

      _leftKey: function(event) {
        if (this._isRTL)
          this._incrementKey(event);
        else
          this._decrementKey(event);
      },

      _rightKey: function(event) {
        if (this._isRTL)
          this._decrementKey(event);
        else
          this._incrementKey(event);
      },

      _incrementKey: function(event) {
        if (!this.disabled) {
          if (event.detail.key === 'end') {
            this.value = this.max;
          } else {
            this.increment();
          }
          this.fire('change');
          event.preventDefault();
        }
      },

      _decrementKey: function(event) {
        if (!this.disabled) {
          if (event.detail.key === 'home') {
            this.value = this.min;
          } else {
            this.decrement();
          }
          this.fire('change');
          event.preventDefault();
        }
      },

      _changeValue: function(event) {
        this.value = event.target.value;
        this.fire('change', {composed: true});
      },

      _inputKeyDown: function(event) {
        event.stopPropagation();
      },

      // create the element ripple inside the `sliderKnob`
      _createRipple: function() {
        this._rippleContainer = this.$.sliderKnob;
        return Polymer.PaperInkyFocusBehaviorImpl._createRipple.call(this);
      },

      // Hide the ripple when user is not interacting with keyboard.
      // This behavior is different from other ripple-y controls, but is
      // according to spec: https://www.google.com/design/spec/components/sliders.html
      _focusedChanged: function(receivedFocusFromKeyboard) {
        if (receivedFocusFromKeyboard) {
          this.ensureRipple();
        }
        if (this.hasRipple()) {
          // note, ripple must be un-hidden prior to setting `holdDown`
          if (receivedFocusFromKeyboard) {
            this._ripple.style.display = '';
          } else {
            this._ripple.style.display = 'none';
          }
          this._ripple.holdDown = receivedFocusFromKeyboard;
        }
      },

      getEle: function(tag) { return this.shadowRoot.querySelector(tag); }

    });

    /**
     * Fired when the slider's value changes.
     *
     * @event value-change
     */

    /**
     * Fired when the slider's immediateValue changes. Only occurs while the
     * user is dragging.
     *
     * To detect changes to immediateValue that happen for any input (i.e.
     * dragging, tapping, clicking, etc.) listen for immediate-value-changed
     * instead.
     *
     * @event immediate-value-change
     */

    /**
     * Fired when the slider's value changes due to user interaction.
     *
     * Changes to the slider's value due to changes in an underlying
     * bound variable will not trigger this event.
     *
     * @event change
     */
  
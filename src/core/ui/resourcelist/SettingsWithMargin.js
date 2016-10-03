goog.provide('anychart.core.ui.resourceList.SettingsWithMargin');
goog.require('anychart.core.ui.resourceList.Settings');
goog.require('anychart.core.utils.Margin');



/**
 * Settings with margin.
 * @extends {anychart.core.ui.resourceList.Settings}
 * @constructor
 */
anychart.core.ui.resourceList.SettingsWithMargin = function() {
  anychart.core.ui.resourceList.SettingsWithMargin.base(this, 'constructor');
};
goog.inherits(anychart.core.ui.resourceList.SettingsWithMargin, anychart.core.ui.resourceList.Settings);


//region --- OWN API ---
/**
 * Getter/setter for margin.
 * @param {(string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.resourceList.SettingsWithMargin|anychart.core.utils.Margin)} .
 */
anychart.core.ui.resourceList.SettingsWithMargin.prototype.margin = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (!this.margin_) {
    this.margin_ = new anychart.core.utils.Margin();
    this.margin_.listenSignals(this.marginInvalidated_, this);
  }
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    this.margin_.setup.apply(this.margin_, arguments);
    return this;
  }
  return this.margin_;
};


/**
 * Margin invalidation handler.
 * @param {anychart.SignalEvent} event
 * @private
 */
anychart.core.ui.resourceList.SettingsWithMargin.prototype.marginInvalidated_ = function(event) {
  this.dispatchSignal(anychart.Signal.NEEDS_REDRAW);
};
//endregion


//region --- SETUP/DISPOSE ---
/** @inheritDoc */
anychart.core.ui.resourceList.SettingsWithMargin.prototype.setupByJSON = function(config, opt_default) {
  anychart.core.ui.resourceList.SettingsWithMargin.base(this, 'setupByJSON', config, opt_default);
  if (goog.isDef(config['margin']))
    this.margin().setupByJSON(config['margin'], opt_default);
};


/** @inheritDoc */
anychart.core.ui.resourceList.SettingsWithMargin.prototype.serialize = function() {
  var json = anychart.core.ui.resourceList.SettingsWithMargin.base(this, 'serialize');
  json['margin'] = this.margin().serialize();
  return json;
};


/** @inheritDoc */
anychart.core.ui.resourceList.SettingsWithMargin.prototype.disposeInternal = function() {
  goog.dispose(this.margin_);
  anychart.core.ui.resourceList.SettingsWithMargin.base(this, 'disposeInternal');
};
//endregion


//exports
anychart.core.ui.resourceList.SettingsWithMargin.prototype['margin'] = anychart.core.ui.resourceList.SettingsWithMargin.prototype.margin;

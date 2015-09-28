goog.provide('anychart.core.utils.TooltipsContainer');
goog.require('acgraph');
goog.require('goog.Disposable');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.userAgent');



/**
 * Top-level container has the same size as the document.
 * It should not block any events on a page.
 * @constructor
 * @extends {goog.Disposable}
 */
anychart.core.utils.TooltipsContainer = function() {
  goog.base(this);

  /**
   * @type {boolean}
   * @private
   */
  this.selectable_ = false;

  var document = goog.dom.getDocument();
  if (goog.userAgent.IE && (!goog.userAgent.isVersionOrHigher('7') || document.documentMode && document.documentMode <= 6)) {
    this.root_ = goog.dom.createDom('div', {'style': 'position:absolute; left:0; top:0; z-index: 9999;'});
  } else {
    this.root_ = goog.dom.createDom('div', {'style': 'position:absolute; z-index: 9999; left: -10000px; top: -10000px'});
  }
  var aw = goog.dom.getWindow().screen.availWidth;
  var ah = goog.dom.getWindow().screen.availHeight;

  if (goog.userAgent.IE && !goog.userAgent.isVersionOrHigher('9')) {
    // hack like `pointer-events: none`
    this.stage_ = acgraph.create(this.root_, 1, 1);
  } else {
    this.stage_ = acgraph.create(this.root_, aw, ah);
  }

  this.stage_.domElement()['style']['cssText'] = 'position:fixed; left:0; top:0; opacity:1; pointer-events: none';

  // do not wrap TooltipsContainer stage into relative div
  // DVF-791
  this.stage_.wrapped_ = true;
  goog.dom.appendChild(goog.dom.getDocument().body, this.root_);
};
goog.inherits(anychart.core.utils.TooltipsContainer, goog.Disposable);
goog.addSingletonGetter(anychart.core.utils.TooltipsContainer);


/**
 * @type {Element}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.root_ = null;


/**
 * @type {acgraph.vector.Stage}
 * @private
 */
anychart.core.utils.TooltipsContainer.prototype.stage_ = null;


/**
 * Set container to tooltip.
 * @param {anychart.core.ui.SeriesTooltip|anychart.core.ui.TooltipItem} tooltip
 */
anychart.core.utils.TooltipsContainer.prototype.allocTooltip = function(tooltip) {
  tooltip.container(this.stage_);
};


/**
 * Release passed tooltip.
 * @param {anychart.core.ui.SeriesTooltip|anychart.core.ui.TooltipItem} tooltip
 */
anychart.core.utils.TooltipsContainer.prototype.release = function(tooltip) {
  tooltip.container(null);
};


/**
 * Getter/Setter for the text selectable option.
 * @param {boolean=} opt_value
 * @return {boolean|anychart.core.utils.TooltipsContainer}
 */
anychart.core.utils.TooltipsContainer.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.selectable_ != opt_value) {
      this.selectable_ = opt_value;
    }
    return this;
  } else {
    return this.selectable_;
  }
};


/** @inheritDoc */
anychart.core.utils.TooltipsContainer.prototype.disposeInternal = function() {
  //todo this method is never called

  this.stage_.dispose();
  this.stage_ = null;
  goog.dom.removeNode(this.root_);
  this.root_ = null;
};



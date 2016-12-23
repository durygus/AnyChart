goog.provide('anychart.core.drawers.RangeStepArea');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Base');
goog.require('anychart.enums');
goog.require('anychart.opt');



/**
 * RangeStepArea drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Base}
 */
anychart.core.drawers.RangeStepArea = function(series) {
  anychart.core.drawers.RangeStepArea.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.RangeStepArea, anychart.core.drawers.Base);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA] = anychart.core.drawers.RangeStepArea;


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.type = anychart.enums.SeriesDrawerTypes.RANGE_STEP_AREA;


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.flags = (
    // anychart.core.drawers.Capabilities.NEEDS_ZERO |
    // anychart.core.drawers.Capabilities.NEEDS_SIZE_SCALE |
    // anychart.core.drawers.Capabilities.USES_CONTAINER_AS_ROOT |
    // anychart.core.drawers.Capabilities.USES_STROKE_AS_FILL |
    anychart.core.drawers.Capabilities.SUPPORTS_CONNECTING_MISSING |
    // anychart.core.drawers.Capabilities.SUPPORTS_STACK |
    // anychart.core.drawers.Capabilities.SUPPORTS_COMPARISON |
    // anychart.core.drawers.Capabilities.SUPPORTS_ERROR |
    // anychart.core.drawers.Capabilities.SUPPORTS_OUTLIERS |
    // anychart.core.drawers.Capabilities.IS_DISCRETE_BASED |
    // anychart.core.drawers.Capabilities.IS_WIDTH_BASED |
    // anychart.core.drawers.Capabilities.IS_3D_BASED |
    // anychart.core.drawers.Capabilities.IS_VERTICAL |
    // anychart.core.drawers.Capabilities.IS_MARKER_BASED |
    // anychart.core.drawers.Capabilities.IS_OHLC_BASED |
    // anychart.core.drawers.Capabilities.IS_LINE_BASED |
    anychart.core.drawers.Capabilities.IS_RANGE_BASED |
    anychart.core.drawers.Capabilities.SUPPORTS_STEP_DIRECTION |
    // anychart.core.drawers.Capabilities.SUPPORTS_DISTRIBUTION |
    0);


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.requiredShapes = (function() {
  var res = {};
  res[anychart.opt.FILL] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.HATCH_FILL] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.LOW] = anychart.enums.ShapeType.PATH;
  res[anychart.opt.HIGH] = anychart.enums.ShapeType.PATH;
  return res;
})();


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.yValueNames = ([anychart.opt.HIGH, anychart.opt.LOW]);


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.startDrawing = function(shapeManager) {
  anychart.core.drawers.RangeStepArea.base(this, 'startDrawing', shapeManager);
  this.direction_ = /** @type {anychart.enums.StepDirection} */ (this.series.getOption(anychart.opt.STEP_DIRECTION) || anychart.enums.StepDirection.CENTER);
};


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.drawFirstPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]), this.isVertical, x, low);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]), this.isVertical, x, high);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]), this.isVertical, x, low);
  anychart.core.drawers.line(/** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]), this.isVertical, x, high);
  anychart.core.drawers.move(/** @type {acgraph.vector.Path} */(shapes[anychart.opt.HIGH]), this.isVertical, x, high);

  /** @type {number} */
  this.prevX_ = x;
  /** @type {number} */
  this.prevY_ = high;
  /** @type {Array.<number>} */
  this.lowsStack = [x, low];
};


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.drawSubsequentPoint = function(point, state) {
  var shapes = this.shapesManager.getShapesGroup(this.seriesState);
  var x = /** @type {number} */(point.meta(anychart.opt.X));
  var high = /** @type {number} */(point.meta(anychart.opt.HIGH));
  var low = /** @type {number} */(point.meta(anychart.opt.LOW));

  var fill = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]);
  var hatchFill = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]);
  var highShape = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HIGH]);

  switch (this.direction_) {
    case anychart.enums.StepDirection.FORWARD:
      anychart.core.drawers.line(fill, this.isVertical, x, this.prevY_);
      anychart.core.drawers.line(hatchFill, this.isVertical, x, this.prevY_);
      anychart.core.drawers.line(highShape, this.isVertical, x, this.prevY_);
      break;
    case anychart.enums.StepDirection.BACKWARD:
      anychart.core.drawers.line(fill, this.isVertical, this.prevX_, high);
      anychart.core.drawers.line(hatchFill, this.isVertical, this.prevX_, high);
      anychart.core.drawers.line(highShape, this.isVertical, this.prevX_, high);
      break;
    default:
      var midX = (x + this.prevX_) / 2;
      anychart.core.drawers.line(fill, this.isVertical, midX, this.prevY_, midX, high);
      anychart.core.drawers.line(hatchFill, this.isVertical, midX, this.prevY_, midX, high);
      anychart.core.drawers.line(highShape, this.isVertical, midX, this.prevY_, midX, high);
  }

  anychart.core.drawers.line(fill, this.isVertical, x, high);
  anychart.core.drawers.line(hatchFill, this.isVertical, x, high);
  anychart.core.drawers.line(highShape, this.isVertical, x, high);

  this.prevX_ = x;
  this.prevY_ = high;

  this.lowsStack.push(x, low);
};


/** @inheritDoc */
anychart.core.drawers.RangeStepArea.prototype.finalizeSegment = function() {
  if (!this.prevPointDrawn) return;
  if (this.lowsStack) {
    var shapes = this.shapesManager.getShapesGroup(this.seriesState);
    var fill = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.FILL]);
    var hatchFill = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.HATCH_FILL]);
    var low = /** @type {acgraph.vector.Path} */(shapes[anychart.opt.LOW]);

    /** @type {number} */
    var prevX = NaN;
    /** @type {number} */
    var prevY = NaN;
    var first = true;
    for (var i = this.lowsStack.length - 1; i >= 0; i -= 2) {
      var x = this.lowsStack[i - 1];
      var y = this.lowsStack[i];
      if (first) {
        anychart.core.drawers.move(low, this.isVertical, x, y);
        first = false;
      } else {
        switch (this.direction_) {
          case anychart.enums.StepDirection.FORWARD:
            anychart.core.drawers.line(fill, this.isVertical, prevX, y);
            anychart.core.drawers.line(hatchFill, this.isVertical, prevX, y);
            anychart.core.drawers.line(low, this.isVertical, prevX, y);
            break;
          case anychart.enums.StepDirection.BACKWARD:
            anychart.core.drawers.line(fill, this.isVertical, x, prevY);
            anychart.core.drawers.line(hatchFill, this.isVertical, x, prevY);
            anychart.core.drawers.line(low, this.isVertical, x, prevY);
            break;
          default:
            var midX = (x + prevX) / 2;
            anychart.core.drawers.line(fill, this.isVertical, midX, prevY, midX, y);
            anychart.core.drawers.line(hatchFill, this.isVertical, midX, prevY, midX, y);
            anychart.core.drawers.line(low, this.isVertical, midX, prevY, midX, y);
        }
      }
      anychart.core.drawers.line(fill, this.isVertical, x, y);
      anychart.core.drawers.line(hatchFill, this.isVertical, x, y);
      anychart.core.drawers.line(low, this.isVertical, x, y);
      prevX = x;
      prevY = y;
    }
    fill.close();
    hatchFill.close();
    this.lowsStack = null;
  }
};
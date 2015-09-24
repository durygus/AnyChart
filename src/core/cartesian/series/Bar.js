goog.provide('anychart.core.cartesian.series.Bar');

goog.require('anychart.core.cartesian.series.BarBase');



/**
 * Define Bar series type.<br/>
 * <b>Note:</b> Use method {@link anychart.charts.Cartesian#bar} to get this series.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data Data for the series.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings
 *    here as a hash map.
 * @constructor
 * @extends {anychart.core.cartesian.series.BarBase}
 */
anychart.core.cartesian.series.Bar = function(opt_data, opt_csvSettings) {
  goog.base(this, opt_data, opt_csvSettings);

  // Define reference fields for a series
  this.referenceValueNames = ['x', 'value', 'value'];
  this.referenceValueMeanings = ['x', 'z', 'y'];
  this.referenceValuesSupportStack = true;

  this.isAnimation_ = false;
};
goog.inherits(anychart.core.cartesian.series.Bar, anychart.core.cartesian.series.BarBase);
anychart.core.cartesian.series.Base.SeriesTypesMap[anychart.enums.CartesianSeriesType.BAR] = anychart.core.cartesian.series.Bar;


/**
 * Whether series in animation now.
 * @param {boolean} value animation state.
 */
anychart.core.cartesian.series.Bar.prototype.setAnimation = function(value) {
  if (goog.isDef(value)) {
    if (this.isAnimation_ != value) {
      this.isAnimation_ = value;
    }
  }
};


/** @inheritDoc */
anychart.core.cartesian.series.Bar.prototype.drawSubsequentPoint = function(pointState) {
  var referenceValues = this.getReferenceCoords();
  if (!referenceValues)
    return false;

  if (this.hasInvalidationState(anychart.ConsistencyState.APPEARANCE)) {
    var x = referenceValues[0];
    var zero = referenceValues[1];
    var y = referenceValues[2];

    /** @type {!acgraph.vector.Rect} */
    var rect = /** @type {!acgraph.vector.Rect} */(this.rootElement.genNextChild());
    var barWidth = this.getPointWidth();

    this.getIterator().meta('x', x).meta('zero', zero).meta('value', y).meta('shape', rect);
    if (!this.isAnimation_)
      rect
        .setX(Math.min(zero, y))
        .setY(x - barWidth / 2)
        .setWidth(Math.abs(zero - y))
        .setHeight(barWidth);
    else
      rect
        .setY(x - barWidth / 2)
        .setHeight(barWidth);

    this.colorizeShape(pointState);

    this.makeInteractive(rect);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.SERIES_HATCH_FILL)) {
    var iterator = this.getIterator();
    var hatchFillShape = this.hatchFillRootElement ?
        /** @type {!acgraph.vector.Rect} */(this.hatchFillRootElement.genNextChild()) :
        null;
    iterator.meta('hatchFillShape', hatchFillShape);
    var shape = /** @type {acgraph.vector.Shape} */(iterator.meta('shape'));
    if (goog.isDef(shape) && hatchFillShape) {
      hatchFillShape.deserialize(shape.serialize());
    }
    this.applyHatchFill(pointState);
  }

  return true;
};


/**
 * @inheritDoc
 */
anychart.core.cartesian.series.Bar.prototype.getType = function() {
  return anychart.enums.CartesianSeriesType.BAR;
};


//exports
anychart.core.cartesian.series.Bar.prototype['fill'] = anychart.core.cartesian.series.Bar.prototype.fill;//inherited
anychart.core.cartesian.series.Bar.prototype['hoverFill'] = anychart.core.cartesian.series.Bar.prototype.hoverFill;//inherited
anychart.core.cartesian.series.Bar.prototype['selectFill'] = anychart.core.cartesian.series.Bar.prototype.selectFill;//inherited

anychart.core.cartesian.series.Bar.prototype['stroke'] = anychart.core.cartesian.series.Bar.prototype.stroke;//inherited
anychart.core.cartesian.series.Bar.prototype['hoverStroke'] = anychart.core.cartesian.series.Bar.prototype.hoverStroke;//inherited
anychart.core.cartesian.series.Bar.prototype['selectStroke'] = anychart.core.cartesian.series.Bar.prototype.selectStroke;//inherited

anychart.core.cartesian.series.Bar.prototype['hatchFill'] = anychart.core.cartesian.series.Bar.prototype.hatchFill;//inherited
anychart.core.cartesian.series.Bar.prototype['hoverHatchFill'] = anychart.core.cartesian.series.Bar.prototype.hoverHatchFill;//inherited
anychart.core.cartesian.series.Bar.prototype['selectHatchFill'] = anychart.core.cartesian.series.Bar.prototype.selectHatchFill;//inherited

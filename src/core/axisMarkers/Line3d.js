goog.provide('anychart.core.axisMarkers.Line3d');
goog.require('anychart.core.axisMarkers.Line');



/**
 * Line marker.
 * @constructor
 * @extends {anychart.core.axisMarkers.Line}
 */
anychart.core.axisMarkers.Line3d = function() {
  anychart.core.axisMarkers.Line3d.base(this, 'constructor');
};
goog.inherits(anychart.core.axisMarkers.Line3d, anychart.core.axisMarkers.Line);


/**
 * Sets the chart axisMarkers belongs to.
 * @param {anychart.core.SeparateChart} chart Chart instance.
 */
anychart.core.axisMarkers.Line3d.prototype.setChart = function(chart) {
  this.chart_ = chart;
};


/**
 * Get the chart axisMarkers belongs to.
 * @return {anychart.core.SeparateChart}
 */
anychart.core.axisMarkers.Line3d.prototype.getChart = function() {
  return this.chart_;
};


/** @inheritDoc */
anychart.core.axisMarkers.Line3d.prototype.boundsInvalidated = function() {
  var ratio = goog.math.clamp(this.scale().transform(this.value(), 0.5), 0, 1);
  if (isNaN(ratio)) return;

  var shift = this.markerElement().strokeThickness() % 2 == 0 ? 0 : -.5;
  var bounds = this.parentBounds();
  var axesLinesSpace = this.axesLinesSpace();
  this.markerElement().clear();

  var x3dShift = this.getChart().x3dShift;
  var y3dShift = this.getChart().y3dShift;

  if (this.layout() == anychart.enums.Layout.HORIZONTAL) {
    var y = Math.round(bounds.getTop() + bounds.height - ratio * bounds.height);
    ratio == 1 ? y -= shift : y += shift;
    this.markerElement()
        .moveTo(bounds.getLeft(), y)
        .lineTo(bounds.getRight() + x3dShift, y);

  } else if (this.layout() == anychart.enums.Layout.VERTICAL) {
    var x = Math.round(bounds.getLeft() + ratio * bounds.width);
    ratio == 1 ? x += shift : x -= shift;
    this.markerElement()
        .moveTo(x, bounds.getTop() - y3dShift)
        .lineTo(x, bounds.getBottom());
  }

  bounds.top -= y3dShift;
  bounds.height += y3dShift;
  bounds.width += x3dShift;

  this.markerElement().clip(axesLinesSpace.tightenBounds(/** @type {!anychart.math.Rect} */(bounds)));
};

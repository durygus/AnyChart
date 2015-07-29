goog.provide('anychart.ui.Title');
goog.require('anychart.core.ui.Title');



/**
 * @constructor
 * @extends {anychart.core.ui.Title}
 */
anychart.ui.Title = function() {
  goog.base(this);
};
goog.inherits(anychart.ui.Title, anychart.core.ui.Title);


/**
 * Constructor function.
 * @return {!anychart.ui.Title}
 */
anychart.ui.title = function() {
  var res = new anychart.ui.Title();
  res.setup(anychart.getFullTheme()['standalones']['title']);
  return res;
};


//exports
goog.exportSymbol('anychart.ui.title', anychart.ui.title);
anychart.ui.Title.prototype['draw'] = anychart.ui.Title.prototype.draw;
anychart.ui.Title.prototype['parentBounds'] = anychart.ui.Title.prototype.parentBounds;
anychart.ui.Title.prototype['container'] = anychart.ui.Title.prototype.container;

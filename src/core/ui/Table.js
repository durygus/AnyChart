goog.provide('anychart.core.ui.Table');
goog.require('acgraph');
goog.require('anychart.core.VisualBaseWithBounds');
goog.require('anychart.core.ui.LabelsFactory');
goog.require('anychart.core.ui.MarkersFactory');
goog.require('anychart.core.ui.table.Cell');
goog.require('anychart.core.ui.table.Column');
goog.require('anychart.core.ui.table.IProxyUser');
goog.require('anychart.core.ui.table.Row');
goog.require('anychart.core.utils.Padding');
goog.require('anychart.enums');
goog.require('anychart.utils');



/**
 * Represents table element.<br/>
 * <b>Note:</b> Use {@link anychart.ui.table} method to create it.
 * @param {number=} opt_rowsCount Number of rows in the table.
 * @param {number=} opt_colsCount Number of columns in the table.
 * @constructor
 * @extends {anychart.core.VisualBaseWithBounds}
 * @implements {anychart.core.ui.table.IProxyUser}
 */
anychart.core.ui.Table = function(opt_rowsCount, opt_colsCount) {
  goog.base(this);

  /**
   * Cells array.
   * @type {Array.<anychart.core.ui.table.Cell>}
   * @private
   */
  this.cells_ = [];

  /**
   * Current columns count.
   * @type {number}
   * @private
   */
  this.colsCount_ = anychart.utils.normalizeToNaturalNumber(opt_colsCount, 4);

  /**
   * Current rows count.
   * @type {number}
   * @private
   */
  this.rowsCount_ = anychart.utils.normalizeToNaturalNumber(opt_rowsCount, 5);

  /**
   * This number tells the table how to rebuild the cells_ array.
   * If it is NaN - nothing to rebuild. In other cases it stores the previous number of columns.
   * @type {number}
   * @private
   */
  this.currentColsCount_ = 0;

  /**
   * Cells that should be disposed.
   * @type {Array.<anychart.core.ui.table.Cell>}
   * @private
   */
  this.cellsPool_ = [];

  /**
   * Row height settings. Array can contain holes.
   * @type {!Array.<number|string>}
   * @private
   */
  this.rowHeightSettings_ = [];

  /**
   * Col width settings. Array can contain holes.
   * @type {!Array.<number|string>}
   * @private
   */
  this.colWidthSettings_ = [];

  /**
   * Incremental row heights array. rowBottoms_[i] = rowBottoms_[i-1] + rowHeight[i] in pixels.
   * @type {!Array.<number>}
   * @private
   */
  this.rowBottoms_ = [];

  /**
   * Incremental col widths array. colRights_[i] = colRights_[i-1] + colWidth[i] in pixels.
   * @type {!Array.<number>}
   * @private
   */
  this.colRights_ = [];

  /**
   * Settings accumulator.
   * Possible structure: {!{
   *  // The same structure, as anychart.core.ui.table.Base.prototype.settingsObj has
   *  // cell fill
   *  fill: (acgraph.vector.Fill|undefined),
   *
   *  // cell border in Cell settings and row/col/table border in Row/Column/Table settings
   *  topBorder: (acgraph.vector.Stroke|undefined),
   *  rightBorder: (acgraph.vector.Stroke|undefined),
   *  bottomBorder: (acgraph.vector.Stroke|undefined),
   *  leftBorder: (acgraph.vector.Stroke|undefined),
   *  border: (acgraph.vector.Stroke|undefined), // actually Table do not use this property
   *
   *  // cell border in Row/Column settings
   *  cellTopBorder: (acgraph.vector.Stroke|undefined),
   *  cellRightBorder: (acgraph.vector.Stroke|undefined),
   *  cellBottomBorder: (acgraph.vector.Stroke|undefined),
   *  cellLeftBorder: (acgraph.vector.Stroke|undefined),
   *  cellBorder: (acgraph.vector.Stroke|undefined),
   *
   *  // cell padding
   *  topPadding: (number|undefined),
   *  rightPadding: (number|undefined),
   *  bottomPadding: (number|undefined),
   *  leftPadding: (number|undefined),
   *
   *  // text settings for text cells
   *  fontSize: (string|number|undefined),
   *  fontFamily: (string|undefined),
   *  fontColor: (string|undefined),
   *  fontOpacity: (number|undefined),
   *  fontDecoration: (acgraph.vector.Text.Decoration|undefined),
   *  fontStyle: (acgraph.vector.Text.FontStyle|undefined),
   *  fontVariant: (acgraph.vector.Text.FontVariant|undefined),
   *  fontWeight: (string|number|undefined),
   *  letterSpacing: (string|number|undefined),
   *  textDirection: (acgraph.vector.Text.Direction|undefined),
   *  lineHeight: (string|number|undefined),
   *  textIndent: (number|undefined),
   *  vAlign: (acgraph.vector.Text.VAlign|undefined),
   *  hAlign: (acgraph.vector.Text.HAlign|undefined),
   *  textWrap: (acgraph.vector.Text.TextWrap|undefined),
   *  textOverflow: (acgraph.vector.Text.TextOverflow|undefined),
   *  selectable: (boolean|undefined),
   *  disablePointerEvents: (boolean|undefined),
   *  useHtml: (boolean|undefined)
   *
   *  // Plus these two properties:
   *  rowEvenFill: (acgraph.vector.Fill|undefined),
   *  rowOddFill: (acgraph.vector.Fill|undefined)
   * }}
   * @type {!Object}
   */
  this.settingsObj = {
    'fill': 'none',
    'cellBorder': 'black',
    'topPadding': 0,
    'rightPadding': 0,
    'bottomPadding': 0,
    'leftPadding': 0,
    'hAlign': anychart.enums.HAlign.START,
    'vAlign': anychart.enums.VAlign.TOP
  };

  if (anychart.DEFAULT_THEME != 'v6')
    this.settingsObj['fill'] = '#fff';
};
goog.inherits(anychart.core.ui.Table, anychart.core.VisualBaseWithBounds);


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Table.prototype.SUPPORTED_SIGNALS =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.core.ui.Table.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.VisualBaseWithBounds.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.TABLE_CELL_BOUNDS |
    anychart.ConsistencyState.TABLE_OVERLAP |
    anychart.ConsistencyState.TABLE_BORDERS |
    anychart.ConsistencyState.TABLE_FILLS |
    anychart.ConsistencyState.TABLE_CONTENT |
    anychart.ConsistencyState.TABLE_STRUCTURE;


//region Private properties with null defaults
/**
 * Factory for cell text content wrappers.
 * @type {anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.ui.Table.prototype.labelsFactory_ = null;


/**
 * Table layer.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.Table.prototype.layer_ = null;


/**
 * Cell contents container.
 * @type {acgraph.vector.Layer}
 * @private
 */
anychart.core.ui.Table.prototype.contentLayer_ = null;


/**
 * Border paths dictionary by stroke object hash.
 * @type {Object.<string, !acgraph.vector.Path>}
 * @private
 */
anychart.core.ui.Table.prototype.borderPaths_ = null;


/**
 * Cell fill paths dictionary by fill object hash.
 * @type {Object.<string, !acgraph.vector.Path>}
 * @private
 */
anychart.core.ui.Table.prototype.fillPaths_ = null;


/**
 * Pool of freed paths that can be reused.
 * @type {Array.<acgraph.vector.Path>}
 * @private
 */
anychart.core.ui.Table.prototype.pathsPool_ = null;


/**
 * @type {Array.<anychart.core.VisualBase>}
 * @private
 */
anychart.core.ui.Table.prototype.contentToClear_ = null;


/**
 * Borders proxy object.
 * @type {anychart.core.ui.table.Border}
 * @private
 */
anychart.core.ui.Table.prototype.bordersProxy_ = null;


/**
 * Borders proxy object.
 * @type {anychart.core.ui.table.Border}
 * @private
 */
anychart.core.ui.Table.prototype.cellBordersProxy_ = null;


/**
 * Paddings proxy object.
 * @type {anychart.core.ui.table.Padding}}
 * @private
 */
anychart.core.ui.Table.prototype.paddingProxy_ = null;


/**
 * Rows array. Lazy creation, may contain undefined indexes.
 * @type {Array.<anychart.core.ui.table.Row>}
 * @private
 */
anychart.core.ui.Table.prototype.rows_ = null;


/**
 * Columns array. Lazy creation, may contain undefined indexes.
 * @type {Array.<anychart.core.ui.table.Column>}
 * @private
 */
anychart.core.ui.Table.prototype.cols_ = null;


/**
 * Row min height settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.core.ui.Table.prototype.rowMinHeightSettings_ = null;


/**
 * Row max height settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.core.ui.Table.prototype.rowMaxHeightSettings_ = null;


/**
 * Col min width settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.core.ui.Table.prototype.colMinWidthSettings_ = null;


/**
 * Col max width settings. Array can contain holes.
 * @type {Array.<number|string>}
 * @private
 */
anychart.core.ui.Table.prototype.colMaxWidthSettings_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Table.prototype.defaultRowHeight_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Table.prototype.defaultRowMinHeight_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Table.prototype.defaultRowMaxHeight_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Table.prototype.defaultColWidth_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Table.prototype.defaultColMinWidth_ = null;


/**
 * Default row height settings.
 * @type {number|string|null}
 * @private
 */
anychart.core.ui.Table.prototype.defaultColMaxWidth_ = null;
//endregion


//region Table methods
//----------------------------------------------------------------------------------------------------------------------
//
//  Public methods to setup or query table
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for table rows count.
 * @return {number} Current rows count.
 *//**
 * Setter for table rows count.<br/>
 * <b>Note:</b> Calculated from the contents if not defined explicitly.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.rowsCount(3);
 * table.container(stage).draw();
 * @param {number=} opt_value [5] Value to set.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * Getter and setter for table rows count.
 * @param {number=} opt_value Rows count to set.
 * @return {!anychart.core.ui.Table|number}
 */
anychart.core.ui.Table.prototype.rowsCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.rowsCount_);
    if (this.rowsCount_ != opt_value) {
      if (isNaN(this.currentColsCount_)) // mark that we should rebuild the table
        this.currentColsCount_ = this.colsCount_;
      this.rowsCount_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_STRUCTURE | anychart.ConsistencyState.TABLE_OVERLAP,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.rowsCount_;
};


/**
 * Getter for table columns count.
 * @return {number} Current columns count.
 *//**
 * Setter for table columns count..<br/>
 * <b>Note:</b> Calculated from the contents if not defined explicitly.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.colsCount(2);
 * table.container(stage).draw();
 * @param {number=} opt_value [4] Value to set.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * Getter and setter for table columns count.
 * @param {number=} opt_value columns count to set.
 * @return {!anychart.core.ui.Table|number}
 */
anychart.core.ui.Table.prototype.colsCount = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.utils.normalizeToNaturalNumber(opt_value, this.colsCount_);
    if (this.colsCount_ != opt_value) {
      if (isNaN(this.currentColsCount_)) // mark that we should rebuild the table
        this.currentColsCount_ = this.colsCount_;
      this.colsCount_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_STRUCTURE | anychart.ConsistencyState.TABLE_OVERLAP,
          anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.colsCount_;
};


/**
 * Returns cell by its row and column number.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * var cell = table.getCell(1,1);
 * cell.content( anychart.ui.label().text('Text element'));
 * table.container(stage).draw();
 * @param {number} row Row index.
 * @param {number} col Column index.
 * @return {anychart.core.ui.table.Cell} {@link anychart.core.ui.table.Cell} instance for method chaining.
 */
anychart.core.ui.Table.prototype.getCell = function(row, col) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  row = anychart.utils.normalizeToNaturalNumber(row, NaN, true);
  col = anychart.utils.normalizeToNaturalNumber(col, NaN, true);
  return this.cells_[row * this.colsCount_ + col] || null;
};


/**
 * Returns row instance by its number. Returns null if there is no row with passed number.
 * @param {number} row
 * @return {anychart.core.ui.table.Row}
 */
anychart.core.ui.Table.prototype.getRow = function(row) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  row = anychart.utils.normalizeToNaturalNumber(row, NaN, true);
  if (isNaN(row) || row >= this.rowsCount_)
    return null;
  if (!this.rows_)
    this.rows_ = [];
  if (!(row in this.rows_))
    this.rows_[row] = new anychart.core.ui.table.Row(this, row);
  return this.rows_[row];
};


/**
 * Returns column instance by its number. Returns null if there is no column with passed number.
 * @param {number} col
 * @return {anychart.core.ui.table.Column}
 */
anychart.core.ui.Table.prototype.getCol = function(col) {
  this.checkTable_();
  // defaulting to NaN to return null when incorrect arguments are passed.
  col = anychart.utils.normalizeToNaturalNumber(col, NaN, true);
  if (isNaN(col) || col >= this.colsCount_)
    return null;
  if (!this.cols_)
    this.cols_ = [];
  if (!(col in this.cols_))
    this.cols_[col] = new anychart.core.ui.table.Column(this, col);
  return this.cols_[col];
};


/**
 * Getter and setter for default row height settings. Defaults to null - divide the rest of table height between
 * rows with null height evenly.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.rowsHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowHeight_ != opt_value) {
      this.defaultRowHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultRowHeight_;
};


/**
 * Getter and setter for default row height minimum settings. Defaults to null - no minimum height.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.rowsMinHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowMinHeight_ != opt_value) {
      this.defaultRowMinHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultRowMinHeight_;
};


/**
 * Getter and setter for default row height maximum settings. Defaults to null - no maximum height.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.rowsMaxHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultRowMaxHeight_ != opt_value) {
      this.defaultRowMaxHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultRowMaxHeight_;
};


/**
 * Getter and setter for default column width settings. Defaults to null - divide the rest of table width between
 * columns with null width evenly.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.colsWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultColWidth_ != opt_value) {
      this.defaultColWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultColWidth_;
};


/**
 * Getter and setter for default column width minimum settings. Defaults to null - no minimum width.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.colsMinWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultColMinWidth_ != opt_value) {
      this.defaultColMinWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultColMinWidth_;
};


/**
 * Getter and setter for default column width maximum settings. Defaults to null - no maximum width.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.colsMaxWidth = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.defaultColMaxWidth_ != opt_value) {
      this.defaultColMaxWidth_ = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.defaultColMaxWidth_;
};


/**
 * Border for the table (not cells). Overrides this.cellBorder() settings for the borders that are on the border of the
 * table. :)
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.Table|anychart.core.ui.table.Border} Border settings instance or this for chaining.
 */
anychart.core.ui.Table.prototype.border = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    if (!goog.isNull(opt_strokeOrFill))
      opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.suspendSignalsDispatching();
    this.settings('border', /** @type {acgraph.vector.Stroke|null|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    for (var i = 0; i < 4; i++)
      this.settings(anychart.core.ui.table.Border.propNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.bordersProxy_ || (this.bordersProxy_ = new anychart.core.ui.table.Border(this, false));
};


/**
 * Getter for table content.<br/>
 * <b>Note:</b> Returns cells content ignored rowSpan and colSpan.
 * @return {Array.<Array.<(anychart.core.VisualBase)>>} Current table content.
 *//**
 * Setter for table content.<br/>
 * <b>Note:</b> Pass <b>null</b> to drop table content.
 * @example
 * var dataSet = [
 *   [1.1, 2.3, 1.7, 1.9],
 *   [1.2, 2.1, 2.7, 1.3],
 *   [1.0, 1.2, 0.7, 1.1],
 *   [1.3, 2.4, 1.7, 1.9]
 * ];
 * var pie = anychart.pie(dataSet).legend(null);
 * var table = anychart.ui.table();
 * table.contents([
 *     [pie, anychart.line(dataSet[0]).title(null).xAxis(null)],
 *     [null, anychart.area(dataSet[1]).title(null).xAxis(null)]
 * ]);
 * table.getCell(0,0).rowSpan(4);
 * table.container(stage).draw();
 * @param {Array.<Array.<(anychart.core.VisualBase|string|number|undefined)>>=} opt_tableValues Values to set.
 * @param {boolean=} opt_demergeCells [false] Pass <b>true</b> to demerge all cells.
 * @return {anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {Array.<Array.<(anychart.core.VisualBase|string|number|undefined)>>=} opt_tableValues
 * @param {boolean=} opt_demergeCells
 * @return {Array.<Array.<(anychart.core.VisualBase)>>|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.contents = function(opt_tableValues, opt_demergeCells) {
  var row, col, cell, rowArr;
  if (goog.isDef(opt_tableValues)) {
    var fail = !goog.isArray(opt_tableValues);
    var colsCount = 0, rowsCount;
    if (!fail) {
      rowsCount = opt_tableValues.length;
      for (row = 0; row < rowsCount; row++) {
        rowArr = opt_tableValues[row];
        if (goog.isArray(rowArr)) {
          if (rowArr.length > colsCount)
            colsCount = rowArr.length;
        } else {
          fail = true;
          break;
        }
      }
    }
    if (fail || !rowsCount || !colsCount) {
      anychart.utils.error(anychart.enums.ErrorCode.WRONG_TABLE_CONTENTS);
    } else {
      this.suspendSignalsDispatching();
      this.rowsCount(rowsCount);
      this.colsCount(colsCount);
      if (!!opt_demergeCells) {
        for (row = 0; row < rowsCount; row++) {
          for (col = 0; col < colsCount; col++) {
            cell = this.getCell(row, col);
            cell.rowSpan(1);
            cell.colSpan(1);
          }
        }
      }
      for (row = 0; row < rowsCount; row++) {
        rowArr = opt_tableValues[row];
        for (col = 0; col < colsCount; col++) {
          cell = this.getCell(row, col);
          cell.content(rowArr[col] || null);
        }
      }
      this.resumeSignalsDispatching(true);
    }
    return this;
  } else {
    // we have no cache here, because we want to return new arrays here anyway. So caching is useless.
    var result = [];
    for (row = 0; row < this.rowsCount_; row++) {
      rowArr = [];
      for (col = 0; col < this.colsCount_; col++) {
        rowArr.push(this.getCell(row, col).content());
      }
      result.push(rowArr);
    }
    return result;
  }
};


/**
 * Draws the table.
 * @return {anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 */
anychart.core.ui.Table.prototype.draw = function() {
  if (!this.checkDrawingNeeded())
    return this;

  if (!this.layer_) {
    this.layer_ = acgraph.layer();
    this.contentLayer_ = this.layer_.layer();
  }

  var stage = this.layer_.getStage();
  var manualSuspend = stage && !stage.isSuspended();
  if (manualSuspend) stage.suspend();

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // if sizes changed, it will be checked in drawing
    this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS);
    this.markConsistent(anychart.ConsistencyState.BOUNDS);
  }

  if (this.labelsFactory_) // we don't want to create it if no cell use it
    this.labelsFactory_.suspendSignalsDispatching();
  this.checkTable_();
  this.checkSizes_();
  this.checkOverlap_();
  this.checkFills_();
  this.checkBorders_();
  this.checkContent_();
  if (this.labelsFactory_)
    this.labelsFactory_.resumeSignalsDispatching(false);

  if (this.hasInvalidationState(anychart.ConsistencyState.Z_INDEX)) {
    this.layer_.zIndex(/** @type {number} */(this.zIndex()));
    this.markConsistent(anychart.ConsistencyState.Z_INDEX);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.CONTAINER)) {
    this.layer_.parent(/** @type {acgraph.vector.ILayer} */(this.container()));
    if (this.container() && this.container().getStage()) {
      //listen resize event
      stage = this.container().getStage();
      if (this.bounds().dependsOnContainerSize()) {
        this.container().getStage().listen(
            acgraph.vector.Stage.EventType.STAGE_RESIZE,
            this.resizeHandler_,
            false,
            this
        );
      } else {
        this.container().getStage().unlisten(
            acgraph.vector.Stage.EventType.STAGE_RESIZE,
            this.resizeHandler_,
            false,
            this
        );
      }
    }
    this.markConsistent(anychart.ConsistencyState.CONTAINER);
  }

  if (manualSuspend) stage.resume();

  //todo(Anton Saukh): refactor this mess!
  this.listenSignals(this.invalidateHandler_, this);
  //end mess

  return this;
};
//endregion


//region Cell settings
//----------------------------------------------------------------------------------------------------------------------
//
//  Cell settings
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Getter for text font size.
 * @return {string|number} Current font size.
 *//**
 * Setter for text font size.
 * @param {string|number=} opt_value ['16px'] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string|number=} opt_value .
 * @return {!anychart.core.ui.Table|string|number} .
 */
anychart.core.ui.Table.prototype.fontSize = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.Table|string|number} */(this.settings('fontSize', opt_value));
};


/**
 * Getter for the font family.
 * @return {string} The current font family.
 *//**
 * Setter for font family.
 * @param {string=} opt_value ['Arial'] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.Table|string} .
 */
anychart.core.ui.Table.prototype.fontFamily = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.ui.Table|string} */(this.settings('fontFamily', opt_value));
};


/**
 * Getter for the text font color.
 * @return {string} The current font color.
 *//**
 * Setter for the text font color.<br/>
 * {@link http://www.w3schools.com/html/html_colors.asp}
 * @param {string=} opt_value ['#000'] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {string=} opt_value .
 * @return {!anychart.core.ui.Table|string} .
 */
anychart.core.ui.Table.prototype.fontColor = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.ui.Table|string} */(this.settings('fontColor', opt_value));
};


/**
 * Getter for the text font opacity.
 * @return {number} The current font opacity.
 *//**
 * Setter for the text font opacity.<br/>
 * Double value from 0 to 1.
 * @param {number=} opt_value [1] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {!anychart.core.ui.Table|number} .
 */
anychart.core.ui.Table.prototype.fontOpacity = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = goog.math.clamp(+opt_value, 0, 1);
  return /** @type {!anychart.core.ui.Table|number} */(this.settings('fontOpacity', opt_value));
};


/**
 * Getter for the text font decoration.
 * @return {acgraph.vector.Text.Decoration|string} The current font decoration.
 *//**
 * Setter for the text font decoration.
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value [{@link acgraph.vector.Text.Decoration}.NONE] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Text.Decoration|string)=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.Decoration} .
 */
anychart.core.ui.Table.prototype.fontDecoration = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontDecoration(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.Decoration} */(this.settings('fontDecoration', opt_value));
};


/**
 * Getter for the text font style.
 * @return {acgraph.vector.Text.FontStyle|string} The current font style.
 *//**
 * Setter for the text font style.
 * @param {(acgraph.vector.Text.FontStyle|string)=} opt_value [{@link acgraph.vector.Text.FontStyle}.NORMAL] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontStyle|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.FontStyle} .
 */
anychart.core.ui.Table.prototype.fontStyle = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontStyle(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.FontStyle} */(this.settings('fontStyle', opt_value));
};


/**
 * Getter for the text font variant.
 * @return {acgraph.vector.Text.FontVariant|string} The current font variant.
 *//**
 * Setter for the text font variant.
 * @param {(acgraph.vector.Text.FontVariant|string)=} opt_value [{@link acgraph.vector.Text.FontVariant}.NORMAL] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.FontVariant|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.FontVariant} .
 */
anychart.core.ui.Table.prototype.fontVariant = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeFontVariant(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.FontVariant} */(this.settings('fontVariant', opt_value));
};


/**
 * Getter for the text font weight.
 * @return {string|number} The current font weight.
 *//**
 * Setter for the text font weight.<br/>
 * {@link http://www.w3schools.com/cssref/pr_font_weight.asp}
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(string|number)=} opt_value .
 * @return {!anychart.core.ui.Table|string|number} .
 */
anychart.core.ui.Table.prototype.fontWeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.Table|string|number} */(this.settings('fontWeight', opt_value));
};


/**
 * Getter for the text letter spacing.
 * @return {string|number} The current letter spacing.
 *//**
 * Setter for the text letter spacing.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.core.ui.Table|number|string} .
 */
anychart.core.ui.Table.prototype.letterSpacing = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.Table|number|string} */(this.settings('letterSpacing', opt_value));
};


/**
 * Getter for the text direction.
 * @return {acgraph.vector.Text.Direction|string} Current text direction.
 *//**
 * Setter for the text direction.
 * @param {(acgraph.vector.Text.Direction|string)=} opt_value [{@link acgraph.vector.Text.Direction}.LTR] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.Direction|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.Direction} .
 */
anychart.core.ui.Table.prototype.textDirection = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextDirection(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.Direction} */(this.settings('textDirection', opt_value));
};


/**
 * Getter for the text line height.
 * @return {string|number} The current text line height.
 *//**
 * Setter for the text line height.<br/>
 * {@link http://www.w3schools.com/cssref/pr_text_letter-spacing.asp}
 * @param {(string|number)=} opt_value ['normal'] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {(number|string)=} opt_value .
 * @return {!anychart.core.ui.Table|number|string} .
 */
anychart.core.ui.Table.prototype.lineHeight = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = anychart.utils.toNumberOrString(opt_value);
  return /** @type {!anychart.core.ui.Table|number|string} */(this.settings('lineHeight', opt_value));
};


/**
 * Getter for the text indent.
 * @return {number} The current text indent.
 *//**
 * Setter for the text indent.
 * @param {number=} opt_value [0] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {number=} opt_value .
 * @return {!anychart.core.ui.Table|number} .
 */
anychart.core.ui.Table.prototype.textIndent = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = parseFloat(anychart.utils.toNumberOrString(opt_value));
  return /** @type {!anychart.core.ui.Table|number} */(this.settings('textIndent', opt_value));
};


/**
 * Getter for the text vertical align.
 * @return {acgraph.vector.Text.VAlign|string} The current text vertical align.
 *//**
 * Setter for the text vertical align.
 * @param {(acgraph.vector.Text.VAlign|string)=} opt_value [{@link acgraph.vector.Text.VAlign}.TOP] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.VAlign|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.VAlign} .
 */
anychart.core.ui.Table.prototype.vAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeVAlign(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.VAlign} */(this.settings('vAlign', opt_value));
};


/**
 * Getter for the text horizontal align.
 * @return {acgraph.vector.Text.HAlign|string} Th current text horizontal align.
 *//**
 * Setter for the text horizontal align.
 * @param {(acgraph.vector.Text.HAlign|string)=} opt_value [{@link acgraph.vector.Text.HAlign}.START] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.HAlign|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.HAlign} .
 */
anychart.core.ui.Table.prototype.hAlign = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeHAlign(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.HAlign} */(this.settings('hAlign', opt_value));
};


/**
 * Getter for the text wrap settings.
 * @return {acgraph.vector.Text.TextWrap|string} Th current text wrap settings.
 *//**
 * Setter for the text wrap settings.
 * @param {(acgraph.vector.Text.TextWrap|string)=} opt_value [{@link acgraph.vector.Text.TextWrap}.BY_LETTER] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextWrap|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.TextWrap} .
 */
anychart.core.ui.Table.prototype.textWrap = function(opt_value) {
  if (goog.isDef(opt_value)) {
    opt_value = anychart.enums.normalizeTextWrap(opt_value);
  }
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.TextWrap} */(this.settings('textWrap', opt_value));
};


/**
 * Getter for the text overflow settings.
 * @return {acgraph.vector.Text.TextOverflow|string} The current text overflow settings.
 *//**
 * Setter for the text overflow settings.
 * @param {(acgraph.vector.Text.TextOverflow|string)=} opt_value [{@link acgraph.vector.Text.TextOverflow}.CLIP] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {acgraph.vector.Text.TextOverflow|string=} opt_value .
 * @return {!anychart.core.ui.Table|acgraph.vector.Text.TextOverflow} .
 */
anychart.core.ui.Table.prototype.textOverflow = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = String(opt_value);
  return /** @type {!anychart.core.ui.Table|acgraph.vector.Text.TextOverflow} */(this.settings('textOverflow', opt_value));
};


/**
 * Getter for the text selectable option.
 * @return {boolean} The current text selectable option.
 *//**
 * Setter for the text selectable.<br/>
 * This options defines whether the text can be selected. If set to <b>false</b> one can't select the text.
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.core.ui.Table|boolean} .
 */
anychart.core.ui.Table.prototype.selectable = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.ui.Table|boolean} */(this.settings('selectable', opt_value));
};


/**
 * Gets current state of disablePointerEvents option.
 * @return {boolean} If pointer events are disabled.
 *//**
 * Setter for the text disablePointerEvents option.<br/>
 * This options defines whether the text should pass mouse events through.
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.core.ui.Table|boolean} .
 */
anychart.core.ui.Table.prototype.disablePointerEvents = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.ui.Table|boolean} */(this.settings('disablePointerEvents', opt_value));
};


/**
 * Getter for the useHtml flag.
 * @return {boolean} The current value of useHTML flag.
 *//**
 * Setter for flag useHtml.<br/>
 * This property defines whether HTML text should be parsed.
 * @param {boolean=} opt_value [false] Value to set.
 * @return {!anychart.core.ui.Table} An instance of {@link anychart.core.ui.Table} class for method chaining.
 *//**
 * @ignoreDoc
 * @param {boolean=} opt_value .
 * @return {!anychart.core.ui.Table|boolean} .
 */
anychart.core.ui.Table.prototype.useHtml = function(opt_value) {
  if (goog.isDef(opt_value)) opt_value = !!opt_value;
  return /** @type {!anychart.core.ui.Table|boolean} */(this.settings('useHtml', opt_value));
};


/**
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellFill('green 0.2');
 * table.container(stage).draw();
 * @example <c>Linear gradient fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellFill(['green 0.2', 'yellow 0.2']);
 * table.container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellFill('green', 0.3);
 * table.container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellFill(['black', 'yellow'], 45, true, 0.5);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellFill({
 *    src: 'http://static.anychart.com/underwater.jpg',
 *    mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * table.container(stage).draw();
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Table} .
 */
anychart.core.ui.Table.prototype.cellFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.core.ui.Table} */(this.settings('fill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill('green 0.2');
 * table.container(stage).draw();
 * @example <c>Linear gradient fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill(['green 0.2', 'yellow 0.2']);
 * table.container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill('green', 0.3);
 * table.container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill(['black', 'yellow'], 45, true, 0.5);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill({
 *    src: 'http://static.anychart.com/underwater.jpg',
 *    mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * table.container(stage).draw();
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Table|undefined} .
 */
anychart.core.ui.Table.prototype.rowOddFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.core.ui.Table} */(this.settings('rowOddFill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter for current series fill color.
 * @return {!acgraph.vector.Fill} Current fill color.
 *//**
 * Sets fill settings using an object or a string.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <c>Solid fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellEvenFill('green 0.2');
 * table.container(stage).draw();
 * @example <c>Linear gradient fill</c><t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellOddFill(['green 0.2', 'yellow 0.2']);
 * table.container(stage).draw();
 * @param {acgraph.vector.Fill} value [null] Color as an object or a string.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Fill color with opacity.<br/>
 * <b>Note:</b> If color is set as a string (e.g. 'red .5') it has a priority over opt_opacity, which
 * means: <b>color</b> set like this <b>rect.fill('red 0.3', 0.7)</b> will have 0.3 opacity.
 * @shortDescription Fill as a string or an object.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellEvenFill('green', 0.3);
 * table.container(stage).draw();
 * @param {string} color Color as a string.
 * @param {number=} opt_opacity Color opacity.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Linear gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellEvenFill(['black', 'yellow'], 45, true, 0.5);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Gradient keys.
 * @param {number=} opt_angle Gradient angle.
 * @param {(boolean|!acgraph.vector.Rect|!{left:number,top:number,width:number,height:number})=} opt_mode Gradient mode.
 * @param {number=} opt_opacity Gradient opacity.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Radial gradient fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellEvenFill(['black', 'yellow'], .5, .5, null, .9, 0.3, 0.81);
 * table.container(stage).draw();
 * @param {!Array.<(acgraph.vector.GradientKey|string)>} keys Color-stop gradient keys.
 * @param {number} cx X ratio of center radial gradient.
 * @param {number} cy Y ratio of center radial gradient.
 * @param {acgraph.math.Rect=} opt_mode If defined then userSpaceOnUse mode, else objectBoundingBox.
 * @param {number=} opt_opacity Opacity of the gradient.
 * @param {number=} opt_fx X ratio of focal point.
 * @param {number=} opt_fy Y ratio of focal point.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Image fill.<br/>
 * Learn more about coloring at:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Fill}
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellEvenFill({
 *    src: 'http://static.anychart.com/underwater.jpg',
 *    mode: acgraph.vector.ImageFillMode.STRETCH
 * });
 * table.container(stage).draw();
 * @param {!acgraph.vector.Fill} imageSettings Object with settings.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(!acgraph.vector.Fill|!Array.<(acgraph.vector.GradientKey|string)>|Function|null)=} opt_fillOrColorOrKeys .
 * @param {number=} opt_opacityOrAngleOrCx .
 * @param {(number|boolean|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number})=} opt_modeOrCy .
 * @param {(number|!acgraph.math.Rect|!{left:number,top:number,width:number,height:number}|null)=} opt_opacityOrMode .
 * @param {number=} opt_opacity .
 * @param {number=} opt_fx .
 * @param {number=} opt_fy .
 * @return {acgraph.vector.Fill|anychart.core.ui.Table|undefined} .
 */
anychart.core.ui.Table.prototype.rowEvenFill = function(opt_fillOrColorOrKeys, opt_opacityOrAngleOrCx, opt_modeOrCy, opt_opacityOrMode, opt_opacity, opt_fx, opt_fy) {
  if (goog.isDefAndNotNull(opt_fillOrColorOrKeys)) // we want to keep null first param as null, not as 'none'
    opt_fillOrColorOrKeys = acgraph.vector.normalizeFill.apply(null, arguments);
  return /** @type {acgraph.vector.Fill|anychart.core.ui.Table} */(this.settings('rowEvenFill',
      /** @type {acgraph.vector.Fill|null|undefined} */(opt_fillOrColorOrKeys), anychart.ConsistencyState.TABLE_FILLS));
};


/**
 * Getter for current cell border settings.
 * @return {!anychart.core.ui.table.Border} Current stroke settings.
 *//**
 * Setter for cell border settings.<br/>
 * Learn more about stroke settings:
 * {@link http://docs.anychart.com/__VERSION__/General_settings/Elements_Stroke}<br/>
 * <b>Note:</b> The last usage of leftBorder(), rightBorder(), topBorder() and bottomBorder() methods determines
 * the border for the corresponding side.<br/>
 * <b>Note:</b> <u>lineJoin</u> settings not working here.
 * @shortDescription Setter for cell border settings.
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellBorder('orange', 3, '5 2', 'round');
 * table.container(stage).draw();
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|Function|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * @param {(acgraph.vector.Stroke|acgraph.vector.ColoredFill|string|null)=} opt_strokeOrFill Fill settings
 *    or stroke settings.
 * @param {number=} opt_thickness [1] Line thickness.
 * @param {string=} opt_dashpattern Controls the pattern of dashes and gaps used to stroke paths.
 * @param {acgraph.vector.StrokeLineJoin=} opt_lineJoin Line join style.
 * @param {acgraph.vector.StrokeLineCap=} opt_lineCap Line cap style.
 * @return {anychart.core.ui.Table|anychart.core.ui.table.Border} .
 */
anychart.core.ui.Table.prototype.cellBorder = function(opt_strokeOrFill, opt_thickness, opt_dashpattern, opt_lineJoin, opt_lineCap) {
  if (goog.isDef(opt_strokeOrFill)) {
    // we treat null as 'none' here because we don't want to be left without super default border
    opt_strokeOrFill = acgraph.vector.normalizeStroke.apply(null, arguments);
    this.suspendSignalsDispatching();
    this.settings('cellBorder', /** @type {acgraph.vector.Stroke|undefined} */(opt_strokeOrFill), anychart.ConsistencyState.TABLE_BORDERS);
    for (var i = 0; i < 4; i++)
      this.settings(anychart.core.ui.table.Border.cellPropNames[i], null, anychart.ConsistencyState.TABLE_BORDERS);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.cellBordersProxy_ || (this.cellBordersProxy_ = new anychart.core.ui.table.Border(this, true));
};


/**
 * Getter for the cell padding settings.
 * @return {!anychart.core.utils.Padding} {@link anychart.core.utils.Padding} instance for method chaining.
 *//**
 * Setter for the cell paddings in pixels using a single value.<br/>
 * @example <t>listingOnly</t>
 * // all paddings 15px
 * table.cellPadding(15);
 * // all paddings 15px
 * table.cellPadding('15px');
 * // top and bottom 5px ,right and left 15px
 * table.cellPadding(anychart.utils.space(5,15));
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellPadding([10, 20]);
 * table.container(stage).draw();
 * @param {(null|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_value Value to set.
 * @return {!anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * Setter for the cell paddings in pixels using several numbers.<br/>
 * @example <t>listingOnly</t>
 * // 1) top and bottom 10px, left and right 15px
 * table.cellPadding(10, '15px');
 * // 2) top 10px, left and right 15px, bottom 5px
 * table.cellPadding(10, '15px', 5);
 * // 3) top 10px, right 15px, bottom 5px, left 12px
 * table.cellPadding(10, '15px', '5px', 12);
 * @example <t>simple-h100</t>
 * var table = anychart.ui.table();
 * table.contents([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11]]);
 * table.cellPadding(10, '15px', '5px', 12);
 * table.container(stage).draw();
 * @param {(string|number)=} opt_value1 Top or top-bottom space.
 * @param {(string|number)=} opt_value2 Right or right-left space.
 * @param {(string|number)=} opt_value3 Bottom space.
 * @param {(string|number)=} opt_value4 Left space.
 * @return {anychart.core.ui.Table} {@link anychart.core.ui.Table} instance for method chaining.
 *//**
 * @ignoreDoc
 * Cell padding settings.
 * @param {(null|string|number|Array.<number|string>|{top:(number|string),left:(number|string),bottom:(number|string),right:(number|string)})=} opt_spaceOrTopOrTopAndBottom .
 * @param {(string|number)=} opt_rightOrRightAndLeft .
 * @param {(string|number)=} opt_bottom .
 * @param {(string|number)=} opt_left .
 * @return {!(anychart.core.ui.Table|anychart.core.ui.table.Padding)} .
 */
anychart.core.ui.Table.prototype.cellPadding = function(opt_spaceOrTopOrTopAndBottom, opt_rightOrRightAndLeft, opt_bottom, opt_left) {
  if (goog.isDef(opt_spaceOrTopOrTopAndBottom)) {
    var top, right, bottom, left;
    var argsLen;
    if (goog.isArray(opt_spaceOrTopOrTopAndBottom)) {
      var tmp = opt_spaceOrTopOrTopAndBottom;
      opt_spaceOrTopOrTopAndBottom = tmp[0];
      opt_rightOrRightAndLeft = tmp[1];
      opt_bottom = tmp[2];
      opt_left = tmp[3];
      argsLen = tmp.length;
    } else
      argsLen = arguments.length;
    if (argsLen == 0) {
      left = bottom = right = top = 0;
    } else if (goog.isObject(opt_spaceOrTopOrTopAndBottom)) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['top']) || 0;
      right = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['right']) || 0;
      bottom = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['bottom']) || 0;
      left = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom['left']) || 0;
    } else if (argsLen == 1) {
      left = bottom = right = top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
    } else if (argsLen == 2) {
      bottom = top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      left = right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
    } else if (argsLen == 3) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      left = right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
      bottom = anychart.utils.toNumberOrString(opt_bottom) || 0;
    } else if (argsLen >= 4) {
      top = anychart.utils.toNumberOrString(opt_spaceOrTopOrTopAndBottom) || 0;
      right = anychart.utils.toNumberOrString(opt_rightOrRightAndLeft) || 0;
      bottom = anychart.utils.toNumberOrString(opt_bottom) || 0;
      left = anychart.utils.toNumberOrString(opt_left) || 0;
    }
    this.suspendSignalsDispatching();
    this.settings(anychart.core.ui.table.Padding.propNames[0], top, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.core.ui.table.Padding.propNames[1], right, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.core.ui.table.Padding.propNames[2], bottom, anychart.ConsistencyState.TABLE_CONTENT);
    this.settings(anychart.core.ui.table.Padding.propNames[3], left, anychart.ConsistencyState.TABLE_CONTENT);
    this.resumeSignalsDispatching(true);
    return this;
  }
  return this.paddingProxy_ || (this.paddingProxy_ = new anychart.core.ui.table.Padding(this));
};
//endregion


//region Drawing phases
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing phases
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Rebuilds table, applying new rows and cols count.
 * @private
 */
anychart.core.ui.Table.prototype.checkTable_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_STRUCTURE)) {
    var newCells = [];
    var currentRowsCount = this.currentColsCount_ ? this.cells_.length / this.currentColsCount_ : 0;
    var row, col;
    var rowsFromCells = Math.min(currentRowsCount, this.rowsCount_);
    var colsFromCells = Math.min(this.currentColsCount_, this.colsCount_);
    for (row = 0; row < rowsFromCells; row++) { // processing rows that are both in current in new tables
      for (col = 0; col < colsFromCells; col++) // adding cells from current cells_ array.
        newCells.push(this.cells_[row * this.currentColsCount_ + col]);
      for (col = colsFromCells; col < this.colsCount_; col++) // adding new cells to the row if needed.
        newCells.push(this.allocCell_(row, col));
      for (col = colsFromCells; col < this.currentColsCount_; col++) // clearing cells that are not needed anymore.
        this.freeCell_(this.cells_[row * this.currentColsCount_ + col]);
    }

    for (row = rowsFromCells; row < this.rowsCount_; row++) { // rows that should be added entirely
      for (col = 0; col < this.colsCount_; col++) // adding new cells if needed.
        newCells.push(this.allocCell_(row, col));
    }

    for (row = rowsFromCells; row < currentRowsCount; row++) { // rows that should be removed entirely
      for (col = 0; col < this.currentColsCount_; col++) // clearing cells that are not needed anymore.
        this.freeCell_(this.cells_[row * this.currentColsCount_ + col]);
    }

    this.cells_ = newCells;
    this.currentColsCount_ = NaN;
    this.markConsistent(anychart.ConsistencyState.TABLE_STRUCTURE);
    this.invalidate(
        anychart.ConsistencyState.TABLE_CELL_BOUNDS |
        anychart.ConsistencyState.TABLE_OVERLAP |
        anychart.ConsistencyState.TABLE_BORDERS |
        anychart.ConsistencyState.TABLE_FILLS |
        anychart.ConsistencyState.TABLE_CONTENT);
  }
};


/**
 * Rebuilds cell sizes.
 * @private
 */
anychart.core.ui.Table.prototype.checkSizes_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_CELL_BOUNDS)) {
    var pixelBounds = this.getPixelBounds();

    var newColRights = this.countSizes_(this.colsCount_, this.colWidthSettings_, this.colMinWidthSettings_,
        this.colMaxWidthSettings_, this.defaultColWidth_, this.defaultColMinWidth_, this.defaultColMaxWidth_,
        pixelBounds.width, this.colRights_);

    var newRowBottoms = this.countSizes_(this.rowsCount_, this.rowHeightSettings_, this.rowMinHeightSettings_,
        this.rowMaxHeightSettings_, this.defaultRowHeight_, this.defaultRowMinHeight_, this.defaultRowMaxHeight_,
        pixelBounds.height, this.rowBottoms_);

    this.markConsistent(anychart.ConsistencyState.TABLE_CELL_BOUNDS);
    if (newColRights || newRowBottoms) {
      this.colRights_ = newColRights || this.colRights_;
      this.rowBottoms_ = newRowBottoms || this.rowBottoms_;
      this.invalidate(
          anychart.ConsistencyState.TABLE_BORDERS |
          anychart.ConsistencyState.TABLE_FILLS |
          anychart.ConsistencyState.TABLE_CONTENT);
    }
  }
};


/**
 * Renews overlapping cells marking.
 * @private
 */
anychart.core.ui.Table.prototype.checkOverlap_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_OVERLAP)) {
    var i, j;
    for (i = 0; i < this.cells_.length; i++) {
      this.cells_[i].overlapper = NaN;
    }
    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var index = row * this.colsCount_ + col;
        var cell = this.cells_[index];
        if (isNaN(cell.overlapper) && (cell.colSpan() > 1 || cell.rowSpan() > 1)) {
          for (i = Math.min(this.rowsCount_, row + cell.rowSpan()); i-- > row;) {
            for (j = Math.min(this.colsCount_, col + cell.colSpan()); j-- > col;) {
              this.cells_[i * this.colsCount_ + j].overlapper = index;
            }
          }
          cell.overlapper = NaN;
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_OVERLAP);
    this.invalidate(
        anychart.ConsistencyState.TABLE_BORDERS |
        anychart.ConsistencyState.TABLE_FILLS |
        anychart.ConsistencyState.TABLE_CONTENT);
  }
};


/**
 * Redraws cell filling.
 * @private
 */
anychart.core.ui.Table.prototype.checkFills_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_FILLS)) {
    this.resetFillPaths_();
    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var cell = this.cells_[row * this.colsCount_ + col];
        if (isNaN(cell.overlapper)) {
          var bounds = this.getCellBounds(row, col,
              /** @type {number} */(cell.rowSpan()),
              /** @type {number} */(cell.colSpan()), bounds); // rect will be created one time and then reused
          var fill = this.getCellFill_(cell, row, col);
          if (fill) {
            var path = this.getFillPath_(fill);
            var l = bounds.getLeft(), r = bounds.getRight() + 1, t = bounds.getTop(), b = bounds.getBottom() + 1;
            path.moveTo(l, t);
            path.lineTo(r, t);
            path.lineTo(r, b);
            path.lineTo(l, b);
            path.close();
          }
        }
      }
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_FILLS);
  }
};


/**
 * Redraws cell filling.
 * @private
 */
anychart.core.ui.Table.prototype.checkBorders_ = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_BORDERS)) {
    this.resetBorderPaths_();
    var row, col, cell1, cell2, index;
    // drawing top borders for top cells
    for (col = 0; col < this.colsCount_; col++) {
      cell1 = this.cells_[col];
      if (isNaN(cell1.overlapper))
        this.drawBorder_(0, col, 1, /** @type {number} */(cell1.colSpan()),
            this.getCellHorizontalBorder_(undefined, cell1), 0);
    }
    // drawing left borders for left cells
    for (row = 0; row < this.rowsCount_; row++) {
      cell1 = this.cells_[row * this.colsCount_];
      if (isNaN(cell1.overlapper))
        this.drawBorder_(row, 0, /** @type {number} */(cell1.rowSpan()), 1,
            this.getCellVerticalBorder_(undefined, cell1), 3);
    }
    // drawing right and bottom borders for all cells
    for (row = 0; row < this.rowsCount_; row++) {
      for (col = 0; col < this.colsCount_; col++) {
        // bottom border
        index = row * this.colsCount_ + col;
        cell1 = this.cells_[index]; // always exists
        cell2 = this.cells_[index + this.colsCount_]; // can be undefined if this is a last row
        if (cell2) {
          if (isNaN(cell1.overlapper)) {
            if (!isNaN(cell2.overlapper)) {
              if (cell2.overlapper == index)
                cell1 = cell2 = undefined;
              else
                cell2 = this.cells_[cell2.overlapper];
            }
          } else {
            if (isNaN(cell2.overlapper)) {
              cell1 = this.cells_[cell1.overlapper];
            } else {
              if (cell1.overlapper == cell2.overlapper) {
                cell1 = cell2 = undefined;
              } else {
                cell1 = this.cells_[cell1.overlapper];
                cell2 = this.cells_[cell2.overlapper];
              }
            }
          }
        } else if (!isNaN(cell1.overlapper))
          cell1 = this.cells_[cell1.overlapper];
        this.drawBorder_(row, col, 1, 1, this.getCellHorizontalBorder_(cell1, cell2), 2);
        // right border
        index = row * this.colsCount_ + col;
        cell1 = this.cells_[index]; // always exists
        cell2 = ((col + 1) == this.colsCount_) ? undefined : this.cells_[index + 1]; // can be undefined if this is a last col
        if (cell2) {
          if (isNaN(cell1.overlapper)) {
            if (!isNaN(cell2.overlapper)) {
              if (cell2.overlapper == index)
                cell1 = cell2 = undefined;
              else
                cell2 = this.cells_[cell2.overlapper];
            }
          } else {
            if (isNaN(cell2.overlapper)) {
              cell1 = this.cells_[cell1.overlapper];
            } else {
              if (cell1.overlapper == cell2.overlapper) {
                cell1 = cell2 = undefined;
              } else {
                cell1 = this.cells_[cell1.overlapper];
                cell2 = this.cells_[cell2.overlapper];
              }
            }
          }
        } else if (!isNaN(cell1.overlapper))
          cell1 = this.cells_[cell1.overlapper];
        this.drawBorder_(row, col, 1, 1, this.getCellVerticalBorder_(cell1, cell2), 1);
      }
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_BORDERS);
  }
};


/**
 * Draws table cells content.
 * @private
 */
anychart.core.ui.Table.prototype.checkContent_ = function() {
  var content, bounds, label, marker, position, positionProvider;
  if (this.hasInvalidationState(anychart.ConsistencyState.TABLE_CONTENT)) {
    if (this.contentToClear_) {
      while (this.contentToClear_.length) {
        content = this.contentToClear_.pop();
        content.suspendSignalsDispatching();
        if (content instanceof anychart.core.ui.LabelsFactory.Label) {
          label = /** @type {anychart.core.ui.LabelsFactory.Label} */(content);
          if (label.parentLabelsFactory())
            label.parentLabelsFactory().clear(label.getIndex());
        } else if (content instanceof anychart.core.ui.MarkersFactory.Marker) {
          marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(content);
          if (marker.parentMarkersFactory())
            marker.parentMarkersFactory().clear(marker.getIndex());
        } else if (content instanceof anychart.core.VisualBase) {
          if (content instanceof anychart.core.Chart)
            (/** @type {anychart.core.Chart} */(content)).autoRedraw(true);
          content.container(null);
          content.remove();
          // no draw here to avoid drawing in to a null container
        }
        content.unlistenSignals(this.handleContentInvalidation_);
        content.resumeSignalsDispatching(false);
      }
    }

    // we use one Padding instance for calculations
    var padding = new anychart.core.utils.Padding();
    padding.suspendSignalsDispatching();

    for (var row = 0; row < this.rowsCount_; row++) {
      for (var col = 0; col < this.colsCount_; col++) {
        var cell = this.cells_[row * this.colsCount_ + col];
        content = cell.realContent;
        if (content) {
          var rowObj = this.rows_ && this.rows_[row];
          var colObj = this.cols_ && this.cols_[col];
          content.suspendSignalsDispatching();
          if (isNaN(cell.overlapper)) {
            bounds = this.getCellBounds(row, col,
                /** @type {number} */(cell.rowSpan()), /** @type {number} */(cell.colSpan()), bounds);
            padding.top(this.getPaddingProp_('topPadding', cell, rowObj, colObj, this));
            padding.right(this.getPaddingProp_('rightPadding', cell, rowObj, colObj, this));
            padding.bottom(this.getPaddingProp_('bottomPadding', cell, rowObj, colObj, this));
            padding.left(this.getPaddingProp_('leftPadding', cell, rowObj, colObj, this));
            bounds = padding.tightenBounds(bounds);
            content.container(this.contentLayer_);
            if (content instanceof anychart.core.ui.LabelsFactory.Label) {
              label = /** @type {anychart.core.ui.LabelsFactory.Label} */(content);
              label.positionProvider({'value': {'x': bounds.left, 'y': bounds.top}});
              // if the label is not created by table label factory than we do not modify it's settings - only position
              // it properly due to cell bounds.
              if (label.parentLabelsFactory() == this.labelsFactory_) {
                label.anchor(anychart.enums.Anchor.LEFT_TOP);
                label.width(bounds.width);
                label.height(bounds.height);
                // we apply custom label settings in the next order: table < col < row < cell
                // keeping in mind, that table-wide settings are already applied to the factory
                // also we use direct settingsObj reference to avoid unnecessary objects creation
                var settings = colObj && colObj.settingsObj;
                if (settings) label.setup(settings);
                settings = rowObj && rowObj.settingsObj;
                if (settings) label.setup(settings);
                settings = cell.settingsObj;
                if (settings) label.setup(settings);
                label.resumeSignalsDispatching(false);
                continue; // we don't want to listen labels of table labelsFactory_.
              } else {
                position = /** @type {string} */(label.position() ||
                    (label.currentLabelsFactory() && label.currentLabelsFactory().position()) ||
                    (label.parentLabelsFactory() && label.parentLabelsFactory().position()));
                positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
                label.positionProvider(positionProvider);
                label.draw();
              }
            } else if (content instanceof anychart.core.ui.MarkersFactory.Marker) {
              marker = /** @type {anychart.core.ui.MarkersFactory.Marker} */(content);
              position = /** @type {string} */(
                  marker.position() ||
                  (marker.currentMarkersFactory() && marker.currentMarkersFactory().position()) ||
                  (marker.parentMarkersFactory() && marker.parentMarkersFactory().position()));
              positionProvider = {'value': anychart.utils.getCoordinateByAnchor(bounds, position)};
              marker.positionProvider(positionProvider);
              marker.draw();
            } else if (content instanceof anychart.core.VisualBase) {
              if (content instanceof anychart.core.Chart)
                (/** @type {anychart.core.Chart} */(content)).autoRedraw(false);
              var element = /** @type {anychart.core.VisualBase} */(content);
              element.parentBounds(bounds);
              if (element.draw)
                element.draw();
            }
          } else {
            content.enabled(false);
            if (content.draw)
              content.draw();
          }
          content.resumeSignalsDispatching(false);
          content.listenSignals(this.handleContentInvalidation_);
        }
      }
    }

    padding.resumeSignalsDispatching(false);

    if (this.labelsFactory_) {
      this.labelsFactory_.suspendSignalsDispatching();
      this.labelsFactory_.setup(this.settingsObj);
      this.labelsFactory_.container(this.contentLayer_);
      this.labelsFactory_.parentBounds(/** @type {anychart.math.Rect} */(this.getPixelBounds()));
      this.labelsFactory_.draw();
      this.labelsFactory_.resumeSignalsDispatching(false);
    }
    this.markConsistent(anychart.ConsistencyState.TABLE_CONTENT);
  }
};


/**
 * @param {anychart.SignalEvent} e
 * @private
 */
anychart.core.ui.Table.prototype.handleContentInvalidation_ = function(e) {
  if (goog.isFunction(e.target.draw)) e.target.draw();
};
//endregion


//region Drawing routines
//----------------------------------------------------------------------------------------------------------------------
//
//  Drawing routines
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * Draws one cell border side by passed params.
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 * @param {?acgraph.vector.Stroke} stroke
 * @param {number} side 0-top, 1-right, 2-bottom, 3-left.
 * @private
 */
anychart.core.ui.Table.prototype.drawBorder_ = function(row, col, rowSpan, colSpan, stroke, side) {
  if (stroke && stroke != 'none') {
    var lineThickness = stroke['thickness'] ? stroke['thickness'] : 1;
    var pixelShift = (lineThickness % 2) ? 0.5 : 0;
    var bounds = this.getCellBounds(row, col, rowSpan, colSpan, bounds);
    var path = this.getBorderPath_(stroke);
    switch (side) {
      case 0: // top
        path.moveTo(bounds.getLeft(), bounds.getTop() + pixelShift);
        path.lineTo(bounds.getRight() + 1, bounds.getTop() + pixelShift);
        break;
      case 1: // right
        path.moveTo(bounds.getRight() + pixelShift, bounds.getTop());
        path.lineTo(bounds.getRight() + pixelShift, bounds.getBottom() + 1);
        break;
      case 2: // bottom
        path.moveTo(bounds.getLeft(), bounds.getBottom() + pixelShift);
        path.lineTo(bounds.getRight() + 1, bounds.getBottom() + pixelShift);
        break;
      case 3: // left
        path.moveTo(bounds.getLeft() + pixelShift, bounds.getTop());
        path.lineTo(bounds.getLeft() + pixelShift, bounds.getBottom() + 1);
        break;
    }
  }
};


/**
 * Return final fill for the cell.
 * @param {anychart.core.ui.table.Cell} cell
 * @param {number} row
 * @param {number} col
 * @return {acgraph.vector.Fill}
 * @private
 */
anychart.core.ui.Table.prototype.getCellFill_ = function(cell, row, col) {
  // check cell fill first
  var fill = cell.fill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // than check row fill
  fill = this.rows_ && this.rows_[row] && this.rows_[row].cellFill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // than - column fill
  fill = this.cols_ && this.cols_[col] && this.cols_[col].cellFill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // table even/odd row fill
  fill = (row % 2) ? this.rowOddFill() : this.rowEvenFill();
  if (fill) return /** @type {acgraph.vector.Fill} */(fill);
  // table super default
  return /** @type {acgraph.vector.Fill} */(this.settings('fill'));
};


/**
 * Returns final horizontal border stroke settings between two cells.
 * @param {anychart.core.ui.table.Cell|undefined} topCell
 * @param {anychart.core.ui.table.Cell|undefined} bottomCell
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.Table.prototype.getCellHorizontalBorder_ = function(topCell, bottomCell) {
  if (topCell || bottomCell) {
    var stroke;
    var bottomBorder = 'bottomBorder';
    var topBorder = 'topBorder';
    var border = 'border';
    var cellBottomBorder = 'cellBottomBorder';
    var cellTopBorder = 'cellTopBorder';
    var cellBorder = 'cellBorder';

    // upper cell settings have advantage on same settings level
    // we don't use *.border().*() notation to avoid unnecessary border proxy creation

    // checking if specific border settings are set for the cells
    stroke = topCell && topCell.settings(bottomBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = bottomCell && bottomCell.settings(topBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if general border settings are set for the cells
    stroke = topCell && topCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = bottomCell && bottomCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    if (this.rows_) {
      var topRow = this.rows_[topCell && topCell.getRowNum()];
      var botRow = this.rows_[bottomCell && bottomCell.getRowNum()];

      // checking if specific border settings are set for the rows
      stroke = topRow && topRow.settings(bottomBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(topBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the rows
      stroke = topRow && topRow.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the row cells
      stroke = topRow && topRow.settings(cellBottomBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(cellTopBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the row cells
      stroke = topRow && topRow.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = botRow && botRow.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    // both cells have the same column
    var col = this.cols_ && this.cols_[(topCell || bottomCell).getColNum()];

    if (col) {
      // checking if the target border is on the top or on the bottom of the column and choosing specific and general
      // settings for this case. The two settings do not conflict, so we check them both here.
      stroke =
          (!topCell && (col.settings(topBorder) || col.settings(border))) || // the top of the column
          (!bottomCell && (col.settings(bottomBorder) || col.settings(border))); // the bottom of the column
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the column cells
      stroke = col.settings(cellBottomBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = col.settings(cellTopBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the column cells
      stroke = col.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = col.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    // checking if the target border is on the top or on the bottom of the column and choosing specific and general
    // settings for this case. The two settings do not conflict, so we check them both here.
    stroke =
        (!topCell && (this.settings(topBorder) || this.settings(border))) || // the top of the column
        (!bottomCell && (this.settings(bottomBorder) || this.settings(border))); // the bottom of the column
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if specific border settings are set for the table cells
    stroke = topCell && this.settings(cellBottomBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = bottomCell && this.settings(cellTopBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // fallback to default table cell border and redundantly ensure that we return valid Stroke
    return /** @type {acgraph.vector.Stroke} */(this.settings(cellBorder)) || 'none';
  }
  return 'none';
};


/**
 * Returns final vertical border stroke settings between two cells.
 * @param {anychart.core.ui.table.Cell|undefined} leftCell
 * @param {anychart.core.ui.table.Cell|undefined} rightCell
 * @return {acgraph.vector.Stroke}
 * @private
 */
anychart.core.ui.Table.prototype.getCellVerticalBorder_ = function(leftCell, rightCell) {
  if (leftCell || rightCell) {
    var stroke;
    var rightBorder = 'rightBorder';
    var leftBorder = 'leftBorder';
    var border = 'border';
    var cellRightBorder = 'cellRightBorder';
    var cellLeftBorder = 'cellLeftBorder';
    var cellBorder = 'cellBorder';

    // upper cell settings have advantage on same settings level
    // we don't use *.border().*() notation to avoid unnecessary border proxy creation

    // checking if specific border settings are set for the cells
    stroke = leftCell && leftCell.settings(rightBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = rightCell && rightCell.settings(leftBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if general border settings are set for the cells
    stroke = leftCell && leftCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = rightCell && rightCell.settings(border);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // both cells have the same column
    var row = this.rows_ && this.rows_[(leftCell || rightCell).getRowNum()];

    if (row) {
      // checking if the target border is on the left or on the right of the column and choosing specific and general
      // settings for this case. The two settings do not conflict, so we check them both here.
      stroke =
          (!leftCell && (row.settings(leftBorder) || row.settings(border))) || // the top of the column
          (!rightCell && (row.settings(rightBorder) || row.settings(border))); // the bottom of the column
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the column cells
      stroke = row.settings(cellRightBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = row.settings(cellLeftBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the column cells
      stroke = row.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = row.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    if (this.cols_) {
      var leftCol = this.cols_[leftCell && leftCell.getColNum()];
      var rightCol = this.cols_[rightCell && rightCell.getColNum()];

      // checking if specific border settings are set for the rows
      stroke = leftCol && leftCol.settings(rightBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(leftBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the rows
      stroke = leftCol && leftCol.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(border);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if specific border settings are set for the row cells
      stroke = leftCol && leftCol.settings(cellRightBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(cellLeftBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

      // checking if general border settings are set for the row cells
      stroke = leftCol && leftCol.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
      stroke = rightCol && rightCol.settings(cellBorder);
      if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    }

    // checking if the target border is on the left or on the right of the column and choosing specific and general
    // settings for this case. The two settings do not conflict, so we check them both here.
    stroke =
        (!leftCell && (this.settings(leftBorder) || this.settings(border))) || // the top of the column
        (!rightCell && (this.settings(rightBorder) || this.settings(border))); // the bottom of the column
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // checking if specific border settings are set for the table cells
    stroke = leftCell && this.settings(cellRightBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);
    stroke = rightCell && this.settings(cellLeftBorder);
    if (stroke) return /** @type {acgraph.vector.Stroke} */(stroke);

    // fallback to default table cell border and redundantly ensure that we return valid Stroke
    return /** @type {acgraph.vector.Stroke} */(this.settings(cellBorder)) || 'none';
  }
  return 'none';
};


/**
 * Removes all border paths and clears hashes.
 * @private
 */
anychart.core.ui.Table.prototype.resetBorderPaths_ = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.borderPaths_) {
    for (var hash in this.borderPaths_) {
      var path = this.borderPaths_[hash];
      path.clear();
      path.parent(null);
      this.pathsPool_.push(path);
      delete this.borderPaths_[hash];
    }
  } else
    this.borderPaths_ = {};
};


/**
 * Removes all cell filling paths and clears hashes.
 * @private
 */
anychart.core.ui.Table.prototype.resetFillPaths_ = function() {
  if (!this.pathsPool_)
    this.pathsPool_ = [];
  if (this.fillPaths_) {
    for (var hash in this.fillPaths_) {
      var path = this.fillPaths_[hash];
      path.clear();
      path.parent(null);
      this.pathsPool_.push(path);
      delete this.fillPaths_[hash];
    }
  } else
    this.fillPaths_ = {};
};


/**
 * Returns border path for a stroke.
 * @param {!acgraph.vector.Stroke} stroke
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.core.ui.Table.prototype.getBorderPath_ = function(stroke) {
  if (goog.isObject(stroke) && ('keys' in stroke) && !goog.isObject(stroke['mode']))
    stroke['mode'] = this.getPixelBounds();
  var hash = anychart.utils.hash(stroke);
  if (hash in this.borderPaths_)
    return this.borderPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        acgraph.path();
    this.layer_.addChild(path);
    path.stroke(stroke);
    path.fill(null);
    this.borderPaths_[hash] = path;
    return path;
  }
};


/**
 * Returns fill path for a fill.
 * @param {!acgraph.vector.Fill} fill
 * @return {!acgraph.vector.Path}
 * @private
 */
anychart.core.ui.Table.prototype.getFillPath_ = function(fill) {
  var hash = anychart.utils.hash(fill);
  if (hash in this.fillPaths_)
    return this.fillPaths_[hash];
  else {
    var path = this.pathsPool_.length ?
        /** @type {!acgraph.vector.Path} */(this.pathsPool_.pop()) :
        acgraph.path();
    this.layer_.addChildAt(path, 0);
    path.fill(fill);
    path.stroke(null);
    this.fillPaths_[hash] = path;
    return path;
  }
};
//endregion


//region Other routines
//----------------------------------------------------------------------------------------------------------------------
//
//  Other routines
//
//----------------------------------------------------------------------------------------------------------------------
/**
 * This method is internal.
 * @param {string=} opt_name Settings object or settings name or nothing to get complete object.
 * @param {(string|number|boolean|acgraph.vector.Fill|acgraph.vector.Stroke|null)=} opt_value Setting value if used as a setter.
 * @param {(anychart.ConsistencyState|number)=} opt_state State to invalidate in table if value changed. Defaults to TABLE_CONTENT.
 * @param {(anychart.Signal|number)=} opt_signal Signal to raise on table if value changed. Defaults to NEEDS_REDRAW.
 * @return {!(anychart.core.ui.Table|Object|string|number|boolean)} A copy of settings or the Text for chaining.
 */
anychart.core.ui.Table.prototype.settings = function(opt_name, opt_value, opt_state, opt_signal) {
  if (goog.isDef(opt_name)) {
    if (goog.isDef(opt_value)) {
      var shouldInvalidate = false;
      if (goog.isNull(opt_value)) {
        if (this.settingsObj[opt_name]) {
          delete this.settingsObj[opt_name];
          shouldInvalidate = true;
        }
      } else {
        if (this.settingsObj[opt_name] != opt_value) {
          this.settingsObj[opt_name] = opt_value;
          shouldInvalidate = true;
        }
      }
      if (shouldInvalidate)
        this.invalidate(+opt_state || anychart.ConsistencyState.TABLE_CONTENT, +opt_signal || anychart.Signal.NEEDS_REDRAW);
      return this;
    } else {
      return this.settingsObj && this.settingsObj[opt_name];
    }
  }
  return this.settingsObj || {};
};


/**
 * Getter and setter for row height settings. Null sets row height to the default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.rowHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.rowHeightSettings_[row] != opt_value) {
      if (goog.isNull(opt_value))
        delete this.rowHeightSettings_[row];
      else
        this.rowHeightSettings_[row] = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return row in this.rowHeightSettings_ ? this.rowHeightSettings_[row] : null;
};


/**
 * Getter and setter for row min height settings. Null sets row height to the default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.rowMinHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.rowMinHeightSettings_ && (row in this.rowMinHeightSettings_)) {
        delete this.rowMinHeightSettings_[row];
        shouldInvalidate = true;
      }
    } else {
      if (!this.rowMinHeightSettings_) this.rowMinHeightSettings_ = [];
      if (this.rowMinHeightSettings_[row] != opt_value) {
        this.rowMinHeightSettings_[row] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.rowMinHeightSettings_ && (row in this.rowMinHeightSettings_)) ? this.rowMinHeightSettings_[row] : null;
};


/**
 * Getter and setter for row max height settings. Null sets row height to the default value.
 * @param {number} row Row number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.rowMaxHeight = function(row, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.rowMaxHeightSettings_ && (row in this.rowMaxHeightSettings_)) {
        delete this.rowMaxHeightSettings_[row];
        shouldInvalidate = true;
      }
    } else {
      if (!this.rowMaxHeightSettings_) this.rowMaxHeightSettings_ = [];
      if (this.rowMaxHeightSettings_[row] != opt_value) {
        this.rowMaxHeightSettings_[row] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.rowMaxHeightSettings_ && (row in this.rowMaxHeightSettings_)) ? this.rowMaxHeightSettings_[row] : null;
};


/**
 * Getter and setter for column height settings. Null sets column width to default value.
 * @param {number} col Column number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.colWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.colWidthSettings_[col] != opt_value) {
      if (goog.isNull(opt_value))
        delete this.colWidthSettings_[col];
      else
        this.colWidthSettings_[col] = opt_value;
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return col in this.colWidthSettings_ ? this.colWidthSettings_[col] : null;
};


/**
 * Getter and setter for column min width settings. Null sets column width to the default value.
 * @param {number} col Column number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.colMinWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.colMinWidthSettings_ && (col in this.colMinWidthSettings_)) {
        delete this.colMinWidthSettings_[col];
        shouldInvalidate = true;
      }
    } else {
      if (!this.colMinWidthSettings_) this.colMinWidthSettings_ = [];
      if (this.colMinWidthSettings_[col] != opt_value) {
        this.colMinWidthSettings_[col] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.colMinWidthSettings_ && (col in this.colMinWidthSettings_)) ? this.colMinWidthSettings_[col] : null;
};


/**
 * Getter and setter for column max width settings. Null sets column width to the default value.
 * @param {number} col Column number.
 * @param {(string|number|null)=} opt_value Value to set.
 * @return {string|number|null|anychart.core.ui.Table}
 */
anychart.core.ui.Table.prototype.colMaxWidth = function(col, opt_value) {
  if (goog.isDef(opt_value)) {
    var shouldInvalidate = false;
    if (goog.isNull(opt_value)) {
      if (this.colMaxWidthSettings_ && (col in this.colMaxWidthSettings_)) {
        delete this.colMaxWidthSettings_[col];
        shouldInvalidate = true;
      }
    } else {
      if (!this.colMaxWidthSettings_) this.colMaxWidthSettings_ = [];
      if (this.colMaxWidthSettings_[col] != opt_value) {
        this.colMaxWidthSettings_[col] = opt_value;
        shouldInvalidate = true;
      }
    }
    if (shouldInvalidate)
      this.invalidate(anychart.ConsistencyState.TABLE_CELL_BOUNDS, anychart.Signal.NEEDS_REDRAW);
    return this;
  }
  return (this.colMaxWidthSettings_ && (col in this.colMaxWidthSettings_)) ? this.colMaxWidthSettings_[col] : null;
};


/**
 * Returns bounds for the cell. Result is placed in opt_outBounds argument, if passed. Internal method - you should
 * ensure table consistency before using it.
 * @param {number} row
 * @param {number} col
 * @param {number} rowSpan
 * @param {number} colSpan
 * @param {anychart.math.Rect=} opt_outBounds Result is placed here.
 * @return {!anychart.math.Rect}
 */
anychart.core.ui.Table.prototype.getCellBounds = function(row, col, rowSpan, colSpan, opt_outBounds) {
  this.checkTable_();
  this.checkSizes_();
  var tableBounds = this.getPixelBounds();
  var outBounds = opt_outBounds instanceof anychart.math.Rect ? opt_outBounds : new anychart.math.Rect(0, 0, 0, 0);
  var start = (this.colRights_[col - 1] + 1) || 0;
  var end = this.colRights_[Math.min(col + colSpan, this.colsCount_) - 1];
  outBounds.width = end - start;
  outBounds.left = tableBounds.left + start;
  start = (this.rowBottoms_[row - 1] + 1) || 0;
  end = this.rowBottoms_[Math.min(row + rowSpan, this.rowsCount_) - 1];
  outBounds.height = end - start;
  outBounds.top = tableBounds.top + start;
  return outBounds;
};


/**
 * Marks content to be cleared. Used by cells.
 * @param {anychart.core.VisualBase} content
 */
anychart.core.ui.Table.prototype.clearContent = function(content) {
  this.contentToClear_ = this.contentToClear_ || [];
  this.contentToClear_.push(content);
};


/**
 * Checks params in right order and returns the size.
 * @param {number|string|null|undefined} rawSize - Raw size settings.
 * @param {number|string|null|undefined} minSize - Raw min size settings.
 * @param {number|string|null|undefined} maxSize - Raw max size settings.
 * @param {number} defSize - NORMALIZED default size.
 * @param {number} defMinSize - NORMALIZED default min size.
 * @param {number} defMaxSize - NORMALIZED default max size.
 * @param {number} tableSize - Table size.
 * @return {number}
 * @private
 */
anychart.core.ui.Table.prototype.getSize_ = function(rawSize, minSize, maxSize,
    defSize, defMinSize, defMaxSize, tableSize) {
  rawSize = anychart.utils.normalizeSize(rawSize, tableSize);
  minSize = anychart.utils.normalizeSize(minSize, tableSize);
  maxSize = anychart.utils.normalizeSize(maxSize, tableSize);
  if (isNaN(rawSize)) rawSize = defSize;
  if (isNaN(minSize)) minSize = defMinSize;
  if (isNaN(maxSize)) maxSize = defMaxSize;
  if (!isNaN(minSize)) rawSize = Math.max(rawSize, minSize);
  if (!isNaN(maxSize)) rawSize = Math.min(rawSize, maxSize);
  return rawSize;
};


/**
 * Calculates cumulative widths of columns or heights of rows (e.g. column right and row bottom coords).
 * Returns null if it doesn't differ from the prevSizesArray.
 * @param {number} sizesCount Number of columns or rows.
 * @param {!Array.<string|number|null>} sizesSettings Size settings array. May contain holes.
 * @param {?Array.<string|number|null>} minSizesSettings Min size settings array. May contain holes or be null.
 * @param {?Array.<string|number|null>} maxSizesSettings Max size settings array. May contain holes or be null.
 * @param {string|number|null} defSize Default setting for column or row size.
 * @param {string|number|null} defMinSize Default setting for column or row min size.
 * @param {string|number|null} defMaxSize Default setting for column or row max size.
 * @param {number} tableSize Table size in pixels.
 * @param {!Array.<number>} prevSizesArray Previous calculation result.
 * @return {?Array.<number>} Array of counted cumulative sizes or null if it doesn't differ.
 * @private
 */
anychart.core.ui.Table.prototype.countSizes_ = function(sizesCount, sizesSettings, minSizesSettings, maxSizesSettings,
    defSize, defMinSize, defMaxSize, tableSize, prevSizesArray) {
  var i, val, size, minSize, maxSize, needsRedraw = false;
  var distributedSize = 0;
  var fixedSizes = [];
  var minSizes = [];
  var maxSizes = [];
  var autoSizesCount = 0;
  defSize = anychart.utils.normalizeSize(defSize, tableSize);
  defMinSize = anychart.utils.normalizeSize(defMinSize, tableSize);
  defMaxSize = anychart.utils.normalizeSize(defMaxSize, tableSize);
  var hardWay = false;
  for (i = 0; i < sizesCount; i++) {
    minSize = minSizesSettings ? anychart.utils.normalizeSize(minSizesSettings[i], tableSize) : NaN;
    maxSize = maxSizesSettings ? anychart.utils.normalizeSize(maxSizesSettings[i], tableSize) : NaN;
    // getting normalized size
    size = this.getSize_(sizesSettings[i], minSize, maxSize, defSize, defMinSize, defMaxSize, tableSize);
    // if it is NaN (not fixed)
    if (isNaN(size)) {
      autoSizesCount++;
      // if there are any limitations on that non-fixed size - we are going to do it hard way:(
      // we cache those limitations
      if (!isNaN(minSize)) {
        minSizes[i] = minSize;
        hardWay = true;
      } else if (!isNaN(defMinSize)) {
        minSizes[i] = defMinSize;
        hardWay = true;
      }
      if (!isNaN(maxSize)) {
        maxSizes[i] = maxSize;
        hardWay = true;
      } else if (!isNaN(defMaxSize)) {
        maxSizes[i] = defMaxSize;
        hardWay = true;
      }
    } else {
      distributedSize += size;
      fixedSizes[i] = size;
    }
  }

  var autoSize;
  var restrictedSizes;
  if (hardWay && autoSizesCount > 0) {
    restrictedSizes = [];
    // we limit max cycling times to guarantee finite exec time in case my calculations are wrong
    var maxTimes = autoSizesCount * autoSizesCount;
    do {
      var repeat = false;
      // min to 3px per autoColumn to make them visible, but not good-looking.
      autoSize = Math.max(3 * autoSizesCount, tableSize - distributedSize) / autoSizesCount;
      for (i = 0; i < sizesCount; i++) {
        // if the size of the column is not fixed
        if (!(i in fixedSizes)) {
          // we recheck if the limitation still exist and drop it if it doesn't
          if (i in restrictedSizes) {
            if (restrictedSizes[i] == minSizes[i] && minSizes[i] < autoSize) {
              distributedSize -= minSizes[i];
              autoSizesCount++;
              delete restrictedSizes[i];
              repeat = true;
              break;
            }
            if (restrictedSizes[i] == maxSizes[i] && maxSizes[i] > autoSize) {
              distributedSize -= maxSizes[i];
              autoSizesCount++;
              delete restrictedSizes[i];
              repeat = true;
              break;
            }
          } else {
            if ((i in minSizes) && minSizes[i] > autoSize) {
              distributedSize += restrictedSizes[i] = minSizes[i];
              autoSizesCount--;
              repeat = true;
              break;
            }
            if ((i in maxSizes) && maxSizes[i] < autoSize) {
              distributedSize += restrictedSizes[i] = maxSizes[i];
              autoSizesCount--;
              repeat = true;
              break;
            }
          }
        }
      }
    } while (repeat && autoSizesCount > 0 && maxTimes--);
  }
  var current = 0;
  var result = [];
  autoSize = Math.max(3 * autoSizesCount, tableSize - distributedSize) / autoSizesCount;
  for (i = 0; i < sizesCount; i++) {
    if (i in fixedSizes)
      size = fixedSizes[i];
    else if (restrictedSizes && (i in restrictedSizes))
      size = restrictedSizes[i];
    else
      size = autoSize;
    current += size;
    val = Math.round(current) - 1;
    result[i] = val;
    if (val != prevSizesArray[i]) needsRedraw = true;
  }
  return needsRedraw ? result : null;
};


/**
 * Marks the cell to be removed on next draw.
 * @param {anychart.core.ui.table.Cell} cell Cell to free.
 * @private
 */
anychart.core.ui.Table.prototype.freeCell_ = function(cell) {
  cell.content(null);
  this.cellsPool_.push(cell);
};


/**
 * Allocates a new cell or reuses previously freed one.
 * @param {number} row
 * @param {number} col
 * @return {anychart.core.ui.table.Cell}
 * @private
 */
anychart.core.ui.Table.prototype.allocCell_ = function(row, col) {
  return this.cellsPool_.length ? // checking if there are any cells in pool
      /** @type {anychart.core.ui.table.Cell} */(this.cellsPool_.pop().reset(row, col)) :
      new anychart.core.ui.table.Cell(this, row, col);
};


/**
 * @private
 */
anychart.core.ui.Table.prototype.resizeHandler_ = function() {
  this.invalidate(anychart.ConsistencyState.BOUNDS, anychart.Signal.NEEDS_REDRAW | anychart.Signal.BOUNDS_CHANGED);
};


/**
 * @private
 */
anychart.core.ui.Table.prototype.invalidateHandler_ = function() {
  anychart.globalLock.onUnlock(this.draw, this);
};


/**
 * @return {!anychart.core.ui.LabelsFactory}
 * @private
 */
anychart.core.ui.Table.prototype.getLabelsFactory_ = function() {
  if (!this.labelsFactory_) {
    this.labelsFactory_ = new anychart.core.ui.LabelsFactory();
    this.labelsFactory_.setup(anychart.getFullTheme()['standalones']['labelsFactory']);
    this.labelsFactory_.anchor(anychart.enums.Anchor.CENTER);
    this.labelsFactory_.position(anychart.enums.Position.CENTER);
    // we do not register disposable here, cause we dispose it manually in disposeInternal
  }
  return this.labelsFactory_;
};


/**
 * Small private stupid routine.
 * @param {string} propName
 * @param {...(anychart.core.ui.table.IProxyUser|undefined)} var_args
 * @private
 * @return {string|number}
 */
anychart.core.ui.Table.prototype.getPaddingProp_ = function(propName, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var item = arguments[i];
    if (item) {
      var res = item.settings(propName);
      if (goog.isDefAndNotNull(res))
        return /** @type {string|number} */(res);
    }
  }
  return 0;
};
//endregion


/**
 * Creates cell content for text cells. Used by cells.
 * @param {*} value Text to be set for the label.
 * @return {!anychart.core.ui.LabelsFactory.Label}
 */
anychart.core.ui.Table.prototype.createTextCellContent = function(value) {
  value = value + '';
  return this.getLabelsFactory_().add({'value': value}, {'value': {'x': 0, 'y': 0}});
};


/** @inheritDoc */
anychart.core.ui.Table.prototype.disposeInternal = function() {
  goog.disposeAll(this.cells_, this.cellsPool_, this.rows_, this.cols_,
      this.fillPaths_, this.borderPaths_, this.pathsPool_);
  goog.dispose(this.labelsFactory_);
  goog.dispose(this.layer_);
  goog.dispose(this.contentLayer_);
  delete this.settingsObj;
  goog.base(this, 'disposeInternal');
};


//exports
anychart.core.ui.Table.prototype['rowsCount'] = anychart.core.ui.Table.prototype.rowsCount;//doc|ex
anychart.core.ui.Table.prototype['colsCount'] = anychart.core.ui.Table.prototype.colsCount;//doc|ex

anychart.core.ui.Table.prototype['getCell'] = anychart.core.ui.Table.prototype.getCell;//doc|ex
anychart.core.ui.Table.prototype['getRow'] = anychart.core.ui.Table.prototype.getRow;
anychart.core.ui.Table.prototype['getCol'] = anychart.core.ui.Table.prototype.getCol;

anychart.core.ui.Table.prototype['rowsHeight'] = anychart.core.ui.Table.prototype.rowsHeight;
anychart.core.ui.Table.prototype['rowsMinHeight'] = anychart.core.ui.Table.prototype.rowsMinHeight;
anychart.core.ui.Table.prototype['rowsMaxHeight'] = anychart.core.ui.Table.prototype.rowsMaxHeight;
anychart.core.ui.Table.prototype['colsWidth'] = anychart.core.ui.Table.prototype.colsWidth;
anychart.core.ui.Table.prototype['colsMinWidth'] = anychart.core.ui.Table.prototype.colsMinWidth;
anychart.core.ui.Table.prototype['colsMaxWidth'] = anychart.core.ui.Table.prototype.colsMaxWidth;

anychart.core.ui.Table.prototype['border'] = anychart.core.ui.Table.prototype.border;

anychart.core.ui.Table.prototype['contents'] = anychart.core.ui.Table.prototype.contents;//doc|ex

anychart.core.ui.Table.prototype['draw'] = anychart.core.ui.Table.prototype.draw;//doc

anychart.core.ui.Table.prototype['fontSize'] = anychart.core.ui.Table.prototype.fontSize;
anychart.core.ui.Table.prototype['fontFamily'] = anychart.core.ui.Table.prototype.fontFamily;
anychart.core.ui.Table.prototype['fontColor'] = anychart.core.ui.Table.prototype.fontColor;
anychart.core.ui.Table.prototype['fontOpacity'] = anychart.core.ui.Table.prototype.fontOpacity;
anychart.core.ui.Table.prototype['fontDecoration'] = anychart.core.ui.Table.prototype.fontDecoration;
anychart.core.ui.Table.prototype['fontStyle'] = anychart.core.ui.Table.prototype.fontStyle;
anychart.core.ui.Table.prototype['fontVariant'] = anychart.core.ui.Table.prototype.fontVariant;
anychart.core.ui.Table.prototype['fontWeight'] = anychart.core.ui.Table.prototype.fontWeight;
anychart.core.ui.Table.prototype['letterSpacing'] = anychart.core.ui.Table.prototype.letterSpacing;
anychart.core.ui.Table.prototype['textDirection'] = anychart.core.ui.Table.prototype.textDirection;
anychart.core.ui.Table.prototype['lineHeight'] = anychart.core.ui.Table.prototype.lineHeight;
anychart.core.ui.Table.prototype['textIndent'] = anychart.core.ui.Table.prototype.textIndent;
anychart.core.ui.Table.prototype['vAlign'] = anychart.core.ui.Table.prototype.vAlign;
anychart.core.ui.Table.prototype['hAlign'] = anychart.core.ui.Table.prototype.hAlign;
anychart.core.ui.Table.prototype['textWrap'] = anychart.core.ui.Table.prototype.textWrap;
anychart.core.ui.Table.prototype['textOverflow'] = anychart.core.ui.Table.prototype.textOverflow;
anychart.core.ui.Table.prototype['selectable'] = anychart.core.ui.Table.prototype.selectable;
anychart.core.ui.Table.prototype['disablePointerEvents'] = anychart.core.ui.Table.prototype.disablePointerEvents;
anychart.core.ui.Table.prototype['useHtml'] = anychart.core.ui.Table.prototype.useHtml;

anychart.core.ui.Table.prototype['cellFill'] = anychart.core.ui.Table.prototype.cellFill;//doc|ex

anychart.core.ui.Table.prototype['rowEvenFill'] = anychart.core.ui.Table.prototype.rowEvenFill;
anychart.core.ui.Table.prototype['rowOddFill'] = anychart.core.ui.Table.prototype.rowOddFill;

anychart.core.ui.Table.prototype['cellBorder'] = anychart.core.ui.Table.prototype.cellBorder;

anychart.core.ui.Table.prototype['cellPadding'] = anychart.core.ui.Table.prototype.cellPadding;

anychart.core.ui.Table.prototype['saveAsPng'] = anychart.core.ui.Table.prototype.saveAsPng;//inherited
anychart.core.ui.Table.prototype['saveAsJpg'] = anychart.core.ui.Table.prototype.saveAsJpg;//inherited
anychart.core.ui.Table.prototype['saveAsPdf'] = anychart.core.ui.Table.prototype.saveAsPdf;//inherited
anychart.core.ui.Table.prototype['saveAsSvg'] = anychart.core.ui.Table.prototype.saveAsSvg;//inherited
anychart.core.ui.Table.prototype['toSvg'] = anychart.core.ui.Table.prototype.toSvg;//inherited

goog.provide('anychart.core.gantt.Controller');

goog.require('acgraph');
goog.require('anychart.core.Base');
goog.require('anychart.core.ui.ScrollBar');
goog.require('anychart.data.Tree');
goog.require('anychart.scales.GanttDateTime');

goog.require('goog.array');
goog.require('goog.math');



/**
 * Gantt controller implementation.
 * TODO (A.Kudryavtsev): Describe.
 * @param {boolean=} opt_isResourceChart - Flag if controller must work in resource chart mode.
 *
 * @constructor
 * @extends {anychart.core.Base}
 */
anychart.core.gantt.Controller = function(opt_isResourceChart) {
  goog.base(this);

  /**
   * Resource chart works with resources.
   * Each resource has periods reflected in data model as array of period-objects (Array.<Period>).
   * Each period has some useful fields (such as 'ID').
   * Basically, field 'periods' in tree data item is just a raw array, but for resource chart here are some
   * issues when we need to quickly find a period by id (for example, for connectors).
   *
   * Indexing the periods takes a time, so we run it only in resource chart mode.
   *
   * @type {boolean}
   * @private
   */
  this.isResourceChart_ = !!opt_isResourceChart;

  /**
   * The map of periods.
   * Contains link to the period by its id.
   * Used for connector draw purposes.
   * @type {Object}
   * @private
   */
  this.periodsMap_ = {};

  /**
   * Visible items map.
   * Contains link to the visible data items by its id.
   * Used for connector draw purposes.
   * @type {Object}
   * @private
   */
  this.visibleItemsMap_ = {};

  /**
   * The map of connectors.
   * @type {Array.<Object>}
   * @private
   */
  this.connectorsData_ = [];

  /**
   * Tree data.
   * @type {anychart.data.Tree}
   * @private
   */
  this.data_ = null;

  /**
   * Visible items of tree (items that are not hidden by collapse).
   * @type {Array.<anychart.data.Tree.DataItem>}
   * @private
   */
  this.visibleData_ = [];

  /**
   * Array that contains a row height differences.
   * NOTE: This array doesn't store row spaces!
   * @type {Array.<number>}
   * @private
   */
  this.heightCache_ = [];

  /**
   * Related data grid.
   * @type {anychart.core.ui.DataGrid}
   * @private
   */
  this.dataGrid_ = null;

  /**
   * Related timeline.
   * @type {anychart.core.gantt.Timeline}
   * @private
   */
  this.timeline_ = null;

  /**
   * Row stroke thickness. Used to calculate a required number of visible data items.
   * @type {number}
   * @private
   */
  this.rowStrokeThickness_ = 1;

  /**
   * Start index.
   * @type {number}
   * @private
   */
  this.startIndex_ = NaN;

  /**
   * End index.
   * @type {number}
   * @private
   */
  this.endIndex_ = NaN;

  /**
   * Vertical offset.
   * Actually, must be calculated automatically. Take care of user doesn't set this value wrong.
   * @type {number}
   * @private
   */
  this.verticalOffset_ = 0;


  /**
   * Height of data grid, available for rows render.
   * @type {number}
   * @private
   */
  this.availableHeight_ = 0;

  /**
   * Flag if startIndex, endIndex, vertical offset were recalculated.
   * @type {boolean}
   * @private
   */
  this.positionRecalculated_ = false;

  /**
   * Traverser that ignores children of collapsed items while passage.
   * @type {anychart.data.Traverser}
   * @private
   */
  this.expandedItemsTraverser_ = null;

  /**
   * Min date timestamp.
   * @type {number}
   * @private
   */
  this.minDate_ = NaN;

  /**
   * Max date timestamp.
   * @type {number}
   * @private
   */
  this.maxDate_ = NaN;

  /**
   * Index for recursive linearization.
   * @type {number}
   * @private
   */
  this.linearIndex_ = 0;

  /**
   * Vertical scroll bar.
   * @type {anychart.core.ui.ScrollBar}
   * @private
   */
  this.verticalScrollBar_ = null;

};
goog.inherits(anychart.core.gantt.Controller, anychart.core.Base);


/**
 * Correctly calculates data item pixel height.
 * @param {anychart.data.Tree.DataItem} item - Tree data item.
 * @return {number} - Data item height.
 */
anychart.core.gantt.Controller.getItemHeight = function(item) {
  return anychart.utils.toNumber(item.get(anychart.enums.GanttDataFields.ROW_HEIGHT)) || anychart.core.ui.DataGrid.DEFAULT_ROW_HEIGHT;
};


/**
 * Consistency state mask supported by this object.
 * @type {number}
 */
anychart.core.gantt.Controller.prototype.SUPPORTED_SIGNALS = anychart.Signal.NEEDS_REAPPLICATION;


/**
 * Consistency state mask supported by this object.
 * In this case consistency state
 *  DATA means that the whole tree has been changed. Needs to re-linearize, calculate visible data anew, recalculate start& end indexes.
 *  VISIBILITY means that some item was collapsed/expanded (children become visible/invisible). Needs to recalculate visible data without new tree linearization.
 *  POSITION means that new start, end, offset, available height were set. No need to linearize a tree and build new visibility data.
 * @type {number}
 */
anychart.core.gantt.Controller.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.ConsistencyState.CONTROLLER_DATA |
    anychart.ConsistencyState.CONTROLLER_VISIBILITY |
    anychart.ConsistencyState.CONTROLLER_POSITION;


/**
 * Henry Laurence Gantt's birth date (20 May 1861).
 * @type {number}
 */
anychart.core.gantt.Controller.GANTT_BIRTH_DATE = Date.UTC(1861, 4, 20);


/**
 * Henry Laurence Gantt's death date (23 Nov 1919).
 * @type {number}
 */
anychart.core.gantt.Controller.GANTT_DEATH_DATE = Date.UTC(1919, 10, 23);


/**
 * Listener for controller invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.core.gantt.Controller.prototype.dataInvalidated_ = function(event) {
  var state = 0;
  var signal = anychart.Signal.NEEDS_REAPPLICATION;

  /*
   Here meta_changed_signal comes from tree on tree data item change.
   We have to initialize rebuilding of visible data items.
   */
  if (event.hasSignal(anychart.Signal.META_CHANGED)) state |= anychart.ConsistencyState.CONTROLLER_VISIBILITY;

  /*
   Here data_changed_signal comes from tree when tree has some structural changes.
   We have to relinerize data and rebuild visible data items.
   */
  if (event.hasSignal(anychart.Signal.DATA_CHANGED)) state |= anychart.ConsistencyState.CONTROLLER_DATA;

  this.invalidate(state, signal);
};


/**
 * Function that decides if we go through data item's children while passage.
 * @param {anychart.data.Tree.DataItem} item - Tree data item.
 * @return {boolean} - Whether item is expanded.
 * @private
 */
anychart.core.gantt.Controller.prototype.traverseChildrenCondition_ = function(item) {
  return !item.meta(anychart.enums.GanttDataFields.COLLAPSED);
};


/**
 * Function that decides whether data item has children.
 * @param {anychart.data.Tree.DataItem} item - Tree data item.
 * @return {boolean} - Whether data item has children.
 * @private
 */
anychart.core.gantt.Controller.prototype.itemHasChildrenCondition_ = function(item) {
  return !!item.numChildren();
};


/**
 * Item's values auto calculation.
 * @param {anychart.data.Tree.DataItem} item - Current tree data item.
 * @param {number} currentDepth - Current depth.
 * @private
 */
anychart.core.gantt.Controller.prototype.autoCalcItem_ = function(item, currentDepth) {
  item
      .meta('depth', currentDepth)
      .meta('index', this.linearIndex_++);

  this.checkDate_(/** @type {number} */ (item.get(anychart.enums.GanttDataFields.ACTUAL_START)));
  this.checkDate_(/** @type {number} */ (item.get(anychart.enums.GanttDataFields.ACTUAL_END)));
  this.checkDate_(/** @type {number} */ (item.get(anychart.enums.GanttDataFields.BASELINE_START)));
  this.checkDate_(/** @type {number} */ (item.get(anychart.enums.GanttDataFields.BASELINE_END)));

  var resultStart = item.get(anychart.enums.GanttDataFields.ACTUAL_START);
  var resultEnd = item.get(anychart.enums.GanttDataFields.ACTUAL_END);

  var progressLength = 0;
  var totalLength = 0;

  for (var i = 0, l = item.numChildren(); i < l; i++) {
    var child = item.getChildAt(i);
    if (child.numChildren()) {
      this.autoCalcItem_(child, currentDepth + 1);
    } else {
      child
          .meta('depth', currentDepth + 1)
          .meta('index', this.linearIndex_++);
    }

    if (!this.isResourceChart_) {
      var childStart = goog.isDef(child.get(anychart.enums.GanttDataFields.ACTUAL_START)) ?
          child.get(anychart.enums.GanttDataFields.ACTUAL_START) :
          child.meta('autoStart');

      var childEnd = goog.isDef(child.get(anychart.enums.GanttDataFields.ACTUAL_END)) ?
          child.get(anychart.enums.GanttDataFields.ACTUAL_END) :
          (child.meta('autoEnd') || childStart);

      var childProgress = goog.isDef(child.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)) ?
          anychart.utils.normalizeSize(/** @type {number} */(child.get(anychart.enums.GanttDataFields.PROGRESS_VALUE)), 1) :
          (child.meta('autoProgress') || 0);

      if (!goog.isDef(resultStart)) {
        resultStart = childStart;
      } else {
        resultStart = Math.min(resultStart, childStart, childEnd);
      }

      if (!goog.isDef(resultEnd)) {
        resultEnd = childEnd;
      } else {
        resultEnd = Math.max(resultEnd, childStart, childEnd);
      }

      this.checkDate_(/** @type {number} */ (child.get(anychart.enums.GanttDataFields.ACTUAL_START)));
      this.checkDate_(/** @type {number} */ (child.get(anychart.enums.GanttDataFields.ACTUAL_END)));
      this.checkDate_(/** @type {number} */ (child.get(anychart.enums.GanttDataFields.BASELINE_START)));
      this.checkDate_(/** @type {number} */ (child.get(anychart.enums.GanttDataFields.BASELINE_END)));

      var delta = (/** @type {number} */(childEnd) - /** @type {number} */(childStart));
      progressLength += /** @type {number} */(childProgress) * delta;
      totalLength += delta;
    }
  }

  if (item.numChildren() && !this.isResourceChart_) {
    item.meta('autoProgress', progressLength / totalLength);
    item.meta('autoStart', resultStart);
    item.meta('autoEnd', resultEnd);
  }

};


/**
 * Linearizes tree. Used to add necessary meta information to data items in a straight tree passage.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 * @private
 */
anychart.core.gantt.Controller.prototype.linearizeData_ = function() {
  this.linearIndex_ = 0;
  this.minDate_ = NaN;
  this.maxDate_ = NaN;

  this.data_.suspendSignalsDispatching();
  for (var i = 0, l = this.data_.numChildren(); i < l; i++) {
    var root = this.data_.getChildAt(i);
    this.autoCalcItem_(/** @type {anychart.data.Tree.DataItem} */ (root), 0);
  }

  this.data_.resumeSignalsDispatching(false);
  return this;
};


/**
 * Checks data item to get it's date fields and extend current min-max range.
 * @param {number} date - Timestamp.
 * @private
 */
anychart.core.gantt.Controller.prototype.checkDate_ = function(date) {
  if (goog.isNumber(date) && !isNaN(date)) {
    if (isNaN(this.minDate_)) { //If one of dates is NaN - the second one is NaN as well.
      this.minDate_ = date;
      this.maxDate_ = date;
    }

    if (date < this.minDate_) this.minDate_ = date;
    if (date > this.maxDate_) this.maxDate_ = date;
  }
};


/**
 * Fills this.visibleData_ and this.heightCache with data.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 * @private
 */
anychart.core.gantt.Controller.prototype.getVisibleData_ = function() {
  this.visibleData_.length = 0;
  this.heightCache_.length = 0;
  this.connectorsData_.length = 0; //Resetting connectors map.
  this.periodsMap_ = {};
  this.visibleItemsMap_ = {};

  var item;
  var height = 0;
  this.expandedItemsTraverser_.reset();
  while (this.expandedItemsTraverser_.advance()) {
    item = /** @type {anychart.data.Tree.DataItem} */ (this.expandedItemsTraverser_.current());
    this.visibleData_.push(item);
    height += (anychart.core.gantt.Controller.getItemHeight(item) + this.rowStrokeThickness_);
    this.heightCache_.push(height);

    var itemId = item.get(anychart.enums.GanttDataFields.ID);
    var visItem = {'item': item, 'index': this.heightCache_.length - 1};
    if (goog.isDef(itemId) && !this.visibleItemsMap_[itemId]) this.visibleItemsMap_[itemId] = visItem;

    if (this.isResourceChart_) {
      var periods = item.get(anychart.enums.GanttDataFields.PERIODS);
      var minPeriodDate = NaN;
      var maxPeriodDate = NaN;
      if (goog.isArray(periods)) {
        //Working with raw array.
        for (var i = 0, l = periods.length; i < l; i++) {
          var period = periods[i];
          var periodId = period[anychart.enums.GanttDataFields.ID];
          var periodItem = {'period': period, 'index': this.heightCache_.length - 1};

          /*
            We must store an index of data item to determine the vertical coordinate of connector.
            Period itself is stored to access its fields.
           */
          if (!this.periodsMap_[periodId]) this.periodsMap_[periodId] = periodItem;

          //Building connectors map for resource chart.
          if (period[anychart.enums.GanttDataFields.CONNECT_TO]) {
            //We put here a link to the period if it is already in the map or ID of destination period.
            var to = this.periodsMap_[period[anychart.enums.GanttDataFields.CONNECT_TO]] || period[anychart.enums.GanttDataFields.CONNECT_TO];
            var type = period[anychart.enums.GanttDataFields.CONNECTOR_TYPE];
            var connectorsMapItem = {'from': periodItem, 'to': to};
            if (type) connectorsMapItem['type'] = type;
            this.connectorsData_.push(connectorsMapItem);
          }

          var periodStart = period[anychart.enums.GanttDataFields.START];
          var periodEnd = period[anychart.enums.GanttDataFields.END];

          if (periodStart && periodEnd) {
            minPeriodDate = isNaN(minPeriodDate) ? Math.min(periodStart, periodEnd) : Math.min(minPeriodDate, periodStart, periodEnd);
            maxPeriodDate = isNaN(maxPeriodDate) ? Math.max(periodStart, periodEnd) : Math.max(maxPeriodDate, periodStart, periodEnd);

            //This extends dates range.
            this.checkDate_(periodStart);
            this.checkDate_(periodEnd);
          }

        }

        if (!isNaN(minPeriodDate) && !isNaN(maxPeriodDate)) {
          item.tree().suspendSignalsDispatching();
          item.meta('minPeriodDate', minPeriodDate);
          item.meta('maxPeriodDate', maxPeriodDate);
          item.tree().resumeSignalsDispatching(false);
        }

      }
    } else {
      //Building connectors map for project chart.
      var connectTo = item.get(anychart.enums.GanttDataFields.CONNECT_TO);
      if (connectTo) {
        var itemConnectTo = this.visibleItemsMap_[connectTo] || connectTo;
        var connType = item.get(anychart.enums.GanttDataFields.CONNECTOR_TYPE);
        var taskMapItem = {'from': visItem, 'to': itemConnectTo};
        if (connType) taskMapItem['type'] = connType;
        this.connectorsData_.push(taskMapItem);
      }
    }
  }

  return this;
};


/**
 * Returns an actual height between rows.
 * NOTE: Considers a row spacing.
 * @param {number} startIndex - Start index.
 * @param {number=} opt_endIndex - End index.
 * @return {number} - Actual height.
 */
anychart.core.gantt.Controller.prototype.getHeightByIndexes = function(startIndex, opt_endIndex) {
  if (!this.heightCache_.length) return 0;

  var cacheEnd = this.heightCache_.length - 1;
  startIndex = Math.min(startIndex, cacheEnd);
  opt_endIndex = goog.isDef(opt_endIndex) ? Math.min(opt_endIndex, cacheEnd) : cacheEnd;


  if (startIndex > opt_endIndex) { //Swapping numbers. Super memory usage optimization.
    startIndex = startIndex - opt_endIndex;
    opt_endIndex = opt_endIndex + startIndex;
    startIndex = opt_endIndex - startIndex;
  }

  var startHeight = this.heightCache_[startIndex - 1] || 0;

  return this.heightCache_[opt_endIndex] - startHeight;
};


/**
 * Calculates index related to height specified.
 * NOTE: Make sure height belongs to [0 .. this.heightCache_[this.heightCache_.length - 1]].
 * @param {number} height - Height.
 * @return {number} - Index.
 */
anychart.core.gantt.Controller.prototype.getIndexByHeight = function(height) {
  var index = goog.array.binarySearch(this.heightCache_, height);
  return index >= 0 ? index : ~index;
};


/**
 * Sets values for this.startIndex_, this.endIndex_ and this.verticalOffset_ if needed based on this.visibleData_ and
 *  this.availableHeight_.
 * Clears POSITION consistency state.
 */
anychart.core.gantt.Controller.prototype.recalculate = function() {
  if (this.visibleData_.length) {
    if (!isNaN(this.startIndex_)) this.startIndex_ = goog.math.clamp(this.startIndex_, 0, this.visibleData_.length - 1);
    if (!isNaN(this.endIndex_)) this.endIndex_ = goog.math.clamp(this.endIndex_, 0, this.visibleData_.length - 1);

    var totalHeight = this.getHeightByIndexes(0, this.heightCache_.length - 1);

    if (this.availableHeight_ >= totalHeight) {
      this.startIndex_ = 0;
      this.verticalOffset_ = 0;
      this.endIndex_ = this.visibleData_.length - 1;
    } else {
      if (isNaN(this.startIndex_) && isNaN(this.endIndex_)) this.startIndex_ = 0;

      if (!isNaN(this.startIndex_)) { //Start index is set.
        totalHeight = this.getHeightByIndexes(this.startIndex_) - this.verticalOffset_;
        if (totalHeight < this.availableHeight_) { //Going from end of list.
          this.startIndex_ = this.getIndexByHeight(this.heightCache_[this.heightCache_.length - 1] - this.availableHeight_);
          this.endIndex_ = this.heightCache_.length - 1;
          this.verticalOffset_ = this.getHeightByIndexes(this.startIndex_, this.endIndex_) - this.availableHeight_;
        } else {
          var height = this.startIndex_ == 0 ? 0 : this.heightCache_[this.startIndex_ - 1];
          this.endIndex_ = this.getIndexByHeight(height + this.availableHeight_ + this.verticalOffset_);
        }
      } else { //End index is set, start index must be NaN here.
        totalHeight = this.getHeightByIndexes(0, this.endIndex_);
        if (totalHeight < this.availableHeight_) { //Going from start of list.
          this.startIndex_ = 0;
          this.verticalOffset_ = 0;
          this.endIndex_ = this.getIndexByHeight(this.availableHeight_);
        } else {
          /*
           This case has another behaviour: when start index is set, we consider the vertical offset.
           In this case (end index is set instead), we suppose that end index cell is fully visible in the end
           of data grid. It means that we do not consider the vertical offset and calculate it as well.
           */
          this.startIndex_ = this.getIndexByHeight(this.heightCache_[this.endIndex_] - this.availableHeight_);
          this.verticalOffset_ = this.getHeightByIndexes(this.startIndex_, this.endIndex_) - this.availableHeight_;
        }
      }
    }

  } else {
    this.startIndex_ = 0;
    this.endIndex_ = 0;
    this.verticalOffset_ = 0;
    this.setGanttLifeYears_();
  }
  this.positionRecalculated_ = true;
  this.markConsistent(anychart.ConsistencyState.CONTROLLER_POSITION);
};


/**
 * Sets this.minDate_ and this.maxDate_ to Henry Gantt's life years.
 * Calculates values to fit timeline's gaps.
 * @private
 */
anychart.core.gantt.Controller.prototype.setGanttLifeYears_ = function() {
  var minDate = anychart.core.gantt.Controller.GANTT_BIRTH_DATE;
  var maxDate = anychart.core.gantt.Controller.GANTT_DEATH_DATE;

  var minGap = 0;
  var maxGap = 0;
  if (this.timeline_) {
    minGap = this.timeline_.minimumGap();
    maxGap = this.timeline_.maximumGap();
  }

  var k = (1 + minGap + maxGap);

  /*
    To calculate this values:

       minGap      maxDate_ - minDate_ = delta         maxGap
    |---------|---------------------------------|--------------------|
    birth     minDate_                          maxDate_             death

    { minDate_ - minGap * delta = birth
    { maxDate_ + maxGap * delta = death
   */

  this.minDate_ = Math.round((minDate + minDate * maxGap + maxDate * minGap) / k);
  this.maxDate_ = Math.round((maxDate + maxDate * minGap + minDate * maxGap) / k);
};


/**
 * Gets periods map.
 * @return {Object} - Map that contains related period by its id.
 */
anychart.core.gantt.Controller.prototype.getPeriodsMap = function() {
  return this.periodsMap_;
};


/**
 * Gets visible items map.
 * @return {Object} - Map that contains related tree dta items by its id.
 */
anychart.core.gantt.Controller.prototype.getVisibleItemsMap = function() {
  return this.visibleItemsMap_;
};


/**
 * Gets connectors data.
 * @return {Array.<Object>} - Connectors data.
 */
anychart.core.gantt.Controller.prototype.getConnectorsData = function() {
  return this.connectorsData_;
};


/**
 * Gets height cache.
 * @return {Array.<number>} - Height cache.
 */
anychart.core.gantt.Controller.prototype.getHeightCache = function() {
  return this.heightCache_;
};


/**
 * Gets/sets source data tree.
 * @param {anychart.data.Tree=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Controller|anychart.data.Tree)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.data = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if ((this.data_ != opt_value) && (opt_value instanceof anychart.data.Tree)) {
      if (this.data_) this.data_.unlistenSignals(this.dataInvalidated_, this); //Stop listening old tree.
      this.data_ = opt_value;
      this.data_.listenSignals(this.dataInvalidated_, this);

      this.expandedItemsTraverser_ = this.data_.getTraverser();
      this.expandedItemsTraverser_.traverseChildrenCondition(this.traverseChildrenCondition_);

      this.invalidate(anychart.ConsistencyState.CONTROLLER_DATA, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.data_;
};


/**
 * Gets/sets vertical offset.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.verticalOffset = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.verticalOffset_ != opt_value) {
      this.verticalOffset_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.verticalOffset_;
};


/**
 * Gets/sets start index.
 * NOTE: Calling this method sets this.endIndex_ to NaN to recalculate value correctly anew.
 * ALSO NOTE: Resets vertical offset to 0 to show required cell all.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.startIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!isNaN(opt_value)) {
      this.startIndex_ = opt_value;
      this.verticalOffset_ = 0;
      this.endIndex_ = NaN;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.startIndex_;
};


/**
 * Gets/sets end index.
 * NOTE: Calling this method sets this.startIndex_ to NaN to recalculate value correctly anew.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.endIndex = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (!isNaN(opt_value)) {
      this.endIndex_ = opt_value;
      this.startIndex_ = NaN;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.endIndex_;
};


/**
 * Gets/sets available height.
 * @param {number=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Controller|number)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.availableHeight = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.availableHeight_ != opt_value) {
      this.availableHeight_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.availableHeight_;
};


/**
 * Gets/sets row stroke thickness.
 * @param {number=} opt_value - Value to be set.
 * @return {number|anychart.core.gantt.Controller} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.rowStrokeThickness = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.rowStrokeThickness_ != opt_value) {
      this.rowStrokeThickness_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_VISIBILITY, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.rowStrokeThickness_;
};


/**
 * Gets/sets data grid.
 * @param {anychart.core.ui.DataGrid=} opt_value - Value to be set.
 * @return {(anychart.core.ui.DataGrid|anychart.core.gantt.Controller)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.dataGrid = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.dataGrid_ != opt_value) {
      this.dataGrid_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.dataGrid_;
};


/**
 * Gets/sets timeline.
 * @param {anychart.core.gantt.Timeline=} opt_value - Value to be set.
 * @return {(anychart.core.gantt.Timeline|anychart.core.gantt.Controller)} - Current value or itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.timeline = function(opt_value) {
  if (goog.isDef(opt_value)) {
    if (this.timeline_ != opt_value) {
      this.timeline_ = opt_value;
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION, anychart.Signal.NEEDS_REAPPLICATION);
    }
    return this;
  }
  return this.timeline_;
};


/**
 * Runs controller.
 * Actually clears all consistency states and applies changes to related data grid.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.run = function() {
  if (!this.isConsistent()) {
    if (this.hasInvalidationState(anychart.ConsistencyState.CONTROLLER_DATA)) {
      this.linearizeData_();
      this.markConsistent(anychart.ConsistencyState.CONTROLLER_DATA);
      this.invalidate(anychart.ConsistencyState.CONTROLLER_VISIBILITY);
    }

    if (this.hasInvalidationState(anychart.ConsistencyState.CONTROLLER_VISIBILITY)) {
      this.getVisibleData_();
      this.markConsistent(anychart.ConsistencyState.CONTROLLER_VISIBILITY);
      this.invalidate(anychart.ConsistencyState.CONTROLLER_POSITION);
    }

    this.recalculate();

    if (isNaN(this.minDate_)) { //In this case this.maxDate_ is NaN as well.
      this.setGanttLifeYears_();
    } else if (this.minDate_ == this.maxDate_) {
      this.minDate_ -= anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY;
      this.maxDate_ += anychart.scales.GanttDateTime.MILLISECONDS_IN_DAY;
    }
  }

  //This must be called anyway. Clears consistency states of data grid not related to controller.
  if (this.dataGrid_)
    this.dataGrid_.drawInternal(this.visibleData_, this.startIndex_, this.endIndex_, this.verticalOffset_, this.availableHeight_, this.positionRecalculated_);

  if (this.timeline_)
    this.timeline_.drawInternal(this.visibleData_, this.startIndex_, this.endIndex_, this.verticalOffset_, this.availableHeight_,
        this.minDate_, this.maxDate_, this.positionRecalculated_);

  if (this.verticalScrollBar_) {
    this.verticalScrollBar_.suspendSignalsDispatching();
    this.verticalScrollBar_.handlePositionChange(false);

    var startRatio = 0;
    var endRatio = 1;

    if (this.heightCache_.length) {
      var itemHeight = this.getHeightByIndexes(this.startIndex_, this.startIndex_);
      var height = this.heightCache_[this.startIndex_] - itemHeight;

      var start = height + this.verticalOffset_;
      var end = start + this.availableHeight_;

      var totalEnd = this.heightCache_[this.heightCache_.length - 1];

      var contentBoundsSimulation = new acgraph.math.Rect(0, 0, 0, totalEnd);

      startRatio = anychart.math.round(start / totalEnd, 4);
      endRatio = anychart.math.round(end / totalEnd, 4);

      this.verticalScrollBar_.contentBounds(contentBoundsSimulation);
    }

    this.verticalScrollBar_
        .setRatio(startRatio, endRatio)
        .draw()
        .handlePositionChange(true)
        .resumeSignalsDispatching(false);
  }

  this.positionRecalculated_ = false;
  return this;
};


/**
 * Generates vertical scroll bar.
 * @return {anychart.core.ui.ScrollBar} - Scroll bar.
 */
anychart.core.gantt.Controller.prototype.getScrollBar = function() {
  if (!this.verticalScrollBar_) {
    this.verticalScrollBar_ = new anychart.core.ui.ScrollBar();
    this.verticalScrollBar_
        .layout(anychart.enums.Layout.VERTICAL)
        .buttonsVisible(false)
        .mouseOutOpacity(.25)
        .mouseOverOpacity(.45);

    var controller = this;

    this.verticalScrollBar_.listen(anychart.enums.EventType.SCROLL_CHANGE, function(e) {
      var startRatio = e['startRatio'];
      var endRatio = e['endRatio'];
      var totalHeight = controller.heightCache_[controller.heightCache_.length - 1];

      controller.suspendSignalsDispatching();

      if (startRatio == 0) { //This fixes JS rounding.
        controller
            .startIndex(0)
            .verticalOffset(0);
      } else if (endRatio == 1) { //This fixed JS rounding troubles.
        controller.endIndex(controller.heightCache_.length); //This exceeds MAX index (max is length-1). That's why it will set visual appearance correctly.
      } else {
        var startHeight = Math.round(startRatio * totalHeight);
        var startIndex = controller.getIndexByHeight(startHeight);
        var previousHeight = startIndex ? controller.heightCache_[startIndex - 1] : 0;
        var verticalOffset = startHeight - previousHeight;
        controller
            .startIndex(startIndex)
            .verticalOffset(verticalOffset);
      }

      controller.resumeSignalsDispatching(false);
      controller.run();
    });
  }
  return this.verticalScrollBar_;
};


/**
 * Scrolls controller to pixel offset specified.
 * TODO (A.Kudryavtsev): Describe how this method fits to total height and available height.
 * @param {number} pxOffset - Vertical pixel total offset.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.scrollTo = function(pxOffset) {
  pxOffset = Math.max(pxOffset, 0);
  var totalHeight = this.heightCache_[this.heightCache_.length - 1];
  this.suspendSignalsDispatching();

  if (pxOffset > totalHeight - this.availableHeight_) { //auto scroll to end
    this.endIndex(this.heightCache_.length - 1);
  } else {
    var itemIndex = this.getIndexByHeight(pxOffset);
    var previousHeight = itemIndex ? this.heightCache_[itemIndex - 1] : 0;
    var verticalOffset = pxOffset - previousHeight;
    this
        .startIndex(itemIndex)
        .verticalOffset(verticalOffset);
  }
  this.resumeSignalsDispatching(false);
  this.run();

  return this;
};


/**
 * Performs vertical scroll to rowIndex specified.
 * TODO (A.Kudryavtsev): Describe how this method fits to total rows count.
 * @param {number} rowIndex - Row index to scroll to.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.scrollToRow = function(rowIndex) {
  rowIndex = goog.math.clamp(rowIndex, 0, this.heightCache_.length - 1);
  this
      .suspendSignalsDispatching()
      .startIndex(rowIndex)
      .verticalOffset(0)
      .resumeSignalsDispatching(false)
      .run();
  return this;
};


/**
 * Scrolls controller to set end index specified.
 * @param {number=} opt_index - End index to be set.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.scrollToEnd = function(opt_index) {
  opt_index = opt_index || this.heightCache_.length - 1;
  return /** @type {anychart.core.gantt.Controller} */ (this.endIndex(opt_index));
};


/**
 * Collapses/expands all.
 * @param {boolean} value - Value to be set.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 * @private
 */
anychart.core.gantt.Controller.prototype.collapseAll_ = function(value) {
  this.data_.suspendSignalsDispatching();
  var traverser = this.data_.getTraverser();
  traverser.nodeYieldCondition(this.itemHasChildrenCondition_);
  while (traverser.advance()) {
    var item = traverser.current();
    item.meta(anychart.enums.GanttDataFields.COLLAPSED, value);
  }

  this.data_.resumeSignalsDispatching(true);
  return this;
};


/**
 * Expands all.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.expandAll = function() {
  return this.collapseAll_(false);
};


/**
 * Collapses all.
 * @return {anychart.core.gantt.Controller} - Itself for method chaining.
 */
anychart.core.gantt.Controller.prototype.collapseAll = function() {
  return this.collapseAll_(true);
};


/** @inheritDoc */
anychart.core.gantt.Controller.prototype.serialize = function() {
  var json = goog.base(this, 'serialize');

  json['isResourceChart'] = this.isResourceChart_;
  json['treeData'] = this.data().serialize();
  json['verticalOffset'] = this.verticalOffset();
  if (!isNaN(this.startIndex()))
    json['startIndex'] = this.startIndex();
  else if (!isNaN(this.endIndex()))
    json['endIndex'] = this.endIndex();

  //NOTE: We do not save available height because it must be set from outside depending on size of restored element.

  return json;
};


/** @inheritDoc */
anychart.core.gantt.Controller.prototype.setupByJSON = function(config) {
  goog.base(this, 'setupByJSON', config);

  this.isResourceChart_ = config['isResourceChart']; //Direct setup. I don't want to believe that it is kind of hack.
  if ('treeData' in config) this.data(anychart.data.Tree.fromJson(config['treeData']));
  this.verticalOffset(config['verticalOffset']);
  if ('startIndex' in config)
    this.startIndex(config['startIndex']);
  else if ('endIndex' in config)
    this.endIndex(config['endIndex']);

  //NOTE: Available height must be set from outside depending on size of restored element.
};

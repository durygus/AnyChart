var setupMultiSeriesColumnSeries = function (chart, data, name, if_labels, if_markers, tooltip) {
  var series = chart.column(data);

  if (!tooltip) series.tooltip(false);
  if (if_labels) series.labels(true);
  if (name) series.name(name);
  if (if_markers) series.markers(true);
  return series
};

var MultiSeriesColumnChart_1 = function (if_labels, if_markers, tooltip, if_axis_title) {
  var chart = anychart.column();
  var seriesData_1 = categorized_small_data.mapAs({x: [0], value: [1]});
  var seriesData_2 = categorized_small_data.mapAs({x: [0], value: [2]});
  var seriesData_3 = categorized_small_data.mapAs({x: [0], value: [3]});
  var seriesData_4 = categorized_small_data.mapAs({x: [0], value: [4]});
  setupMultiSeriesColumnSeries(chart, seriesData_1, 'Florida', if_labels, if_markers, tooltip);
  setupMultiSeriesColumnSeries(chart, seriesData_2, 'Texas', if_labels, if_markers, tooltip);
  setupMultiSeriesColumnSeries(chart, seriesData_3, 'Arizona', if_labels, if_markers, tooltip);
  setupMultiSeriesColumnSeries(chart, seriesData_4, 'Nevada', if_labels, if_markers, tooltip);
  return chart
};

var MultiSeriesColumnChart_2 = function () {
  var chart = MultiSeriesColumnChart_1(false, false, false, true);
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Products'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  return chart
};

var MultiSeriesColumnChart_3 = function () {
  var chart = MultiSeriesColumnChart_1(false, false, 'small', false);
  chart.title().enabled(true);
  chart.title().text('Sales of different products in Florida and Texas');
  chart.legend(true);
  chart.xAxis().ticks().enabled(true);
  chart.yAxis().minorTicks().enabled(true);
  chart.grid().enabled(true);
  chart.grid(1).enabled(true);
  chart.minorGrid().enabled(true);
  chart.minorGrid(1).enabled(true);
  return chart
};

var MultiSeriesColumnChart_4 = function () {
  return MultiSeriesColumnChart_1(true, true, 'small', false);
};

anychart.onDocumentReady(function () {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="column_multi_series_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="column_multi_series_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="column_multi_series_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="column_multi_series_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = MultiSeriesColumnChart_1(false, false, 'small', false);
  chart1.container('column_multi_series_1');
  chart1.draw();
  var chart2 = MultiSeriesColumnChart_2();
  chart2.container('column_multi_series_2');
  chart2.draw();
  var chart3 = MultiSeriesColumnChart_3();
  chart3.container('column_multi_series_3');
  chart3.draw();
  var chart4 = MultiSeriesColumnChart_4();
  chart4.container('column_multi_series_4');
  chart4.draw();
});
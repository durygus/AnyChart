var setupStackedAreaSeries = function (chart, data, name, if_labels, if_markers, tooltip) {
  var series = chart.area(data);
  series.clip(false);

  if (!tooltip) series.tooltip(false);
  if (if_labels) series.labels(true);
  if (name) series.name(name);
  if (if_markers) series.markers(true);
  return series
};

var StackedAreaChart_1 = function (if_labels, if_markers, tooltip, if_axis_title) {
  var chart = anychart.area();
  chart.yScale().stackMode('value');
  var seriesData_1 = categorized_data.mapAs({x: [0], value: [1]});
  var seriesData_2 = categorized_data.mapAs({x: [0], value: [2]});
  var seriesData_3 = categorized_data.mapAs({x: [0], value: [3]});
  var seriesData_4 = categorized_data.mapAs({x: [0], value: [4]});
  setupStackedAreaSeries(chart, seriesData_1, 'Florida', if_labels, if_markers, tooltip);
  setupStackedAreaSeries(chart, seriesData_2, 'Texas', if_labels, if_markers, tooltip);
  setupStackedAreaSeries(chart, seriesData_3, 'Arizona', if_labels, if_markers, tooltip);
  setupStackedAreaSeries(chart, seriesData_4, 'Nevada', if_labels, if_markers, tooltip);
  return chart
};

var StackedAreaChart_2 = function () {
  var chart = StackedAreaChart_1(false, false, false, true);
  chart.title().enabled(true);
  chart.title().text('Sales of different products, 2015');
  chart.xAxis().title({text: 'Products'});
  chart.yAxis().title({text: 'Revenue by dollars'});
  return chart
};

var StackedAreaChart_3 = function () {
  var chart = StackedAreaChart_1(false, false, 'small', false);
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

var StackedAreaChart_4 = function () {
  return StackedAreaChart_1(true, true, 'small', false);
};

anychart.onDocumentReady(function () {
    var $containers = $('<div class="col-lg-4"><div class="chart-container" id="area_stacked_1"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="area_stacked_2"></div></div> ' +
  '<div class="col-lg-4"><div class="chart-container" id="area_stacked_3"></div></div>' +
  '<div class="col-lg-4"><div class="chart-container" id="area_stacked_4"></div></div>');
  $('#chart-places').append($containers);

  var chart1 = StackedAreaChart_1(false, false, 'small', false);
  chart1.container('area_stacked_1');
  chart1.draw();
  var chart2 = StackedAreaChart_2();
  chart2.container('area_stacked_2');
  chart2.draw();
  var chart3 = StackedAreaChart_3();
  chart3.container('area_stacked_3');
  chart3.draw();
  var chart4 = StackedAreaChart_4();
  chart4.container('area_stacked_4');
  chart4.draw();
});
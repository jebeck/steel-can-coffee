var d3 = require('d3');
var coffee = require('./index');

(function() {
  var result = coffee.setup();

  d3.json('data.json', function(data) {
    var viz = coffee.visualize({
      data: data,
      selection: result.svg,
      Shapes: result.Shapes
    });
    viz.draw();
    var parent = document.getElementById('main');
    var margin = result.margin, dimensions = result.dimensions;
    d3.select(window).on('resize', function() {
      dimensions.width = parent.offsetWidth - margin.left - margin.right;
      dimensions.height = parent.offsetHeight - margin.top - margin.bottom;
      d3.select('#main').select('svg').attr({
        width: parent.offsetWidth,
        height: parent.offsetHeight
      });
      viz.update(dimensions);
    });
  });
})();
var d3 = require('d3');
var Hammer = require('hammerjs');
// because viewport units don't work properly on mobile Safari :(
require('viewport-units-buggyfill').init();

var coffee = require('./index');

(function() {
  var result = coffee.setup();

  d3.json('data.json', function(data) {
    function handleBack() {
      viz.cycleBackwards();
    }
    function handleForwards() {
      viz.cycleForwards();
    }
    var viz = coffee.visualize({
      data: data,
      selection: result.svg,
      Shapes: result.Shapes
    });
    viz.draw();
    var parent = document.getElementById('main');
    var mc = new Hammer(parent);
    var margin = result.margin, dimensions = result.dimensions;
    d3.select(window).on('resize', function() {
      var w = window.innerWidth, h = window.innerHeight;
      dimensions.width = w - margin.left - margin.right;
      dimensions.height = h - margin.top - margin.bottom;
      d3.select('#main')
        .attr({
          width: w,
          height: h
        })
        .select('svg')
        .attr({
          width: w,
          height: h
      });
      viz.update(dimensions);
    });
    d3.select('span.nav.back').on('click', handleBack);
    d3.select('span.nav.forward').on('click', handleForwards);
    mc.on('swipeleft', handleBack);
    mc.on('swiperight', handleForwards);
  });
})();
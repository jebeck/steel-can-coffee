var d3 = require('d3');
var Hammer = require('hammerjs');
// because viewport units don't work properly on mobile Safari :(
require('viewport-units-buggyfill').init();

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

    function handleBack() {
      viz.cycleBackwards();
    }
    function handleForwards() {
      viz.cycleForwards();
    }

    d3.select('span.nav.back').on('click', handleBack);
    d3.select('span.nav.forward').on('click', handleForwards);
    mc.on('swipeleft', handleBack);
    mc.on('swiperight', handleForwards);

    function handleSpecial(special) {
      special.classed('special', false);
      var datum = special.datum();
      viz.focused = datum.rank;
      d3.selectAll('span.nav')
        .classed('hidden', true);
      viz.drawFocus();
      coffee.foreignobject({
        handleClose: viz.undrawFocus,
        d: datum,
        selection: d3.select('#main').select('svg'),
        shape: viz.shape
      });
    }

    d3.selectAll('.coffee-circle-group').on('click', function() {
      if (d3.select(this).classed('special')) {
        handleSpecial(d3.select(this));
      }
      else {
        var thisRank = d3.select(this).datum().rank;
        var specialRank = d3.select('.coffee-circle-group.special').datum().rank;
        var diff = thisRank - specialRank;
        if (diff < 0) {
          for (var i = 0; i < Math.abs(diff); i++) {
            handleForwards();
          }
        }
        else {
          for (var j = 0; j < diff; j++) {
            handleBack();
          }
        }
      }
    });
    window.onkeypress = function(e) {
      if (e.keyIdentifier === 'Enter') {
        if (viz.focused !== null) {
          viz.undrawFocus();
        }
        else {
          handleSpecial(d3.select('.coffee-circle-group.special'));
        }
      }
    };
    // because arrow keys, Esc don't register onkeypress
    document.onkeydown = function(e) {
      if (e.keyIdentifier === 'Right') {
        handleBack();
      }
      else if (e.keyIdentifier === 'Left') {
        handleForwards();
      }
      else if (e.keyCode === 27) {
        viz.undrawFocus();
      }
    };
  });
})();
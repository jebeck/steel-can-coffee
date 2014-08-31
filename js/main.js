var attachFastClick = require('fastclick');
var d3 = require('d3');
var Hammer = require('hammerjs');
var hastouch = require('./hastouch');
// because viewport units don't work properly on mobile Safari :(
require('viewport-units-buggyfill').init();

var coffee = require('./index');

(function() {

  attachFastClick(document.body);

  d3.select('span#close-icon').classed('hidden', hastouch());
  d3.select('span#close-text').classed('hidden', !hastouch());

  function onDismiss() {
    d3.select('div#intro').classed('hidden', true);
    d3.selectAll('span.nav').classed('hidden', false);
    d3.select(window).on('keypress', null);
    d3.select(window).on('keydown', null);

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
        // keyCode 13 is Enter
        if (e.keyCode === 13) {
          if (viz.focused !== null) {
            viz.undrawFocus();
          }
          else {
            handleSpecial(d3.select('.coffee-circle-group.special'));
          }
        }
      };
      // because arrow keys, Esc (keyCode 27) don't register onkeypress
      document.onkeydown = function(e) {
        if (e.keyIdentifier === 'Right' || (e.keyCode === 9 && !e.shiftKey)) {
          // preventDefault to stop tab (keyCode 9) from moving active focus to address bar
          e.preventDefault();
          handleBack();
        }
        else if (e.keyIdentifier === 'Left' || (e.keyCode === 9 && e.shiftKey)) {
          // preventDefault to stop tab (keyCode 9) from moving active focus to address bar
          e.preventDefault();
          handleForwards();
        }
        else if (e.keyCode === 27) {
          viz.undrawFocus();
        }
        // prevent annoying white strip at bottom of screen if press down arrow
        else if (e.keyIdentifier === 'Down') {
          e.preventDefault();
        }
      };
    });
  }

  if (hastouch()) {
    d3.select('div#intro').on('click', onDismiss);
  }
  else {
    d3.select('p#close span').on('click', onDismiss);
  }

  d3.select(window).on('keypress', function() {
    // keyCode 13 is Enter
    if (d3.event.keyCode === 13) {
      onDismiss();
    }
  });

  d3.select(window).on('keydown', function() {
    if (d3.event.keyCode === 27) {
      onDismiss();
    }
  });

})();
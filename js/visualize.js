var _ = require('lodash');
var d3 = require('d3');

var hastouch = require('./hastouch');

module.exports = function(opts) {
  opts = opts || {};
  var defaults = {
    duration: 800,
    focusRadiusRatio: 1.5
  };

  _.defaults(opts, defaults);
  var viz = {};

  var shape, ranksToPosition, paths, currentRanks = [1,2,3,4,5];
  viz.focused = null;
  // initialize shape and ranksToPosition
  updateShape();

  function updateShape(dimensions) {
    var shapes = new opts.Shapes(), aspectRatio;

    if (!arguments.length) {
      aspectRatio = shapes.w / shapes.h;
    }
    else {
      aspectRatio = dimensions.width/dimensions.height;
    }

    var w = window.innerWidth, h = window.innerHeight;
    if (w <= 360) {
      if (!dimensions) {
        dimensions = {
          width: w,
          height: h
        };
      }
      shape = shapes.threeTwoVertical(dimensions);
      ranksToPosition = shape.ranksToPosition;
    }
    else if (h <= 360) {
      if (!dimensions) {
        dimensions = {
          width: w,
          height: h
        };
      }
      shape = shapes.threeTwoHorizontal(dimensions);
      ranksToPosition = shape.ranksToPosition;
    }
    else if (aspectRatio >= 0.95) {
      shape = shapes.pentagon();
      ranksToPosition = shape.ranksToPosition;
    }
    else if (aspectRatio < 0.95) {
      shape = shapes.vertical();
      ranksToPosition = shape.ranksToPosition;
    }
    viz.shape = shape;
  }

  var xPosition = function(d) {
    if (d.rank === viz.focused) {
      return shape[ranksToPosition[d.rank]].focused.x;
    }
    return shape[ranksToPosition[d.rank]].x;
  };

  var yPosition = function(d) {
    if (d.rank === viz.focused) {
      return shape[ranksToPosition[d.rank]].focused.y;
    }
    return shape[ranksToPosition[d.rank]].y;
  };

  var isSpecial = function(d) {
    var isSpecial = shape.specialPosition;
    if (ranksToPosition[d.rank] === isSpecial) {
      return true;
    }
    return false;
  };

  function getCurrentPositions() {
    return _.map(currentRanks, function(r) {
      return ranksToPosition[r];
    });
  }

  function preserveRanksToPosition() {
    var oldRanksToPosition = _.clone(ranksToPosition);
    _.map(currentRanks, function(r, i) {
      ranksToPosition[r] = oldRanksToPosition[i + 1];
    });
  }

  function updateRanksToPosition(currentPositions) {
    _.map(currentRanks, function(r, i) {
      ranksToPosition[r] = currentPositions[i];
    });
  }

  viz.cycleBackwards = function(duration) {
    duration = duration || opts.duration;
    var currentPositions = getCurrentPositions();

    var first = currentRanks[0];
    currentRanks = currentRanks.slice(1,5);
    currentRanks.push(first);

    updateRanksToPosition(currentPositions);

    viz.updatePosition(duration);
  };

  viz.cycleForwards = function(duration) {
    duration = duration || opts.duration;
    var currentPositions = getCurrentPositions();

    var last = currentRanks[4];
    currentRanks = currentRanks.slice(0,4);
    currentRanks.unshift(last);

    updateRanksToPosition(currentPositions);

    viz.updatePosition(duration);
  };

  // make a group for each coffee brand
  var circles = opts.selection.selectAll('g')
    .data(opts.data)
    .enter()
    .append('g')
    .attr({
      id: function(d) { return d.brand.replace(' ', '_'); }
    })
    .classed({
      'coffee-circle-group': true,
      'special': isSpecial,
      'link': true
    });

  viz.draw = function() {
    // define paths for text in circles
    paths = d3.select('defs')
      .selectAll('path')
      .data(opts.data)
      .enter()
      .append('path')
      .attr({
        d: function(d) {
          var path = shape.pathGenerator(xPosition(d), yPosition(d));
          return path.m + path.a;
        },
        id: function(d) { return d.brand.replace(' ', '_') + 'Path'; }
      });

    // add large circle
    circles.append('circle')
      .attr({
        cx: xPosition,
        cy: yPosition,
        r: 0,
        'class': 'coffee-circle'
      });

    // add inner circles
    circles.append('circle')
      .attr({
        cx: xPosition,
        cy: yPosition,
        r: 0
      })
      .classed({
        'coffee-circle-ghost': true,
        'no-touch': !hastouch()
      });

    // animate expansion of large circles to full radius
    circles.selectAll('.coffee-circle')
      .transition()
      .duration(750)
      .attr({
        r: shape.radius,
        'stroke-width': (shape.radius / 20)
      });

    // animate expansion of small circles to full radius
    circles.selectAll('.coffee-circle-ghost')
      .transition()
      .duration(750)
      .attr({
        r: shape.radius/2
      });

    // add coffee brand text to each circle
    circles.append('text')
      .append('textPath')
      .attr({
        'font-size': (0.4 * shape.radius),
        startOffset: '33%',
        'xlink:href': function(d) { return '#' + d.brand.replace(' ', '_') + 'Path'; },
        'class': 'coffee-brand',
      })
      .text(function(d) { return d.brand; });

    // add coffee brand rank number to each circle
    circles.append('text')
      .attr({
        'font-size': (1.4 * shape.radius),
        x: xPosition,
        y: yPosition,
        'class': 'coffee-rank'
      })
      .text(function(d) { return d.rank; });

    return viz;
  };

  viz.update = function(dimensions) {
    var duration;
    if (!arguments.length) {
      updateShape();
      duration = opts.duration/2;
    }
    else {
      updateShape(dimensions);
      duration = 0;
    }
    preserveRanksToPosition();
    viz.updatePosition(duration);

    // update radius of focus circle, if exists
    circles.selectAll('.coffee-circle-focus')
      .attr('r', shape.radius * opts.focusRadiusRatio);

    // update radius of large circles
    circles.selectAll('.coffee-circle')
      .attr('r', shape.radius);

    // update radius of small circles
    circles.selectAll('.coffee-circle-ghost')
      .attr('r', shape.radius/2);

    // update position of coffee brand text
    circles.selectAll('.coffee-brand')
      .attr({
        'font-size': (0.4 * shape.radius),
        startOffset: '33%'
      });

    if (viz.focused) {
      var fo = shape.foreignObject;
      d3.select('#thisIsTheForeignObject')
        .attr({
          width: fo.width,
          height: fo.height,
          x: fo.x,
          y: fo.y(d3.select('.fo-main')[0][0].getBoundingClientRect().height)
        });      
    }
  };

  viz.updatePosition = function(duration) {
    // update position of large and small circles
    circles.selectAll('circle')
      .transition()
      .duration(duration)
      .attr({
        cx: xPosition,
        cy: yPosition
      });

    // update special class for near-to-focused circle
    if (!viz.focused) {
      circles.classed('special', isSpecial);
    }

    // update paths for text in circle
    paths.transition()
      .duration(duration)
      .attr({
        d: function(d) {
          var path = shape.pathGenerator(xPosition(d), yPosition(d));
          return path.m + path.a;
        }
    });

    // update position of coffee rank text
    circles.selectAll('.coffee-rank')
      .transition()
      .duration(duration)
      .attr({
        'font-size': (1.4 * shape.radius),
        x: xPosition,
        y: yPosition
      });
  };

  function updatePathAndText(focused, wasFocused, duration) {
    duration = duration || opts.duration;
    // update path for text in circle
    paths.filter(function(d) {
      if (d.rank === viz.focused || d.rank === wasFocused) {
        return d;
      }
    })
      .transition()
      .duration(opts.duration)
      .attr({
        d: function(d) {
          var path = shape.pathGenerator(xPosition(d), yPosition(d));
          return path.m + path.a;
        }
    });

    // update position of coffee rank text
    focused.selectAll('.coffee-rank')
      .transition()
      .duration(opts.duration)
      .attr({
        'font-size': (1.4 * shape.radius),
        x: xPosition,
        y: yPosition
      });
  }

  viz.drawFocus = function() {
    var focused = circles.filter(function(d) {
      if (isSpecial(d)) {
        return d;
      }
    });

    // remove pointer cursor when circle is focused
    focused.classed('link', false);

    // add a third larger 'focus' circle
    focused.insert('circle', '.coffee-circle')
      .attr({
        cx: xPosition,
        cy: yPosition,
        r: 0,
        'class': 'coffee-circle-focus'
      });

    // update position of all circles
    focused.selectAll('circle')
      .transition()
      .duration(opts.duration)
      .attr({
        cx: xPosition,
        cy: yPosition
      });

    // animate the introduction of the 'focus' circle
    focused.select('.coffee-circle-focus')
      .transition()
      .duration(opts.duration)
      .attr({
        r: focused.select('.coffee-circle').attr('r') * opts.focusRadiusRatio
      });

    updatePathAndText(focused);

    var unfocused = circles.filter(function(d) {
      if (!isSpecial(d)) {
        return d;
      }
    });

    // animate the exit of the unfocused circles
    unfocused.selectAll('circle')
      .transition()
      .duration(opts.duration/2)
      .attr({
        r: 0,
        opacity: 0.0
      });

    // animate the exit of the text in the unfocused circles
    unfocused.selectAll('text')
      .transition()
      .duration(opts.duration/2)
      .attr({
        opacity: 0.0
      });
  };

  viz.undrawFocus = function() {
    d3.select('.fo-main').classed('exiting', true);
    var wasFocused = circles.filter(function(d) { if (isSpecial(d)) { return d; } });
    // add back pointer cursor
    wasFocused.classed('link', true);
    var oldFocus = viz.focused;
    viz.focused = null;
    updatePathAndText(wasFocused, oldFocus, opts.duration/2);

    viz.update();

    setTimeout(function() {
      d3.select('#thisIsTheForeignObject').remove();
      // can't transition here because multiple transition on same node not allowed
      d3.select('.coffee-circle-focus').remove();

      circles.selectAll('circle')
        .transition()
        .duration(opts.duration/2)
        .attr({
          'opacity': 1.0
        });
      circles.selectAll('text')
        .transition()
        .duration(opts.duration/2)
        .attr({
          'opacity': 1.0
        });
      d3.selectAll('span.nav').classed('hidden', false);
    }, 500);
  };

  return viz;
};
var _ = require('lodash');
var d3 = require('d3');

module.exports = function(opts) {
  opts = opts || {};

  var shape, ranksToPosition, paths, currentRanks = [1,2,3,4,5];
  // initialize shape and ranksToPosition
  updateShape();

  // make a group for each coffee brand
  var circles = opts.selection.selectAll('g')
    .data(opts.data)
    .enter()
    .append('g')
    .attr({
      id: function(d) { return d.brand.replace(' ', '_'); },
      'class': 'coffee-circle-group'
    });

  function updateShape(dimensions) {
    var shapes = new opts.Shapes(), aspectRatio;

    if (!arguments.length) {
      aspectRatio = shapes.w / shapes.h;
    }
    else {
      aspectRatio = dimensions.width/dimensions.height;
    }

    if (dimensions && dimensions.width <= 320) {
      shape = shapes.threeTwoVertical(dimensions);
      ranksToPosition = shape.ranksToPosition;
    }
    else if (dimensions && dimensions.height <= 320) {
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
  }

  var xPosition = function(d) {
    return shape[ranksToPosition[d.rank]].x;
  };

  var yPosition = function(d) {
    return shape[ranksToPosition[d.rank]].y;
  };

  var specialClass = function(d) {
    var specialClass = shape.specialPosition;
    if (shape.ranksToPosition[d.rank] === specialClass) {
      return true;
    }
    return false;
  };

  function getCurrentPositions() {
    return _.map(currentRanks, function(r) {
      return ranksToPosition[r];
    });
  }

  function updateRanksToPosition(currentPositions) {
    _.map(currentRanks, function(r, i) {
      ranksToPosition[r] = currentPositions[i];
    });
  }

  this.cycleBackwards = function() {
    var currentPositions = getCurrentPositions();

    var first = currentRanks[0];
    currentRanks = currentRanks.slice(1,5);
    currentRanks.push(first);

    updateRanksToPosition(currentPositions);

    this.updatePosition(1000);
  };

  this.cycleForwards = function() {
    var currentPositions = getCurrentPositions();

    var last = currentRanks[4];
    currentRanks = currentRanks.slice(0,4);
    currentRanks.unshift(last);

    updateRanksToPosition(currentPositions);

    this.updatePosition(1000);
  };

  this.draw = function() {
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
        r: 0,
        'class': function(d) {
          var special = specialClass(d) ? 'special' : '';
          return 'coffee-circle-ghost ' + special;
        }
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

    return this;
  };

  this.update = function(dimensions) {
    updateShape(dimensions);
    // TODO: query if aspect ratio changed significantly (i.e., requiring redraw)
    // and if not, return early!

    this.updatePosition(0);

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
  };

  this.updatePosition = function(duration) {
    // update position of large and small circles
    circles.selectAll('circle')
      .transition()
      .duration(duration)
      .attr({
        cx: xPosition,
        cy: yPosition
      });

    // update special class for near-to-focus circle
    circles.selectAll('.coffee-circle-ghost')
      .classed('special', specialClass);

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

  return this;
};
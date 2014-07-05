var d3 = require('d3');

module.exports = function(opts) {
  opts = opts || {};

  var shape, ranksToPosition, paths;
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
        'class': 'coffee-circle-ghost'
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

    // update position of large and small circles
    circles.selectAll('circle')
      .attr({
        cx: xPosition,
        cy: yPosition
      });

    // update radius of large circles
    circles.selectAll('.coffee-circle')
      .attr('r', shape.radius);

    // update radius of small circles
    circles.selectAll('.coffee-circle-ghost')
      .attr('r', shape.radius/2);

    // update paths for text in circle
    paths.attr({
      d: function(d) {
        var path = shape.pathGenerator(xPosition(d), yPosition(d));
        return path.m + path.a;
      }
    });

    // update position of coffee brand text
    circles.selectAll('.coffee-brand')
      .attr({
        'font-size': (0.4 * shape.radius),
        startOffset: '33%'
      });

    // update position of coffee rank text
    circles.selectAll('.coffee-rank')
      .attr({
        'font-size': (1.4 * shape.radius),
        x: xPosition,
        y: yPosition
      });
  };

  return this;
};
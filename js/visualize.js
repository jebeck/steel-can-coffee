var d3 = require('d3');

module.exports = function(opts) {
  opts = opts || {};

  var shapes = new opts.Shapes();

  var ranksToPosition = {
    1: 'top',
    2: 'rightMid',
    3: 'rightBottom',
    4: 'leftBottom',
    5: 'leftMid'
  };

  var shape = shapes.pentagon();

  var xPosition = function(d) {
    return shape[ranksToPosition[d.rank]].x;
  };

  var yPosition = function(d) {
    return shape[ranksToPosition[d.rank]].y;
  };

  var circles = opts.selection.selectAll('g')
    .data(opts.data)
    .enter()
    .append('g')
    .attr({
      id: function(d) { return d.brand.replace(' ', '_'); },
      'class': 'coffee-circle-group'
    });

  d3.select('defs')
    .selectAll('path')
    .data(opts.data)
    .enter()
    .append('path')
    .attr({
      d: function(d) {
        var path = shapes.pathGenerator(xPosition(d), yPosition(d));
        return path.m + path.a;
      },
      id: function(d) { return d.brand.replace(' ', '_') + 'Path'; }
    });

  circles.append('circle')
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: 0,
      'class': 'coffee-circle'
    });

  circles.append('circle')
    .attr({
      cx: xPosition,
      cy: yPosition,
      r: 0,
      'class': 'coffee-circle-ghost'
    });

  circles.selectAll('.coffee-circle')
    .transition()
    .duration(750)
    .attr({
      r: shape.radius,
      'stroke-width': (shape.radius / 20)
    });

  circles.selectAll('.coffee-circle-ghost')
    .transition()
    .duration(750)
    .attr({
      r: shape.radius/2
    });

  circles.append('text')
    .append('textPath')
    .attr({
      'font-size': (0.4 * shape.radius),
      startOffset: '33%',
      'xlink:href': function(d) { return '#' + d.brand.replace(' ', '_') + 'Path'; },
      'class': 'coffee-brand',
    })
    .text(function(d) { return d.brand; });

  circles.append('text')
    .attr({
      'font-size': (1.4 * shape.radius),
      x: xPosition,
      y: yPosition,
      'class': 'coffee-rank'
    })
    .text(function(d) { return d.rank; });

};
var d3 = require('d3');

module.exports = function() {
  var parent = document.getElementById('main');

  // set up SVG dimensions according to standard D3 margin convention
  var w = parent.offsetWidth;
  var h = parent.offsetHeight;
  var margin = {
    top: 10,
    bottom: 10,
    left: 10,
    right: 10
  };
  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;
  dimensions = {width: width, height: height};

  // append the main SVG element and group
  var svg = d3.select('#main')
    .append('svg')
    .attr({
      width: w,
      height: h
    })
    .append('g')
    .attr({
      id: 'mainGroup',
      transform: 'translate(' + margin.left + ',' + margin.top + ')'
    });

  // set up a defs group for adding to later
  d3.select('svg')
    .insert('defs', '#mainGroup');

  // create a closure that will yield coordinates for circles
  // pentagon when viewport is big enough
  // otherwise horizontal or vertical line depending on aspect ratio
  var Shapes = function() {
    this.w = dimensions.width;
    this.h = dimensions.height;

    this.pathGeneratorFn = function(radius) {
      return function(x, y) {
        return {
          m: 'M' + (x - radius) + ',' + (y) + ' ',
          a: 'a' + (radius) + ',' + (radius) + ' 0 1,0 ' + (radius) + ',' + (-radius)
        };
      };
    };

    this.pentagon = function() {
      var bigR = (0.95 * this.h)/2.9;
      var littleR = (0.95 * bigR)/2;
      var textR = 0.95 * littleR;

      return {
        top: {
          x: (this.w/2),
          y: this.h - (bigR + (this.h/2))
        },
        leftMid: {
          x: -(Math.sin((2*Math.PI)/5) * bigR) + (this.w/2),
          y: this.h - ((Math.cos((2*Math.PI)/5) * bigR) + (this.h/2))
        },
        rightMid: {
          x: (Math.sin((2*Math.PI)/5) * bigR) + (this.w/2),
          y: this.h - ((Math.cos((2*Math.PI)/5) * bigR) + (this.h/2))
        },
        leftBottom: {
          x: -(Math.sin((4*Math.PI)/5) * bigR) + (this.w/2),
          y: this.h - (-(Math.cos(Math.PI/5) * bigR) + (this.h/2))
        },
        rightBottom: {
          x: (Math.sin((4*Math.PI)/5) * bigR) + (this.w/2),
          y: this.h - (-(Math.cos(Math.PI/5) * bigR) + (this.h/2))
        },
        radius: littleR,
        pathGenerator: this.pathGeneratorFn(textR)
      };
    };

    this.vertical = function() {
      return {
        top: {
          x: this.w/2,
          y: this.h/10
        },
        midTop: {
          x: this.w/2,
          y: 3 * this.h/10
        },
        mid: {
          x: this.w/2,
          y: this.h/2
        },
        midBottom: {
          x: this.w/2,
          y: 7 * this.h/10
        },
        bottom: {
          x: this.w/2,
          y: 9 * this.h/10
        },
        radius: 0.45 * this.h/5,
        pathGenerator: this.pathGeneratorFn(0.95 * (0.45 * this.h/5))
      };
    };

    return this;
  };

  return {svg: svg, dimensions: dimensions, margin: margin, Shapes: Shapes};
};
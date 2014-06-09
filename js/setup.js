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

  // append the main SVG element and group
  var svg = d3.select('#main')
    .append('svg')
    .attr({
      width: w,
      height: h,
      preserveAspectRatio: 'xMidYMid meet',
      viewBox: '0 0 ' + w + ' ' + h
    })
    .append('g')
    .attr({
      id: 'mainGroup',
      transform: 'translate(' + margin.left + ',' + margin.top + ')'
    });

  // set up a defs group for adding to later
  d3.select('svg')
    .insert('defs', '#mainGroup');

  // set up the handler for window resize events to resize the SVG responsively
  window.onresize = function() {
    d3.select('#main').select('svg')
      .attr({
        width: parent.offsetWidth,
        height: parent.offsetHeight
      });
  };

  // append a rect for testing the SVG responsiveness
  // TODO: remove or comment out later
  svg.append('rect')
    .attr({
      width: width,
      height: height,
      'class': 'background-light'
    });

  // create a closure that will yield coordinates for circles
  // pentagon when viewport is big enough
  // otherwise horizontal or vertical line depending on aspect ratio
  var Shapes = function() {
    this.w = parent.offsetWidth - margin.left - margin.right;
    this.h = parent.offsetHeight - margin.top - margin.bottom;

    var bigR = (0.95 * this.h)/2.9;
    var littleR = (0.95 * bigR)/2;
    var textR = 0.95 * littleR;

    this.pathGenerator = function(x, y) {
      return {
        m: 'M' + (x - textR) + ',' + (y) + ' ',
        a: 'a' + (textR) + ',' + (textR) + ' 0 1,0 ' + (textR) + ',' + (-textR)
      };
    };

    this.pentagon = function() {
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
        radius: littleR
      };
    };

    return this;
  };

  return {svg: svg, Shapes: Shapes};
};
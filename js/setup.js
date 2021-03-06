var d3 = require('d3');

module.exports = function() {
  var parent = document.getElementById('main');

  // set up SVG dimensions according to standard D3 margin convention
  var w = parent.offsetWidth;
  var h = parent.offsetHeight;
  var commonMargin = 10;
  var margin = {
    top: commonMargin,
    bottom: commonMargin,
    left: commonMargin,
    right: commonMargin
  };
  var width = w - margin.left - margin.right;
  var height = h - margin.top - margin.bottom;
  var dimensions = {w: w, h: h, width: width, height: height};

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
    var that = this;

    this.pathGeneratorFn = function(radius) {
      return function(x, y) {
        return {
          m: 'M' + (x - radius) + ',' + (y) + ' ',
          a: 'a' + (radius) + ',' + (radius) + ' 0 0 0 ' + (2*radius) + ',0' 
        };
      };
    };

    this.pentagon = function() {
      var bigR = (0.95 * this.h)/2.9;
      var littleR = (0.95 * bigR)/2;
      var textR = 0.95 * littleR;
      var margin = commonMargin;

      return {
        top: {
          x: (this.w/2),
          y: this.h - (bigR + (this.h/2)),
          focused: {
            x: this.w/4,
            y: this.h/2
          }
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
        ranksToPosition: {
          5: 'top',
          4: 'rightMid',
          3: 'rightBottom',
          2: 'leftBottom',
          1: 'leftMid'
        },
        pathGenerator: this.pathGeneratorFn(textR),
        specialPosition: 'top',
        foreignObject: {
          width: this.w/2,
          height: this.h,
          x: this.w/2 - littleR/2,
          y: function(realHeight) { return that.h/2 + commonMargin - realHeight/2; }
        }
      };
    };

    this.vertical = function() {
      return {
        side: {
          x: this.w/4,
          y: this.h/2,
          focused: {
            x: this.w/2,
            y: this.h/5
          }
        },
        bottom: {
          x: 3 * this.w/4,
          y: 7 * this.h/8
        },
        midBottom: {
          x: 3 * this.w/4,
          y: 5 * this.h/8
        },
        midTop: {
          x: 3 * this.w/4,
          y: 3 * this.h/8
        },
        top: {
          x: 3 * this.w/4,
          y: this.h/8
        },
        radius: 0.55 * this.h/5,
        ranksToPosition: {
          5: 'side',
          4: 'top',
          3: 'midTop',
          2: 'midBottom',
          1: 'bottom'
        },
        pathGenerator: this.pathGeneratorFn(0.95 * (0.55 * this.h/5)),
        specialPosition: 'side',
        foreignObject: {
          width: 0.9 * this.w,
          height: this.h - 2 * this.h/5,
          x: 0.05 * this.w,
          y: function(realHeight) {
            if (realHeight > that.h/2) {
              return that.h/5 * 2 + commonMargin;
            }
            else {
              return that.h/2;
            }
          }
        }
      };
    };

    this.threeTwoVertical = function(dimensions) {
      var margin = commonMargin;
      var r = (this.w - 2 * margin)/4.25;
      return {
        top: {
          x: r + margin,
          y: r + margin,
          focused: {
            x: this.w/2,
            y: this.h/2
          }
        },
        topLeft: {
          x: this.w - margin - r,
          y: ((this.h/2 - (r + margin))/2) + r + margin
        },
        rightMid: {
          x: r + margin,
          y: this.h/2
        },
        bottomLeft: {
          x: this.w - margin - r,
          y: (((this.h - margin - r) - (this.h/2))/2) + this.h/2
        },
        bottom: {
          x: r + margin,
          y: this.h - margin - r
        },
        radius: r,
        ranksToPosition: {
          5: 'top',
          4: 'topLeft',
          3: 'rightMid',
          2: 'bottomLeft',
          1: 'bottom'
        },
        pathGenerator: this.pathGeneratorFn(0.95 * r),
        specialPosition: 'top'
      };
    };

    this.threeTwoHorizontal = function(dimensions) {
      var margin = commonMargin;
      var r = (this.h - 2* margin)/4;
      return {
        topLeft: {
          x: margin + r,
          y: margin + r,
          focused: {
            x: this.w/2,
            y: this.h/2
          }
        },
        bottomLeft: {
          x: this.w/2 - (((this.w/2) - (margin + r))/2),
          y: this.h - margin - r
        },
        topMid: {
          x: this.w/2,
          y: margin + r
        },
        bottomRight: {
          x: this.w/2 + (((this.w - margin - r) - (this.w/2))/2),
          y: this.h - margin - r
        },
        topRight: {
          x: this.w - margin - r,
          y: margin + r
        },
        radius: r,
        ranksToPosition: {
          5: 'topLeft',
          4: 'bottomLeft',
          3: 'topMid',
          2: 'bottomRight',
          1: 'topRight'
        },
        pathGenerator: this.pathGeneratorFn(0.95 * r),
        specialPosition: 'topLeft'
      };
    };

    return this;
  };

  return {svg: svg, dimensions: dimensions, margin: margin, Shapes: Shapes};
};
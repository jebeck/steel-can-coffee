var d3 = require('d3');
var coffee = require('./index');

(function() {
  var result = coffee.setup();

  d3.json('data.json', function(data) {
    coffee.visualize({
      data: data,
      selection: result.svg,
      Shapes: result.Shapes
    });
  });
})();
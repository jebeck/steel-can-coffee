var _ = require('lodash');
var d3 = require('d3');

module.exports = function(opts) {
  opts = opts || {};
  var shape = opts.shape;
  var fo = shape.foreignObject;

  var facts = ['aromas', 'flavors', 'quotation'];
  var factIcons = {
    aromas: 'icon-pencil',
    flavors: 'icon-flavor', 
    quotation: 'icon-quote'
  };
  var foId = 'thisIsTheForeignObject';

  function addFact(key, val, fact) {
    fact.append('h2')
      .html(function() {
        if (key === 'quotation') {
          return '<i class="' + factIcons[key] + '"></i> comments';
        }
        return'<i class="' + factIcons[key] + '"></i> ' + key;
      });

    // handle arrays of aromas and flavors differently
    if (typeof val === 'object') {
      var list = fact.append('p')
        .append('ul')
        .selectAll('li')
        .data(val)
        .enter()
        .append('li')
        .append('span')
        .html(function(d) { return '#' + d; });
    }
    else {
      fact.append('p')
        .attr('class', 'quotation')
        .html(val);
    }
  } 

  var main = opts.selection.append('g')
    .attr({
      id: 'foreignObjectGroup'
    })
    .append('foreignObject')
    .attr({
      id: foId,
      width: fo.width,
      height: fo.height,
      x: fo.x,
      y: fo.y(fo.height)
    })
    .append('xhtml:div')
    .attr('class', 'fo-main');

  main.append('span')
    .attr('class', 'close')
    .on('click', opts.handleClose)
    .html('<i class="icon-close"></i>');

  var flex = main.append('div').attr('class', 'flex-facts');

  // add an <h2> and <p> for each fact
  _.each(facts, function(fact) {
    var thisFact = opts.d[fact], factSel;
    if (typeof thisFact === 'object') {
      factSel = flex.append('div').attr('class', 'fact');
    }
    else {
      factSel = main.append('div').attr('class', 'fact');
    }
    addFact(fact, thisFact, factSel);
  });

  // find the height of the resulting div to determine y-placement of foreignObject
  var height = main[0][0].getBoundingClientRect().height;
  opts.selection.select('#' + foId).attr('y', fo.y(height));
};
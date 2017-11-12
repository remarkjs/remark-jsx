'use strict';
var React = require('react');
var text = require('./text');

module.exports = raw;

/* Stringify `raw`. */
function raw(ctx, node) {
  return ctx.dangerous ?
    React.createElement('span', {
      dangerouslySetInnerHTML: {__html: node.value}
    }) : text(ctx, node);
}

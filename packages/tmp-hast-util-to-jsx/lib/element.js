'use strict';
var React = require('react');
var all = require('./all');

module.exports = element;
var own = {}.hasOwnProperty;

/* Stringify an element `node`. */
function element(ctx, node) {
  var name = node.tagName;
  var content = all(ctx, name === 'template' ? node.content : node);
  var component = own.call(ctx.componentMap, name)? ctx.componentMap[name]: name;

  return React.createElement.apply(null, [component, node.properties].concat(content));
}

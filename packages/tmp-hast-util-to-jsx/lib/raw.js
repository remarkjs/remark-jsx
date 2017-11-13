'use strict';
var React = require('react');
var text = require('./text');
var one = require('./one');
var raw2hast = require('hast-util-raw');

module.exports = raw;

/* Stringify `raw`. */
function raw(ctx, node) {
  return ctx.dangerous ? one(ctx, raw2hast(node)) : text(ctx, node);
}

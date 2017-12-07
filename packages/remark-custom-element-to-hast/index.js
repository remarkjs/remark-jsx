'use strict';

var extend = require("xtend");
var map = require('unist-util-map');
var toHAST = require('mdast-util-to-hast');
var removePosition = require('unist-util-remove-position');
var customElementParser = require('./custom-element-parser');

module.exports = plugin;

function plugin(options) {
  var settings = options || {};
  var componentWhitelist = settings.componentWhitelist || [];
  var proto = this.Parser.prototype;

  proto.blockTokenizers.customElement = customElementParser(componentWhitelist);
  proto.blockMethods.splice(proto.blockMethods.indexOf('html'), 0, 'customElement');

  this.Compiler = function (node, file) {
    var hast = toHAST(node, {allowDangerousHTML: false});
    var result = map(hast, function (node) {
      if (node.children) {
        node.children = node.children.reduce(function (acc, n) {
          if (n.type === 'text' && n.children) {
            Array.prototype.push.apply(acc, n.children);
          } else {
            acc.push(n);
          }
          return acc;
        }, []);
      }
      return node;
    });
    removePosition(result, true);

    return result;
  }
}

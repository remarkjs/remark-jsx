'use strict';

var extend = require("xtend");
var map = require('unist-util-map');
var raw2hast = require('hast-util-raw');
var toHAST = require('mdast-util-to-hast');
var removePosition = require('unist-util-remove-position');
var customElementParser = require('./custom-element-parser');

module.exports = plugin;

function plugin(options) {
  var settings = options || {};
  var componentWhitelist = settings.componentWhitelist || [];
  var componentWhitelistLowercases = componentWhitelist.reduce((acc, name) => {
    acc[name.toLowerCase()] = name;
    return acc;
  }, {})
  var proto = this.Parser.prototype;

  proto.blockTokenizers.customElement = customElementParser(componentWhitelist);
  proto.blockMethods.splice(proto.blockMethods.indexOf('html'), 0, 'customElement');

  this.Compiler = function (node, file) {
    var hast = toHAST(node, {allowDangerousHTML: true});
    var result = map(hast, function (node) {
      if (node.type === 'raw') {
        return map(raw2hast(node), function (node) {
          if (node.type === 'element' && node.tagName in componentWhitelistLowercases) {
            return extend(node, {
              tagName: componentWhitelistLowercases[node.tagName]
            });
          }
          return node;
        });
      }
      return node;
    });
    removePosition(result, true);

    return result;
  }
}

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

  var customElement = customElementParser(componentWhitelist);
  customElement.locator = function locate(value, fromIndex) {
    return value.indexOf('<', fromIndex);
  };

  proto.blockTokenizers.customElement = customElement;
  proto.blockMethods.splice(proto.blockMethods.indexOf('html'), 0, 'customElement');

  proto.inlineTokenizers.customElement = customElement;
  proto.inlineMethods.splice(proto.inlineMethods.indexOf('html'), 0, 'customElement');

  this.Compiler = function (node, file) {
    var hast = toHAST(node, {
      allowDangerousHTML: false
    });

    function process() {
      var args = [].concat.apply([], arguments);
      return args.reduce(map, hast);
    }

    var result = process(function flattenFalseTextNodes(node) {
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
    }, function transformInnerMarkdownIntoHAST(node) {
      if (node.unprocessed) {
        return toHAST(node, {
          allowDangerousHTML: false
        });
      }
      return node;
    }, function mergeSuccessiveTextFieldsIntoASingleOne(node) {
      if (node.children) {
        node.children = node.children.reduce(function (acc, n) {
          var children = acc.children;
          var prev = acc.prev;
          if (n.type === 'text') {
            if (prev) {
              prev.value += n.value;
            } else {
              prev = n;
              children.push(n);
            }
          } else {
            prev = null;
            children.push(n);
          }
          return {
            prev: prev,
            children: children
          }
        }, {
          prev: null,
          children: []
        }).children;
      }
      return node;
    }, function removeUnnecessaryFields(node) {
      delete node.position;
      delete node.innerStartsAt;
      delete node.innerEndsAt;
      delete node.startsAt;
      delete node.endsAt;
      return node;
    });

    return result;
  }
}

'use strict';

var toHAST = require('mdast-util-to-hast');
var map = require('unist-util-map');
var customElementParser = require('./custom-element-parser');

module.exports = plugin;

function plugin(options) {
  var settings = options || {};
  var componentWhitelist = settings.componentWhitelist || [];
  var proto = this.Parser.prototype;

  var customElement = customElementParser(componentWhitelist);
  customElement.locator = function (value, fromIndex) {
    return value.indexOf('<', fromIndex);
  };

  proto.blockTokenizers.customElement = customElement;
  proto.blockMethods.splice(proto.blockMethods.indexOf('html'), 0, 'customElement');

  proto.inlineTokenizers.customElement = customElement;
  proto.inlineMethods.splice(proto.inlineMethods.indexOf('html'), 0, 'customElement');

  function pipeTransformers() {
    var transformers = [].concat.apply([], arguments);
    return function (node) {
      return transformers.reduce(map, node);
    };
  }

  this.Compiler = function (node) {
    var transform = pipeTransformers(
      /* Initial tranform to HAST */
      function (node) {
        return toHAST(node, {
          allowDangerousHTML: false
        });
      },
      /* Flatten false text nodes */
      function (node) {
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
      },
      /* Transform unprocessed inner MDAST node into HAST */
      function (node) {
        if (node.unprocessed) {
          return toHAST(node, {
            allowDangerousHTML: false
          });
        }
        return node;
      },
      /* Merge successive text nodes into a single one */
      function (node) {
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
            };
          }, {
            prev: null,
            children: []
          }).children;
        }
        return node;
      },
      /* Remove unnecessary fields */
      function (node) {
        delete node.position;
        delete node.innerStartsAt;
        delete node.innerEndsAt;
        delete node.startsAt;
        delete node.endsAt;
        return node;
      });

    var result = transform(node);

    return result;
  };
}

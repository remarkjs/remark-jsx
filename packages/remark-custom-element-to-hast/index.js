'use strict';

var toHAST = require('mdast-util-to-hast');
var nodeMap = require('unist-util-map');
var customElementParser = require('./custom-element-parser');

module.exports = plugin;

function plugin(options) {
  var settings = options || {};
  var babel = settings.babel;
  var componentWhitelist = settings.componentWhitelist || [];
  var proto = this.Parser.prototype;
  proto.options.blocks = []; // Let's ignore this

  proto.blockTokenizers.customElement = customElementParser(componentWhitelist, true);
  proto.blockMethods.splice(proto.blockMethods.indexOf('html'), 1, 'customElement');

  proto.inlineTokenizers.customElement = customElementParser(componentWhitelist, false);
  proto.inlineMethods.splice(proto.inlineMethods.indexOf('html'), 1, 'customElement');

  function pipeTransformers() {
    var transformers = [].concat.apply([], arguments);
    return function (node) {
      return transformers.reduce(nodeMap, node);
    };
  }

  this.Compiler = function (node) {
    var transform = pipeTransformers(
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
          var result = toHAST(node, {
            allowDangerousHTML: false
          });
          node.children = null;
          return result;
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
      /* Remove unnecessary whitespace text */
      function (node) {
        if (node.children) {
          node.children = node.children.filter(function (n) {
            return !(n.type === 'text' && n.value === '\n');
          });
        }
        return node;
      },
      /* Compile js attributes */
      function (node) {
        if (babel && node.type === 'element') {
          Object.keys(node.properties).forEach(function (key) {
            if (key.indexOf('js:') === 0) {
              var code = node.properties[key];
              node.properties[key] = babel.transform('(' + code + ')', { presets:['react'] }).code;
            }
          });
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

    /* Initial tranform to HAST */
    var hast = toHAST(node, {
      allowDangerousHTML: false
    });
    /* Chain transformers */
    var result = transform(hast);

    return result;
  };
}

'use strict';

var smartHtmlParser = require('./smart-html-parser');

module.exports = blockCustomElementFactory;

function blockCustomElementFactory(componentWhitelist) {
  var parseHtml = smartHtmlParser(componentWhitelist);

  var running = false;

  return function blockCustomElement(eat, value, silent) {
    if (running) return;
    var self = this;
    var blocks = self.options.blocks;
    var length = value.length;

    try {
      running = true;
      var dump = {
        type: "raw",
        children: []
      };
      var tree = parseHtml(value, function (rawToken) {
        var substringToEat = value.substring(0, rawToken.endsAt);
        var substringToParse = value.substring(rawToken.startsAt, rawToken.endsAt);
        var now = eat.now();
        var parsed = eat(substringToEat).reset({
          type: 'p',
          value: self.tokenizeInline(substringToParse, now)
        }, dump);
        parsed.value.forEach(function (node) {
          node.unprocessed = true;
          node.startsAt = rawToken.startsAt;
          node.endsAt = rawToken.endsAt;
        });
        return parsed.value;
      });
      if (tree.children.length === 0 || tree.children[0].type !== 'element') {
        return;
      }

      var nodes = tree.children.reduce(function (acc, n) {
        var stop = acc.stop;
        var nodes = acc.nodes;
        if (!stop) {
          if (!(n.type === 'element' || (n.type === 'text' && (n.value === ' ' || n.value === '\n')))) {
            return {
              nodes: nodes, 
              stop: true
            };
          }
          nodes.push(n);
        }
        return {
          nodes: nodes,
          stop: stop
        };
      }, {
        nodes: [],
        stop: false
      }).nodes;

      return eat(value.substring(0, nodes[nodes.length - 1].endsAt))({
        type: 'p',
        value: {
          type: 'root',
          children: nodes
        }
      });
    } finally {
      running = false;
    }
  };
}

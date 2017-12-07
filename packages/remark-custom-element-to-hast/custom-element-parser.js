'use strict';

var smartHtmlParser = require('./smart-html-parser');

module.exports = blockCustomElementFactory;

function blockCustomElementFactory(componentWhitelist) {
  var parseHtml = smartHtmlParser(componentWhitelist);

  return function blockCustomElement(eat, value, silent) {
    var self = this;
    var blocks = self.options.blocks;
    var length = value.length;

    var tree = parseHtml(value);
    if (tree.children.length === 0 || (tree.children.length === 1 && tree.children[0].type === 'raw')) return;

    if (tree.children[0].type === 'raw') {
      var firstPart = value.slice(0, tree.children[0].endsAt);
      var now = eat.now();
      var parsed = eat(firstPart)({
        type: 'p',
        value: self.tokenizeInline(firstPart, now)
      });
      return parsed.value;
    }

    return eat(value)({
      type: 'p',
      value: tree
    });
  };
}

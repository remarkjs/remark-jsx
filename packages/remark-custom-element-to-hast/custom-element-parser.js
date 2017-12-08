'use strict';

var smartHtmlParser = require('./smart-html-parser');

module.exports = blockCustomElementFactory;

function blockCustomElementFactory(componentWhitelist) {
  var parseHtml = smartHtmlParser(componentWhitelist);

  return function blockCustomElement(eat, value, silent) {
    var self = this;
    var blocks = self.options.blocks;
    var length = value.length;

    var lastRawItemIndex = 0;
    var dump = {type: "raw", children: []};
    var tree = parseHtml(value, function (rawToken) {
      var substringToEat = value.substring(lastRawItemIndex, rawToken.endsAt);
      var substringToParse = value.substring(rawToken.startsAt, rawToken.endsAt);
      var now = eat.now();
      var parsed = eat(substringToEat)({
        type: 'p',
        value: self.tokenizeInline(substringToParse, now)
      }, dump);
      lastRawItemIndex = rawToken.endsAt;
      parsed.value.forEach(function (node) {
        node.unprocessed = true;
      });
      return parsed.value;
    });
    if (tree.children.length === 0) return;

    return eat(value.substring(lastRawItemIndex, value.length))({
      type: 'p',
      value: tree
    });
  };
}

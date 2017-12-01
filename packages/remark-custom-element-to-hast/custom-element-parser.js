'use strict';

var attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
var unquoted = '[^"\'=<>`\\u0000-\\u0020]+';
var singleQuoted = '\'[^\']*\'';
var doubleQuoted = '"[^"]*"';
var attributeValue = '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')';
var attribute = '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';

var raw2hast = require('hast-util-raw');

module.exports = blockCustomElementFactory;

function blockCustomElementFactory(componentWhitelist) {
  var components = componentWhitelist.join('|');
  var openTag = '<(' + components + ')' + attribute + '*\\s*>';
  var closeTag = '<\\/\\1\\s*>';
  var autoCloseTag = new RegExp('<(' + components + ')' + attribute + '*\\s*\\/>');
  var simpleTag = new RegExp(openTag + '(.*)' + closeTag);
  function matchSimpleTag(value) {
    var match = value.match(simpleTag);
    if (match) {
      return {
        value: match[0],
        name: match[1],
        children: match[2],
        startsAt: match.index,
        endsAt: match[0].length + match.index
      };
    }
    return null;
  }
  function matchAutoCloseTag(value) {
    var match = value.match(autoCloseTag);
    if (match) {
      return {
        value: match[0],
        name: match[1],
        children: null,
        startsAt: match.index,
        endsAt: match[0].length + match.index
      };
    }
    return null;
  }
  function matchTag(value) {
    return matchSimpleTag(value) || matchAutoCloseTag(value);
  }

  return function blockCustomElement(eat, value, silent) {
    var self = this;
    var blocks = self.options.blocks;
    var length = value.length;
    var index = 0;
    var next;
    var line;
    var offset;
    var character;
    var count;
    var sequence;
    var subvalue;

    var match = matchTag(value);
    if (!match) return;

    if (match.startsAt) {
      var firstPart = value.slice(0, match.startsAt);
      var now = eat.now();
      var parsed = eat(firstPart)({
        type: 'p',
        value: this.tokenizeInline(firstPart, now)
      });
      return parsed.value;
    }

    return eat(match.value)({
      type: 'html',
      value: match.value
    });
  };
}

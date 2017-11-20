'use strict';

var attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
var unquoted = '[^"\'=<>`\\u0000-\\u0020]+';
var singleQuoted = '\'[^\']*\'';
var doubleQuoted = '"[^"]*"';
var attributeValue = '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')';
var attribute = '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';

module.exports = blockCustomElementFactory;

var C_TAB = '\t';
var C_SPACE = ' ';
var C_NEWLINE = '\n';
var C_LT = '<';

function blockCustomElementFactory(componentWhitelist) {
  var components = componentWhitelist.join('|');

  var openTag = '<(' + components + ')' + attribute + '*\\s*>';
  var autoCloseTag = '<(' + components + ')' + attribute + '*\\s*\\/>';
  var closeTag = '<\\/(' + components + ')\\s*>';

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

    var sequences = [
      [new RegExp('^' + openTag), new RegExp(closeTag + '$'), false],
      [new RegExp('^' + autoCloseTag + '$'), /^$/, false]
    ];

    /* Eat initial spacing. */
    while (index < length) {
      character = value.charAt(index);

      if (character !== C_TAB && character !== C_SPACE) {
        break;
      }

      index++;
    }

    if (value.charAt(index) !== C_LT) {
      return;
    }

    next = value.indexOf(C_NEWLINE, index + 1);
    next = next === -1 ? length : next;
    line = value.slice(index, next);
    offset = -1;
    count = sequences.length;

    while (++offset < count) {
      if (sequences[offset][0].test(line)) {
        sequence = sequences[offset];
        break;
      }
    }

    if (!sequence) {
      return;
    }

    if (silent) {
      return sequence[2];
    }

    index = next;

    if (!sequence[1].test(line)) {
      while (index < length) {
        next = value.indexOf(C_NEWLINE, index + 1);
        next = next === -1 ? length : next;
        line = value.slice(index + 1, next);

        if (sequence[1].test(line)) {
          if (line) {
            index = next;
          }

          break;
        }

        index = next;
      }
    }

    subvalue = value.slice(0, index);

    return eat(subvalue)({
      type: 'html',
      value: subvalue
    });
  };
}

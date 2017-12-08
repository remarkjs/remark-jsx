'use strict';

function getAllMatches(regexp, value) {
  var r = new RegExp(regexp, 'g');
  var matches = [];
  var singleMatch;
  while (singleMatch = r.exec(value)) {
    matches.push(singleMatch);
  }
  return matches;
}

function partialTokenizer(subParser, valueDesc) {
  var matches = subParser(valueDesc);
  var rawFragments = matches.reduce(function (acc, current) {
    var fragments = acc.fragments;
    var lastEndsAt = acc.lastEndsAt;
    if (current.startsAt !== lastEndsAt) {
      fragments.push({
        type: 'raw',
        value: valueDesc.value.substring(lastEndsAt - valueDesc.startsAt, current.startsAt - valueDesc.startsAt),
        startsAt: lastEndsAt,
        endsAt: current.startsAt
      });
    }
    return {
      fragments: fragments,
      lastEndsAt: current.endsAt
    };
  }, {
    fragments: [],
    lastEndsAt: valueDesc.startsAt
  });
  if (rawFragments.lastEndsAt !== valueDesc.endsAt) {
    rawFragments.fragments.push({
      type: 'raw',
      value: valueDesc.value.substring(rawFragments.lastEndsAt - valueDesc.startsAt),
      startsAt: rawFragments.lastEndsAt,
      endsAt: valueDesc.endsAt
    });
  }
  Array.prototype.push.apply(matches, rawFragments.fragments);
  matches.sort(function (a, b) {
    return a.startsAt > b.startsAt;
  });
  return matches;
}

function pipeTokenizers(tokenizers, value) {
  function applyNext(tokens, next) {
    return Array.prototype.concat.apply([], tokens.map(function (t) {
      return t.type === 'raw' ? next(t) : t;
    }));
  }
  return tokenizers.reduce(applyNext, [{
    type: 'raw',
    value: value,
    startsAt: 0,
    endsAt: value.length
  }]);
}

var attributeName = '[a-zA-Z_:][a-zA-Z0-9:._-]*';
var unquoted = '([^"\'=<>`\\u0000-\\u0020]+)';
var singleQuoted = '\'([^\']*)\'';
var doubleQuoted = '"([^"]*)"';
var attributeValue = '(?:' + unquoted + '|' + singleQuoted + '|' + doubleQuoted + ')';
var attribute = '(?:\\s+' + attributeName + '(?:\\s*=\\s*' + attributeValue + ')?)';

function smartHtmlParser(componentWhitelist) {
  var components = componentWhitelist.join('|');

  function parseOpeningTags(isAutoClosing, valueDesc) {
    return partialTokenizer(function (valueDesc) {
      var regexp = '<(' + components + ')(' + attribute + '*)\\s*' + (isAutoClosing ? '/>' : '>');
      var propertiesRegex = '(' + attributeName + ')\\s*=\\s*' + attributeValue + '?';
      var matches = getAllMatches(regexp, valueDesc.value).map(function (match) {
        return {
          value: match[0],
          type: isAutoClosing ? 'autoCloseTag' : 'openTag',
          tagName: match[1],
          startsAt: match.index + valueDesc.startsAt,
          endsAt: valueDesc.startsAt + match.index + match[0].length,
          properties: getAllMatches(propertiesRegex, match[2]).reduce(function (props, m) {
            props[m[1]] = m[2] || m[3] || m[4];
            return props;
          }, {})
        };
      });
      return matches;
    }, valueDesc);
  };

  function parseClosingTags(valueDesc) {
    return partialTokenizer(function (valueDesc) {
      var regexp = '</(' + components + ')\\s*>';
      var matches = getAllMatches(regexp, valueDesc.value).map(function (match) {
        return {
          value: match[0],
          type: 'closingTag',
          tagName: match[1],
          startsAt: match.index + valueDesc.startsAt,
          endsAt: valueDesc.startsAt + match.index + match[0].length
        };
      });
      return matches;
    }, valueDesc);
  };

  function parse(value, rawTransformer) {
    var tokens = pipeTokenizers([
      parseClosingTags,
      function (v) {
        return parseOpeningTags(true, v);
      },
      function (v) {
        return parseOpeningTags(false, v);
      },
    ], value);

    var tree = tokens.reduce(function (stack, t) {
      switch (t.type) {
        case 'closingTag':
          {
            var head = stack.pop();
            if (head.tagName !== t.tagName) {
              throw new Error();
            }
            head.endsAt = t.endsAt;
            head.innerEndsAt = t.startsAt;
            break;
          }
        case 'openTag':
          {
            var element = {
              type: 'element',
              tagName: t.tagName,
              properties: t.properties,
              children: [],
              startsAt: t.starts,
              innerStartsAt: t.endsAt,
            };
            stack[stack.length - 1].children.push(element);
            stack.push(element);
            break;
          }
        case 'autoCloseTag':
          {
            var element = {
              type: 'element',
              tagName: t.tagName,
              properties: t.properties,
              children: [],
              startsAt: t.starts,
              endsAt: t.endsAt
            };
            stack[stack.length - 1].children.push(element);
            break;
          }
        default:
          {
            var element = rawTransformer ? rawTransformer(t) : {
              type: 'text',
              value: t.value,
              startsAt: t.startsAt,
              endsAt: t.endsAt
            };
            Array.prototype.push.apply(stack[stack.length - 1].children, element);
            break;
          }
      }
      return stack;
    }, [{
      type: 'root',
      children: []
    }])[0];
    return tree;
  }
  return parse;
}

module.exports = smartHtmlParser;

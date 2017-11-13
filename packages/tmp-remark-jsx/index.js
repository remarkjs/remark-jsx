'use strict';

var xtend = require('xtend');
var toHAST = require('mdast-util-to-hast');
var toJsx = require('tmp-hast-util-to-jsx');
var sanitize = require('hast-util-sanitize');
var reactElementParser = require('./react-element-parser');

module.exports = plugin;

function plugin(options) {
  var settings = options || {};
  var clean = settings.sanitize;
  var schema = clean && typeof clean === 'object' ? clean : null;
  var handlers = settings.handlers || {};
  var componentMap = settings.componentMap || {};

  this.Compiler = compiler;
  var blockTokenizers = this.Parser.prototype.blockTokenizers;
  var blockMethods = this.Parser.prototype.blockMethods;
  blockTokenizers.react = reactElementParser(componentMap);
  blockMethods.splice(blockMethods.indexOf('html'), 0, 'react')

  function compiler(node, file) {
    var root = node && node.type && node.type === 'root';
    var hast = toHAST(node, {allowDangerousHTML: !clean, handlers: handlers});
    var result;

    if (file.extname) {
      file.extname = '.jsx';
    }

    if (clean) {
      hast = sanitize(hast, schema);
    }

    result = toJsx(hast, xtend(settings, {
      allowDangerousHTML: !clean,
      componentMap: componentMap
    }));

    return result;
  }
}

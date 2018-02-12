'use strict';

var fs = require('fs');
var path = require('path');
var test = require('tape');
var hidden = require('is-hidden');
var unified = require('unified');
var parseMD = require('remark-parse');
var customElementCompiler = require('../');

var FIXTURE_ROOT = path.join(__dirname, 'fixtures');
var fixtures = fs.readdirSync(FIXTURE_ROOT).filter(function (dir) {
  return !hidden(dir);
});

function readFile(filepath, filename) {
  return fs.readFileSync(path.join(filepath, filename), 'utf-8');
}

function writeToFile(filepath, filename, content) {
  return fs.writeFileSync(path.join(filepath, filename), content, 'utf-8');
}

function toJson(object) {
  return JSON.stringify(object, null, 2) + '\n';
}

/* Assert fixtures. */
fixtures.forEach(function (fixture) {
  var filepath = path.join(FIXTURE_ROOT, fixture);
  var input = readFile(filepath, 'input.md');
  var configFiles = fs.readdirSync(filepath).map(function (filename) {
    return filename.match(/^config(.\d+)?.js$/);
  }).filter(function (match) {
    return match;
  }).map(function (match) {
    var configFilename = match[0];
    var ext = match[1] || '';
    return {
      data: require(path.join(filepath, configFilename)),
      ext: ext
    };
  });

  configFiles.forEach(function (config) {
    test('Fixtures: ' + fixture, function (t) {
      var outputName = 'output' + config.ext + '.json';
      var expectedOutput = readFile(filepath, outputName);
      var processor = unified()
        .use(parseMD)
        .use(customElementCompiler, config.data);

      var output = toJson(processor.processSync(input).contents);

      if (process.env.UPDATE_TESTS) {
        writeToFile(filepath, outputName, output);
      }
      t.equal(output, expectedOutput, 'should work on `' + fixture + '`');
      t.end();
    });
  });
});

/* Assert parse errors */
test('Parse errors', function (t) {
  var processor = unified()
    .use(parseMD)
    .use(customElementCompiler, {
      componentWhitelist: ['Component']
    });
  var input = `</Component>`;
  processor.process(input, function (err) {
    t.ok(err);
    t.ok(err instanceof Error);
    t.equal(err.message, '');
    t.end();
  });
});

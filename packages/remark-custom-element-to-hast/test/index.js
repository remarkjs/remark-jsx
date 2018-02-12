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
  var expectedOutput = readFile(filepath, 'output.json');
  var input = readFile(filepath, 'input.md');
  var configFiles = fs.readdirSync(filepath).filter(function (filename) {
    return /^config(.\d+)?.js$/.test(filename);
  }).map(function (configFilename) {
    return require(path.join(filepath, configFilename));
  });

  configFiles.forEach(function (config) {
    test('Fixtures: ' + fixture, function (t) {
      var processor = unified()
        .use(parseMD)
        .use(customElementCompiler, config);

      var output = toJson(processor.processSync(input).contents);

      if (process.env.UPDATE_TESTS) {
        writeToFile(filepath, 'output.json', output);
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

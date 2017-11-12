'use strict';

var test = require('tape');
var u = require('unist-builder');
var to = require('..');

test('`text`', function (t) {
  t.deepEqual(
    to(u('doctype')),
    null,
    'should stringify doctypes without `name`'
  );

  t.deepEqual(
    to(u('doctype', {name: 'html'})),
    null,
    'should stringify doctypes with `name`'
  );

  t.deepEqual(
    to(u('doctype', {
      name: 'html',
      public: '-//W3C//DTD XHTML 1.0 Transitional//EN'
    })),
    null,
    'should stringify doctypes with a public identifier'
  );

  t.deepEqual(
    to(u('doctype', {
      name: 'html',
      system: 'about:legacy-compat'
    })),
    null,
    'should stringify doctypes with a system identifier'
  );

  t.deepEqual(
    to(u('doctype', {
      name: 'html',
      public: '-//W3C//DTD HTML 4.01//',
      system: 'http://www.w3.org/TR/html4/strict.dtd'
    })),
    null,
    'should stringify doctypes with both identifiers'
  );

  t.deepEqual(
    to(u('doctype', {
      name: 'html',
      system: 'taco"'
    })),
    null,
    'should quote smartly'
  );

  t.end();
});

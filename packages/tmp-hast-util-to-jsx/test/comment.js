'use strict';

var test = require('tape');
var u = require('unist-builder');
var to = require('..');

test('`comment`', function (t) {
  t.deepEqual(
    to(u('comment', 'alpha')),
    null,
    'should stringify `comment`s'
  );

  t.deepEqual(
    to(u('comment', 'AT&T')),
    null,
    'should not encode `comment`s (#1)'
  );

  /* No way to get around this. */
  t.deepEqual(
    to(u('comment', '-->')),
    null,
    'should not encode `comment`s (#2)'
  );

  t.end();
});

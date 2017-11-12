'use strict';

var createElement = require('react').createElement;
var test = require('tape');
var h = require('hastscript');
var u = require('unist-builder');
var to = require('..');

test('`root`', function (t) {
  t.deepEqual(
    to(u('root', [
      u('text', 'alpha '),
      h('i', 'bravo'),
      u('text', ' charlie')
    ])),
    ['alpha ', createElement('i', {}, 'bravo'), ' charlie'],
    'should stringify `root`s'
  );

  t.end();
});

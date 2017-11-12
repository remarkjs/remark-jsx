'use strict';
var createElement = require('react').createElement;
var test = require('tape');
var h = require('hastscript');
var u = require('unist-builder');
var to = require('..');

test('`element` attributes', function (t) {
  t.deepEqual(
    to(h('i', {className: ['alpha']}, 'bravo')),
    createElement('i', {className: ['alpha']}, 'bravo'),
    'should stringify special camel-cased properties'
  );

  t.deepEqual(
    to(h('i', {dataFoo: 'alpha'}, 'bravo')),
    createElement('i', {dataFoo: 'alpha'}, 'bravo'),
    'should stringify camel-cased properties'
  );

  t.deepEqual(
    to(h('i', {data123: 'alpha'}, 'bravo')),
    createElement('i', {data123: 'alpha'}, 'bravo'),
    'should stringify numeric `data-` properties'
  );

  t.deepEqual(
    to(h('img', {alt: ''})),
    createElement('img', {alt: ''}),
    'should show empty string attributes'
  );

  t.deepEqual(
    to(h('img', {alt: ''}), {collapseEmptyAttributes: true}),
    createElement('img', {alt: ''}),
    'should collapse empty string attributes in ' +
    '`collapseEmptyAttributes` mode'
  );

  t.deepEqual(
    to(h('i', {className: ['a', 'b'], title: 'c d'}, 'bravo')),
    createElement('i', {className: ['a', 'b'], title: 'c d'}, 'bravo'),
    'should stringify multiple properties'
  );

  t.deepEqual(
    to(h('i', {className: ['a', 'b'], title: 'c d'}, 'bravo'), {
      tightAttributes: true
    }),
    createElement('i', {className: ['a', 'b'], title: 'c d'}, 'bravo'),
    'should stringify multiple properties tightly in ' +
    '`tightAttributes` mode'
  );

  t.deepEqual(
    to(h('i', {className: ['alpha', 'charlie']}, 'bravo')),
    createElement('i', {className: ['alpha', 'charlie']}, 'bravo'),
    'should stringify space-separated attributes'
  );

  t.deepEqual(
    to(h('input', {type: 'file', accept: ['jpg', 'jpeg']})),
    createElement('input', {type: 'file', accept: ['jpg', 'jpeg']}),
    'should stringify comma-separated attributes'
  );

  t.deepEqual(
    to(h('input', {type: 'file', accept: ['jpg', 'jpeg']}), {
      tightCommaSeparatedLists: true
    }),
    createElement('input', {type: 'file', accept: ['jpg', 'jpeg']}),
    'should stringify comma-separated attributes tighly in ' +
    '`tightCommaSeparatedLists` mode'
  );

  t.deepEqual(
    to(h('span', {dataUnknown: ['alpha', 'bravo']})),
    createElement('span', {dataUnknown: ['alpha', 'bravo']}),
    'should stringify unknown lists as space-separated'
  );

  t.deepEqual(
    to(h('i', {hidden: true}, 'bravo')),
    createElement('i', {hidden: true}, 'bravo'),
    'should stringify known boolean attributes set to `true`'
  );

  t.deepEqual(
    to(h('i', {hidden: false}, 'bravo')),
    createElement('i', {hidden: false}, 'bravo'),
    'should ignore known boolean attributes set to `false`'
  );

  t.deepEqual(
    to(h('i', {hidden: 1}, 'bravo')),
    createElement('i', {hidden: 1}, 'bravo'),
    'should stringify truthy known boolean attributes'
  );

  t.deepEqual(
    to(h('i', {hidden: 0}, 'bravo')),
    createElement('i', {hidden: 0}, 'bravo'),
    'should ignore falsey known boolean attributes'
  );

  t.deepEqual(
    to(h('i', {dataUnknown: false}, 'bravo')),
    createElement('i', {dataUnknown: false}, 'bravo'),
    'should stringify unknown attributes set to `false`'
  );

  t.deepEqual(
    to(h('i', {dataUnknown: true}, 'bravo')),
    createElement('i', {dataUnknown: true}, 'bravo'),
    'should stringify unknown attributes set to `true`'
  );

  t.deepEqual(
    to(h('i', {cols: 1}, 'bravo')),
    createElement('i', {cols: 1}, 'bravo'),
    'should stringify positive known numeric attributes'
  );

  t.deepEqual(
    to(h('i', {cols: -1}, 'bravo')),
    createElement('i', {cols: -1}, 'bravo'),
    'should stringify negative known numeric attributes'
  );

  t.deepEqual(
    to(h('i', {cols: 0}, 'bravo')),
    createElement('i', {cols: 0}, 'bravo'),
    'should stringify known numeric attributes set to `0`'
  );

  t.deepEqual(
    to(h('i', {cols: NaN}, 'bravo')),
    createElement('i', {}, 'bravo'),
    'should ignore known numeric attributes set to `NaN`'
  );
  function yup() {
    return 'yup';
  }
  t.deepEqual(
    to(h('i', {cols: {toString: yup}}, 'bravo')),
    createElement('i', {cols: {toString: yup}}, 'bravo'),
    'should stringify known numeric attributes set to non-numeric'
  );

  t.deepEqual(
    to(h('i', {id: 'alpha'}, 'bravo')),
    createElement('i', {id: 'alpha'}, 'bravo'),
    'should stringify other attributes'
  );

  t.deepEqual(
    to(h('i', {id: ''}, 'bravo')),
    createElement('i', {id: ''}, 'bravo'),
    'should stringify other falsey attributes'
  );

  t.deepEqual(
    to(h('i', {id: true}, 'bravo')),
    createElement('i', {id: true}, 'bravo'),
    'should stringify other non-string attributes'
  );

  t.deepEqual(
    to(h('img', {alt: ''}), {quote: '\''}),
    createElement('img', {alt: ''}),
    'should quote attribute values with single quotes is ' +
    '`quote: \'\\\'\'`'
  );

  t.throws(
    function () {
      to(h('img'), {quote: '`'});
    },
    /Invalid quote ```, expected `'` or `"`/,
    'should throw on invalid quotes'
  );

  t.deepEqual(
    to(h('img', {alt: ''}), {quote: '"'}),
    createElement('img', {alt: ''}),
    'should quote attribute values with single quotes is ' +
    '`quote: \'"\'`'
  );

  t.deepEqual(
    to(h('img', {alt: '"some \' stuff"'}), {
      quote: '"',
      quoteSmart: true
    }),
    createElement('img', {alt: '"some \' stuff"'}),
    'should quote smartly if the other quote is less ' +
    'prominent (#1)'
  );

  t.deepEqual(
    to(h('img', {alt: '\'some " stuff\''}), {quote: '\'', quoteSmart: true}),
    createElement('img', {alt: '\'some " stuff\''}),
    'should quote smartly if the other quote is less ' +
    'prominent (#2)'
  );

  t.deepEqual(
    to(h('img', {alt: 'alpha'}), {preferUnquoted: true}),
    createElement('img', {alt: 'alpha'}),
    'should omit quotes in `preferUnquoted`'
  );

  t.deepEqual(
    to(h('img', {alt: 'alpha bravo'}), {preferUnquoted: true}),
    createElement('img', {alt: 'alpha bravo'}),
    'should keep quotes in `preferUnquoted` and impossible'
  );

  t.deepEqual(
    to(h('img', {alt: ''}), {preferUnquoted: true}),
    createElement('img', {alt: ''}),
    'should not add `=` when omitting quotes on empty values'
  );

  t.deepEqual(
    to(h('i', {'3<5\0': 'alpha'})),
    createElement('i', {'3<5\0': 'alpha'}),
    'should encode entities in attribute names'
  );

  t.deepEqual(
    to(h('i', {title: '3<5\0'})),
    createElement('i', {title: '3<5\0'}),
    'should encode entities in attribute values'
  );

  t.deepEqual(
    to(h('i', {'3=5\0': 'alpha'}), {allowParseErrors: true}),
    createElement('i', {'3=5\0': 'alpha'}),
    'should not encode characters in attribute names which ' +
    'cause parse errors, but work, in `allowParseErrors` mode'
  );

  t.deepEqual(
    to(h('i', {title: '3"5\0'}), {allowParseErrors: true}),
    createElement('i', {title: '3"5\0'}),
    'should not encode characters in attribute values which ' +
    'cause parse errors, but work, in `allowParseErrors` mode'
  );

  t.deepEqual(
    to(h('i', {title: '3\'5'}), {allowDangerousCharacters: true}),
    createElement('i', {title: '3\'5'}),
    'should not encode characters which cause XSS issues ' +
    'in older browsers, in `allowParseErrors` mode'
  );

  t.deepEqual(
    to(u('element', {
      tagName: 'i',
      properties: {id: null}
    }, [u('text', 'bravo')])),
    createElement('i', {id: null}, 'bravo'),
    'should ignore attributes set to `null`'
  );

  t.deepEqual(
    to(u('element', {
      tagName: 'i',
      properties: {id: undefined}
    }, [u('text', 'bravo')])),
    createElement('i', {id: undefined}, 'bravo'),
    'should ignore attributes set to `undefined`'
  );

  t.end();
});

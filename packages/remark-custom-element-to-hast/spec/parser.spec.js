/* global describe, it, expect */
var unified = require('unified');
var parse = require('remark-parse');
var customElementCompiler = require('../');

var parser = unified()
  .use(parse)
  .use(customElementCompiler, {componentWhitelist: ['MyComponent', 'Autoclose', 'Note']});

describe('Components with nested markdown', function () {
  var md = 'This is a test <MyComponent myAttr="test">of how components\' **children**</MyComponent> are handled';
  var hast = parser.processSync(md).contents;
  var hastCustom = hast.children[0].children.find(function (el) {
    return el.tagName === 'MyComponent';
  });

  it('should have children', function () {
    expect(hastCustom.children.length).toBeGreaterThan(0);
  });

  it('should have a strong children', function () {
    var strong = hastCustom.children.find(function (el) {
      return el.tagName && el.tagName === 'strong';
    });
    expect(strong).toBeDefined();
  });
});

describe('Autoclosing components', function () {
  var md = 'This is a test of <Autoclose value="test"/> components. <MyComponent>Let\'s try to nest <Autoclose value="ok"/> with **mixed content**</MyComponent>';
  var root = parser.processSync(md).contents;
  var p = root.children[0];
  var comp = p.children.find(function (el) {
    return el.tagName === 'MyComponent';
  });
  var autoclose = comp.children.find(function (el) {
    return el.tagName === 'Autoclose';
  });

  it('should have an Autoclose element', function () {
    expect(p.children.find(function (el) {
      return el.tagName === 'Autoclose';
    })).toBeDefined();
  });

  it('should work when nested in another component', function () {
    expect(autoclose).toBeDefined();
  });

  it('should work when mixed with markdown when nested', function () {
    var strong = comp.children.find(function (el) {
      return el.tagName === 'strong';
    });
    expect(autoclose.children.length).toBe(0);
    expect(strong).toBeDefined();
  });
});

describe('Inline components without breaking paragraphs', function () {
  var md = '# This is a test \n Of a complex structure with a <Note text="note component"> \n  <h2>Hello</h2> \n  Will break the parsing \n  </Note> inside a paragraph. ';
  it('should work with usual html tags', function () {
    parser.process(md, function (err, file) {
      expect(err).toBeNull();
      var root = file && file.contents;
      expect(root).toBeDefined();
      expect(root.children.length).toBe(2);
      expect(root.children[0].tagName).toEqual('h1');
      var paragraph = root.children[1];
      expect(paragraph.tagName).toEqual('p');
      var note = paragraph.children.find(function (el) {
        return el.tagName === 'Note';
      });
      expect(note).toBeDefined();
      expect(note.children.find(function (el) {
        return el.tagName === 'h2';
      })).toBeDefined();
    });
  });
});

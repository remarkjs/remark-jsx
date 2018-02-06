'use strict';
const fs = require('fs');
const parseMD = require('remark-parse');
const unified = require('unified');
const customElementCompiler = require('@dumpster/remark-custom-element-to-hast');
const React = require('react');
const ReactDOM = require('react-dom');
const renderer = require('..')(React);
const babel = require('babel-standalone');

const processor = unified()
  .use(parseMD)
  .use(customElementCompiler, {
    componentWhitelist: ['Note', 'input', 'Strong', 'InlineNote'],
    babel: babel
  });
const md = fs.readFileSync(__dirname + '/example.md', 'utf8');
const hast = processor.processSync(md).contents;

console.log('result', hast);

const App = renderer(hast, {
  unsafe: true,
  components: {
    InlineNote: function (props) {
      return React.createElement('span', {}, ['InlineNote: ', props.value]);
    },
    Note: function (props) {
      return React.createElement('span', {}, ['Note: ', props.value, props.children]);
    },
    Strong: 'strong'
  }
});

ReactDOM.render(React.createElement(App, {title: "My Title"}), document.getElementById('root'));

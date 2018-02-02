'use strict';
const parseMD = require('remark-parse');
const unified = require('unified');
const customElementCompiler = require('../remark-custom-element-to-hast');
const React = require('react');
const ReactDOM= require('react-dom');
const renderer = require('.')(React);

const processor = unified()
  .use(parseMD)
  .use(customElementCompiler, {
    componentWhitelist: ['Note', 'Strong', 'InlineNote']
  });
const md =
`# My title

_Hey!_

<Note content="*Hello*" />

A <Note content="This should be displayed">
  <Strong>Cool _test_</Strong> with some <InlineNote value="content"/>
  inside</Note> <InlineNote value='along' otherValue="other surprises!" />

## It also works within tables!

| A                    | B   |
| -------------------- | --- |
| <Note value="wow" /> | b   |

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
`;
const hast = processor.processSync(md).contents;

console.log('result', hast);

const App = renderer(hast, {
  components: {
    InlineNote: function InlineNote(props) {
      return React.createElement('span', {}, ["InlineNote: ", props.value]);
    },
    Note: function Note(props) {
      return React.createElement('span', {}, ["Note: ", props.value, props.children]);
    },
    Strong: 'strong'
  }
});

ReactDOM.render(React.createElement(App), document.getElementById('root'));

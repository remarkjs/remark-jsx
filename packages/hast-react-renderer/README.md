# [hast-react-renderer](https://github.com/fazouane-marouane/remark-jsx/tree/master/packages/hast-react-renderer)

[![npm version](https://badge.fury.io/js/%40dumpster%2Fhast-react-renderer.svg)](https://badge.fury.io/js/%40dumpster%2Fhast-react-renderer)
[![][license-badge]][license]

Transforms a HAST into a usable `react` component.

## Usage

You can use this package in conjuction with [remark-custom-element-to-hast](https://www.npmjs.com/package/@dumpster/remark-custom-element-to-hast)

```js
'use strict';
const parseMD = require('remark-parse');
const unified = require('unified');
const customElementCompiler = require('@dumpster/remark-custom-element-to-hast');
const React = require('react');
const ReactDOM= require('react-dom');
// 1. require then pass-in React to get your renderer. It should work likewise with Preact.
const renderer = require('@dumpster/hast-react-renderer')(React);

// 2. Create a HAST to render
const processor = unified()
  .use(parseMD)
  .use(customElementCompiler, {
    componentWhitelist: ['Note', 'my-strong']
  });
const md =
`# My title

| A                    | B   |
| -------------------- | --- |
| <Note value="Wow" /> | It <my-strong>_really_ works</my-strong>   |
`;
const hast = processor.processSync(md).contents;

// 3. Pass the HAST to the renderer alongside the components you used in your original markdown
const MyDocument = renderer(hast, {
  components: {
    Note: function Note(props) {
      return <span>Note: {props.value}</span>;
    },
    'my-strong': 'strong'
  }
});

ReactDOM.render(<MyDocument />, document.getElementById('root'));

```

[license-badge]: https://img.shields.io/github/license/mashape/apistatus.svg

[license]: /LICENSE

# ![\*\*remark-custom-element-to-hast\*\*](https://github.com/fazouane-marouane/remark-jsx/tree/master/packages/remark-custom-element-to-hast)

[![npm version](https://badge.fury.io/js/%40dumpster%2Fremark-custom-element-to-hast.svg)](https://badge.fury.io/js/%40dumpster%2Fremark-custom-element-to-hast)
[![][license-badge]][license]

Compile markdown file that contain calls to custom elements into a simplified
HAST using [**remark**][remark].
The output HAST may later be transformed into react element for example.

## Example of usage

```javascript
const beautify = require("json-beautify");
const unified = require('unified');
const parseMD = require('remark-parse');
const customElementCompiler = require('@dumpster/remark-custom-element-to-hast');

const processor = unified()
  .use(parseMD)
  .use(customElementCompiler, {componentWhitelist: ['MyStuff', 'MyOtherStuff']})
  .process('## Hello world!\n<MyStuff name="Hello">World<MyOtherStuff /></MyStuff>', function (err, file) {
    console.log(beautify(file.contents, null, 2, 100));
  });
```

The above example will output:

```json
{
  "type": "root",
  "children": [
    {
      "type": "element",
      "tagName": "h2",
      "properties": {},
      "children": [ { "type": "text", "value": "Hello world!" } ]
    },
    { "type": "text", "value": "\n" },
    {
      "type": "element",
      "tagName": "MyStuff",
      "properties": { "name": "Hello" },
      "children": [
        { "type": "text", "value": "World" },
        { "type": "element", "tagName": "MyOtherStuff", "properties": {}, "children": [] }
      ]
    }
  ]
}
```

[remark]: https://github.com/wooorm/remark

[license-badge]: https://img.shields.io/github/license/mashape/apistatus.svg

[license]: /LICENSE

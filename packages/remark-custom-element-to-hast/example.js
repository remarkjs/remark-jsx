'use strict';
const beautify = require("json-beautify");
const unified = require('unified');
const parseMD = require('remark-parse');
const customElementCompiler = require('.');

const processor = unified()
  .use(parseMD)
  .use(customElementCompiler, {
    componentWhitelist: ['Note', 'Strong', 'InlineNote']
  })
  .process(
    `*Hey!*

A <Note content="ceci devrait être affiché">
  <Strong>Super\n *test*</Strong> avec du <InlineNote value="contenu"/>
  dedans</Note> <InlineNote value='ainsi que' otherValue="d'autres surprises!" />

## It also works within tables!

A | B
--|--
<Note value="wow" /> | b
`,
    function (err, file) {
      err && console.error(err);
      console.log(beautify(file.contents, null, 2, 100));
      // then https://github.com/wooorm/remark-vdom/blob/master/index.js
    });

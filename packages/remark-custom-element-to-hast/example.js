'use strict';
const parseMD = require('remark-parse');
const unified = require('unified');
const customElementCompiler = require('.');

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
`;
const hast = processor.processSync(md).contents;

console.log('result', JSON.stringify(hast, null, 2));

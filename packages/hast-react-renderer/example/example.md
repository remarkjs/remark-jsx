# My title


_Hey!_

yo <Note js:value="props.title" />

hey <Note value="With inner \"quotes\"" />

<input type="checkbox" defaultChecked js:onChange="e => console.log('checkbox changed', e.target.checked)" />

A <Note content="This should be displayed">
  <Strong>Cool _test_</Strong> with some <InlineNote value="content"/>
  inside</Note> <InlineNote value='along' otherValue="other surprises!" />

## It also works within tables!

| A                    | B   |
| -------------------- | --- |
| <Note js:value="['wow', 'yo'].map((v, i) => (<Strong key={String(i)}>{v}</Strong>))" /> | b   |

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

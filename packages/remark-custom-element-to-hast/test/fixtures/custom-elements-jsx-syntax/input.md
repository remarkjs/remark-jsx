<Component js:cool-stuff="41 + 1" />

<HOC js:value="[1, 2, 3].map(v => (<Component value={v} />))" />

<HOC value="val1">
  <HOC value="val2">
    <Component js:value="{
      x: 42,
      y: {
        a: 24,
        b: 'some stuff'
      }
    }" />
  </HOC>
</HOC>

<Component value="<Component value='hey'/>">
</Component>

<Component value="</Component><Component>">
<Component/> "
</Component>

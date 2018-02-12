# Simple usages

<Note>This custom element will be parsed</Note>
<my-custom-element attr1="Hello there" attr2="Is there anyone here?" yes>even this one</my-custom-element>


# Syntax

If you look close enough you'll see that this is a mix between a custome element and JSX syntax: <Note optionalValue namespace:my-attribute='OHAI' />

It will be parsed into the following:

```json
{
  "type": "element",
  "tagName": "Note",
  "properties": {
    "optionalValue": true,
    "namespace:my-attribute": "OHAI"
  },
  "children": []
}
```

It can also work in block mode

<Note />

<Note></Note>

## Nesting

Now you'll see that it can also accept nesting

<Note><my-custom-element /></Note>

```json
{
  "type": "element",
  "tagName": "Note",
  "properties": {},
  "children": [
    {
      "type": "element",
      "tagName": "my-custom-element",
      "properties": {},
      "children": []
    }
  ]
}
```

# Escapes

Of course, custom elements that are located inside a code block would be parsed as such:

So the following `<Note />`  will be parsed as

```json
{
  "type": "element",
  "tagName": "code",
  "properties": {},
  "children": [
    {
      "type": "text",
      "value": "<Note />"
    }
  ]
}
```

The following

```
<Note />
```

Will produce the following result:

```json
{
  "type": "element",
  "tagName": "pre",
  "properties": {},
  "children": [
    {
      "type": "element",
      "tagName": "code",
      "properties": {},
      "children": [
        {
          "type": "text",
          "value": "<Note />\n"
        }
      ]
    }
  ]
}
```

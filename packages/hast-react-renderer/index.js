'use strict';

module.exports = rendererFactory;

function rendererFactory(React) {
  var createElement = React.createElement;

  function renderer(ast, options) {
    var displayName = options.displayName;
    var components = options.components;

    function AstRenderer() {
      /**
       * TODO:
       * 1. remove recursivity
       * 2. use props of AstRenderer
       */
      function createElementFromAst(node, key) {
        switch (node.type) {
          case 'element':
            var component = components[node.tagName] || node.tagName;
            var props = Object.assign({}, node.properties, {key: String(key)});
            var children = node.children.map(createElementFromAst);
            return createElement(component, props, children);
          case 'text':
            return node.value;
          default:
            return createElement('div', {}, node.children.map(createElementFromAst));
        }
      }

      return createElementFromAst(ast, 0);
    }

    if (displayName) {
      AstRenderer.displayName = displayName;
    }

    return AstRenderer;
  }

  return renderer;
}

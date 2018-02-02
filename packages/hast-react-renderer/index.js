'use strict';

module.exports = rendererFactory;

function rendererFactory(React) {
  var createElement = React.createElement;
  var cloneElement = React.cloneElement;
  var Fragment = React.Fragment || "div";

  function renderer (ast, options) {
    var displayName = options.displayName;
    var components = options.components;

    function AstRenderer(props) {
      /**
       * TODO:
       * 1. remove recursivity
       * 2. use props
       */
      function createElementFromAst(node, key) {
        switch(node.type) {
          case 'element':
          var component = components[node.tagName] || node.tagName;
          var props = Object.assign({}, node.properties, { key: ""+key});
          var children = node.children.map(createElementFromAst);
          return createElement(component, props, children);
          case 'text':
          return node.value;
          default:
          return createElement('div', {}, node.children.map(createElementFromAst))
        }
      }

      return createElementFromAst(ast, 0);
    }

    return AstRenderer;
  }

  return renderer;
}

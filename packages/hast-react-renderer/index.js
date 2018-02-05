'use strict';

module.exports = rendererFactory;

function rendererFactory(React) {
  var createElement = React.createElement;

  function renderer(ast, options) {
    var displayName = options.displayName;
    var components = options.components;
    var unsafe = options.unsafe;

    function AstRenderer(props) {
      function unsafeEvalWithProps(code) {
        var args = ['props', 'React'].concat(Object.keys(components));
        var argsValue = [props, React].concat(Object.keys(components).map(function(k) {
          return components[k];
        }));
        var func = Function.apply(null, args.concat(['return (' + code + ')']));
        return func.apply(props, argsValue);
      }

      /**
       * TODO:
       * 1. remove recursivity
       * 2. use props of AstRenderer
       */
      function createElementFromAst(node, key) {
        switch (node.type) {
          case 'element':
            var component = components[node.tagName] || node.tagName;
            var componentProps = {};
            Object.keys(node.properties).forEach(function (propKey) {
              if (propKey.indexOf('js:') === 0) {
                componentProps[propKey.slice(3)] =
                unsafe? unsafeEvalWithProps(node.properties[propKey], props):
                node.properties[propKey];
              } else {
                componentProps[propKey] = node.properties[propKey];
              }
            });
            componentProps.key = String(key);
            var children = node.children.map(createElementFromAst);
            return createElement(component, componentProps, children.length ? children : undefined);
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

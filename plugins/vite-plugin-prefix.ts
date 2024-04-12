import jscodeshift from 'jscodeshift';

export default function prefixPlugin(prefix: string) {
  return {
    name: 'prefix-plugin',
    // apply: 'serve',

    transform(code, id) {
      if (id.endsWith('tsx')) {
        const ast = jscodeshift(code);
        ast.find(jscodeshift.CallExpression).forEach((path) => {
          const callee = path.node.callee;
          if (
            callee.type === 'MemberExpression' &&
            callee.object.name === 'React' &&
            callee.property.name === 'createElement' &&
            path.node.arguments.length >= 2 &&
            path.node.arguments[0].type === 'Literal' &&
            path.node.arguments[0].value === 'img'
          ) {
            const props = path.node.arguments[1].properties;
            props.forEach((prop) => {
              if (prop.key.name === 'src') {
                if (prop.value.type === 'Identifier' || prop.value.type === 'MemberExpression') {
                  prop.value = jscodeshift.template.expression`${jscodeshift.literal(prefix)} + ${prop.value}`;
                } else if (prop.value.type === 'TemplateLiteral') {
                  prop.value = jscodeshift.template.expression`\`\${${jscodeshift.literal(prefix)}}\${${prop.value}}\``;
                } else if (prop.value.type === 'LogicalExpression' || prop.value.type === 'ConditionalExpression') {
                  prop.value = jscodeshift.template.expression`${jscodeshift.literal(prefix)} + ${prop.value}`;
                } else if (prop.value.type === 'Literal') {
                  prop.value.value = `${prefix}${prop.value.value}`;
                }
              }
            });
          }
        });

        return ast.toSource();
      }
    },
  };
}

import jscodeshift from 'jscodeshift';

export default function prefixPlugin(prefix: string) {
  return {
    name: 'prefix-plugin',
    // apply: 'serve',

    transform(code, id) {
      if (id.endsWith('tsx')) {
        const ast = jscodeshift(code);
        const prefixValue = jscodeshift.literal(prefix);
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
                  // 如果 src 是变量或表达式
                  // const prefixValue = 'MemberExpression';
                  prop.value = jscodeshift.template.expression`${jscodeshift.literal(prefix)} + ${prop.value}`;
                } else if (prop.value.type === 'TemplateLiteral') {
                  // 如果 src 是模板字符串
                  // const prefixValue = 'TemplateLiteral';
                  prop.value = jscodeshift.template.expression`\`\${${jscodeshift.literal(prefix)}}\${${prop.value}}\``;
                } else if (prop.value.type === 'LogicalExpression' || prop.value.type === 'ConditionalExpression') {
                  // 如果 src 是逻辑表达式或条件表达式
                  // const prefixValue = 'LogicalExpression';
                  prop.value = jscodeshift.template.expression`${jscodeshift.literal(prefix)} + ${prop.value}`;
                } else if (prop.value.type === 'Literal') {
                  // 如果 src 是字符串字面量
                  // const prefixValue = 'Literal';
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

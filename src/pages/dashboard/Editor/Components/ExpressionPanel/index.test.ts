import * as fs from 'fs';
import * as path from 'path';
import ts = require('typescript');

describe('dashboard expression panel', () => {
  it('does not spread a Form.List field key to sibling Form.Items', () => {
    const filePath = path.join(__dirname, 'index.tsx');
    const source = fs.readFileSync(filePath, 'utf8');
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const violations: number[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isJsxSpreadAttribute(node) && ts.isIdentifier(node.expression) && node.expression.text === 'field') {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push(line + 1);
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);

    expect(violations).toEqual([]);
  });
});

import * as fs from 'fs';
import * as path from 'path';
import ts = require('typescript');

/**
 * 找出把函数作为第一个实参传给 setPanels 的位置。
 *
 * 这里的约定是：面板列表的更新统一走 `commitPanels(nextPanels)`（先算好新列表，
 * 再 setState + 通知父级）。函数式 updater 必须保持纯函数，而面板更新伴随
 * `onConfigChange` 与弹窗状态复位等副作用，一旦 React 重放 updater 就会重复执行，
 * 因此在本文件中禁止使用。
 */
export function collectImpureUpdaterCalls(filePath: string, source: string): string[] {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node) && node.expression.getText(sourceFile) === 'setPanels') {
      const firstArgument = node.arguments[0];
      if (firstArgument && (ts.isArrowFunction(firstArgument) || ts.isFunctionExpression(firstArgument))) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push(`${filePath}:${line + 1}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return violations;
}

describe('panels state update policy', () => {
  it('does not run side effects inside a functional setPanels updater', () => {
    const violation = collectImpureUpdaterCalls('index.tsx', fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8'));

    expect(violation).toEqual([]);
  });

  it('flags a functional setPanels updater', () => {
    const source = `
      const Demo = () => {
        setPanels((prev) => prev);
        return null;
      };
    `;

    expect(collectImpureUpdaterCalls('demo.tsx', source)).toEqual(['demo.tsx:3']);
  });
});

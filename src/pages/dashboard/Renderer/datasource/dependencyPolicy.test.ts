import * as fs from 'fs';
import * as path from 'path';
import ts = require('typescript');

const HOOK_NAMES = new Set(['useEffect', 'useLayoutEffect', 'useMemo', 'useCallback', 'useDeepCompareEffect']);

const roots = [
  'src/pages/dashboard',
  'src/plugins/iotdb/Dashboard',
  'src/plugins/TDengine/Dashboard',
  'src/plugins/clickHouse/Dashboard',
  'src/plugins/mysql/Dashboard',
  'src/plugins/pgsql/Dashboard',
  'src/plugins/doris/Dashboard',
  'src/plus/parcels/Dashboard',
];

function listSourceFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return listSourceFiles(filePath);
    return /\.[jt]sx?$/.test(entry.name) ? [filePath] : [];
  });
}

function containsJsonStringify(node: ts.Node) {
  let found = false;
  const visit = (child: ts.Node) => {
    if (
      ts.isCallExpression(child) &&
      ts.isPropertyAccessExpression(child.expression) &&
      child.expression.expression.getText() === 'JSON' &&
      child.expression.name.text === 'stringify'
    ) {
      found = true;
      return;
    }
    ts.forEachChild(child, visit);
  };
  visit(node);
  return found;
}

describe('dashboard hook dependency policy', () => {
  it('does not stringify values in hook dependency arrays', () => {
    const violations: string[] = [];

    roots.flatMap(listSourceFiles).forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node)) {
          const hookName = ts.isIdentifier(node.expression) ? node.expression.text : ts.isPropertyAccessExpression(node.expression) ? node.expression.name.text : '';
          const dependencies = node.arguments[node.arguments.length - 1];
          if (HOOK_NAMES.has(hookName) && dependencies && ts.isArrayLiteralExpression(dependencies) && containsJsonStringify(dependencies)) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(dependencies.getStart());
            violations.push(`${filePath}:${line + 1}`);
          }
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    });

    expect(violations).toEqual([]);
  });
});

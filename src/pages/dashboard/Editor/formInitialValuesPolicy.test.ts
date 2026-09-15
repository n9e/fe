import * as fs from 'fs';
import * as path from 'path';
import ts = require('typescript');

import { defaultValues } from './config';

const roots = [
  'src/pages/dashboard/Editor',
  'src/plugins/TDengine/Dashboard',
  'src/plugins/clickHouse/Dashboard',
  'src/plugins/doris/Dashboard',
  'src/plugins/elasticsearch/Dashboard',
  'src/plugins/iotdb/Dashboard',
  'src/plugins/mysql/Dashboard',
  'src/plugins/pgsql/Dashboard',
  'src/plugins/prometheus/Dashboard',
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

describe('dashboard editor form initialization policy', () => {
  it('does not register or default a panel version field', () => {
    const formSource = fs.readFileSync(path.join('src/pages/dashboard/Editor', 'Form.tsx'), 'utf8');

    expect(defaultValues).not.toHaveProperty('version');
    expect(formSource).not.toMatch(/<Form\.Item\s+name='version'/);
  });

  it('does not use Form.initialValues alongside field-level initialValue defaults', () => {
    const violations: string[] = [];

    roots.flatMap(listSourceFiles).forEach((filePath) => {
      const source = fs.readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
      const visit = (node: ts.Node) => {
        if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
          const isAntdForm = node.tagName.getText(sourceFile) === 'Form';
          const hasInitialValues = node.attributes.properties.some((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(sourceFile) === 'initialValues');
          if (isAntdForm && hasInitialValues) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
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

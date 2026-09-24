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

/** 读取 JSX 元素上声明的属性名。 */
function getJsxAttributeNames(node: ts.JsxOpeningElement | ts.JsxSelfClosingElement, sourceFile: ts.SourceFile): string[] {
  return node.attributes.properties.filter((attribute): attribute is ts.JsxAttribute => ts.isJsxAttribute(attribute)).map((attribute) => attribute.name.getText(sourceFile));
}

/** 判断 Form 子树内是否声明了字段级 initialValue（`<Form.Item initialValue>`）。 */
function hasFieldLevelInitialValue(formElement: ts.Node, sourceFile: ts.SourceFile): boolean {
  let found = false;
  const visit = (node: ts.Node) => {
    if (found) return;
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      if (node.tagName.getText(sourceFile) === 'Form.Item' && getJsxAttributeNames(node, sourceFile).includes('initialValue')) {
        found = true;
        return;
      }
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(formElement, visit);
  return found;
}

/**
 * 收集同一个 Form 上同时出现 `Form.initialValues` 与字段级 `initialValue` 的位置。
 *
 * 两者叠加时 antd 会就同一字段的初始值来源给出告警，且 `Form.initialValues` 只在挂载时
 * 生效、后续不再更新，容易出现回显与重置不一致。约定是：字段默认值写在 `Form.Item`
 * 的 `initialValue` 上，已保存的数据在挂载后统一 `setFieldsValue`。
 *
 * 仅依赖 `Form.initialValues` 提供首帧值的嵌套表单（无字段级 `initialValue`，例如
 * `component={false}` 的查询编辑器值容器）不属于该冲突，不在此处报告。
 */
function collectViolations(filePath: string, source: string): string[] {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, filePath.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const violations: string[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const isAntdForm = node.tagName.getText(sourceFile) === 'Form';
      const hasInitialValues = getJsxAttributeNames(node, sourceFile).includes('initialValues');
      // JSX 子节点挂在 JsxElement 上而不是开标签上，扫描范围要取外层元素
      const formElement = ts.isJsxOpeningElement(node) && ts.isJsxElement(node.parent) ? node.parent : node;
      if (isAntdForm && hasInitialValues && hasFieldLevelInitialValue(formElement, sourceFile)) {
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
        violations.push(`${filePath}:${line + 1}`);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return violations;
}

describe('dashboard editor form initialization policy', () => {
  it('does not register or default a panel version field', () => {
    const formSource = fs.readFileSync(path.join('src/pages/dashboard/Editor', 'Form.tsx'), 'utf8');

    expect(defaultValues).not.toHaveProperty('version');
    expect(formSource).not.toMatch(/<Form\.Item\s+name='version'/);
  });

  it('does not use Form.initialValues alongside field-level initialValue defaults', () => {
    const violations = roots.flatMap(listSourceFiles).flatMap((filePath) => collectViolations(filePath, fs.readFileSync(filePath, 'utf8')));

    expect(violations).toEqual([]);
  });

  it('flags a form that mixes Form.initialValues with a field-level initialValue', () => {
    const source = `
      const Demo = () => (
        <Form initialValues={{ a: 1 }}>
          <Form.Item name='a' initialValue={1}>
            <Input />
          </Form.Item>
        </Form>
      );
    `;

    expect(collectViolations('demo.tsx', source)).toEqual(['demo.tsx:3']);
  });

  it('allows a value-container form that only supplies Form.initialValues', () => {
    const source = `
      const Demo = () => (
        <Form component={false} form={form} initialValues={{ type }}>
          <Form.Item name='type' hidden>
            <div />
          </Form.Item>
        </Form>
      );
    `;

    expect(collectViolations('demo.tsx', source)).toEqual([]);
  });
});

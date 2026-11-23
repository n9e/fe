import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import type { ImportDeclaration } from 'ts-morph';

/**
 * 查看态依赖边界测试。
 *
 * 从面板渲染入口出发，只沿 dashboard 内部的静态运行时 import 遍历。
 * 编辑器选项组件的静态依赖由编辑器入口单独持有。
 */
const DASHBOARD_ROOT = path.resolve(__dirname, '../..');
const EDITOR_ROOT = path.resolve(DASHBOARD_ROOT, 'Editor');
const VIEW_ENTRY = path.resolve(DASHBOARD_ROOT, 'Renderer/Renderer/index.tsx');
const OPTIONS_ENTRY = path.resolve(EDITOR_ROOT, 'Options/index.tsx');
const TS_CONFIG_PATH = path.resolve(__dirname, '../../../../../tsconfig.json');

/** 编辑器选项入口静态导入的配置组件。 */
const PANEL_OPTION_MODULES = [
  './Timeseries',
  './BarChart',
  './Stat',
  './TableNG',
  './Table',
  './Pie',
  './Hexbin',
  './BarGauge',
  './Text',
  './Gauge',
  './Heatmap',
  './Iframe',
  './AiButton',
];

/** 所有图表都由查看态静态引入，避免显示面板时再请求独立 chunk。 */
const EAGER_CHART_ENTRIES = [
  'Renderer/Renderer/TimeSeriesNG/index.tsx',
  'Renderer/Renderer/Stat/index.tsx',
  'Renderer/Renderer/Table/index.tsx',
  'Renderer/Renderer/TableNG/index.tsx',
  'Renderer/Renderer/Text/index.tsx',
  'Renderer/Renderer/Iframe/index.tsx',
  'Renderer/Renderer/AiButton/index.tsx',
  'Renderer/Renderer/Pie/index.tsx',
  'Renderer/Renderer/Hexbin/index.tsx',
  'Renderer/Renderer/BarGauge/index.tsx',
  'Renderer/Renderer/Gauge/index.tsx',
  'Renderer/Renderer/Heatmap/index.tsx',
  'Renderer/Renderer/BarChart/index.tsx',
];

/** 判断导入声明是否会产生运行时依赖；纯类型导入会被编译移除。 */
function hasRuntimeDependency(declaration: ImportDeclaration): boolean {
  if (declaration.isTypeOnly()) return false;
  if (declaration.getDefaultImport() || declaration.getNamespaceImport()) return true;
  const namedImports = declaration.getNamedImports();
  // 没有具名导入时是副作用导入，仍然产生运行时依赖
  if (namedImports.length === 0) return true;
  return namedImports.some((item) => !item.isTypeOnly());
}

/** 收集从入口出发、只经过 dashboard 内部模块的静态运行时依赖。 */
function collectStaticDashboardDependencies(entry: string): string[] {
  const project = new Project({ tsConfigFilePath: TS_CONFIG_PATH, skipAddingFilesFromTsConfig: true });
  const visited = new Set<string>();
  const queue = [entry];
  const reached = new Set<string>();
  const dashboardPrefix = `${DASHBOARD_ROOT}${path.sep}`;

  while (queue.length) {
    const filePath = queue.shift() as string;
    if (visited.has(filePath)) continue;
    visited.add(filePath);

    const sourceFile = project.addSourceFileAtPathIfExists(filePath);
    if (!sourceFile) continue;

    const dependencies = [
      ...sourceFile
        .getImportDeclarations()
        .filter(hasRuntimeDependency)
        .map((declaration) => declaration.getModuleSpecifierSourceFile()),
      ...sourceFile
        .getExportDeclarations()
        .filter((declaration) => !declaration.isTypeOnly())
        .map((declaration) => declaration.getModuleSpecifierSourceFile()),
    ];

    dependencies.forEach((dependency) => {
      if (!dependency) return;
      const dependencyPath = dependency.getFilePath();
      // 跨出 dashboard 的依赖（组件库、页面等）不在本测试的边界范围内
      if (!dependencyPath.startsWith(dashboardPrefix)) return;
      reached.add(dependencyPath);
      queue.push(dependencyPath);
    });
  }

  return [...reached];
}

describe('panel view dependency boundary', () => {
  // 依赖图只构建一次：ts-morph 需要解析整个查看态模块图，重复构建会显著拖慢用例
  let staticDependencies: Set<string>;

  beforeAll(() => {
    staticDependencies = new Set(collectStaticDashboardDependencies(VIEW_ENTRY));
  });

  it('never statically reaches editor modules from the panel renderer entry', () => {
    const editorDependencies = [...staticDependencies]
      .filter((filePath) => filePath.startsWith(`${EDITOR_ROOT}${path.sep}`))
      .map((filePath) => path.relative(DASHBOARD_ROOT, filePath));

    expect(editorDependencies).toEqual([]);
  });

  it('statically imports every options panel from the editor options entry', () => {
    const optionsSource = new Project({ tsConfigFilePath: TS_CONFIG_PATH, skipAddingFilesFromTsConfig: true }).addSourceFileAtPath(OPTIONS_ENTRY);
    const imports = optionsSource
      .getImportDeclarations()
      .filter(hasRuntimeDependency)
      .map((declaration) => declaration.getModuleSpecifierValue());

    expect(imports).toEqual(expect.arrayContaining(PANEL_OPTION_MODULES));
    expect(optionsSource.getDescendantsOfKind(SyntaxKind.CallExpression).some((call) => call.getExpression().getKind() === SyntaxKind.ImportKeyword)).toBe(false);
  });

  it('statically loads every chart renderer in the view bundle', () => {
    EAGER_CHART_ENTRIES.forEach((entry) => {
      expect(staticDependencies.has(path.resolve(DASHBOARD_ROOT, entry))).toBe(true);
    });
  });
});

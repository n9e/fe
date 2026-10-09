import path from 'path';
import { Project, SyntaxKind } from 'ts-morph';
import type { ImportDeclaration } from 'ts-morph';

/**
 * 查看态依赖边界测试。
 *
 * 图表注册表同时服务查看态和编辑器，因此查看态的静态依赖图里不能出现编辑器模块。
 * 这里从面板渲染入口出发，只沿 dashboard 内部的静态 import 遍历：
 * - 动态 import（注册表的 loadOptions 和低频图表加载器）不会被跟随，
 *   这正是编辑器与编辑器选项面板保持按需加载的方式；
 * - 只用于类型的 import 在编译后会被移除，不算静态依赖。
 */
const DASHBOARD_ROOT = path.resolve(__dirname, '../..');
const EDITOR_ROOT = path.resolve(DASHBOARD_ROOT, 'Editor');
const VIEW_ENTRY = path.resolve(DASHBOARD_ROOT, 'Renderer/Renderer/index.tsx');
const REGISTRY_ENTRY = path.resolve(__dirname, 'index.tsx');
const TS_CONFIG_PATH = path.resolve(__dirname, '../../../../../tsconfig.json');

/** 注册表需要动态加载的编辑器选项面板模块（相对 registry/index.tsx）。 */
const PANEL_OPTION_MODULES = [
  '../../Editor/Options/Timeseries',
  '../../Editor/Options/BarChart',
  '../../Editor/Options/Stat',
  '../../Editor/Options/TableNG',
  '../../Editor/Options/Table',
  '../../Editor/Options/Pie',
  '../../Editor/Options/Hexbin',
  '../../Editor/Options/BarGauge',
  '../../Editor/Options/Text',
  '../../Editor/Options/Gauge',
  '../../Editor/Options/Heatmap',
  '../../Editor/Options/Iframe',
];

/** 常用图表：查看态直接静态引入。 */
const EAGER_CHART_ENTRIES = [
  'Renderer/Renderer/TimeSeriesNG/index.tsx',
  'Renderer/Renderer/Stat/index.tsx',
  'Renderer/Renderer/Table/index.tsx',
  'Renderer/Renderer/TableNG/index.tsx',
  'Renderer/Renderer/Text/index.tsx',
  'Renderer/Renderer/Iframe/index.tsx',
];

/** 低频图表：只能通过动态 import 加载，不能进入查看态首屏依赖。 */
const LAZY_CHART_ENTRIES = [
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

  it('loads every editor option panel through a dynamic import', () => {
    const registrySource = new Project({ tsConfigFilePath: TS_CONFIG_PATH, skipAddingFilesFromTsConfig: true }).addSourceFileAtPath(REGISTRY_ENTRY);
    const dynamicImportModules = registrySource
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter((call) => call.getExpression().getKind() === SyntaxKind.ImportKeyword)
      .map((call) => call.getArguments()[0]?.getText() ?? '');

    expect(dynamicImportModules.slice().sort()).toEqual(PANEL_OPTION_MODULES.map((modulePath) => `'${modulePath}'`).sort());
  });

  it('keeps the common charts eager and the low-frequency charts out of the view bundle', () => {
    EAGER_CHART_ENTRIES.forEach((entry) => {
      expect(staticDependencies.has(path.resolve(DASHBOARD_ROOT, entry))).toBe(true);
    });
    LAZY_CHART_ENTRIES.forEach((entry) => {
      expect(staticDependencies.has(path.resolve(DASHBOARD_ROOT, entry))).toBe(false);
    });
  });
});

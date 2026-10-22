/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// Check real component/test contracts with the production compiler options.
// Transpile-only Jest and TS syntax checks do not catch missing JSX props.
const args = process.argv.slice(2);
const workspace = path.resolve(args.find((arg) => !arg.startsWith('--')) || path.join(__dirname, '../..'));
const configPath = path.join(workspace, 'tsconfig.json');
const formatHost = {
  getCanonicalFileName: (name) => name,
  getCurrentDirectory: () => workspace,
  getNewLine: () => '\n',
};
const fail = (diagnostics) => {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost));
  process.exit(1);
};
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) fail([config.error]);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, workspace, undefined, configPath);
if (parsed.errors.length) fail(parsed.errors);

const scopes = [
  'src/pages/logExplorer/components/LogsViewer/index.tsx',
  'src/pages/logExplorer/components/LogsViewer/Raw.tsx',
  'src/pages/logExplorer/components/LogsViewer/Clustering/Table.tsx',
  'src/pages/logExplorer/components/LogsViewer/utils/useExternalGridScroll.test.tsx',
  'src/pages/logExplorer/components/FieldsList',
  'src/pages/logExplorer/components/FilterConfigPopover.test.tsx',
  'src/plugins/doris/ExplorerNG/SideBarNav/FieldsSidebar/index.tsx',
  'src/plugins/clickHouse/ExplorerNG/SideBarNav/FieldsSidebar/index.tsx',
  'src/plugins/elasticsearch/ExplorerNG/components/FiltersBuilder',
];
const plusScope = 'src/plus/datasource/cloudwatchLogs/ExplorerNG/SideBarNav/FieldsSidebar';
if (fs.existsSync(path.join(workspace, plusScope))) scopes.push(plusScope);
else if (args.includes('--with-plus')) throw new Error(`Missing enterprise source: ${plusScope}`);

const files = [];
const collect = (file) => {
  if (fs.statSync(file).isDirectory()) {
    for (const name of fs.readdirSync(file)) collect(path.join(file, name));
  } else if (/\.tsx?$/.test(file)) files.push(file);
};
scopes.forEach((scope) => collect(path.join(workspace, scope)));
// Preserve the ambient declarations included by the production project (SVG,
// Jest matchers, etc.) while limiting diagnostics to this feature's sources.
const declarations = parsed.fileNames.filter((file) => file.endsWith('.d.ts'));
const options = { ...parsed.options, noEmit: true };
const host = ts.createCompilerHost(options);
host.getCurrentDirectory = () => workspace;
const program = ts.createProgram([...new Set([...files, ...declarations])], options, host);
const diagnostics = [...program.getOptionsDiagnostics(), ...program.getGlobalDiagnostics()];
for (const file of files) {
  const source = program.getSourceFile(file);
  if (!source) throw new Error(`Source was not checked: ${file}`);
  diagnostics.push(...program.getSyntacticDiagnostics(source), ...program.getSemanticDiagnostics(source));
}
const errors = diagnostics.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error);
if (errors.length) fail(errors);
console.log(`Log explorer semantic type checks passed (${files.length} files, enterprise: ${scopes.includes(plusScope)}).`);

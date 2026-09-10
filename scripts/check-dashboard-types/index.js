/* eslint-disable no-console */
const path = require('path');
const ts = require('typescript');

const configPath = path.resolve(__dirname, 'tsconfig.json');
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error) {
  console.error(
    ts.formatDiagnostic(config.error, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => '\n',
    }),
  );
  process.exit(1);
}

const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, path.dirname(configPath));
const program = ts.createProgram(parsed.fileNames, parsed.options);
const dashboardRoot = path.resolve(__dirname, '../../src/pages/dashboard') + path.sep;
const excludedPathSegments = [
  `${path.sep}VariableConfig${path.sep}`,
  `${path.sep}grafanaImport${path.sep}`,
  `${path.sep}transformations${path.sep}AddFieldFromCalculationTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}ConcatenateFieldsTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}ConfigFromQueryResultsTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}ConvertFieldTypeTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}ExtractFieldsTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}FilterByNameTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}FilterByRefIdTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}FilterByValuesTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}GroupByTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}LabelsToFieldsTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}LimitTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}PartitionByValuesTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}ReduceTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}RenameByRegexTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}RowsToFieldsTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}SeriesToRowsTransformation${path.sep}`,
  `${path.sep}transformations${path.sep}SortByTransformation${path.sep}`,
  `${path.sep}Renderer${path.sep}datasource${path.sep}prometheus.ts`,
  `${path.sep}Renderer${path.sep}datasource${path.sep}elasticsearch${path.sep}`,
  `${path.sep}Renderer${path.sep}Renderer${path.sep}Table${path.sep}`,
  `${path.sep}Renderer${path.sep}Renderer${path.sep}Timeseries${path.sep}`,
];

const isActiveDashboardFile = (fileName) => {
  const resolved = path.resolve(fileName);
  return resolved.startsWith(dashboardRoot) && !excludedPathSegments.some((segment) => resolved.includes(segment));
};

const getIgnoredRanges = (sourceFile) => {
  const content = sourceFile.getFullText();
  const ranges = [];
  let searchFrom = 0;
  while (searchFrom < content.length) {
    const startMarker = content.indexOf('dashboard-any-ignore-start', searchFrom);
    if (startMarker < 0) break;
    const endMarker = content.indexOf('dashboard-any-ignore-end', startMarker);
    ranges.push([startMarker, endMarker < 0 ? content.length : endMarker]);
    searchFrom = endMarker < 0 ? content.length : endMarker + 1;
  }
  return ranges;
};

const isIgnoredPosition = (sourceFile, position) => getIgnoredRanges(sourceFile).some(([start, end]) => position >= start && position <= end);

const implicitAnyCodes = new Set([7005, 7006, 7031, 7034]);
const diagnostics = ts
  .getPreEmitDiagnostics(program)
  .filter(
    (diagnostic) =>
      diagnostic.file && isActiveDashboardFile(diagnostic.file.fileName) && implicitAnyCodes.has(diagnostic.code) && !isIgnoredPosition(diagnostic.file, diagnostic.start ?? 0),
  );

const anyDiagnostics = [];
for (const sourceFile of program.getSourceFiles()) {
  if (!isActiveDashboardFile(sourceFile.fileName) || sourceFile.isDeclarationFile) continue;
  const visit = (node) => {
    if (node.kind === ts.SyntaxKind.AnyKeyword && !isIgnoredPosition(sourceFile, node.getStart(sourceFile))) {
      const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
      anyDiagnostics.push({
        file: sourceFile.fileName,
        line: position.line + 1,
        column: position.character + 1,
      });
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => '\n',
    }),
  );
  process.exitCode = 1;
}

if (anyDiagnostics.length) {
  anyDiagnostics.forEach(({ file, line, column }) => {
    console.error(`${path.relative(process.cwd(), file)}:${line}:${column} - error ANY001: Explicit any is not allowed in active dashboard code.`);
  });
  process.exitCode = 1;
}

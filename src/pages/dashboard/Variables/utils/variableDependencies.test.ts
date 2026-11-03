import { extractDependencies, getMissingVariableReferences } from './variableDependencies';

test('finds missing references in nested payloads and deduplicates all supported syntaxes', () => {
  expect(getMissingVariableReferences({ datasource: '$source', query: ['${job}', { filter: '[[host]] $job' }] }, new Set())).toEqual(['source', 'job', 'host']);
});

test('accepts available variables, builtins, scoped variables and interpolation prefixes', () => {
  expect(getMissingVariableReferences('$host_suffix ${__interval} [[__field.labels.host]]', new Set(['host', '__interval', '__field.labels.host']))).toEqual([]);
});

test('does not treat backend SQL macros or expression-free literal text as missing variables', () => {
  expect(getMissingVariableReferences('SELECT $__timeFilter(ts), $__timeGroup(ts, 60), $job', new Set(['job']))).toEqual([]);
  expect(getMissingVariableReferences('up{job="api"}', new Set())).toEqual([]);
});

test('recognizes variable dependencies inside formatted interpolation expressions', () => {
  expect(extractDependencies('${servers:sql_like_or:description}')).toEqual(['servers']);
  expect(extractDependencies('[[servers:sql_like_and:logs.description]]')).toEqual(['servers']);
  expect(extractDependencies('${servers:customqueryparam:svc:x-}')).toEqual(['servers']);
});

test('validates formatted references against the available variable names', () => {
  expect(getMissingVariableReferences('${servers:sql_like_or:description}', new Set(['servers']))).toEqual([]);
  expect(getMissingVariableReferences('${missing:sql_like_or:description}', new Set())).toEqual(['missing']);
});

test('ignores the reserved namespace so backend and link placeholders stay untranslated', () => {
  expect(getMissingVariableReferences('$__time_format__ $__series_name $__field.labels.host', new Set())).toEqual([]);
  expect(getMissingVariableReferences('$__unknown_builtin', new Set())).toEqual([]);
  // 保留名之外的未定义引用仍然会被报告
  expect(getMissingVariableReferences('$__interval $job', new Set(['__interval']))).toEqual(['job']);
});

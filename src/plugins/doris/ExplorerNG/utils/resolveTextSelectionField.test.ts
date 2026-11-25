import resolveTextSelectionField from './resolveTextSelectionField';

const indexData = ['attr', 'attr.host.arh', 'attr.host.backupArh', 'attr.host.stats.cores'].map((field) => ({
  field,
  type: 'text',
  indexable: true,
}));

function resolve(value: string, selection: string, from = value.indexOf(selection)) {
  return resolveTextSelectionField({ fieldName: 'attr.host', value, from, to: from + selection.length, indexData });
}

it('uses the full backend path for a string fragment', () => {
  expect(resolve('  {"ARH":"aarch-arm64"}  ', 'arm64')).toEqual({ fieldName: 'attr.host.arh', value: 'arm64' });
});

it('distinguishes identical values by selection position', () => {
  const value = '{"arh":"arm64","backupArh":"arm64"}';
  expect(resolve(value, 'arm64')).toEqual({ fieldName: 'attr.host.arh', value: 'arm64' });
  expect(resolve(value, 'arm64', value.lastIndexOf('arm64'))).toEqual({ fieldName: 'attr.host.backupArh', value: 'arm64' });
});

it('resolves a scalar inside multiple nested objects', () => {
  expect(resolve('{"stats":{"cores":8}}', '8')).toEqual({ fieldName: 'attr.host.stats.cores', value: '8' });
});

it('decodes escaped characters from the selected JSON string', () => {
  const value = JSON.stringify({ arh: 'arm"64' });
  expect(resolve(value, JSON.stringify('arm"64').slice(1, -1))).toEqual({ fieldName: 'attr.host.arh', value: 'arm"64' });
});

it.each([
  ['plain arm64', 'arm64'],
  ['{arh:"arm64"}', 'arm64'],
  ['{"arh":"arm64"}', 'arh'],
  ['{"arh":"arm64"}', '{"arh":"arm64"}'],
  ['{"arh":"arm64","backupArh":"arm64"}', 'arm64","backupArh":"arm64'],
  ['{"unlisted":"arm64"}', 'arm64'],
  ['{"arh":["arm64"]}', 'arm64'],
])('skips a selection without a mapped scalar in %s', (value, selection) => {
  expect(resolve(value, selection)).toBeUndefined();
});

import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '../../..');

const inlineActionTables = [
  'src/pages/embeddedProduct/pages/List/index.tsx',
  'src/pages/warning/shield/index.tsx',
  'src/pages/notificationRules/pages/List.tsx',
  'src/pages/aiConfig/llmConfigs/pages/List.tsx',
  'src/pages/variableConfigs/index.tsx',
];

describe('tables with lightweight row actions', () => {
  it.each(inlineActionTables)('%s surfaces row actions inline', (file) => {
    const source = readFileSync(path.join(root, file), 'utf8');

    expect(source).toContain('inline: [');
    expect(source).not.toContain('rowActionDisplay');
  });
});

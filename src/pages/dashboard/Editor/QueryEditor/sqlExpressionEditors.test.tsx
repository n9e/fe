/** @jest-environment jsdom */

import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import { fireEvent, render, screen } from '@testing-library/react';

import IotDBQueryBuilder from '@/plugins/iotdb/Dashboard/QueryBuilder';
import TDengineQueryBuilder from '@/plugins/TDengine/Dashboard/QueryBuilder';
import type { ITarget } from '@/pages/dashboard/types';

jest.mock('@/utils/constant', () => ({
  alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  DatasourceCateEnum: { iotdb: 'iotdb', tdengine: 'tdengine' },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'db_iotdb:query.query' || key === 'db_tdengine:query.query' ? 'SQL' : key),
  }),
}));

jest.mock(
  '@/components/UsageDocs',
  () =>
    ({ children }: { children: React.ReactNode }) =>
      children,
);
jest.mock('@/plugins/iotdb/components/AdvancedSettings', () => () => null);
jest.mock('@/plugins/iotdb/components/Meta', () => ({ MetaModal: () => null }));
jest.mock('@/plugins/TDengine/components/AdvancedSettings', () => () => null);
jest.mock('@/plugins/TDengine/components/Meta', () => ({ MetaModal: () => null }));
jest.mock('@/plugins/TDengine/components/SqlTemplates', () => () => null);

const sqlTarget = {
  refId: 'A',
  query: { query: 'SELECT time, value FROM metrics' },
} satisfies ITarget;

function renderEditor(Editor: typeof IotDBQueryBuilder, targets: ITarget[]) {
  let form: FormInstance;
  function TestForm() {
    const [instance] = Form.useForm();
    form = instance;
    return (
      <Form form={instance} initialValues={{ targets }}>
        <Editor datasourceValue={1} />
      </Form>
    );
  }
  render(<TestForm />);
  return { getTargets: () => form.getFieldValue('targets') as ITarget[] };
}

describe.each([
  ['IoTDB', IotDBQueryBuilder],
  ['TDengine', TDengineQueryBuilder],
] as const)('%s dashboard expression compatibility', (_name, Editor) => {
  it.each([{ kind: 'expression' }, { __mode__: '__expr__' }])('edits an existing expression with marker %j without changing SQL', (marker) => {
    const expressionTarget = { ...marker, refId: 'B', expression: '$A * 2' } as ITarget;
    const { getTargets } = renderEditor(Editor, [sqlTarget, expressionTarget]);

    expect(screen.getAllByRole('textbox', { name: /SQL/ })).toHaveLength(1);
    expect(screen.getByLabelText('Expression')).toHaveValue('$A * 2');
    expect(screen.getByRole('textbox', { name: /SQL/ })).toHaveValue(sqlTarget.query.query);
    expect(getTargets()).toEqual([sqlTarget, expressionTarget]);

    fireEvent.change(screen.getByLabelText('Expression'), { target: { value: '$A / 100' } });

    expect(getTargets()).toEqual([sqlTarget, { ...expressionTarget, expression: '$A / 100' }]);
    expect(screen.getByRole('textbox', { name: /SQL/ })).toHaveValue(sqlTarget.query.query);
  });
});

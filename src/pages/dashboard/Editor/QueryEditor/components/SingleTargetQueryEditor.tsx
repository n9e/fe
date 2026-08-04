import React, { useLayoutEffect } from 'react';
import { Form } from 'antd';

import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { ITarget } from '@/pages/dashboard/types';

import { getDashboardDatasourceDefinition } from '../registry';
import SingleTargetQueryPanel from './SingleTargetQueryPanel';
import TargetDatasourceSelect from './TargetDatasourceSelect';

interface Props {
  target: ITarget;
  type: string;
  panelWidth?: number;
  range: IRawTimeRange;
  datasourceValue?: number;
  onChange: (target: ITarget) => void;
  headerActions?: React.ReactNode;
}

interface QueryFormProps extends Omit<Props, 'headerActions'> {
  QueryEditor: React.ComponentType<any>;
}

function QueryForm({ target, type, panelWidth, range, datasourceValue, onChange, QueryEditor }: QueryFormProps) {
  const [form] = Form.useForm();

  // 仅在挂载/身份切换时同步初始值；组件已按 cate-datasourceValue 作为 key 重建，
  // 把 target 放进依赖会在每次按键回传后重置子表单，打断输入与光标。
  useLayoutEffect(() => {
    form.setFieldsValue({
      type,
      datasourceCate: target.datasource?.cate,
      datasourceValue,
      targets: [target],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, type, datasourceValue]);

  return (
    <Form
      component={false}
      form={form}
      onValuesChange={() => {
        const nextTarget = form.getFieldValue(['targets', 0]);
        if (nextTarget) {
          onChange({
            ...nextTarget,
            kind: 'query',
            datasource: target.datasource,
          });
        }
      }}
    >
      <QueryEditor panelWidth={panelWidth} cate={target.datasource!.cate} datasourceValue={datasourceValue} range={range} />
    </Form>
  );
}

export default function SingleTargetQueryEditor({ target, type, panelWidth, range, datasourceValue, onChange, headerActions }: Props) {
  const datasourceDefinition = target.datasource?.cate ? getDashboardDatasourceDefinition(target.datasource.cate) : undefined;
  const QueryEditor = datasourceDefinition?.QueryEditor;

  if (!target.datasource?.cate || typeof datasourceValue !== 'number' || !QueryEditor) return null;

  const datasourceSelect = <TargetDatasourceSelect target={target} onTargetChange={onChange} />;

  return (
    <div className='n9e-dashboard-single-target-query-editor'>
      <SingleTargetQueryPanel refId={target.refId} datasourceSelect={datasourceSelect} actions={headerActions}>
        <QueryForm
          key={`${target.datasource.cate}-${datasourceValue}`}
          target={target}
          type={type}
          panelWidth={panelWidth}
          range={range}
          datasourceValue={datasourceValue}
          onChange={onChange}
          QueryEditor={QueryEditor}
        />
      </SingleTargetQueryPanel>
    </div>
  );
}

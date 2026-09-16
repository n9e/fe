import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { Form } from 'antd';
import _ from 'lodash';

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
  QueryEditor: typeof import('../QueryBuilder').default;
}

export function QueryForm({ target, type, panelWidth, range, datasourceValue, onChange, QueryEditor }: QueryFormProps) {
  const [form] = Form.useForm();
  const currentTarget = Form.useWatch(['targets', 0], form) as ITarget | undefined;
  const onChangeRef = useRef(onChange);
  const targetRef = useRef(target);
  const lastSyncedTargetRef = useRef<ITarget>(target);

  // 初始值必须在首帧就存在：Doris 等编辑器会据此决定是否渲染内容。QueryForm
  // 按 cate-datasourceValue 重建，因此无需在每次 target 回传后重置表单。
  const initialValues = {
    type,
    datasourceCate: target.datasource?.cate,
    datasourceValue,
    targets: [target],
  };

  // Form.Item 注册后立刻同步类型，避免 Doris 这类依赖 type 的编辑器首帧空白；
  // 图表类型随后变化时也只更新该字段，不覆盖正在编辑的查询条件。
  useLayoutEffect(() => {
    form.setFieldsValue({ type });
  }, [form, type]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // 外层表单可能独立更新 hide、legend 等元数据。内层表单随后改 SQL 时，
  // 必须以最新 target 为基底合并，避免用旧闭包把这些元数据覆盖回去。
  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  // SQL Builder 等操作通过 form.setFields 写值，Ant Design 不会为这类程序写入
  // 触发 onValuesChange。直接监听目标值，保证内层表单的所有变更都能回传外层。
  useEffect(() => {
    if (!currentTarget) return;
    const latestTarget = targetRef.current;
    const nextTarget = {
      ...latestTarget,
      ...currentTarget,
      query: {
        ...(latestTarget.query ?? {}),
        ...(currentTarget.query ?? {}),
      },
      kind: 'query' as const,
      datasource: latestTarget.datasource,
    };
    if (_.isEqual(nextTarget, lastSyncedTargetRef.current)) return;
    lastSyncedTargetRef.current = _.cloneDeep(nextTarget);
    onChangeRef.current(nextTarget);
  }, [currentTarget]);

  return (
    <Form component={false} form={form} initialValues={initialValues}>
      <Form.Item name='type' hidden>
        <div />
      </Form.Item>
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

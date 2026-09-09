import React, { useContext } from 'react';
import { Form } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import { IS_PLUS } from '@/utils/constant';
import type { DashboardDatasource, ITarget } from '@/pages/dashboard/types';
import { useGlobalState } from '@/pages/dashboard/globalState';

import { createDashboardQueryTarget } from '../registry';

interface Props {
  fieldName?: number;
  target?: ITarget;
  onTargetChange?: (target: ITarget) => void;
}

export default function TargetDatasourceSelect({ fieldName, target, onTargetChange }: Props) {
  const form = Form.useFormInstance();
  const { datasourceCateOptions, datasourceList } = useContext(CommonStateContext);
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const datasourceVars = _.filter(variablesWithOptions, (item) => _.includes(['datasource', 'datasourceIdentifier'], item.type));

  // 运行时支持字符串模板变量数据源（如 ${var}），id 可为 string | number
  type DatasourceOption = Pick<DashboardDatasource, 'name' | 'plugin_type' | 'is_default' | 'identifier'> & { id: string | number };
  const getDatasourceOptions = (list: DatasourceOption[]): DatasourceOption[] =>
    _.filter(
      _.concat(
        _.map(
          datasourceVars,
          (item): DatasourceOption => ({
            id: `\${${item.name}}`,
            name: `\${${item.name}}`,
            plugin_type: item.definition,
            is_default: false,
          }),
        ),
        list,
      ),
      (item) => {
        const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
        return cateData?.dashboard === true && (cateData.graphPro ? IS_PLUS : true);
      },
    );

  const handleDatasourceChange = (datasourceId: number | string) => {
    const targets = [...(form.getFieldValue('targets') ?? [])] as ITarget[];
    const currentTarget = target ?? (fieldName === undefined ? undefined : targets[fieldName]);
    const datasourceCate = _.find(getDatasourceOptions(datasourceList), {
      id: datasourceId,
    })?.plugin_type;
    if (!datasourceCate) return;
    const nextTarget = {
      ...createDashboardQueryTarget(datasourceCate, datasourceId, currentTarget?.refId ?? 'A'),
      hide: currentTarget?.hide,
      legend: currentTarget?.legend,
    };
    if (onTargetChange) {
      onTargetChange(nextTarget);
    } else if (fieldName !== undefined) {
      targets[fieldName] = nextTarget;
      form.setFieldsValue({ targets });
    }
  };

  const select = (
    <DatasourceSelectV3
      size='small'
      style={{ minWidth: 220 }}
      datasourceCateList={datasourceCateOptions}
      ajustDatasourceList={getDatasourceOptions}
      value={target?.datasource?.id}
      onChange={handleDatasourceChange}
    />
  );

  if (onTargetChange) return select;
  if (fieldName === undefined) return null;

  return (
    <>
      <Form.Item name={[fieldName, 'datasource', 'cate']} hidden>
        <div />
      </Form.Item>
      <Form.Item
        name={[fieldName, 'datasource', 'id']}
        rules={[
          {
            required: true,
          },
        ]}
        noStyle
      >
        {select}
      </Form.Item>
    </>
  );
}

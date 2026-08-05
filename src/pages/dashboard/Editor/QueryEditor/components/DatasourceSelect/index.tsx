import React, { useContext } from 'react';
import { Form, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import { CommonStateContext } from '@/App';
import getDefaultTargets from '@/pages/dashboard/utils/getDefaultTargets';
import { IS_PLUS } from '@/utils/constant';
import type { IVariable } from '@/pages/dashboard/Variables/types';
import type { DashboardDatasource } from '@/pages/dashboard/types';

import DatasourceSelectExtra from './DatasourceSelectExtra';

interface DatasourceSelectProps {
  datasourceCate?: string;
  datasourceValue?: number | string;
  variablesWithOptions: IVariable[];
}

export default function index({ datasourceCate, datasourceValue, variablesWithOptions }: DatasourceSelectProps) {
  const { t } = useTranslation('dashboard');
  const { datasourceCateOptions } = useContext(CommonStateContext);
  const datasourceVars = _.filter(variablesWithOptions, (item) => {
    return _.includes(['datasource', 'datasourceIdentifier'], item.type);
  });
  const chartForm = Form.useFormInstance();

  return (
    <>
      <Form.Item name='datasourceCate' hidden>
        <div />
      </Form.Item>
      <Space align='start'>
        <InputGroupWithFormItem label={t('common:datasource.id')}>
          <Form.Item
            name='datasourceValue'
            rules={[
              {
                required: true,
                message: t('common:datasource.id_required'),
              },
            ]}
          >
            <DatasourceSelectV3
              style={{ minWidth: 220 }}
              datasourceCateList={datasourceCateOptions}
              ajustDatasourceList={(list) => {
                const data = _.filter(
                  _.concat(
                    _.map(datasourceVars, (item) => {
                      return {
                        id: `\${${item.name}}`,
                        name: `\${${item.name}}`,
                        plugin_type: item.definition,
                        is_default: false,
                      };
                    }),
                    list as DashboardDatasource[],
                  ),
                  (item) => {
                    const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
                    return cateData?.dashboard === true && (cateData.graphPro ? IS_PLUS : true);
                  },
                );
                return data;
              }}
              additionalOptions={[
                {
                  value: 'mixed',
                  filter: 'mixed 混用数据源',
                  optionLabel: t('query.mixed_datasource', '混用数据源'),
                  label: t('query.mixed_datasource', '混用数据源'),
                },
              ]}
              onChange={(val, cate) => {
                if (cate === 'mixed') {
                  const previousCate = datasourceCate || chartForm.getFieldValue('datasourceCate');
                  const previousValue = datasourceValue ?? chartForm.getFieldValue('datasourceValue');
                  const targets = chartForm.getFieldValue('targets') ?? [];
                  const targetDatasource = _.find(targets, (target) => target.datasource)?.datasource;
                  chartForm.setFieldsValue({
                    datasourceCate: 'mixed',
                    datasourceValue: 'mixed',
                    targets: _.map(targets, (target) => {
                      if (target.kind === 'expression' || target.__mode__ === '__expr__') return target;
                      return {
                        ...target,
                        datasource: {
                          cate: previousCate === 'mixed' ? targetDatasource?.cate ?? 'prometheus' : previousCate || targetDatasource?.cate || 'prometheus',
                          id: previousValue === 'mixed' ? targetDatasource?.id : previousValue ?? targetDatasource?.id,
                        },
                      };
                    }),
                  });
                  return;
                }
                if (!cate) return;
                const previousCate = chartForm.getFieldValue('datasourceCate');
                chartForm.setFieldsValue({
                  datasourceCate: cate,
                  datasourceValue: val,
                  ...(previousCate !== cate ? { targets: getDefaultTargets(cate as import('@/utils/constant').DatasourceCateEnum) } : {}),
                });
              }}
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <DatasourceSelectExtra datasourceValue={datasourceValue} />
      </Space>
    </>
  );
}

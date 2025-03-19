import React, { useContext, useRef } from 'react';
import { Form, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { DatasourceSelectV2 } from '@/components/DatasourceSelect';
import { CommonStateContext } from '@/App';

import DatasourceSelectExtra from './DatasourceSelectExtra';

export default function index({ dashboardId, chartForm, variableConfig }) {
  const { t } = useTranslation('dashboard');
  const { datasourceCateOptions, datasourceList } = useContext(CommonStateContext);
  const datasourceVars = _.filter(variableConfig, { type: 'datasource' });

  return (
    <Space align='start'>
      <Form.Item name='datasourceCate' hidden>
        <div />
      </Form.Item>
      <InputGroupWithFormItem label={t('common:datasource.id')}>
        <Form.Item
          name='datasourceValue'
          rules={[
            {
              required: true,
              message: t('query.datasource_msg'),
            },
          ]}
        >
          <DatasourceSelectV2
            style={{ minWidth: 220 }}
            datasourceCateList={_.filter(datasourceCateOptions, (item) => {
              return item.dashboard === true;
            })}
            datasourceList={_.filter(
              _.concat(
                _.map(datasourceVars, (item) => {
                  return {
                    id: `\${${item.name}}`,
                    name: `\${${item.name}}`,
                    plugin_type: item.definition,
                  };
                }),
                datasourceList as any,
              ),
              (item) => {
                const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
                return cateData?.dashboard === true;
              },
            )}
            onChange={(val) => {
              const preCate = chartForm.getFieldValue('datasourceCate');
              const curCate = _.find(
                _.concat(
                  _.map(datasourceVars, (item) => {
                    return {
                      id: `\${${item.name}}`,
                      name: `\${${item.name}}`,
                      plugin_type: item.definition,
                    };
                  }),
                  datasourceList as any,
                ),
                { id: val },
              )?.plugin_type;
              // TODO: 调整数据源类型后需要重置配置
              if (preCate !== curCate) {
                if (_.includes(['elasticsearch', 'opensearch'], curCate)) {
                  chartForm.setFieldsValue({
                    datasourceCate: curCate,
                    targets: [
                      {
                        refId: 'A',
                        query: {
                          index: '',
                          filters: '',
                          values: [
                            {
                              func: 'count',
                            },
                          ],
                          date_field: '@timestamp',
                        },
                      },
                    ],
                  });
                } else if (curCate === 'zabbix') {
                  chartForm.setFieldsValue({
                    datasourceCate: curCate,
                    targets: [
                      {
                        refId: 'A',
                        query: {
                          mode: 'timeseries',
                          subMode: 'metrics',
                        },
                      },
                    ],
                  });
                } else {
                  chartForm.setFieldsValue({
                    datasourceCate: curCate,
                    targets: [
                      {
                        refId: 'A',
                      },
                    ],
                  });
                }
              }
            }}
          />
        </Form.Item>
      </InputGroupWithFormItem>
      <DatasourceSelectExtra dashboardId={dashboardId} variableConfig={variableConfig} />
    </Space>
  );
}

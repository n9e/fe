import React, { useContext } from 'react';
import { Form, Input, Select, Space } from 'antd';
import Icon from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { ProSvg } from '@/components/DatasourceSelect';
import { CommonStateContext } from '@/App';

const defaultDatasourceCate = 'prometheus';

export default function index({ chartForm, variableConfig }) {
  const { t } = useTranslation('dashboard');
  const { groupedDatasourceList, datasourceCateOptions } = useContext(CommonStateContext);
  const cates = _.filter(datasourceCateOptions, (item) => {
    return !!item.dashboard;
  });
  const datasourceVars = _.filter(variableConfig, { type: 'datasource' });
  const getDefaultDatasourceValue = (datasourceCate) => {
    const finded = _.find(datasourceVars, { definition: datasourceCate });
    if (finded) {
      return `\${${finded.name}}`;
    }
    return groupedDatasourceList[datasourceCate]?.[0]?.id;
  };

  return (
    <Space align='start'>
      <Input.Group>
        <span className='ant-input-group-addon'>{t('common:datasource.type')}</span>
        <Form.Item name='datasourceCate' noStyle initialValue={defaultDatasourceCate}>
          <Select
            dropdownMatchSelectWidth={false}
            style={{ minWidth: 70 }}
            onChange={(val) => {
              // TODO: 调整数据源类型后需要重置配置
              // setTimeout(() => {
              if (val === 'prometheus') {
                chartForm.setFieldsValue({
                  targets: [
                    {
                      refId: 'A',
                      expr: '',
                    },
                  ],
                  datasourceValue: getDefaultDatasourceValue('prometheus'),
                });
              } else if (val === 'elasticsearch' || val === 'opensearch') {
                chartForm.setFieldsValue({
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
                        interval: 1,
                        interval_unit: 'min',
                      },
                    },
                  ],
                  datasourceValue: getDefaultDatasourceValue(val),
                });
              } else if (val === 'zabbix') {
                chartForm.setFieldsValue({
                  targets: [
                    {
                      refId: 'A',
                      query: {
                        mode: 'timeseries',
                        subMode: 'metrics',
                      },
                    },
                  ],
                  datasourceValue: undefined,
                });
              } else {
                chartForm.setFieldsValue({
                  targets: [
                    {
                      refId: 'A',
                    },
                  ],
                  datasourceValue: undefined,
                });
              }
              // }, 500);
            }}
          >
            {_.map(cates, (item) => (
              <Select.Option key={item.value} value={item.value}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.graphPro ? <Icon component={ProSvg as any} style={{ color: '#6C53B1', fontSize: 14 }} /> : null}
                  {item.label}
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Input.Group>
      <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
        {({ getFieldValue }) => {
          const cate = getFieldValue('datasourceCate') || defaultDatasourceCate;
          return (
            <Input.Group compact>
              <span
                className='ant-input-group-addon'
                style={{
                  width: 'max-content',
                  height: 32,
                  lineHeight: '32px',
                }}
              >
                {t('common:datasource.id')}
              </span>
              <Form.Item
                name='datasourceValue'
                rules={[
                  {
                    required: true,
                    message: t('query.datasource_msg'),
                  },
                ]}
                initialValue={getDefaultDatasourceValue(defaultDatasourceCate)}
              >
                <Select allowClear placeholder={t('query.datasource_placeholder')} style={{ minWidth: 70 }} dropdownMatchSelectWidth={false} showSearch optionFilterProp='children'>
                  {_.map(datasourceVars, (item, idx) => {
                    return (
                      <Select.Option value={`\${${item.name}}`} key={`${item.name}_${idx}`}>
                        {`\${${item.name}}`}
                      </Select.Option>
                    );
                  })}
                  {_.map(groupedDatasourceList[cate], (item) => (
                    <Select.Option value={item.id} key={item.id}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Input.Group>
          );
        }}
      </Form.Item>
    </Space>
  );
}

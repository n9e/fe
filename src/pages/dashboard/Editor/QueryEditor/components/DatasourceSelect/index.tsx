import React, { useContext } from 'react';
import { Form, Input, Select, Space } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getAuthorizedDatasourceCates } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';

const defaultDatasourceCate = 'prometheus';

export default function index({ chartForm, defaultDatasourceValue, variableConfig }) {
  const { t } = useTranslation('dashboard');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const cates = getAuthorizedDatasourceCates();
  const datasourceVars = _.filter(variableConfig, { type: 'datasource' });

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
              setTimeout(() => {
                if (val === 'prometheus') {
                  chartForm.setFieldsValue({
                    targets: [
                      {
                        refId: 'A',
                        expr: '',
                      },
                    ],
                    datasourceValue: undefined,
                  });
                } else if (val === 'elasticsearch') {
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
                    datasourceValue: groupedDatasourceList.elasticsearch?.[0]?.id,
                  });
                }
              }, 500);
            }}
          >
            {_.map(cates, (item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
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
                    required: cate !== 'prometheus',
                    message: t('query.datasource_msg'),
                  },
                ]}
              >
                <Select
                  allowClear
                  placeholder={cate !== 'prometheus' ? t('query.datasource_placeholder') : _.find(groupedDatasourceList.prometheus, { id: defaultDatasourceValue })?.name}
                  style={{ minWidth: 70 }}
                  dropdownMatchSelectWidth={false}
                >
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

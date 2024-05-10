import React, { useContext, useRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Select, Row, Col, Input } from 'antd';
import { CloseCircleOutlined } from '@ant-design/icons';
import PrometheusExplorer from '@/pages/explorer/Prometheus';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import EmptyDatasourcePopover from '@/components/DatasourceSelect/EmptyDatasourcePopover';
import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';
import { CommonStateContext } from '@/App';
import { Record } from '../services';

interface Props {
  panel: Record;
  panels: Record[];
  setPanels: (panels: Record[]) => void;
  onChange: (promql?: string) => void;
}

export default function Panel(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { panel, panels, setPanels, onChange } = props;
  const [form] = Form.useForm();
  const headerExtraRef = useRef<HTMLDivElement>(null);

  return (
    <div className='n9e-fill-color-2 n9e-border-base' style={{ padding: 16, maxHeight: 650, marginBottom: 16, position: 'relative', display: 'flex' }}>
      <div className='explorer-container'>
        <Form
          form={form}
          initialValues={{
            datasourceCate: 'prometheus',
            datasourceValue: getDefaultDatasourceValue('prometheus', groupedDatasourceList),
          }}
        >
          <div className='explorer-content'>
            <Row gutter={8}>
              <Col>
                <InputGroupWithFormItem label={t('common:datasource.type')}>
                  <Form.Item name='datasourceCate' noStyle>
                    <Select
                      value='prometheus'
                      options={[
                        {
                          label: 'Prometheus',
                          value: 'prometheus',
                        },
                      ]}
                    />
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
              <Col>
                <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue('datasourceCate');
                    return (
                      <EmptyDatasourcePopover datasourceCate={cate} datasourceList={groupedDatasourceList[cate]}>
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
                                message: t('common:datasource.id_required'),
                              },
                            ]}
                          >
                            <Select
                              style={{ minWidth: 70 }}
                              dropdownMatchSelectWidth={false}
                              onChange={(val: string) => {
                                setDefaultDatasourceValue(cate, val);
                                if (cate !== 'prometheus') {
                                  form.setFieldsValue({
                                    query: undefined,
                                  });
                                  form.setFieldsValue({
                                    query: {
                                      range: {
                                        start: 'now-1h',
                                        end: 'now',
                                      },
                                    },
                                  });
                                }
                              }}
                              showSearch
                              optionFilterProp='children'
                            >
                              {_.map(groupedDatasourceList[cate], (item) => (
                                <Select.Option value={item.id} key={item.id}>
                                  {item.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Input.Group>
                      </EmptyDatasourcePopover>
                    );
                  }}
                </Form.Item>
              </Col>
              <Col flex={'1'}>
                <div ref={headerExtraRef} />
              </Col>
            </Row>
            <div style={{ minHeight: 0, height: '100%' }}>
              <Form.Item shouldUpdate noStyle>
                {({ getFieldValue }) => {
                  const datasourceValue = getFieldValue('datasourceValue');
                  return (
                    <PrometheusExplorer
                      headerExtra={headerExtraRef.current}
                      datasourceValue={datasourceValue}
                      form={form}
                      showBuiltinMetrics={false}
                      promQL={panel.expression}
                      defaultUnit={panel.unit}
                      showGlobalMetrics={false}
                      showBuilder={false}
                      onChange={(promQL) => {
                        onChange(promQL);
                      }}
                      promQLInputTooltip={panel.name}
                    />
                  );
                }}
              </Form.Item>
            </div>
          </div>
        </Form>
      </div>

      {panels.length > 1 && (
        <CloseCircleOutlined
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: 14,
          }}
          onClick={() => {
            setPanels(_.filter(panels, (item) => item.uid !== panel.uid));
          }}
        />
      )}
    </div>
  );
}

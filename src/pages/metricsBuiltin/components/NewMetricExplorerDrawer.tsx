import React, { useContext, useRef, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Select, Row, Col, Input, Drawer } from 'antd';

import PrometheusExplorer from '@/pages/explorer/Prometheus';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import EmptyDatasourcePopover from '@/components/DatasourceSelect/EmptyDatasourcePopover';
import { setDefaultDatasourceValue } from '@/utils';
import { CommonStateContext } from '@/App';

interface Props {
  datasourceValue?: number;
  promql?: string;
  visible: boolean;
  onClose: () => void;
}

export default function NewMetricExplorerDrawer(props: Props) {
  const { t } = useTranslation('metricsBuiltin');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { promql, visible, onClose } = props;
  const [form] = Form.useForm();
  const headerExtraRef = useRef<HTMLDivElement>(null);
  const datasourceCate = Form.useWatch('datasourceCate', form);
  const datasourceValue = Form.useWatch('datasourceValue', form);

  useEffect(() => {
    form.setFieldsValue({
      datasourceCate: 'prometheus',
      datasourceValue: props.datasourceValue,
    });
  }, [props.datasourceValue]);

  return (
    <Drawer title={t('laset_over_time')} placement='right' width='80%' onClose={onClose} visible={visible}>
      <div className='h-full overflow-hidden children:h-full'>
        <Form form={form}>
          <div className='flex flex-col h-full'>
            <Row gutter={8} className='flex-shrink-0'>
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
                    <Select
                      style={{ minWidth: 70 }}
                      dropdownMatchSelectWidth={false}
                      onChange={(val: string) => {
                        setDefaultDatasourceValue(datasourceCate, val);
                      }}
                      showSearch
                      optionFilterProp='children'
                    >
                      {_.map(groupedDatasourceList[datasourceCate], (item) => (
                        <Select.Option value={item.id} key={item.id}>
                          {item.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </InputGroupWithFormItem>
              </Col>
              <Col flex={'1'}>
                <div ref={headerExtraRef} />
              </Col>
            </Row>
            <div className='min-h-0 h-full flex-1'>
              <PrometheusExplorer
                headerExtra={headerExtraRef.current}
                datasourceValue={datasourceValue}
                form={form}
                showBuiltinMetrics={false}
                promQL={promql}
                showGlobalMetrics={false}
                showBuilder={false}
                defaultUnit='datetimeSeconds'
              />
            </div>
          </div>
        </Form>
      </div>
    </Drawer>
  );
}

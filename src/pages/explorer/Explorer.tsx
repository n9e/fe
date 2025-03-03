/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/**
 * querystring
 * data_source_name: string
 * data_source_id: string
 */
import React, { useRef, useContext } from 'react';
import { Input, Form, Select, Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import EmptyDatasourcePopover from '@/components/DatasourceSelect/EmptyDatasourcePopover';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';
import { CommonStateContext } from '@/App';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import { Explorer as TDengine } from '@/plugins/TDengine';
import { Explorer as CK } from '@/plugins/clickHouse';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';
import Loki from './Loki';
import Help from './components/Help';
import './index.less';

// @ts-ignore
import PlusExplorer from 'plus:/parcels/Explorer';

type Type = 'logging' | 'metric' | 'loki';

interface IProps {
  type: Type;
  defaultCate: string;
  panelIdx?: number;
  defaultFormValuesControl?: {
    isInited?: boolean;
    setIsInited: () => void;
    defaultFormValues?: any;
    setDefaultFormValues?: (query: any) => void;
  };
}

const Panel = ({ type, defaultCate, panelIdx, defaultFormValuesControl }: IProps) => {
  const { t } = useTranslation('explorer');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [form] = Form.useForm();
  const history = useHistory();
  const headerExtraRef = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(useLocation().search);
  const defaultDatasourceCate = params.get('data_source_name') || localStorage.getItem(`explorer_datasource_cate_${type}`) || defaultCate;
  const defaultDatasourceValue = params.get('data_source_id') ? _.toNumber(params.get('data_source_id')) : getDefaultDatasourceValue(defaultDatasourceCate, groupedDatasourceList);
  const datasourceCate = Form.useWatch('datasourceCate', form);
  const explorerContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div className='explorer-container' ref={explorerContainerRef}>
      <Form
        form={form}
        initialValues={{
          datasourceCate: defaultDatasourceCate,
          datasourceValue: defaultDatasourceValue,
        }}
      >
        <div className='explorer-content'>
          <Row gutter={8}>
            <Col>
              <InputGroupWithFormItem label={t('common:datasource.type')} addonAfterWithContainer={<Help datasourceCate={datasourceCate} />}>
                <Form.Item name='datasourceCate' noStyle>
                  <DatasourceCateSelect
                    scene='graph'
                    filterCates={(cates) => {
                      return _.filter(cates, (item) => _.includes(item.type, type));
                    }}
                    dropdownMatchSelectWidth={false}
                    style={{ minWidth: 70 }}
                    onChange={(val) => {
                      form.setFieldsValue({
                        datasourceValue: getDefaultDatasourceValue(val, groupedDatasourceList),
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
                      if (panelIdx === 0) {
                        history.replace({
                          search: `?data_source_name=${val}&data_source_id=${getDefaultDatasourceValue(val, groupedDatasourceList)}`,
                        });
                      }
                    }}
                  />
                </Form.Item>
              </InputGroupWithFormItem>
            </Col>
            <Col>
              {explorerContainerRef.current && (
                <EmptyDatasourcePopover
                  datasourceCate={datasourceCate}
                  datasourceList={groupedDatasourceList[datasourceCate]}
                  getPopupContainer={() => {
                    if (explorerContainerRef.current) {
                      return explorerContainerRef.current;
                    }
                    return document.body;
                  }}
                >
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
                          setDefaultDatasourceValue(datasourceCate, val);
                          if (datasourceCate !== 'prometheus') {
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
                          if (panelIdx === 0) {
                            history.replace({
                              search: `?data_source_name=${datasourceCate}&data_source_id=${val}`,
                            });
                          }
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
                  </Input.Group>
                </EmptyDatasourcePopover>
              )}
            </Col>
            <Col flex={'1'}>
              <div ref={headerExtraRef} />
            </Col>
          </Row>
          <div style={{ minHeight: 0, height: '100%' }}>
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const datasourceCate = getFieldValue('datasourceCate');
                const datasourceValue = getFieldValue('datasourceValue');
                if (datasourceCate === DatasourceCateEnum.elasticsearch) {
                  return <Elasticsearch headerExtra={headerExtraRef.current} datasourceValue={datasourceValue} form={form} defaultFormValuesControl={defaultFormValuesControl} />;
                } else if (datasourceCate === DatasourceCateEnum.prometheus) {
                  return (
                    <Prometheus headerExtra={headerExtraRef.current} datasourceValue={datasourceValue} form={form} panelIdx={panelIdx} allowReplaceHistory showBuilder={false} />
                  );
                } else if (datasourceCate === DatasourceCateEnum.tdengine) {
                  return <TDengine datasourceValue={datasourceValue} form={form} />;
                } else if (datasourceCate === DatasourceCateEnum.loki) {
                  return <Loki datasourceValue={datasourceValue} headerExtra={headerExtraRef.current} form={form} defaultFormValuesControl={defaultFormValuesControl} />;
                } else if (datasourceCate === DatasourceCateEnum.ck) {
                  return <CK datasourceValue={datasourceValue} headerExtra={headerExtraRef.current} />;
                }
                return (
                  <PlusExplorer
                    datasourceCate={datasourceCate}
                    datasourceValue={datasourceValue}
                    headerExtraRef={headerExtraRef}
                    form={form}
                    defaultFormValuesControl={defaultFormValuesControl}
                  />
                );
              }}
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default Panel;

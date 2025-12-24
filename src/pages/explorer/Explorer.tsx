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
import React, { useRef, useContext, useEffect } from 'react';
import { Form, Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';

import { DatasourceSelectV3 } from '@/components/DatasourceSelect';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';
import { CommonStateContext } from '@/App';
import { Explorer as TDengine } from '@/plugins/TDengine';
import { Explorer as CK } from '@/plugins/clickHouse';
import { allCates } from '@/components/AdvancedWrap/utils';
import ViewSelect from '@/components/ViewSelect';

import { useGlobalState } from './globalState';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';
import Loki from './Loki';
import Help from './components/Help';
import './index.less';

// @ts-ignore
import PlusExplorer from 'plus:/parcels/Explorer';

type Type = 'logging' | 'metric';

interface Query {
  datasourceCate: string;
  datasourceValue: number;
  [key: string]: string | number;
}

interface IProps {
  tabKey: string;
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

function getDefaultDatasourceCate(datasourceList, defaultCate) {
  // 如果 defaultCate 存在于 datasourceList 中，直接返回
  if (_.find(datasourceList, { plugin_type: defaultCate })) {
    return defaultCate;
  }
  const findResult = _.find(datasourceList, (item) => {
    const cateObj = _.find(allCates, { value: item.plugin_type });
    if (cateObj && _.includes(cateObj.type, 'logging')) {
      return true;
    }
  });
  if (findResult) {
    return findResult.plugin_type;
  }
  return defaultCate;
}

const Panel = (props: IProps) => {
  const { t } = useTranslation('explorer');
  const { type, defaultCate, panelIdx = 0, defaultFormValuesControl } = props;
  const { datasourceCateOptions, datasourceList, groupedDatasourceList } = useContext(CommonStateContext);
  const [tabKey, setTabKey] = useGlobalState('tabKey');
  const [form] = Form.useForm();
  const history = useHistory();
  const headerExtraRef = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(useLocation().search);
  const defaultDatasourceCate = params.get('data_source_name') || getDefaultDatasourceCate(datasourceList, defaultCate);
  const defaultDatasourceValue = params.get('data_source_id') ? _.toNumber(params.get('data_source_id')) : getDefaultDatasourceValue(defaultDatasourceCate, groupedDatasourceList);
  const datasourceCate = Form.useWatch('datasourceCate', form);
  const explorerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTabKey(props.tabKey);
  }, [props.tabKey]);

  return (
    <div className={`explorer-container explorer-container-${tabKey}`} ref={explorerContainerRef}>
      <Form
        form={form}
        initialValues={{
          datasourceCate: defaultDatasourceCate,
          datasourceValue: defaultDatasourceValue,
        }}
      >
        <div className='explorer-content'>
          <Row gutter={8}>
            <Col flex='none'>
              <ViewSelect<Query>
                page='logs-explorer'
                getFilterValuesJSONString={() => {
                  return JSON.stringify({});
                }}
                renderOptionExtra={(filterValues) => {
                  const { datasourceCate, datasourceValue } = filterValues;
                  return (
                    <div className='flex items-center gap-2'>
                      <img src={_.get(_.find(allCates, { value: datasourceCate }), 'logo')} alt={datasourceCate} className='w-[12px] h-[12px]' />
                      <span>{_.find(datasourceList, { id: datasourceValue })?.name ?? datasourceValue}</span>
                    </div>
                  );
                }}
                onSelect={(filterValues) => {
                  console.log(filterValues);
                }}
              />
            </Col>
            <Col flex='none'>
              <>
                <Form.Item name='datasourceCate' hidden>
                  <div />
                </Form.Item>
                <InputGroupWithFormItem label={t('common:datasource.id')} addonAfterWithContainer={<Help datasourceCate={datasourceCate} />}>
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
                        return _.filter(list, (item) => {
                          const cateData = _.find(datasourceCateOptions, { value: item.plugin_type });
                          if (cateData && _.includes(cateData.type, type)) {
                            return cateData.graphPro ? IS_PLUS : true;
                          }
                          return false;
                        });
                      }}
                      onChange={(val, datasourceCate) => {
                        setDefaultDatasourceValue(datasourceCate, val);
                        if (datasourceCate !== 'prometheus') {
                          // 先清空 query
                          form.setFieldsValue({
                            datasourceCate,
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
                        } else {
                          form.setFieldsValue({
                            datasourceCate,
                          });
                        }
                        if (panelIdx === 0) {
                          history.replace({
                            search: `?data_source_name=${datasourceCate}&data_source_id=${val}`,
                          });
                        }
                      }}
                    />
                  </Form.Item>
                </InputGroupWithFormItem>
              </>
            </Col>
            <Col flex='auto'>
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

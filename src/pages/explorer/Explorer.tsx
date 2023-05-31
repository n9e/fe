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
import React, { useState, useRef, useContext } from 'react';
import { Button, Card, Space, Input, Form, Select } from 'antd';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { generateID } from '@/utils';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import EmptyDatasourcePopover from '@/components/DatasourceSelect/EmptyDatasourcePopover';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDefaultDatasourceValue, setDefaultDatasourceValue } from '@/utils';
import { CommonStateContext } from '@/App';
import { DatasourceCateSelect } from '@/components/DatasourceSelect';
import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';
// @ts-ignore
import PlusExplorer from 'plus:/parcels/Explorer';
import './index.less';

type PanelMeta = { id: string; defaultPromQL?: string };
interface IPanelProps {
  id: string;
  defaultPromQL: string;
  removePanel: (id: string) => void;
  type: Type;
  defaultCate: string;
}
type Type = 'logging' | 'metric';

export function getUrlParamsByName(name) {
  let reg = new RegExp(`.*?${name}=([^&]*)`),
    str = location.search || '',
    target = str.match(reg);
  if (target) {
    return target[1];
  }
  return '';
}

const Panel = ({ defaultPromQL, removePanel, id, type, defaultCate }: IPanelProps) => {
  const { t } = useTranslation('explorer');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [form] = Form.useForm();
  const headerExtraRef = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams(useLocation().search);
  const [datasourceCate, setDatasourceCate] = useState(params.get('data_source_name') || localStorage.getItem(`explorer_datasource_cate_${type}`) || defaultCate);
  const datasourceValue = params.get('data_source_id') ? _.toNumber(params.get('data_source_id')) : getDefaultDatasourceValue(datasourceCate, groupedDatasourceList);
  return (
    <Card bodyStyle={{ padding: 16 }} className='panel'>
      <Form
        form={form}
        initialValues={{
          datasourceCate: datasourceCate,
          datasourceValue: datasourceValue,
        }}
      >
        <Space align='start'>
          <InputGroupWithFormItem label={t('common:datasource.type')}>
            <Form.Item name='datasourceCate' noStyle>
              <DatasourceCateSelect
                scene='graph'
                filterCates={(cates) => {
                  return _.filter(cates, (item) => item.type === type);
                }}
                dropdownMatchSelectWidth={false}
                style={{ minWidth: 70 }}
                onChange={(val) => {
                  if (typeof val === 'string') {
                    setDatasourceCate(val);
                  }
                  form.setFieldsValue({
                    datasourceValue: getDefaultDatasourceValue(val, groupedDatasourceList),
                  });
                }}
              />
            </Form.Item>
          </InputGroupWithFormItem>
          <Form.Item shouldUpdate={(prev, curr) => prev.datasourceCate !== curr.datasourceCate} noStyle>
            {({ getFieldValue }) => {
              const cate = getFieldValue('datasourceCate');
              return (
                <EmptyDatasourcePopover datasourceList={groupedDatasourceList[cate]}>
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
                        }}
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
          <div ref={headerExtraRef} />
        </Space>
        <Form.Item shouldUpdate noStyle>
          {({ getFieldValue }) => {
            const datasourceCate = getFieldValue('datasourceCate');
            const datasourceValue = getFieldValue('datasourceValue');
            if (datasourceCate === DatasourceCateEnum.elasticsearch) {
              return <Elasticsearch key={datasourceValue} datasourceValue={datasourceValue} form={form} />;
            } else if (datasourceCate === DatasourceCateEnum.prometheus) {
              return <Prometheus key={datasourceValue} defaultPromQL={defaultPromQL} headerExtra={headerExtraRef.current} datasourceValue={datasourceValue} form={form} />;
            }
            return <PlusExplorer datasourceCate={datasourceCate} datasourceValue={datasourceValue} headerExtraRef={headerExtraRef} form={form} />;
          }}
        </Form.Item>
      </Form>
      <span
        className='remove-panel-btn'
        onClick={() => {
          removePanel(id);
        }}
      >
        <CloseCircleOutlined />
      </span>
    </Card>
  );
};

interface IProps {
  type: Type;
  defaultCate: string;
}

const PanelList = ({ type, defaultCate }: IProps) => {
  const { t } = useTranslation('explorer');
  const [panelList, setPanelList] = useState<PanelMeta[]>([{ id: generateID(), defaultPromQL: decodeURIComponent(getUrlParamsByName('promql')) }]);

  // 添加一个查询面板
  function addPanel() {
    setPanelList(() => [
      ...panelList,
      {
        id: generateID(),
      },
    ]);
  }

  // 删除指定查询面板
  function removePanel(id) {
    setPanelList(_.filter(panelList, (item) => item.id !== id));
  }

  return (
    <>
      {panelList.map(({ id, defaultPromQL = '' }) => {
        return <Panel key={id} id={id} removePanel={removePanel} defaultPromQL={defaultPromQL} type={type} defaultCate={defaultCate} />;
      })}
      <div className='add-prometheus-panel'>
        <Button size='large' onClick={addPanel}>
          <PlusOutlined />
          {t('add_btn')}
        </Button>
      </div>
    </>
  );
};

export default PanelList;

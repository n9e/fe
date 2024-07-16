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
import React, { useState } from 'react';
import { Modal, Table, Space, Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { Dashboard } from '@/store/dashboardInterface';
import EditItem from './EditItem';
import { IVariable } from './definition';
import { setVaraiableSelected } from './constant';

interface IProps {
  id: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  value?: IVariable[];
  range: IRawTimeRange;
  onChange: (v?: IVariable[]) => void;
  dashboard: Dashboard;
}

export default function EditItems(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { visible, setVisible, onChange, value, range, id, dashboard } = props;
  const datasourceVars = _.filter(value, { type: 'datasource' });
  const [data, setData] = useState<IVariable[]>(value || []);
  const [record, setRecord] = useState<IVariable>({
    name: '',
    type: 'query',
    definition: '',
    value: '',
    datasource: {
      cate: 'prometheus',
    },
  });
  const [recordIndex, setRecordIndex] = useState<number>(-1);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');

  return (
    <Modal
      title={t(`var.title.${mode}`)}
      width={1000}
      visible={visible}
      onOk={() => {
        setVisible(false);
      }}
      onCancel={() => {
        setVisible(false);
        setMode('list');
      }}
      wrapClassName='variable-modal'
      footer={null}
    >
      {mode === 'list' ? (
        <Table
          rowKey={(record) => {
            return `${record.type}${record.name}${record.definition}`;
          }}
          size='small'
          dataSource={data}
          tableLayout='fixed'
          columns={[
            {
              title: t('var.name'),
              dataIndex: 'name',
              width: 150,
              render: (text, record, idx) => {
                return (
                  <a
                    onClick={() => {
                      setMode('edit');
                      setRecordIndex(idx);
                      setRecord(record);
                    }}
                  >
                    {text}
                  </a>
                );
              },
            },
            {
              title: t('var.type'),
              dataIndex: 'type',
              render: (val) => {
                return t(`var.type_map.${val}`);
              },
            },
            {
              title: t('var.definition'),
              dataIndex: 'definition',
              render: (text, record) => {
                if (record.type === 'textbox') {
                  return record.defaultValue;
                }
                return text;
              },
            },
            {
              title: t('var.hide'),
              dataIndex: 'hide',
              width: 70,
              render: (text) => {
                return text ? t(`var.hide_map.yes`) : t('var.hide_map.no');
              },
            },
            {
              title: t('common:table.operations'),
              width: 150,
              render: (_text, record, idx) => {
                return (
                  <Space>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => {
                        const newData = arrayMoveImmutable(data, idx, idx + 1);
                        setData(newData);
                        onChange(newData);
                      }}
                      disabled={idx === data.length - 1}
                    >
                      <ArrowDownOutlined />
                    </Button>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => {
                        const newData = arrayMoveImmutable(data, idx, idx - 1);
                        setData(newData);
                        onChange(newData);
                      }}
                      disabled={idx === 0}
                    >
                      <ArrowUpOutlined />
                    </Button>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => {
                        const newData = [
                          ...data,
                          {
                            ...record,
                            name: 'copy_of_' + record.name,
                          },
                        ];
                        setData(newData);
                        onChange(newData);
                      }}
                    >
                      <CopyOutlined />
                    </Button>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => {
                        const newData = _.cloneDeep(data);
                        newData.splice(idx, 1);
                        setData(newData);
                        onChange(newData);
                      }}
                    >
                      <DeleteOutlined />
                    </Button>
                  </Space>
                );
              },
            },
          ]}
          pagination={false}
          footer={() => {
            return (
              <Button
                type='primary'
                onClick={() => {
                  setMode('add');
                  setRecordIndex(data.length);
                  setRecord({
                    name: '',
                    type: 'query',
                    definition: '',
                    value: '',
                    datasource: {
                      cate: 'prometheus',
                    },
                  });
                }}
              >
                {t('var.btn')}
              </Button>
            );
          }}
        />
      ) : (
        <EditItem
          id={id}
          range={range}
          index={recordIndex}
          datasourceVars={datasourceVars}
          data={record}
          vars={data}
          onOk={(val) => {
            let newData = data;
            if (mode === 'add') {
              newData = [...data, val];
            } else if (mode === 'edit') {
              newData = _.map(data, (item, i) => {
                if (i === recordIndex) {
                  return val;
                }
                return item;
              });
              // TODO 2023-01-25 如果修改了数据源变量的默认值，更新该变量的已选值
              if (val.type === 'datasource' && val.defaultValue) {
                const preDefaultValue = _.find(data, { name: val.name })?.defaultValue;
                if (preDefaultValue !== val.defaultValue) {
                  setVaraiableSelected({
                    name: val.name,
                    value: val.defaultValue,
                    id,
                    urlAttach: true,
                    vars: newData,
                  });
                }
              }
            }
            setData(newData);
            onChange(newData);
            setMode('list');
            setRecordIndex(-1);
          }}
          onCancel={() => {
            setMode('list');
            setRecordIndex(-1);
          }}
          dashboard={dashboard}
        />
      )}
    </Modal>
  );
}

import React, { useState } from 'react';
import { Modal, Table, Space, Button } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { arrayMoveImmutable } from 'array-move';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';

import { useGlobalState } from '@/pages/dashboard/globalState';

import { IVariable } from '../types';
import Variable from './Variable';

interface IProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode?: number; // 0: 变量名、类型、数据源类型、数据源值无法修改
  onChange: (newVariables: IVariable[]) => void;
}

export default function EditModal(props: IProps) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const history = useHistory();
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const { visible, setVisible, editMode, onChange } = props;
  const datasourceVars = _.filter(variablesWithOptions, (item) => {
    return _.includes(['datasource', 'datasourceIdentifier'], item.type);
  });
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
          dataSource={variablesWithOptions}
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
            ...(editMode === 0
              ? []
              : [
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
                              setVariablesWithOptions((prev) => {
                                const newData = arrayMoveImmutable(prev, idx, idx + 1);
                                onChange(newData);
                                return newData;
                              });
                            }}
                            disabled={idx === variablesWithOptions.length - 1}
                          >
                            <ArrowDownOutlined />
                          </Button>
                          <Button
                            type='link'
                            size='small'
                            onClick={() => {
                              setVariablesWithOptions((prev) => {
                                const newData = arrayMoveImmutable(prev, idx, idx - 1);
                                onChange(newData);
                                return newData;
                              });
                            }}
                            disabled={idx === 0}
                          >
                            <ArrowUpOutlined />
                          </Button>
                          <Button
                            type='link'
                            size='small'
                            onClick={() => {
                              setVariablesWithOptions((prev) => {
                                const newData = [
                                  ...prev,
                                  {
                                    ...record,
                                    name: 'copy_of_' + record.name,
                                  },
                                ];
                                onChange(newData);
                                return newData;
                              });
                            }}
                          >
                            <CopyOutlined />
                          </Button>
                          <Button
                            type='link'
                            size='small'
                            onClick={() => {
                              setVariablesWithOptions((prev) => {
                                const newData = _.cloneDeep(prev);
                                newData.splice(idx, 1);
                                onChange(newData);

                                // localStorage 本地保存
                                if (dashboardMeta.dashboardId) {
                                  localStorage.removeItem(`dashboard_v6_${dashboardMeta.dashboardId}_${record.name}`);
                                }

                                // replace url 参数
                                let newQueryParams = queryString.parse(location.search);
                                newQueryParams = _.omit(newQueryParams, [record.name]);
                                history.replace({
                                  pathname: location.pathname,
                                  search: queryString.stringify(newQueryParams),
                                });

                                return newData;
                              });
                            }}
                          >
                            <DeleteOutlined />
                          </Button>
                        </Space>
                      );
                    },
                  },
                ]),
          ]}
          pagination={false}
          footer={() => {
            if (editMode === 0) {
              return null;
            }
            return (
              <Button
                type='primary'
                onClick={() => {
                  setMode('add');
                  setRecordIndex(variablesWithOptions.length);
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
        <Variable
          index={recordIndex}
          datasourceVars={datasourceVars}
          data={record}
          variablesWithOptions={variablesWithOptions}
          editMode={editMode}
          onOk={(val) => {
            setVariablesWithOptions((prev) => {
              let newData = _.cloneDeep(prev);
              if (mode === 'add') {
                newData = [...newData, val];
              } else if (mode === 'edit') {
                newData = _.map(newData, (item, i) => {
                  if (i === recordIndex) {
                    return {
                      ...item,
                      ...val,
                    };
                  }
                  return item;
                });
                // 2023-01-25 如果修改了数据源变量的默认值，更新该变量的已选值
                // 2025-12-08 修复在新版本变量组件中该功能失效的问题
                if (val.type === 'datasource' && val.defaultValue) {
                  const prevFinded = _.find(prev, { name: val.name });
                  const finded = _.find(newData, { name: val.name });
                  if (prevFinded && finded) {
                    const preDefaultValue = prevFinded?.defaultValue;
                    if (preDefaultValue !== val.defaultValue) {
                      const currentValue = val.defaultValue;
                      finded.value = currentValue;

                      // replace url 参数
                      const newQueryParams = location.search ? queryString.parse(location.search) : {};
                      history.replace({
                        pathname: location.pathname,
                        search: queryString.stringify(
                          _.assign(newQueryParams, {
                            [val.name]: currentValue,
                          }),
                        ),
                      });

                      // localStorage 本地保存
                      if (dashboardMeta.dashboardId && val !== undefined) {
                        localStorage.setItem(
                          `dashboard_v6_${dashboardMeta.dashboardId}_${val.name}`,
                          typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue),
                        );
                      }
                    }
                  }
                }
              }
              onChange(newData);
              return newData;
            });
            setMode('list');
            setRecordIndex(-1);
          }}
          onCancel={() => {
            setMode('list');
            setRecordIndex(-1);
          }}
        />
      )}
    </Modal>
  );
}

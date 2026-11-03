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
  /** Rewrites dashboard config references as one local update when a variable is renamed. */
  onRename?: (oldName: string, newName: string, variables: IVariable[]) => void;
  /** Counts saved dashboard references before a variable rename or deletion. */
  getReferenceCount?: (name: string) => number;
}

export default function EditModal(props: IProps) {
  const { t } = useTranslation('dashboard');
  const location = useLocation();
  const history = useHistory();
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const [variablesWithOptions, setVariablesWithOptions] = useGlobalState('variablesWithOptions');
  const { visible, setVisible, editMode, onChange, onRename, getReferenceCount } = props;
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
  const [pendingVariableRename, setPendingVariableRename] = useState<{
    value: IVariable;
    oldName: string;
    referenceCount: number;
  } | null>(null);

  const shouldSyncTextboxValueWithDefault = (previousVariable: IVariable | undefined) => {
    if (mode === 'add') {
      return true;
    }

    if (!previousVariable) {
      return false;
    }

    return previousVariable.value === undefined || previousVariable.value === null || previousVariable.value === '' || previousVariable.value === previousVariable.defaultValue;
  };

  const deleteVariable = (name: string) => {
    setVariablesWithOptions((prev) => {
      const newData = _.cloneDeep(prev);
      const index = newData.findIndex((item) => item.name === name);
      if (index === -1) return prev;

      newData.splice(index, 1);
      onChange(newData);

      // localStorage 本地保存
      if (dashboardMeta.dashboardId) {
        localStorage.removeItem(`dashboard_v6_${dashboardMeta.dashboardId}_${name}`);
      }

      // replace url 参数
      let newQueryParams = queryString.parse(location.search);
      newQueryParams = _.omit(newQueryParams, [name]);
      history.replace({
        pathname: location.pathname,
        search: queryString.stringify(newQueryParams),
      });

      return newData;
    });
  };

  const saveVariable = (val: IVariable, updateReferences: boolean) => {
    setVariablesWithOptions((prev) => {
      let newData = _.cloneDeep(prev);
      const previousVariable = mode === 'edit' ? prev[recordIndex] : undefined;

      if (val.type === 'textbox' && shouldSyncTextboxValueWithDefault(previousVariable)) {
        val.value = val.defaultValue ?? '';
      }

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
                localStorage.setItem(`dashboard_v6_${dashboardMeta.dashboardId}_${val.name}`, typeof currentValue === 'string' ? currentValue : JSON.stringify(currentValue));
              }
            }
          }
        }
      }
      if (mode === 'edit' && previousVariable && previousVariable.name !== val.name && onRename && updateReferences) {
        onRename(previousVariable.name, val.name, newData);
      } else {
        onChange(newData);
      }
      return newData;
    });
    setPendingVariableRename(null);
    setMode('list');
    setRecordIndex(-1);
  };

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
        setPendingVariableRename(null);
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
                      setPendingVariableRename(null);
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
                    render: (_text: unknown, record: IVariable, idx: number) => {
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
                              /** 已保存的配置仍在引用该变量时，先提示影响并确认删除。 */
                              const referenceCount = getReferenceCount?.(record.name) ?? 0;
                              if (referenceCount > 0) {
                                Modal.confirm({
                                  title: t('var.reference_delete_title', { name: record.name }),
                                  content: t('var.reference_delete_content', { total: referenceCount }),
                                  okText: t('var.reference_delete_confirm'),
                                  okType: 'danger',
                                  cancelText: t('common:btn.cancel'),
                                  onOk: () => deleteVariable(record.name),
                                });
                                return;
                              }
                              deleteVariable(record.name);
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
                  setPendingVariableRename(null);
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
            const previousVariable = mode === 'edit' ? variablesWithOptions[recordIndex] : undefined;
            if (previousVariable && previousVariable.name !== val.name && onRename) {
              const referenceCount = getReferenceCount?.(previousVariable.name) ?? 0;
              if (referenceCount > 0) {
                setPendingVariableRename({ value: val, oldName: previousVariable.name, referenceCount });
                return;
              }
              saveVariable(val, true);
              return;
            }
            saveVariable(val, false);
          }}
          onCancel={() => {
            setMode('list');
            setRecordIndex(-1);
          }}
        />
      )}
      {pendingVariableRename && (
        <Modal
          title={t('var.rename_reference_title', { name: pendingVariableRename.oldName })}
          visible
          zIndex={1001}
          maskClosable={false}
          onCancel={() => setPendingVariableRename(null)}
          footer={[
            <Button key='back' onClick={() => setPendingVariableRename(null)}>
              {t('var.rename_reference_back')}
            </Button>,
            <Button key='rename-only' danger onClick={() => saveVariable(pendingVariableRename.value, false)}>
              {t('var.rename_reference_only')}
            </Button>,
            <Button key='update-references' type='primary' onClick={() => saveVariable(pendingVariableRename.value, true)}>
              {t('var.rename_reference_update', { total: pendingVariableRename.referenceCount })}
            </Button>,
          ]}
        >
          {t('var.rename_reference_content', {
            name: pendingVariableRename.oldName,
            newName: pendingVariableRename.value.name,
            total: pendingVariableRename.referenceCount,
          })}
        </Modal>
      )}
    </Modal>
  );
}

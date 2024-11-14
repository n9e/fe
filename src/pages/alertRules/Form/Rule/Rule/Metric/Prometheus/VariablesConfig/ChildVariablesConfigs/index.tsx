import React from 'react';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Tooltip, Form, Table, Button } from 'antd';
import { InfoCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import HostSelectPreview from '@/components/DeviceSelect/HostSelect/Preview';
import NetworkDeviceSelectPreview from '@/components/DeviceSelect/NetworkDeviceSelect/Preview';
import EditModal from '../EditModal';
import ChildVariablesConfigs from './';

interface Props {
  topPrefixName: (string | number)[];
  topField: FormListFieldData;
  prefixName: (string | number)[];
  level: number;
}

function baseVariablesToRowData(data) {
  const rowData = {};
  _.forEach(data, (item) => {
    rowData[item.name] = item.query;
  });
  return rowData;
}
function getColumnKeys(data) {
  let keys: string[] = [];
  _.forEach(data, (item) => {
    keys = _.concat(keys, _.keys(item));
  });
  return _.uniq(keys);
}

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { topPrefixName, topField, prefixName, level } = props;
  const form = Form.useFormInstance();
  const topNamePath = [...topPrefixName, topField.name, 'var_config'];
  const topParam = Form.useWatch([...topNamePath, 'param_val']);
  const childVarConfigsPath = prefixName;
  const childVarConfigs = Form.useWatch(childVarConfigsPath);
  const [editModalData, setEditModalData] = React.useState<{
    childVarConfigsIndex: number;
    paramValIndex: number;
    visible: boolean;
    data: any;
  }>({
    childVarConfigsIndex: 0,
    paramValIndex: 0,
    visible: false,
    data: {},
  });

  if (topParam === undefined || _.isEmpty(topParam)) return null;
  return (
    <>
      <div className='mb1'>
        {level === 1 && (
          <div className='mb1'>
            <Space>
              <span>{t('var_config.filter')}</span>
              <PlusCircleOutlined
                onClick={() => {
                  const values = _.cloneDeep(form.getFieldsValue());
                  const childVarConfigs = _.get(values, childVarConfigsPath, []);
                  _.set(
                    values,
                    childVarConfigsPath,
                    _.concat(childVarConfigs, {
                      param_val: [baseVariablesToRowData(topParam)],
                    }),
                  );
                  form.setFieldsValue(values);
                }}
              />
              <Tooltip title={t('var_config.filter_tip')}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          </div>
        )}
        {level === 2 && (
          <div className='mt1'>
            <Space>
              <span>{t('var_config.add_subFilter')}</span>
              <PlusCircleOutlined
                onClick={() => {
                  const values = _.cloneDeep(form.getFieldsValue());
                  const childVarConfigs = _.get(values, childVarConfigsPath, []);
                  _.set(
                    values,
                    childVarConfigsPath,
                    _.concat(childVarConfigs, {
                      param_val: [baseVariablesToRowData(topParam)],
                    }),
                  );
                  form.setFieldsValue(values);
                }}
              />
            </Space>
          </div>
        )}
        {childVarConfigs !== undefined &&
          _.map(childVarConfigs, (item, idx: number) => {
            return (
              <div
                key={idx}
                className='mb1 p1'
                style={{
                  backgroundColor: level === 1 ? 'var(--fc-fill-4)' : 'var(--fc-fill-5)',
                }}
              >
                <Table
                  rowKey={(record) => {
                    return JSON.stringify(record);
                  }}
                  size='small'
                  pagination={false}
                  columns={_.concat(
                    _.map(getColumnKeys(item.param_val), (item) => {
                      return {
                        title: item,
                        dataIndex: item,
                        key: item,
                        render: (val, _record, index) => {
                          if (val) {
                            const param_type = _.find(topParam, { name: item })?.param_type;
                            return (
                              <Space>
                                <span>
                                  {param_type === 'threshold' && val}
                                  {param_type === 'enum' && _.join(val, ',')}
                                  {param_type === 'host' && <HostSelectPreview queries={val} />}
                                  {param_type === 'device' && <NetworkDeviceSelectPreview queries={val} />}
                                </span>
                                <a
                                  onClick={() => {
                                    setEditModalData({
                                      childVarConfigsIndex: idx,
                                      paramValIndex: index,
                                      visible: true,
                                      data: _.find(topParam, { name: item }),
                                    });
                                  }}
                                >
                                  {t('common:btn.edit')}
                                </a>
                              </Space>
                            );
                          }
                        },
                      };
                    }),
                    [
                      {
                        title: t('common:table.operations'),
                        width: 100,
                        render: () => {
                          return (
                            <Space>
                              <Button
                                size='small'
                                type='link'
                                style={{
                                  padding: 0,
                                }}
                                onClick={() => {
                                  const values = _.cloneDeep(form.getFieldsValue());
                                  const curConf = _.get(values, [...childVarConfigsPath, idx], {});
                                  _.set(values, [...childVarConfigsPath, idx], {
                                    ...curConf,
                                    param_val: _.concat(curConf.param_val, baseVariablesToRowData(topParam)),
                                  });
                                  form.setFieldsValue(values);
                                }}
                              >
                                {t('common:btn.add')}
                              </Button>
                              <Button
                                size='small'
                                type='link'
                                danger
                                style={{
                                  padding: 0,
                                }}
                                onClick={() => {
                                  const values = _.cloneDeep(form.getFieldsValue());
                                  const curConf = _.get(values, childVarConfigsPath, []);
                                  _.set(
                                    values,
                                    childVarConfigsPath,
                                    _.filter(curConf, (item, index: number) => index !== idx),
                                  );
                                  form.setFieldsValue(values);
                                }}
                              >
                                {t('common:btn.delete')}
                              </Button>
                            </Space>
                          );
                        },
                      },
                    ] as any,
                  )}
                  dataSource={item.param_val}
                />
                {level === 1 && <ChildVariablesConfigs topPrefixName={topPrefixName} topField={topField} prefixName={[...prefixName, idx, 'child_var_configs']} level={2} />}
              </div>
            );
          })}
      </div>
      <EditModal
        {...editModalData}
        onCancel={() => {
          setEditModalData({
            childVarConfigsIndex: 0,
            paramValIndex: 0,
            visible: false,
            data: {},
          });
        }}
        onOk={(vals) => {
          const values = _.cloneDeep(form.getFieldsValue());
          const curConf = _.get(values, [...childVarConfigsPath, editModalData.childVarConfigsIndex], {});
          _.set(values, [...childVarConfigsPath, editModalData.childVarConfigsIndex], {
            ...curConf,
            param_val: _.map(curConf.param_val, (item, index: number) => {
              if (index === editModalData.paramValIndex) {
                const itemClone = _.cloneDeep(item);
                itemClone[vals.name] = vals.query;
                return itemClone;
              }
              return item;
            }),
          });
          form.setFieldsValue(values);
          setEditModalData({
            childVarConfigsIndex: 0,
            paramValIndex: 0,
            visible: false,
            data: {},
          });
        }}
      />
    </>
  );
}

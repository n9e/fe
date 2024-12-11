import React from 'react';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Tooltip, Form, Table, Button } from 'antd';
import { InfoCircleOutlined, PlusCircleOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import HostSelectPreview from '@/components/DeviceSelect/HostSelect/Preview';
import HostSelectQueryRender from '@/components/DeviceSelect/HostSelect/QueryRender';
import NetworkDeviceSelectPreview from '@/components/DeviceSelect/NetworkDeviceSelect/Preview';
import NetworkDeviceSelectQueryRender from '@/components/DeviceSelect/NetworkDeviceSelect/QueryRender';
import EditModal from '../EditModal';
import ChildVariablesConfigs from './';

interface Props {
  topPrefixName: (string | number)[];
  topField: FormListFieldData;
  prefixName: (string | number)[];
  level: number;
  prefixIndex?: number;
}

function baseVariablesToRowData(data) {
  const rowData = {};
  _.forEach(data, (item) => {
    rowData[item.name] = item;
  });
  return rowData;
}
function getColumnKeys(topParam) {
  return _.map(topParam, 'name');
}

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { topPrefixName, topField, prefixName, level } = props;
  const form = Form.useFormInstance();
  const topNamePath = [...topPrefixName, topField.name, 'var_config'];
  const topVarEnabled = Form.useWatch([...topPrefixName, topField.name, 'var_enabled']);
  const topParam = Form.useWatch([...topNamePath, 'param_val']);
  const childVarConfigsPath = prefixName;
  const childVarConfigs = Form.useWatch(childVarConfigsPath);
  const [editModalData, setEditModalData] = React.useState<{
    paramValIndex: number;
    visible: boolean;
    data: any;
  }>({
    paramValIndex: 0,
    visible: false,
    data: {},
  });

  if (!topVarEnabled || topParam === undefined || _.isEmpty(topParam)) return null;
  return (
    <>
      <div className='mb1'>
        {level === 1 ? (
          <div className='mb1'>
            <Space>
              <span>{t('var_config.filter')}</span>
              <PlusCircleOutlined
                onClick={() => {
                  const values = _.cloneDeep(form.getFieldsValue());
                  const curConf = _.get(values, childVarConfigsPath, {});
                  _.set(values, childVarConfigsPath, {
                    ...curConf,
                    param_val: _.concat(curConf.param_val || [], baseVariablesToRowData(topParam)),
                  });
                  form.setFieldsValue(values);
                }}
              />
              <Tooltip title={t('var_config.filter_tip')}>
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          </div>
        ) : (
          <div className='mt1'>
            <Space>
              <span>{t('var_config.add_subFilter')}</span>
              <PlusCircleOutlined
                onClick={() => {
                  const values = _.cloneDeep(form.getFieldsValue());
                  const curConf = _.get(values, childVarConfigsPath, {});
                  _.set(values, childVarConfigsPath, {
                    ...curConf,
                    param_val: _.concat(curConf.param_val || [], baseVariablesToRowData(topParam)),
                  });
                  form.setFieldsValue(values);
                }}
              />
            </Space>
          </div>
        )}
        {childVarConfigs !== undefined && childVarConfigs?.param_val !== undefined && !_.isEmpty(childVarConfigs?.param_val) && (
          <div
            className='mb1 p1'
            style={{
              backgroundColor: `var(--fc-fill-${level + 3})`, // 从 4 开始
            }}
          >
            <Table
              rowKey={(record, index) => {
                return JSON.stringify(record) + index;
              }}
              tableLayout='fixed'
              size='small'
              pagination={false}
              columns={_.concat(
                _.map(getColumnKeys(topParam), (item) => {
                  return {
                    title: item,
                    dataIndex: item,
                    key: item,
                    render: (val, _record, index) => {
                      if (val) {
                        const { param_type } = val;
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 'max-content', minWidth: 0 }}>
                              {param_type === 'threshold' && val.query}
                              {param_type === 'enum' && _.join(val.query, ',')}
                              {param_type === 'host' && (
                                <HostSelectPreview queries={val.query} targetType='icon'>
                                  <HostSelectQueryRender queries={val.query} maxLength={1000 / getColumnKeys(childVarConfigs.param_val).length} />
                                </HostSelectPreview>
                              )}
                              {param_type === 'device' && (
                                <NetworkDeviceSelectPreview queries={val.query} targetType='icon'>
                                  <NetworkDeviceSelectQueryRender queries={val.query} maxLength={1000 / getColumnKeys(childVarConfigs.param_val).length} />
                                </NetworkDeviceSelectPreview>
                              )}
                            </div>
                            <EditOutlined
                              onClick={() => {
                                setEditModalData({
                                  paramValIndex: index,
                                  visible: true,
                                  data: val,
                                });
                              }}
                            />
                          </div>
                        );
                      }
                    },
                  };
                }),
                [
                  {
                    title: t('common:table.operations'),
                    width: 100,
                    render: (_val, _record, index) => {
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
                              const curConf = _.get(values, childVarConfigsPath, {});
                              const param_val = _.filter(curConf.param_val, (_item, curIndex: number) => curIndex !== index);
                              _.set(values, childVarConfigsPath, {
                                ...curConf,
                                param_val: _.isEmpty(param_val) ? undefined : param_val,
                                child_var_configs: _.isEmpty(param_val) ? undefined : curConf.child_var_configs,
                              });
                              form.setFieldsValue(values);
                            }}
                            icon={<MinusCircleOutlined />}
                          />
                        </Space>
                      );
                    },
                  },
                ] as any,
              )}
              dataSource={childVarConfigs.param_val}
            />
            {level < 3 && <ChildVariablesConfigs topPrefixName={topPrefixName} topField={topField} prefixName={[...prefixName, 'child_var_configs']} level={level + 1} />}
          </div>
        )}
      </div>
      <EditModal
        {...editModalData}
        onCancel={() => {
          setEditModalData({
            paramValIndex: 0,
            visible: false,
            data: {},
          });
        }}
        onOk={(vals) => {
          const values = _.cloneDeep(form.getFieldsValue());
          const curConf = _.get(values, childVarConfigsPath, {});
          _.set(values, childVarConfigsPath, {
            ...curConf,
            param_val: _.map(curConf.param_val, (item, index: number) => {
              if (index === editModalData.paramValIndex) {
                const itemClone = _.cloneDeep(item);
                itemClone[vals.name] = vals;
                return itemClone;
              }
              return item;
            }),
          });
          form.setFieldsValue(values);
          setEditModalData({
            paramValIndex: 0,
            visible: false,
            data: {},
          });
        }}
        nameAndTypeDisabled
      />
    </>
  );
}

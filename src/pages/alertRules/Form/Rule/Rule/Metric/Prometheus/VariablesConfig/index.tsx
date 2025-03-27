import React from 'react';
import { Form, Space, Switch, Table, Button } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import { PlusCircleOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { HelpLink } from '@/components/pageLayout';
import HostSelectPreview from '@/components/DeviceSelect/HostSelect/Preview';
import HostSelectQueryRender from '@/components/DeviceSelect/HostSelect/QueryRender';
import NetworkDeviceSelectPreview from '@/components/DeviceSelect/NetworkDeviceSelect/Preview';
import NetworkDeviceSelectQueryRender from '@/components/DeviceSelect/NetworkDeviceSelect/QueryRender';
import EditModal from './EditModal';
import syncChildVariables from './utils/syncChildVariables';

interface Props {
  prefixName: (string | number)[];
  field: FormListFieldData;
}

function setChildVarConfigs(values, namePath, childVarConfigsNamePath) {
  const newNamePathValues = _.get(values, namePath, []);
  const childVarConfigsNamePathValues = _.get(values, childVarConfigsNamePath);
  const newChildVarConfigsNamePathValue = syncChildVariables(newNamePathValues, childVarConfigsNamePathValues);
  _.set(values, childVarConfigsNamePath, newChildVarConfigsNamePathValue);
}

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { prefixName, field } = props;
  const form = Form.useFormInstance();
  const namePath = [...prefixName, field.name, 'var_config', 'param_val'];
  const childVarConfigsNamePath = [...prefixName, field.name, 'var_config', 'child_var_configs'];
  const var_enabled = Form.useWatch([...prefixName, field.name, 'var_enabled']);
  const var_config = Form.useWatch(namePath);
  const [editModalData, setEditModalData] = React.useState<{
    action: string;
    visible: boolean;
    data: any;
  }>({
    action: 'create',
    visible: false,
    data: {},
  });

  return (
    <>
      <div className='mb2'>
        <div className='mb1'>
          <Space>
            <span>{t('var_config.enable')}</span>
            <Form.Item {...field} name={[field.name, 'var_enabled']} valuePropName='checked' noStyle>
              <Switch size='small' />
            </Form.Item>
          </Space>
        </div>
        <div
          className='mb1 p1'
          style={{
            display: var_enabled ? 'block' : 'none',
            backgroundColor: 'var(--fc-fill-4)',
          }}
        >
          <div className='mb1'>
            <Space>
              <span>{t('var_config.config')}</span>
              <PlusCircleOutlined
                onClick={() => {
                  setEditModalData({
                    action: 'create',
                    visible: true,
                    data: {
                      param_type: 'threshold',
                      id: moment().valueOf(),
                    },
                  });
                }}
              />
              <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alarm-management/alert-rules/alert-promql-var-set/' />
            </Space>
          </div>
          <Table
            rowKey='name'
            size='small'
            tableLayout='fixed'
            columns={[
              {
                title: t('var_config.name'),
                dataIndex: 'name',
                width: 100,
              },
              {
                title: t('var_config.type'),
                dataIndex: 'param_type',
                width: 100,
                render: (text) => {
                  return t(`var_config.${text}`);
                },
              },
              {
                title: t('var_config.value'),
                dataIndex: 'query',
                render: (val, record) => {
                  if (record.param_type === 'threshold') {
                    return val;
                  }
                  if (record.param_type === 'enum') {
                    return _.join(val, ',');
                  }
                  if (record.param_type === 'host') {
                    return (
                      <HostSelectPreview queries={val} targetType='icon'>
                        <HostSelectQueryRender queries={val} />
                      </HostSelectPreview>
                    );
                  }
                  if (record.param_type === 'device') {
                    return (
                      <NetworkDeviceSelectPreview queries={val} targetType='icon'>
                        <NetworkDeviceSelectQueryRender queries={val} />
                      </NetworkDeviceSelectPreview>
                    );
                  }
                },
              },
              {
                title: t('common:table.operations'),
                width: 100,
                render: (record) => {
                  return (
                    <Space>
                      <Button
                        size='small'
                        type='link'
                        style={{
                          padding: 0,
                        }}
                        onClick={() => {
                          setEditModalData({
                            action: 'edit',
                            visible: true,
                            data: record,
                          });
                        }}
                        icon={<EditOutlined />}
                      />
                      <Button
                        size='small'
                        type='link'
                        style={{
                          padding: 0,
                        }}
                        onClick={() => {
                          const values = _.cloneDeep(form.getFieldsValue());
                          const namePathValues = _.get(values, namePath, []);
                          const index = _.findIndex(namePathValues, { id: record.id });
                          _.set(
                            values,
                            namePath,
                            _.filter(namePathValues, (v, i: number) => i !== index),
                          );
                          setChildVarConfigs(values, namePath, childVarConfigsNamePath);
                          form.setFieldsValue(values);
                        }}
                        icon={<MinusCircleOutlined />}
                      />
                    </Space>
                  );
                },
              },
            ]}
            dataSource={var_config}
            pagination={false}
          />
        </div>
      </div>
      <EditModal
        {...editModalData}
        onCancel={() => {
          setEditModalData({
            action: 'create',
            visible: false,
            data: {},
          });
        }}
        onOk={(vals) => {
          const values = _.cloneDeep(form.getFieldsValue());
          const namePathValues = _.get(values, namePath, []);
          if (editModalData.action === 'create') {
            _.set(values, namePath, _.concat(namePathValues, [vals]));
          } else if (editModalData.action === 'edit') {
            const index = _.findIndex(namePathValues, { id: vals.id });
            _.set(values, [...namePath, index], vals);
          }
          setChildVarConfigs(values, namePath, childVarConfigsNamePath);
          form.setFieldsValue(values);
          setEditModalData({
            action: 'create',
            visible: false,
            data: {},
          });
        }}
      />
    </>
  );
}

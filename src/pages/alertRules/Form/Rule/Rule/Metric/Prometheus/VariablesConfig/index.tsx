import React from 'react';
import { Form, Space, Switch, Table, Tooltip, Button } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { PlusCircleOutlined, InfoCircleOutlined, EditOutlined, MinusCircleOutlined } from '@ant-design/icons';
import HostSelectPreview from '@/components/DeviceSelect/HostSelect/Preview';
import HostSelectQueryRender from '@/components/DeviceSelect/HostSelect/QueryRender';
import NetworkDeviceSelectPreview from '@/components/DeviceSelect/NetworkDeviceSelect/Preview';
import NetworkDeviceSelectQueryRender from '@/components/DeviceSelect/NetworkDeviceSelect/QueryRender';
import EditModal from './EditModal';

interface Props {
  prefixName: (string | number)[];
  field: FormListFieldData;
}

export default function index(props: Props) {
  const { t } = useTranslation('alertRules');
  const { prefixName, field } = props;
  const form = Form.useFormInstance();
  const namePath = [...prefixName, field.name, 'var_config', 'param_val'];
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
                    },
                  });
                }}
              />
              <Tooltip title={t('var_config.config_tip')}>
                <InfoCircleOutlined />
              </Tooltip>
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
                          const index = _.findIndex(namePathValues, { name: record.name });
                          _.set(
                            values,
                            namePath,
                            _.filter(namePathValues, (v, i: number) => i !== index),
                          );
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
            const index = _.findIndex(namePathValues, { name: vals.name });
            _.set(values, [...namePath, index], vals);
          }
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
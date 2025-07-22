import React, { useContext, useState } from 'react';
import _ from 'lodash';
import { Form, Input, Select, Modal, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import CronPattern from '@/components/CronPattern';
import KVTagSelect, { validatorOfKVTagSelect } from '@/components/KVTagSelect';

const { Option } = Select;
const layout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 19,
  },
};

const fields = [
  {
    id: 2,
    field: 'datasource_ids',
    name: '数据源',
  },
  {
    id: 5,
    field: 'cron_pattern',
    name: '执行频率',
  },
  {
    id: 4,
    field: 'disabled',
    name: '启用',
  },
  {
    id: 12,
    field: 'append_tags',
    name: '附加标签',
  },
];

interface Props {
  isModalVisible: boolean;
  editModalFinish: Function;
}

const editModal: React.FC<Props> = ({ isModalVisible, editModalFinish }) => {
  const { t } = useTranslation('recordingRules');
  const [form] = Form.useForm();
  const [field, setField] = useState<string>('datasource_ids');
  const [refresh, setRefresh] = useState(true);
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const datasourceList = groupedDatasourceList.prometheus;

  const modelOk = () => {
    form.validateFields().then(async (values) => {
      const data = { ...values };
      delete data.field;
      if (values.field === 'disabled') {
        data.disabled = !values.enable_status ? 1 : 0;
        delete data.enable_status;
      }
      Object.keys(data).forEach((key) => {
        // 因为功能上有清除备注的需求，需要支持传空
        if (data[key] === undefined) {
          data[key] = '';
        }
        if (key !== 'datasource_ids' && Array.isArray(data[key])) {
          data[key] = data[key].join(' ');
        }
      });
      editModalFinish(true, data);
    });
  };

  const editModalClose = () => {
    editModalFinish(false);
  };

  const fieldChange = (val) => {
    setField(val);
  };

  return (
    <>
      <Modal
        title={t('batch.update.title')}
        visible={isModalVisible}
        onOk={modelOk}
        onCancel={() => {
          editModalClose();
        }}
      >
        <Form
          {...layout}
          form={form}
          className='strategy-form'
          layout={refresh ? 'horizontal' : 'horizontal'}
          initialValues={{
            datasource_ids: [0],
            field: 'datasource_ids',
            enable_status: true,
          }}
        >
          <Form.Item
            label={t('batch.update.field')}
            name='field'
            rules={[
              {
                required: false,
              },
            ]}
          >
            <Select style={{ width: '100%' }} onChange={fieldChange}>
              {fields.map((item) => (
                <Option key={item.id} value={item.field}>
                  {t(`batch.update.options.${item.field}`)}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {(() => {
            switch (field) {
              case 'note':
                return (
                  <>
                    <Form.Item label={t('batch.update.changeto')} name='note'>
                      <Input />
                    </Form.Item>
                  </>
                );
              case 'datasource_ids':
                return (
                  <>
                    <Form.Item label={t('batch.update.changeto')} name='datasource_ids'>
                      <Select mode='multiple'>
                        <Option value={0}>$all</Option>
                        {_.map(datasourceList, (item) => {
                          return (
                            <Option key={item.id} value={item.id}>
                              {item.name}
                            </Option>
                          );
                        })}
                      </Select>
                    </Form.Item>
                  </>
                );

              case 'cron_pattern':
                return (
                  <>
                    <CronPattern name='cron_pattern' label={t('batch.update.changeto')} />
                  </>
                );
              case 'disabled':
                return (
                  <>
                    <Form.Item label={t('batch.update.changeto')} name='enable_status' valuePropName='checked'>
                      <Switch />
                    </Form.Item>
                  </>
                );
              case 'append_tags':
                return (
                  <>
                    <Form.Item label={t('batch.update.changeto')} name='append_tags' rules={[validatorOfKVTagSelect]}>
                      <KVTagSelect />
                    </Form.Item>
                  </>
                );
              default:
                return null;
            }
          })()}
        </Form>
      </Modal>
    </>
  );
};

export default editModal;

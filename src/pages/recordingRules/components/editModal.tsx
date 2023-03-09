import React, { useContext, useState } from 'react';
import _ from 'lodash';
import { Form, Input, InputNumber, Select, Tag, Space, Tooltip, Modal, Switch } from 'antd';
import { QuestionCircleFilled } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';

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
    field: 'prom_eval_interval',
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

// 校验单个标签格式是否正确
function isTagValid(tag) {
  const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
  return {
    isCorrectFormat: contentRegExp.test(tag.toString()),
    isLengthAllowed: tag.toString().length <= 64,
  };
}

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

  // 渲染标签
  function tagRender(content) {
    const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
    return isCorrectFormat && isLengthAllowed ? (
      <Tag closable={content.closable} onClose={content.onClose}>
        {content.value}
      </Tag>
    ) : (
      <Tooltip title={isCorrectFormat ? t('append_tags_msg1') : t('append_tags_msg2')}>
        <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
          {content.value}
        </Tag>
      </Tooltip>
    );
  }

  // 校验所有标签格式
  function isValidFormat() {
    return {
      validator(_, value) {
        const isInvalid =
          value &&
          value.some((tag) => {
            const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
            if (!isCorrectFormat || !isLengthAllowed) {
              return true;
            }
          });
        return isInvalid ? Promise.reject(new Error(t('append_tags_msg'))) : Promise.resolve();
      },
    };
  }

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
        if (Array.isArray(data[key])) {
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
            prom_eval_interval: 15,
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

              case 'prom_eval_interval':
                return (
                  <>
                    <Form.Item label={t('batch.update.changeto')}>
                      <Space>
                        <Form.Item style={{ marginBottom: 0 }} name='prom_eval_interval' initialValue={15} wrapperCol={{ span: 10 }}>
                          <InputNumber
                            min={1}
                            onChange={() => {
                              setRefresh(!refresh);
                            }}
                          />
                        </Form.Item>
                        s
                        <Tooltip title={t('batch.update.prom_eval_interval_tip', { num: form.getFieldValue('prom_eval_interval') })}>
                          <QuestionCircleFilled />
                        </Tooltip>
                      </Space>
                    </Form.Item>
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
                    <Form.Item label={t('batch.update.changeto')} name='append_tags' rules={[isValidFormat]}>
                      <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('append_tags_placeholder')} tagRender={tagRender} />
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

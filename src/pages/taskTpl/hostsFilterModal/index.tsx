import React from 'react';
import { Form, Modal, Space, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { getTargetList } from '@/services/targets';
import ValuesSelect from './ValuesSelect';
import Preview from './Preview';

interface Props {
  group_id: number;
  onOk: (hosts: any[]) => void;
}

const queryKeyOptions = ['all_hosts', 'tags', 'hosts'];

function hostsFilterModal(props: Props & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy, group_id, onOk } = props;
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <Form.List
        name='queries'
        initialValue={[
          {
            key: 'all_hosts',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <Modal
            title={
              <Space>
                <span>{t('host.query.title')}</span>
                <PlusCircleOutlined
                  onClick={() =>
                    add({
                      key: 'hosts',
                      op: '==',
                      values: [],
                    })
                  }
                />
              </Space>
            }
            visible={visible}
            onOk={() => {
              form.validateFields().then((values) => {
                const { queries } = values;
                queries.push({
                  key: 'group_ids',
                  op: '==',
                  values: [group_id],
                });
                getTargetList({
                  p: 1,
                  limit: 100000, // TODO 临时解决方案，limit 100000 认为是获取全部
                  queries,
                }).then((res) => {
                  onOk(res?.dat?.list || []);
                  destroy();
                });
              });
            }}
            onCancel={destroy}
          >
            {fields.map((field, idx) => (
              <div key={field.key}>
                <Space align='baseline'>
                  {idx > 0 && <div className='alert-rule-host-condition-tips'>且</div>}
                  <Form.Item {...field} name={[field.name, 'key']} rules={[{ required: true, message: 'Missing key' }]}>
                    <Select
                      style={{ minWidth: idx > 0 ? 100 : 142 }}
                      onChange={() => {
                        const queries = form.getFieldValue(['queries']);
                        const query = queries[field.name];
                        query.values = [];
                        form.setFieldsValue({
                          queries,
                        });
                      }}
                    >
                      {queryKeyOptions.map((item) => (
                        <Select.Option key={item} value={item}>
                          {t(`host.query.key.${item}`)}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue, setFieldsValue }) => {
                      const queryKey = getFieldValue(['queries', field.name, 'key']);
                      const queryOp = getFieldValue(['queries', field.name, 'op']);
                      if (queryKey === 'all_hosts') return null;
                      return (
                        <Space align='baseline'>
                          <Form.Item {...field} name={[field.name, 'op']} rules={[{ required: true, message: 'Missing op' }]}>
                            <Select
                              style={{ minWidth: 60 }}
                              options={_.concat(
                                [
                                  {
                                    value: '==',
                                    label: '==',
                                  },
                                  {
                                    value: '!=',
                                    label: '!=',
                                  },
                                ],
                                queryKey === 'hosts'
                                  ? [
                                      {
                                        value: '=~',
                                        label: '=~',
                                      },
                                      {
                                        value: '!~',
                                        label: '!~',
                                      },
                                    ]
                                  : [],
                              )}
                              onChange={(val) => {
                                const queries = getFieldValue(['queries']);
                                const query = queries[field.name];
                                query.values = undefined;
                                setFieldsValue({
                                  queries,
                                });
                              }}
                            />
                          </Form.Item>
                          <ValuesSelect queryKey={queryKey} queryOp={queryOp} field={field} />
                        </Space>
                      );
                    }}
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </Space>
              </div>
            ))}
            <Form.Item shouldUpdate noStyle>
              {({ getFieldValue }) => {
                const queries = _.cloneDeep(getFieldValue(['queries']));
                queries.push({
                  key: 'group_ids',
                  op: '==',
                  values: [group_id],
                });
                return <Preview queries={queries} />;
              }}
            </Form.Item>
          </Modal>
        )}
      </Form.List>
    </Form>
  );
}

export default ModalHOC<Props>(hostsFilterModal);

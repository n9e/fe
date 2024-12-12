import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Modal, Form, Input, Select, Radio, Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import { putTargetsBgids, getBusiGroupsTags } from '@/pages/targets/services';

interface Props {
  gids?: string;
  idents: string[];
  selectedRows: any[];
  onOk: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('targets');
  const { busiGroups } = useContext(CommonStateContext);
  const { gids, idents, selectedRows, onOk } = props;
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const action = Form.useWatch('action', form);
  const groups = _.uniqBy(
    _.reduce(
      selectedRows,
      (prev, curr) => {
        return _.concat(prev, curr.group_objs);
      },
      [],
    ),
    'id',
  );
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    getBusiGroupsTags().then((res) => {
      setTags(res);
    });
  }, []);

  return (
    <>
      <span
        onClick={() => {
          setVisible(true);
          form.setFieldsValue({ idents: _.join(idents, '\n'), action: 'reset' });
        }}
      >
        {t('update_busi.title')}
      </span>
      <Modal
        title={t('update_busi.title')}
        destroyOnClose
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          form.validateFields().then((values) => {
            const data = {
              ...values,
              idents: _.split(values.idents, '\n'),
            };
            putTargetsBgids(data).then((res) => {
              if (_.isEmpty(res?.dat)) {
                setVisible(false);
                onOk();
              } else {
                const errData = _.map(res.dat, (val, key) => {
                  return {
                    host: key,
                    error_msg: val,
                  };
                });
                Modal.error({
                  icon: null,
                  content: (
                    <Table
                      size='small'
                      columns={[
                        {
                          title: t('common:table.host'),
                          dataIndex: 'host',
                          key: 'host',
                        },
                        {
                          title: t('common:table.error_msg'),
                          dataIndex: 'error_msg',
                          key: 'error_msg',
                        },
                      ]}
                      dataSource={errData}
                      pagination={false}
                      rowKey='host'
                    />
                  ),
                });
              }
            });
          });
        }}
      >
        <Form layout='vertical' preserve={false} form={form}>
          <Form.Item label={t('targets')} name='idents'>
            <Input.TextArea
              autoSize={{
                minRows: 4,
                maxRows: 20,
              }}
            />
          </Form.Item>
          <Form.Item label={t('update_busi.mode.label')} name='action'>
            <Radio.Group
              options={[
                {
                  label: t('update_busi.mode.reset'),
                  value: 'reset',
                },
                {
                  label: t('update_busi.mode.add'),
                  value: 'add',
                },
                {
                  label: t('update_busi.mode.del'),
                  value: 'del',
                },
              ]}
              optionType='button'
              buttonStyle='solid'
              onChange={(e) => {
                if (e.target.value === 'del' && gids !== undefined) {
                  form.setFieldsValue({ bgids: [_.toNumber(gids)] });
                }
              }}
            />
          </Form.Item>
          <Form.Item label={t('update_busi.label')} name='bgids'>
            <Select
              showSearch
              optionFilterProp='label'
              mode='multiple'
              options={
                action === 'reset' || action === 'add'
                  ? _.map(busiGroups, (item) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    })
                  : _.map(groups, (item) => {
                      return {
                        label: item.name,
                        value: item.id,
                      };
                    })
              }
            />
          </Form.Item>
          <Form.Item label={t('update_busi.tags')} name='tags' tooltip={t('update_busi.tags_tip')}>
            <Select
              mode='tags'
              tokenSeparators={[' ']}
              options={_.map(tags, (item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

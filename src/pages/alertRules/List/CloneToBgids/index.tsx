import React, { useState } from 'react';
import _ from 'lodash';
import { Modal, Form, Select, Table, message } from 'antd';
import { useTranslation } from 'react-i18next';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { rulesClones } from '@/pages/alertRules/services';

interface Props {
  ids: React.Key[];
  busiGroups: any[];
  onOk: () => void;
}

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { ids, busiGroups, onOk, visible, destroy } = props;
  const [resultData, setResultData] = useState<{
    visible: boolean;
    data: any[];
  }>({
    visible: false,
    data: [],
  });
  const [form] = Form.useForm();

  return (
    <Modal
      width={800}
      title={t('batch.clone_to_bgids.title')}
      visible={visible}
      onOk={() => {
        form.validateFields().then((values) => {
          rulesClones({
            rule_ids: ids,
            bgids: values.bgids,
          }).then((res) => {
            if (!_.isEmpty(res)) {
              const data: any[] = [];
              _.forEach(res, (msg, rule) => {
                data.push({
                  id: _.uniqueId('clone_result_id'),
                  rule,
                  msg,
                });
              });
              setResultData({
                visible: true,
                data,
              });
            } else {
              destroy();
              message.success(t('common:success.clone'));
              onOk();
            }
          });
        });
      }}
      onCancel={destroy}
      okText={t('common:btn.clone')}
    >
      <Form layout='vertical' form={form}>
        <Form.Item name='bgids' label={t('batch.clone_to_bgids.select_bgids')} rules={[{ required: true }]}>
          <Select
            mode='multiple'
            options={_.map(busiGroups, (bg) => ({
              label: bg.name,
              value: bg.id,
            }))}
          />
        </Form.Item>
      </Form>
      <Modal
        width={800}
        visible={resultData.visible}
        title={t('batch.clone_to_bgids.result.title')}
        footer={null}
        onCancel={() => {
          setResultData({
            visible: false,
            data: [],
          });
        }}
      >
        <Table
          size='small'
          rowKey='id'
          columns={[
            {
              title: t('batch.clone_to_bgids.result.rule'),
              dataIndex: 'rule',
            },
            {
              title: t('batch.clone_to_bgids.result.msg'),
              dataIndex: 'msg',
            },
          ]}
          dataSource={resultData.data}
        />
      </Modal>
    </Modal>
  );
}

export default ModalHOC<Props>(index);

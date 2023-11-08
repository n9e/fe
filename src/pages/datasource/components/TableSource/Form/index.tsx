import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Form, Input, Modal, message } from 'antd';
import Assignee from './Assignee';
import { useTranslation } from 'react-i18next';
import { AutoDatasourcetypeValue } from '../auth';
import { upsertDataSourcePerm } from '../services';
import ESForm from './ES';
import SlsForm from './Sls';
interface Props {
  initialV?: any;
  visible: boolean;
  onClose: (b: boolean) => void;
  type: AutoDatasourcetypeValue;
  dataSourceId: number;
}

// Cascader返回的数据结构是二维数组，提交需要转成对象
const transArr2Obj = (arr) => {
  const result = {};
  arr.forEach((item) => {
    if (item.length === 1) {
      result[item[0] + '_is_all'] = true;
    } else if (item.length === 2) {
      const key = item[0];
      const value = item[1];
      const keyWithIds = key + '_ids';
      if (result[keyWithIds]) {
        result[keyWithIds].push(value);
      } else {
        result[keyWithIds] = [value];
      }
    }
  });
  return result;
};

// 上边方法的逆方法
function transObj2Arr(obj) {
  const result: (String | number)[][] = [];

  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key]) {
      const values = obj[key];
      if (key.endsWith('_is_all')) {
        result.push([key.slice(0, -7)]);
      } else {
        values.forEach((value) => {
          result.push([key.slice(0, -4), value]);
        });
      }
    }
  }
  return result;
}
export default function AuthModal(props: Props) {
  const { visible, onClose, type, dataSourceId, initialV } = props;
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const AuthForm = {
    'elasticsearch': ESForm,
    'aliyun-sls': SlsForm,
  };

  useEffect(() => {
    if (initialV) {
      form.setFieldsValue({ ...initialV, scope: transObj2Arr(initialV.scope) });
    }
  }, [initialV]);

  const handleSubmit = async () => {
    await form.validateFields();
    const values = form.getFieldsValue();
    const data = { ...values, scope: transArr2Obj(values.scope), ds_cate: type, ds_id: dataSourceId };
    const res = await upsertDataSourcePerm(data);
    if (res.err) {
      message.error('Error: ' + res.err);
    }
    onClose(!res.err);
  };

  return (
    <Modal visible={visible} onCancel={() => onClose(false)} title={initialV ? t('auth.edit') : t('auth.new')} onOk={handleSubmit}>
      <Form form={form} layout='vertical'>
        {AuthForm[type]({ dataSourceId })}
        <Form.Item label={t('auth.assign')} name={['scope']} rules={[{ required: true, message: t('auth.placeholder') }]}>
          <Assignee />
        </Form.Item>
        <Form.Item name={['id']} hidden>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
}

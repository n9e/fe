import React, { useState } from 'react';
import { Form, Button, Input, Table, Switch, message } from 'antd';
import { FormComponentProps } from 'antd/lib/form';
import { useDynamicList } from '@umijs/hooks';
import request from '@pkgs/request';
import api from '@pkgs/api';

interface Item {
  cn?: string;
  en?: string;
  leaf?: number;
}

interface IParams {
  selectNode: any;
  onCanel: () => void;
  fetchData: () => void;
}
export default Form.create()((props: FormComponentProps & IParams) => {
  const { list, remove, getKey, push, sortForm } = useDynamicList<Item>([{}]);
  const { getFieldDecorator, getFieldsValue } = props.form;
  const { selectNode } = props;
  const [weight, setWeight] = useState(1);
  const columns = [
    {
      title: '名称',
      dataIndex: 'cn',
      key: 'cn',
      render: (text: string, row: Item, index: number) => (
        <>
          {getFieldDecorator(`params[${getKey(index)}].cn`, { initialValue: text })(
            <Input style={{ width: 120, marginRight: 16 }} placeholder="请输入名称" />,
          )}
        </>
      ),
    },
    {
      title: '英文名',
      dataIndex: 'en',
      key: 'en',
      render: (text: string, row: Item, index: number) => (
        <>
          {getFieldDecorator(`params[${getKey(index)}].en`, { initialValue: text })(
            <Input style={{ width: 120, marginRight: 16 }} placeholder="请输入英文名" />,
          )}
        </>
      ),
    },
    {
      key: '是否是叶子节点',
      title: 'leaf',
      dataIndex: 'leaf',
      render: (text: string, row: Item, index: number) => (
        <>
          {getFieldDecorator(`params[${getKey(index)}].leaf`, { initialValue: text })(
            <Switch />,
          )}
          <Button.Group style={{ marginLeft: 100 }}>
            <Button onClick={() => remove(index)}>
              删除
            </Button>
          </Button.Group>
        </>
      ),
    },
  ];

  const onClick = () => {
    request(api.privileges, {
      method: 'POST',
      body: JSON.stringify(sortForm(getFieldsValue().params.map((item: any, index: number) => (
        {
          cn: item.cn,
          en: item.en,
          leaf: item.leaf ? 1 : 0,
          pid: selectNode.id,
          typ: selectNode.typ,
          path: `${selectNode.path}.${item.en}`,
          weight: !!selectNode.children ? selectNode.children.length + 1 + index : index + 1
        }))))
    }).then(() => {
      message.success('success');
      props.fetchData();
      props.onCanel();
    })
  }


  return (
    <>
      <Table
        columns={columns}
        dataSource={list}
        rowKey={(r: Item, index: number) => getKey(index).toString()}
        pagination={false}
      />
      <Button
        style={{ marginTop: 8 }}
        block
        type="dashed"
        onClick={() => push({})}
      >
        +
      </Button>
      <Button
        style={{ marginTop: 16, marginLeft: 250 }}
        onClick={props.onCanel}
      >
        取消
      </Button>
      <Button
        type="primary"
        style={{ marginTop: 16, marginLeft: 16 }}
        onClick={onClick}
      >
        确定
      </Button>

    </>
  );
});

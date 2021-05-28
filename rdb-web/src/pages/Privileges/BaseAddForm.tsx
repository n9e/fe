import React, { Component } from 'react';
import { Input, Modal, Form, Switch } from 'antd';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import _ from 'lodash';
import { FormProps } from 'antd/lib/form';


interface Node {
  en: string,
  cn: string,
  leaf: 0 | 1,
}

interface NodeEditorModalProps {
  type: 'create' | 'modify',
  pid?: number,
  initialValues?: Node,
  onOk: (values: any, destroy?: () => void) => void,
  onCancel?: () => void,
}

class NodeEditorModal extends Component<NodeEditorModalProps & ModalWrapProps & FormProps> {
  titleMap = {
    create: '创建权限点',
    modify: '修改权限点',
  };

  handleOk = () => {
    this.props.form!.validateFields((err: any, values: any) => {
      if (!err) {
        this.props.onOk({
          ...values,
          leaf: values.leaf ? 1 : 0,
        }, this.props.destroy);
      }
      this.props.form?.resetFields();
    });
  }

  handleCancel = () => {
    this.props.type === 'modify' ? this.props.onCancel() : null;
    this.props.destroy();
  }

  render() {
    const {
      type, visible, initialValues
    } = this.props;
    const { getFieldDecorator } = this.props.form!;

    return (
      <Modal
        title={this.titleMap[type]}
        visible={visible}
        onCancel={this.handleCancel}
        onOk={this.handleOk}
        className="NsTreeModal"
      >
        <Form
          layout="vertical"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <Form.Item label='名称'>
            {getFieldDecorator('cn', {
              initialValue: initialValues ? initialValues.cn : '',
              rules: [{ required: true, message: "必填项！" }],
            })(
              <Input />,
            )}
          </Form.Item>
          <Form.Item label='英文名'>
            {getFieldDecorator('en', {
              initialValue: initialValues ? initialValues.en : '',
              rules: [{ required: true, message: "必填项！" }],
            })(
              <Input />,
            )}
          </Form.Item>
          <Form.Item label='是否叶子节点'>
            {getFieldDecorator('leaf', {
              initialValue: initialValues ? initialValues.leaf === 1 ? true : false : '',
              valuePropName: 'checked',
            })(
              <Switch />,
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export const nodeEditorModal = ModalControl(Form.create()(NodeEditorModal));

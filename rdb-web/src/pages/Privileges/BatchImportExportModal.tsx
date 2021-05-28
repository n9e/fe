import React, { Component } from 'react';
import { Input, Modal, Form, message } from 'antd';
import ModalControl, { ModalWrapProps } from '@pkgs/ModalControl';
import _ from 'lodash';
import { FormProps } from 'antd/lib/form';
import request from '@pkgs/request';
import api from '@pkgs/api';

const { TextArea } = Input;

interface NodeImportExport {
  type: 'import' | 'export',
  data: [],
  onOk: (values: any, destroy?: () => void) => void,
  onCancel?: () => void,
}

class NodeImportModal extends Component<NodeImportExport & ModalWrapProps & FormProps> {
  titleMap = {
    import: '导入策略',
    export: '导出策略',
  };

  handleOk = () => {
    if (this.props.type === 'import') {
      this.props.form!.validateFields((err: any, values: any) => {
        if (!err) {
          let parsed;
          try {
            parsed = _.map(JSON.parse(values.data), (item) => {
              return { ...item };
            });
          } catch (e) {
            message.error(e.toString());
          }
          if (parsed) {
            request(api.privilegesImport, {
              method: 'PUT',
              body: JSON.stringify(parsed),
            }).then(() => {
              this.props.onOk();
              this.props.destroy();
            });
          }
        }
      })
    } else {
      this.props.destroy();
    }
  }

  handleCancel = () => {
    this.props.destroy();
  }

  render() {
    const { type, visible, data } = this.props;
    const { getFieldDecorator } = this.props.form!;
    let initialValue;

    try {
      initialValue = !_.isEmpty(data) ? JSON.stringify(data, null, 4) : undefined;
    } catch (e) {
      console.log(e);
    }
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
          <Form.Item>
            {
              getFieldDecorator('data', {
                initialValue,
              })(
                <TextArea autoSize={{ minRows: 2, maxRows: 10 }} />,
              )
            }
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}

export const nodeImportModal = ModalControl(Form.create()(NodeImportModal));

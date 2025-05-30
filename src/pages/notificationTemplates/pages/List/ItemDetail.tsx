import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Space, message, Modal, Form } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getItemByIdent as getNotificationChannel } from '@/pages/notificationChannels/services';

import { getItem, deleteItem, Item } from '../../services';
import { NS, CN } from '../../constants';
import FormModal from './FormModal';
import FormCpt from './Form';

interface Props {
  id: number;
  onChange: () => void;
  onDelete: () => void;
}

export default forwardRef(function ItemDetail(props: Props, ref) {
  const { t } = useTranslation(NS);
  const { id, onChange, onDelete } = props;
  const [data, setData] = useState<Item>();
  const [form] = Form.useForm();
  const contentRef = React.useRef<{ key: string; value?: string }[]>();
  const [formModalState, setFormModalState] = useState<{
    mode: 'edit' | 'clone';
    visible: boolean;
    data?: Item;
  }>({
    mode: 'edit',
    visible: false,
  });
  const fetchData = () => {
    if (id) {
      getItem(id).then((itemData) => {
        setData(itemData);
        // 将 content: {[key:string]: string} 转换为 content: {key: string, value: string}[]
        const content = _.map(itemData.content, (value, key) => {
          return {
            key,
            value,
          };
        });
        contentRef.current = content;
        form.setFieldsValue({ content });
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useImperativeHandle(
    ref,
    () => {
      return {
        getSavedState() {
          return _.isEqual(form.getFieldsValue().content, contentRef.current);
        },
      };
    },
    [],
  );

  return (
    <>
      <div className={`${CN}-main-header`}>
        <Space
          style={{
            fontSize: 14,
          }}
        >
          <span>{data?.name}</span>
          <EditOutlined
            onClick={() => {
              if (data) {
                setFormModalState({ mode: 'edit', data, visible: true });
              }
            }}
          />
          <CopyOutlined
            onClick={() => {
              if (data) {
                setFormModalState({ mode: 'clone', data, visible: true });
              }
            }}
          />
          <DeleteOutlined
            onClick={() => {
              Modal.confirm({
                title: t('common:confirm.delete'),
                onOk: () => {
                  if (data?.id) {
                    deleteItem([data.id]).then(() => {
                      message.success(t('common:success.delete'));
                      onDelete();
                    });
                  }
                },
                onCancel: () => {},
              });
            }}
          />
        </Space>
        <div>
          <Space>
            <span>
              {t('common:table.ident')}：{data?.ident ?? '-'}
            </span>
            <span>
              {t('notify_channel_ident')}：{data?.notify_channel_ident ?? '-'}
            </span>
          </Space>
        </div>
      </div>
      <FormCpt form={form} item={data} contentRef={contentRef} />
      <FormModal
        visible={formModalState.visible}
        mode={formModalState.mode}
        data={formModalState.data}
        onOk={() => {
          if (formModalState.mode === 'edit') {
            fetchData();
          }
          onChange();
          setFormModalState({ ...formModalState, visible: false });
        }}
        onCancel={() => {
          setFormModalState({ ...formModalState, visible: false });
        }}
      />
    </>
  );
});

import React from 'react';
import { Space, Button } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { LinksItem } from '@/pages/dashboard/types';

interface Props {
  value?: LinksItem;
  onEdit: (value: LinksItem) => void;
  onDelete: () => void;
}

export default function LinkItem(props: Props) {
  const { value, onEdit, onDelete } = props;

  return (
    <div
      style={{
        backgroundColor: 'var(--fc-fill-3)',
      }}
      className='flex items-center justify-between p-2 mb-2 rounded'
    >
      <div
        style={{
          width: 'calc(100% - 100px)',
        }}
      >
        <div>{value?.title}</div>
        <div className='overflow-hidden text-ellipsis whitespace-nowrap'>{value?.url}</div>
      </div>
      <Space size={0}>
        <Button
          icon={<EditOutlined />}
          type='text'
          onClick={() => {
            if (value) {
              onEdit(value);
            }
          }}
        />
        <Button
          icon={<DeleteOutlined />}
          type='text'
          onClick={() => {
            onDelete();
          }}
        />
      </Space>
    </div>
  );
}

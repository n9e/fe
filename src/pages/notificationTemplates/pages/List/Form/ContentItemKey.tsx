import React from 'react';
import { Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import ContentKeyFormModal from './ContentKeyFormModal';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

export default function ContentItemKey(props: Props) {
  const { value, onChange } = props;
  return (
    <Space>
      {value}
      <EditOutlined
        onClick={() => {
          ContentKeyFormModal({
            mode: 'edit',
            contentKey: value,
            onOk: (contentKey) => {
              onChange && onChange(contentKey);
            },
          });
        }}
      />
    </Space>
  );
}

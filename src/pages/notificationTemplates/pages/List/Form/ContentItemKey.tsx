import React from 'react';
import { Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';

import ContentKeyFormModal from './ContentKeyFormModal';

interface Props {
  value?: string;
  onChange?: (value: string) => void;
  hideEdit?: boolean;
}

export default function ContentItemKey(props: Props) {
  const { value, onChange, hideEdit } = props;
  return (
    <Space>
      {value}
      {!hideEdit && (
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
      )}
    </Space>
  );
}

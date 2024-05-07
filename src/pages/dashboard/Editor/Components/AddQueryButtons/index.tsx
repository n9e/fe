import React from 'react';
import { Button, Space, Form } from 'antd';
import _ from 'lodash';
import { IS_PLUS } from '@/utils/constant';
import getFirstUnusedLetter from '../../../Renderer/utils/getFirstUnusedLetter';

export default function index({ add, addQuery }) {
  const targets = Form.useWatch('targets');
  const newRefId = getFirstUnusedLetter(_.map(targets, 'refId'));

  return (
    <Space style={{ marginTop: 10 }}>
      <Button
        onClick={() => {
          addQuery(newRefId);
        }}
      >
        + Add query
      </Button>
      {IS_PLUS && (
        <Button
          onClick={() => {
            add({ expr: '', __mode__: '__expr__', refId: newRefId });
          }}
        >
          + Expression
        </Button>
      )}
    </Space>
  );
}

import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Button, Alert } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { getSqlTemplate } from '../services';

interface Props {
  onSelect: (val: string) => void;
}

export default function SqlTemplates(props: Props) {
  const { onSelect } = props;
  const [templates, setTemplates] = useState<{ [index: string]: string }>();

  useEffect(() => {
    getSqlTemplate().then((res) => {
      setTemplates(res);
    });
  }, []);

  return (
    <Dropdown
      trigger={['click']}
      placement='bottomRight'
      overlay={
        <div>
          <Alert message='以下 sql 查询条件仅供参考，在实际使用的时候，需要将其中的 $变量 替换为实际的值' />
          <Menu style={{ height: 300, width: 800, overflow: 'auto' }}>
            {_.map(templates, (val, key) => {
              return (
                <Menu.Item
                  key={key}
                  onClick={() => {
                    onSelect(val);
                  }}
                >
                  <strong>{key}:</strong> <span style={{ color: '#999' }}>{val}</span>
                </Menu.Item>
              );
            })}
          </Menu>
        </div>
      }
    >
      <Button>
        查询模板 <DownOutlined />
      </Button>
    </Dropdown>
  );
}

import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Button } from 'antd';
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
      overlay={
        <Menu>
          {_.map(templates, (val, key) => {
            return (
              <Menu.Item
                key={key}
                onClick={() => {
                  onSelect(val);
                }}
              >
                {key}
              </Menu.Item>
            );
          })}
        </Menu>
      }
    >
      <Button>
        查询模板 <DownOutlined />
      </Button>
    </Dropdown>
  );
}

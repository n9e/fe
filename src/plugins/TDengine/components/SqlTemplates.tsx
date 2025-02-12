import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Button, Alert } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getSqlTemplate } from '../services';

interface Props {
  onSelect: (val: string) => void;
}

export default function SqlTemplates(props: Props) {
  const { t } = useTranslation('db_tdengine');
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
          <Alert message={t('query.sqlTemplates_tip')} />
          <Menu style={{ height: 300, width: 900, overflow: 'auto' }}>
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
        {t('query.sqlTemplates')} <DownOutlined />
      </Button>
    </Dropdown>
  );
}

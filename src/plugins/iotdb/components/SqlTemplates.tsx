import React, { useState, useEffect } from 'react';
import { Dropdown, Menu, Button, Alert } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getSqlTemplate } from '../services';

interface Props {
  cate?: string;
  onSelect: (val: string) => void;
}

export default function SqlTemplates(props: Props) {
  const { t } = useTranslation('db_iotdb');
  const { cate, onSelect } = props;
  const [templates, setTemplates] = useState<{ [index: string]: string }>();
  const [errorContent, setErrorContent] = useState('');

  useEffect(() => {
    getSqlTemplate(cate)
      .then((res) => {
        setTemplates(res);
        setErrorContent('');
      })
      .catch((err) => {
        setTemplates({});
        setErrorContent(_.get(err, 'message') || t('query.sqlTemplates_load_failed'));
      });
  }, [cate, t]);

  return (
    <Dropdown
      trigger={['click']}
      placement='bottomRight'
      overlay={
        <div>
          <Alert message={t('query.sqlTemplates_tip')} />
          {errorContent && <Alert className='mt-2' message={errorContent} type='error' />}
          <Menu style={{ height: 300, width: 900, overflow: 'auto' }}>
            {_.map(templates, (val, key) => {
              return (
                <Menu.Item
                  key={key}
                  onClick={() => {
                    onSelect(val);
                  }}
                >
                  <strong>{key}:</strong> <span style={{ color: 'var(--fc-text-3)' }}>{val}</span>
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

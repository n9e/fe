import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { Select, SelectProps, Form, Space, Tooltip } from 'antd';
import { SyncOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getContactKeys, Item } from './services';
import { NS } from '../../../constants';

export default function ContactKeysSelect(props: SelectProps) {
  const { t } = useTranslation(NS);
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    setLoading(true);
    getContactKeys()
      .then((res) => {
        setData(
          _.concat(
            [
              {
                label: 'Phone',
                key: 'phone',
              },
              {
                label: 'Email',
                key: 'email',
              },
            ],
            res,
          ),
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Form.Item
      name={['param_config', 'user_info', 'contact_key']}
      label={
        <Space size={4}>
          {t('variable_configuration.contact_key')}
          <Tooltip className='n9e-ant-from-item-tooltip' title={t('variable_configuration.contact_key_tip')}>
            <QuestionCircleOutlined />
          </Tooltip>
          <Link to='/help/notification-settings?tab=contacts' target='_blank'>
            <SettingOutlined />
          </Link>
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              fetchData();
              e.preventDefault();
            }}
          />
        </Space>
      }
    >
      <Select
        {...(props || {})}
        options={_.map(data, (item) => {
          return {
            label: item.label,
            value: item.key,
          };
        })}
      />
    </Form.Item>
  );
}

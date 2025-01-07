/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Space, Dropdown, Menu } from 'antd';
import { EditOutlined, LinkOutlined, DashboardOutlined } from '@ant-design/icons';
import Edit from './Edit';
import { ILink } from '../types';
import './style.less';

interface IProps {
  editable?: boolean;
  value?: ILink[];
  onChange: (newValue: ILink[]) => void;
}

export default function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { editable = true, value } = props;
  const links = useMemo(() => {
    const data: {
      id: string;
      type: string;
      title: string;
      url: string;
      targetBlank?: boolean;
    }[] = [];
    _.forEach(value, (item) => {
      if (item.type === 'dashboards') {
        _.forEach(item.dashboards, (dashboard) => {
          data.push({
            id: _.uniqueId(),
            type: 'dashboards',
            title: dashboard.name,
            url: `/dashboards/${dashboard.ident || dashboard.id}`,
            targetBlank: item.targetBlank,
          });
        });
      } else {
        data.push({
          ...item,
          id: _.uniqueId(),
        });
      }
    });
    return data;
  }, [JSON.stringify(value)]);

  return (
    <div className='dashboard-detail-links'>
      <Space align='baseline'>
        <Dropdown
          overlay={
            <Menu>
              {editable && (
                <Menu.Item
                  key='edit_links'
                  onClick={() => {
                    Edit({
                      initialValues: value,
                      onOk: (newValue) => {
                        props.onChange(newValue);
                      },
                    });
                  }}
                >
                  <Space>
                    <EditOutlined />
                    {t('common:btn.edit')}
                  </Space>
                </Menu.Item>
              )}
              {_.map(links, (item) => {
                return (
                  <Menu.Item key={item.id}>
                    <a href={item.url} target={item.targetBlank ? '_blank' : '_self'}>
                      <Space>
                        {item.type === 'dashboards' ? <DashboardOutlined /> : <LinkOutlined />}
                        {item.title}
                      </Space>
                    </a>
                  </Menu.Item>
                );
              })}
            </Menu>
          }
        >
          <Button icon={<LinkOutlined />} />
        </Dropdown>
      </Space>
    </div>
  );
}

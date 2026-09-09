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

import { useIsAuthorized } from '@/components/AuthorizationWrapper';

import Edit from './Edit';
import { ILink } from '../types';
import useStableValue from '../hooks/useStableValue';
import './style.less';

interface IProps {
  editable?: boolean;
  value?: ILink[];
  onChange: (newValue: ILink[]) => void;
}

export default function index(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { editable = true, value } = props;
  const indexPatternsAuthorized = useIsAuthorized(['/dashboards/put']);
  const stableValue = useStableValue(value);
  const links = useMemo(() => {
    const data: {
      id: string;
      type: string;
      title: string;
      url: string;
      targetBlank?: boolean;
    }[] = [];
    _.forEach(stableValue, (item) => {
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
  }, [stableValue]);

  // 如果没有编辑权限并且没有配置链接，则不渲染
  if (!indexPatternsAuthorized && _.isEmpty(value)) return null;

  return (
    <div className='dashboard-detail-links'>
      <Space align='baseline'>
        <Dropdown
          overlay={
            <Menu
              items={[
                ...(editable
                  ? [
                      {
                        key: 'edit_links',
                        label: (
                          <Space>
                            <EditOutlined />
                            {t('common:btn.edit')}
                          </Space>
                        ),
                        onClick: () => {
                          Edit({
                            initialValues: value as ILink[],
                            onOk: props.onChange as (value: unknown) => void,
                            // 组件内部使用 destroy 关闭弹窗，onCancel 为类型所需
                            onCancel: () => undefined,
                          });
                        },
                      },
                    ]
                  : []),
                ..._.map(links, (item) => ({
                  key: item.id,
                  label: (
                    <a href={item.url} target={item.targetBlank ? '_blank' : '_self'}>
                      <Space>
                        {item.type === 'dashboards' ? <DashboardOutlined /> : <LinkOutlined />}
                        {item.title}
                      </Space>
                    </a>
                  ),
                })),
              ]}
            />
          }
        >
          <Button icon={<LinkOutlined />} />
        </Dropdown>
      </Space>
    </div>
  );
}

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
import React, { useState, useEffect, useContext } from 'react';
import { Space, Table } from 'antd';
import Icon from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import { getN9EServers } from '@/services/help';
import { CommonStateContext } from '@/App';
import SystemInfoSvg from '../../../../public/image/system-info.svg';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import './locale';

function calculateRowSpans(data, field) {
  const spans: number[] = [];
  let count = 0;
  for (let i = 0; i < data.length; i++) {
    if (i === 0 || data[i][field] !== data[i - 1][field]) {
      count = 1;
      for (let j = i + 1; j < data.length; j++) {
        if (data[j][field] === data[i][field]) count++;
        else break;
      }
      spans.push(count);
    } else {
      spans.push(0);
    }
  }
  return spans;
}

export default function Servers() {
  const { t } = useTranslation('servers');
  const { profile, datasourceList } = useContext(CommonStateContext);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const columns = [
    {
      title: t('cluster'),
      dataIndex: 'cluster',
      key: 'cluster',
      sorter: (a: any, b: any) => {
        return localeCompare(a.cluster, b.cluster);
      },
      render: (text, record, index) => {
        const rowSpan = calculateRowSpans(data, 'cluster')[index];
        return {
          children: text,
          props: {
            rowSpan: rowSpan,
          },
        };
      },
    },
    {
      title: t('instance'),
      dataIndex: 'instance',
      key: 'instance',
      sorter: (a: any, b: any) => {
        return localeCompare(a.instance, b.instance);
      },
      render: (text, record, index) => {
        const rowSpan = calculateRowSpans(data, 'instance')[index];
        return {
          children: text,
          props: {
            rowSpan: rowSpan,
          },
        };
      },
    },
    {
      title: t('datasource'),
      dataIndex: 'datasource_id',
      key: 'datasource_id',
      sorter: (a: any, b: any) => {
        return localeCompare(a.datasource_id, b.datasource_id);
      },
      render: (text) => {
        return _.get(_.find(datasourceList, { id: text }), 'name');
      },
    },
    {
      title: t('clock'),
      dataIndex: 'clock',
      key: 'clock',
      sorter: (a: any, b: any) => {
        return localeCompare(a.clock, b.clock);
      },
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  const fetchData = () => {
    getN9EServers()
      .then((res) => {
        setData(res.dat);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout
      icon={<Icon component={SystemInfoSvg as any} />}
      title={
        <Space>
          {t('title')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/system-configuration/alert-engine/' />
        </Space>
      }
    >
      <div>
        <div className='n9e-border-base' style={{ padding: 20 }}>
          {profile.admin ? (
            <div>
              <Table bordered size='small' rowKey='id' tableLayout='fixed' loading={loading} dataSource={data} pagination={false} columns={columns} />
            </div>
          ) : (
            <div>{t('unauthorized')}</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

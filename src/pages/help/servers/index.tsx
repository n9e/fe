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
import { Table } from 'antd';
import Icon from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { getN9EServers } from '@/services/help';
import { CommonStateContext } from '@/App';
import SystemInfoSvg from '../../../../public/image/system-info.svg';
import localeCompare from '@/pages/dashboard/Renderer/utils/localeCompare';
import './locale';

const convertDataToRowSpan = (data: any[] = [], columns: any[] = []) => {
  const keys = columns.map((item) => item.dataIndex);
  for (const key of keys) {
    for (let i = 0; i < data.length; i++) {
      let count = 1;
      let r = i;

      for (let j = i + 1; j < data.length; j++) {
        if (data[i][key] === data[j][key]) {
          count++;
          i = j;
          if (!data[j].row_span_map) {
            data[j].row_span_map = {};
          }
          data[j].row_span_map[key] = 0;
        } else {
          break;
        }
      }

      if (!data[r].row_span_map) {
        data[r].row_span_map = {};
      }

      data[r].row_span_map[key] = count;
    }
  }

  return data;
};

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
      onCell: (record) => {
        return {
          rowSpan: record.row_span_map?.['cluster'],
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
      onCell: (record) => {
        return {
          rowSpan: record.row_span_map?.['instance'],
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
      onCell: (record) => {
        return {
          rowSpan: record.row_span_map?.['datasource_id'],
        };
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
        setData(convertDataToRowSpan(res.dat, columns));
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
      title={
        <>
          <Icon component={SystemInfoSvg as any} /> {t('title')}
        </>
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

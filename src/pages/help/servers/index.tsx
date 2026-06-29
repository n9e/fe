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
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Space } from 'antd';
import Icon from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import EnhancedTable from '@/components/EnhancedTable';
import { getN9EServers } from '@/services/help';
import { CommonStateContext } from '@/App';
import SystemInfoSvg from '@/assets/n9e/image/system-info.svg?react';
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
  // 受控排序：rowSpan 合并依赖行的展示顺序，本地 sorter 改顺序后 row_span_map 会错位，故自己排序后再重算合并
  const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' | null }>({});
  const columns = [
    {
      title: t('cluster'),
      dataIndex: 'cluster',
      key: 'cluster',
      sorter: true,
      sortOrder: sorter.field === 'cluster' ? sorter.order : undefined,
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
      sorter: true,
      sortOrder: sorter.field === 'instance' ? sorter.order : undefined,
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
      sorter: true,
      sortOrder: sorter.field === 'datasource_id' ? sorter.order : undefined,
      render: (text) => {
        return _.get(_.find(datasourceList, { id: text }), 'name');
      },
    },
    {
      title: t('clock'),
      dataIndex: 'clock',
      key: 'clock',
      sorter: true,
      sortOrder: sorter.field === 'clock' ? sorter.order : undefined,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
    },
  ];
  // 先按受控排序状态排序，再重算 rowSpan，保证合并与展示顺序一致
  const displayData = useMemo(() => {
    const arr = _.cloneDeep(data);
    if (sorter.field && sorter.order) {
      arr.sort((a, b) => {
        const r = localeCompare(a[sorter.field!], b[sorter.field!]);
        return sorter.order === 'ascend' ? r : -r;
      });
    }
    return convertDataToRowSpan(arr, columns);
  }, [data, sorter, datasourceList]);
  const fetchData = () => {
    getN9EServers()
      .then((res) => {
        setData(res.dat || []);
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
      title={<Space>{t('title')}</Space>}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/system-configuration/alert-engine/'
    >
      <div className='n9e'>
        {profile.admin ? (
          <div>
            <EnhancedTable
              bordered
              size='small'
              rowKey='id'
              tableLayout='fixed'
              loading={loading}
              dataSource={displayData}
              pagination={false}
              columns={columns}
              onChange={(_pagination, _filters, s: any) => {
                setSorter({ field: s.field, order: s.order });
              }}
            />
          </div>
        ) : (
          <div>{t('unauthorized')}</div>
        )}
      </div>
    </PageLayout>
  );
}

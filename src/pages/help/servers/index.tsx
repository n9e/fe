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

export default function Servers() {
  const { t } = useTranslation('servers');
  const { profile, datasourceList } = useContext(CommonStateContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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
      title={
        <>
          <Icon component={SystemInfoSvg as any} /> {t('title')}
        </>
      }
    >
      <div>
        <div style={{ padding: 20 }}>
          {profile.admin ? (
            <div>
              <Table
                size='small'
                rowKey='id'
                tableLayout='fixed'
                loading={loading}
                dataSource={data}
                pagination={false}
                columns={[
                  {
                    title: t('instance'),
                    dataIndex: 'instance',
                    key: 'instance',
                    sorter: (a: any, b: any) => {
                      return localeCompare(a.instance, b.instance);
                    },
                  },
                  {
                    title: t('cluster'),
                    dataIndex: 'cluster',
                    key: 'cluster',
                    sorter: (a: any, b: any) => {
                      return localeCompare(a.cluster, b.cluster);
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
                ]}
              />
            </div>
          ) : (
            <div>{t('unauthorized')}</div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

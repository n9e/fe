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
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Button, Table } from 'antd';
import { useHistory } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { useAntdTable } from 'ahooks';
import { CommonStateContext } from '@/App';
import { getEvents } from './services';
import { deleteAlertEventsModal } from './index';
import { SeverityColor } from './index';

interface IProps {
  filterObj: any;
  header: React.ReactNode;
  filter: any;
  setFilter: (filter: any) => void;
  refreshFlag: string;
}

export default function TableCpt(props: IProps) {
  const { filterObj, filter, setFilter, header } = props;
  const history = useHistory();
  const { t } = useTranslation('AlertCurEvents');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const columns = [
    {
      title: t('common:datasource.type'),
      dataIndex: 'cate',
    },
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_id',
      render: (value, record) => {
        return _.find(groupedDatasourceList?.[record.cate], { id: value })?.name || '-';
      },
    },
    {
      title: t('rule_name'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        const content =
          tags &&
          tags.map((item) => (
            <Tag
              color='purple'
              key={item}
              onClick={() => {
                if (!filter.queryContent.includes(item)) {
                  setFilter({
                    ...filter,
                    queryContent: filter.queryContent ? `${filter.queryContent.trim()} ${item}` : item,
                  });
                }
              }}
            >
              {item}
            </Tag>
          ));
        return (
          <>
            <div>
              <a style={{ padding: 0 }} onClick={() => history.push(`/alert-cur-events/${id}`)}>
                {title}
              </a>
            </div>
            <div>
              <span className='event-tags'>{content}</span>
            </div>
          </>
        );
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      width: 120,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operate',
      width: 120,
      render(value, record) {
        return (
          <>
            <Button
              size='small'
              type='link'
              onClick={() => {
                history.push({
                  pathname: '/alert-mutes/add',
                  search: queryString.stringify({
                    busiGroup: record.group_id,
                    prod: record.rule_prod,
                    cate: record.cate,
                    datasource_ids: [record.datasource_id],
                    tags: record.tags,
                  }),
                });
              }}
            >
              {t('shield')}
            </Button>
            <Button
              size='small'
              type='link'
              danger
              onClick={() =>
                deleteAlertEventsModal(
                  [record.id],
                  () => {
                    setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
                    setRefreshFlag(_.uniqueId('refresh_'));
                  },
                  t,
                )
              }
            >
              {t('common:btn.delete')}
            </Button>
          </>
        );
      },
    },
  ];
  const fetchData = ({ current, pageSize }) => {
    return getEvents({
      p: current,
      limit: pageSize,
      ...filterObj,
    }).then((res) => {
      return {
        total: res.dat.total,
        list: res.dat.list,
      };
    });
  };
  const { tableProps } = useAntdTable(fetchData, {
    refreshDeps: [refreshFlag, JSON.stringify(filterObj), props.refreshFlag],
    defaultPageSize: 30,
    debounceWait: 500,
  });

  return (
    <div className='event-content'>
      <div style={{ padding: 16, width: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex' }}>{header}</div>
        <Table
          size='small'
          columns={columns}
          {...tableProps}
          rowClassName={(record: { severity: number; is_recovered: number }) => {
            return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
          }}
          pagination={{
            ...tableProps.pagination,
            pageSizeOptions: ['30', '100', '200', '500'],
          }}
        />
      </div>
    </div>
  );
}

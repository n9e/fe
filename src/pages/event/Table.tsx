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
import { Tag, Button, Table, Tooltip, Dropdown, Menu } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { useAntdTable } from 'ahooks';
import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import { getEvents } from './services';
import { deleteAlertEventsModal } from './index';
import { SeverityColor } from './index';

// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';

interface IProps {
  filterObj: any;
  header: React.ReactNode;
  filter: any;
  setFilter: (filter: any) => void;
  refreshFlag: string;
  selectedRowKeys: number[];
  setSelectedRowKeys: (selectedRowKeys: number[]) => void;
}

export default function TableCpt(props: IProps) {
  const { filterObj, filter, setFilter, header, selectedRowKeys, setSelectedRowKeys } = props;
  const history = useHistory();
  const { t } = useTranslation('AlertCurEvents');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const columns = [
    {
      title: t('prod'),
      dataIndex: 'rule_prod',
      width: 100,
      render: (value) => {
        return t(`AlertHisEvents:rule_prod.${value}`);
      },
    },
    {
      title: t('common:datasource.id'),
      dataIndex: 'datasource_id',
      width: 100,
      render: (value, record) => {
        if (value === 0) {
          return '$all';
        }
        return _.find(groupedDatasourceList?.[record.cate], { id: value })?.name || '-';
      },
    },
    {
      title: t('rule_name'),
      dataIndex: 'rule_name',
      render(title, { id, tags }) {
        return (
          <>
            <div className='mb1'>
              <Link to={`/alert-cur-events/${id}`}>{title}</Link>
            </div>
            <div>
              {_.map(tags, (item) => {
                return (
                  <Tooltip key={item} title={item}>
                    <Tag
                      // color='purple'
                      style={{ maxWidth: '100%' }}
                      onClick={() => {
                        if (!filter.queryContent.includes(item)) {
                          setFilter({
                            ...filter,
                            queryContent: filter.queryContent ? `${filter.queryContent.trim()} ${item}` : item,
                          });
                        }
                      }}
                    >
                      <div
                        style={{
                          maxWidth: 'max-content',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {item}
                      </div>
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          </>
        );
      },
    },
    {
      title: t('first_trigger_time'),
      dataIndex: 'first_trigger_time',
      width: 120,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
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
      width: 80,
      render(value, record) {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item>
                  <AckBtn
                    data={record}
                    onOk={() => {
                      setRefreshFlag(_.uniqueId('refresh_'));
                    }}
                  />
                </Menu.Item>
                {!_.includes(['firemap', 'northstar'], record?.rule_prod) && (
                  <Menu.Item>
                    <Button
                      style={{ padding: 0 }}
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
                  </Menu.Item>
                )}
                <Menu.Item>
                  <Button
                    style={{ padding: 0 }}
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
                </Menu.Item>
              </Menu>
            }
          >
            <Button type='link' icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];
  if (import.meta.env.VITE_IS_PRO === 'true') {
    columns.splice(5, 0, {
      title: t('status'),
      dataIndex: 'status',
      width: 100,
      render: (value) => {
        return t(`status_${value}`) as string;
      },
    });
    columns.splice(6, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      width: 100,
      render: (value) => {
        return value;
      },
    });
  }
  const fetchData = ({ current, pageSize }) => {
    const params: any = {
      p: current,
      limit: pageSize,
      ..._.omit(filterObj, 'range'),
    };
    if (filterObj.range) {
      const parsedRange = parseRange(filterObj.range);
      params.stime = moment(parsedRange.start).unix();
      params.etime = moment(parsedRange.end).unix();
    }
    return getEvents(params).then((res) => {
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
      <div className='n9e-border-base' style={{ padding: 16, width: '100%', overflowY: 'auto' }}>
        <div style={{ display: 'flex' }}>{header}</div>
        <Table
          className='mt8'
          size='small'
          tableLayout='fixed'
          rowKey={(record) => record.id}
          columns={columns}
          {...tableProps}
          rowClassName={(record: { severity: number; is_recovered: number }) => {
            return SeverityColor[record.is_recovered ? 3 : record.severity - 1] + '-left-border';
          }}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange(selectedRowKeys: number[]) {
              setSelectedRowKeys(selectedRowKeys);
            },
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

import React, { useState, useContext } from 'react';
import { Drawer, Table, Tag, Dropdown, Menu, Button, Row, Col, Space, Select, Input } from 'antd';
import { MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import queryString from 'query-string';

import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import { getEvents } from '@/pages/event/services';
import { CommonStateContext } from '@/App';
import { deleteAlertEventsModal } from '@/pages/event';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { IS_PLUS, IS_ENT } from '@/utils/constant';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { allCates } from '@/components/AdvancedWrap/utils';
import { getEventById } from '@/pages/alertCurEvent/services';
import { NS as alertCurEventNS } from '@/pages/alertCurEvent/constants';
import EventDetailDrawer from '@/pages/alertCurEvent/pages/List/EventDetailDrawer';

import './style.less';

// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';
// @ts-ignore
import BatchAckBtn from 'plus:/parcels/Event/Acknowledge/BatchAckBtn';

export interface Props {
  title?: string;
  rid?: number;
  visible: boolean;
  onClose: () => void;
}

const SeverityColor = ['red', 'orange', 'yellow', 'green'];
const fetchData = (rid, filter, { current, pageSize }) => {
  const params: any = {
    p: current,
    limit: pageSize,
    ..._.omit(filter, 'range'),
    rid,
  };
  if (filter.range) {
    const parsedRange = parseRange(filter.range);
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

export default function index(props: Props) {
  const { t } = useTranslation('AlertCurEvents');
  const { datasourceList, feats } = useContext(CommonStateContext);
  const history = useHistory();
  const { title, rid, visible, onClose } = props;
  const [filter, setFilter] = useState<any>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [eventDetailDrawerData, setEventDetailDrawerData] = useState<{
    visible: boolean;
    data?: any;
  }>({
    visible: false,
  });
  const { tableProps } = useAntdTable(
    (params) => {
      if (visible) {
        return fetchData(rid, filter, params);
      }
      return Promise.resolve({
        total: 0,
        list: [],
      });
    },
    {
      refreshDeps: [rid, visible, JSON.stringify(filter), refreshFlag],
      defaultPageSize: 30,
      debounceWait: 500,
    },
  );
  const columns = [
    {
      title: t(`${alertCurEventNS}:event_name`),
      dataIndex: 'rule_name',
      render(title, record) {
        const currentDatasourceCate = _.find(allCates, { value: record.cate });
        const currentDatasource = _.find(datasourceList, { id: record.datasource_id });

        return (
          <div className='max-w-[60vw]'>
            <div className='mb-2'>
              <Space>
                {currentDatasourceCate && currentDatasource ? (
                  <Space>
                    <img src={currentDatasourceCate.logo} height={14} />
                    {currentDatasource.name}
                    <span>/</span>
                  </Space>
                ) : record.cate === 'host' ? (
                  <Space>
                    <img src='/image/logos/host.png' height={14} />
                    <span>/</span>
                  </Space>
                ) : null}
                <a
                  onClick={() => {
                    getEventById(record.id).then((res) => {
                      setEventDetailDrawerData({
                        visible: true,
                        data: res.dat,
                      });
                    });
                  }}
                >
                  {title}
                </a>
              </Space>
            </div>
            <div>
              {_.map(record.tags, (item) => {
                return (
                  <Tag
                    key={item}
                    style={{ maxWidth: '100%' }}
                    onClick={() => {
                      if (!_.includes(filter.query, item)) {
                        setFilter({
                          ...filter,
                          query: filter.query ? `${filter.query.trim()} ${item}` : item,
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
                );
              })}
            </div>
          </div>
        );
      },
    },
    {
      title: t('first_trigger_time'),
      dataIndex: 'first_trigger_time',
      fixed: 'right' as const,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('trigger_time'),
      dataIndex: 'trigger_time',
      fixed: 'right' as const,
      render(value) {
        return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operate',
      fixed: 'right' as const,
      render(_value, record) {
        return (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key='AckBtn'>
                  <AckBtn
                    data={record}
                    onOk={() => {
                      setRefreshFlag(_.uniqueId('refresh_'));
                    }}
                  />
                </Menu.Item>
                {!_.includes(['firemap', 'northstar'], record?.rule_prod) && (
                  <Menu.Item key='mute'>
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
                <Menu.Item key='delete'>
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
  if (IS_PLUS) {
    columns.splice(3, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      fixed: 'right' as const,
      render: (value, record) => {
        if (record.status === 1) {
          return value;
        }
        return t('status_0');
      },
    });
  }
  let prodOptions = getProdOptions(feats);
  if (IS_ENT) {
    prodOptions = [
      ...prodOptions,
      {
        label: t('AlertHisEvents:rule_prod.firemap'),
        value: 'firemap',
        pro: false,
      },
      {
        label: t('AlertHisEvents:rule_prod.northstar'),
        value: 'northstar',
        pro: false,
      },
    ];
  }

  return (
    <Drawer title={title} placement='right' onClose={onClose} visible={visible} width='80%'>
      <Row justify='space-between' style={{ width: '100%' }}>
        <Space>
          <TimeRangePicker
            allowClear
            value={filter.range}
            onChange={(val) => {
              setFilter({
                ...filter,
                range: val,
              });
            }}
            dateFormat='YYYY-MM-DD HH:mm:ss'
          />
          <Select
            allowClear
            placeholder={t('prod')}
            style={{ minWidth: 80 }}
            value={filter.rule_prods}
            mode='multiple'
            onChange={(val) => {
              setFilter({
                ...filter,
                rule_prods: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            {prodOptions.map((item) => {
              return (
                <Select.Option value={item.value} key={item.value}>
                  {item.label}
                </Select.Option>
              );
            })}
          </Select>
          <DatasourceSelect
            style={{ width: 100 }}
            filterKey='alertRule'
            value={filter.datasource_ids}
            onChange={(val: number[]) => {
              setFilter({
                ...filter,
                datasource_ids: val,
              });
            }}
          />
          <BusinessGroupSelectWithAll
            value={filter.bgid}
            onChange={(val: number) => {
              setFilter({
                ...filter,
                bgid: val,
              });
            }}
          />
          <Select
            allowClear
            style={{ minWidth: 80 }}
            placeholder={t('severity')}
            value={filter.severity}
            onChange={(val) => {
              setFilter({
                ...filter,
                severity: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            <Select.Option value={1}>S1（Critical）</Select.Option>
            <Select.Option value={2}>S2（Warning）</Select.Option>
            <Select.Option value={3}>S3（Info）</Select.Option>
          </Select>
          <Input
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
            value={filter.query}
            onChange={(e) => {
              setFilter({
                ...filter,
                query: e.target.value,
              });
            }}
          />
        </Space>
        <Col
          flex='100px'
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Dropdown
            overlay={
              <ul className='ant-dropdown-menu'>
                <li
                  className='ant-dropdown-menu-item'
                  onClick={() =>
                    deleteAlertEventsModal(
                      selectedRowKeys,
                      () => {
                        setSelectedRowKeys([]);
                        setRefreshFlag(_.uniqueId('refresh_'));
                      },
                      t,
                    )
                  }
                >
                  {t('common:btn.batch_delete')}
                </li>
                <BatchAckBtn
                  selectedIds={selectedRowKeys}
                  onOk={() => {
                    setSelectedRowKeys([]);
                    setRefreshFlag(_.uniqueId('refresh_'));
                  }}
                />
              </ul>
            }
            trigger={['click']}
          >
            <Button style={{ marginRight: 8 }} disabled={selectedRowKeys.length === 0}>
              {t('batch_btn')}
            </Button>
          </Dropdown>
        </Col>
      </Row>
      <Table
        className='mt8 alert-rules-events-table'
        size='small'
        tableLayout='auto'
        scroll={!_.isEmpty(tableProps.dataSource) ? { x: 'max-content' } : undefined} // TODO: 临时解决空数据时会出现滚动条问题
        rowKey={(record) => record.id}
        columns={columns}
        {...tableProps}
        rowClassName={(record) => {
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
      <EventDetailDrawer
        visible={eventDetailDrawerData.visible}
        data={eventDetailDrawerData.data}
        onClose={() => setEventDetailDrawerData({ visible: false })}
        onDeleteSuccess={() => {
          setRefreshFlag(_.uniqueId('refresh_'));
          setSelectedRowKeys([]);
        }}
      />
    </Drawer>
  );
}

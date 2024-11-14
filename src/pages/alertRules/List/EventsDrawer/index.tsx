import React, { useState, useContext } from 'react';
import { Drawer, Table, Tooltip, Tag, Dropdown, Menu, Button, Row, Col, Space, Select, Input } from 'antd';
import { MoreOutlined, SearchOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';
import queryString from 'query-string';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import { getEvents } from '@/pages/event/services';
import { CommonStateContext } from '@/App';
import { deleteAlertEventsModal } from '@/pages/event';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { IS_PLUS, IS_ENT } from '@/utils/constant';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
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
  const { groupedDatasourceList, feats } = useContext(CommonStateContext);
  const history = useHistory();
  const { title, rid, visible, onClose } = props;
  const [filter, setFilter] = useState<any>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
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
    columns.splice(5, 0, {
      title: t('claimant'),
      dataIndex: 'claimant',
      width: 100,
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
        tableLayout='fixed'
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
    </Drawer>
  );
}

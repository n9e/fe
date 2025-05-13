import React, { useEffect, useState, useLayoutEffect, useRef, useImperativeHandle, useContext } from 'react';
import { Button, Drawer, Tag, Table, Dropdown, Menu, Tooltip } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';
import _, { throttle } from 'lodash';
import moment from 'moment';
import { useDebounceFn } from 'ahooks';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';

import { getAlertCards, getCardDetail } from '@/services/warning';
import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';

import { SeverityColor, deleteAlertEventsModal } from './index';
import AggrRuleDropdown from './AggrRuleDropdown';
import './index.less';

// @ts-ignore
import BatchAckBtn from 'plus:/parcels/Event/Acknowledge/BatchAckBtn';
// @ts-ignore
import AckBtn from 'plus:/parcels/Event/Acknowledge/AckBtn';

interface Props {
  filter: any;
  refreshFlag: string;
}

interface CardType {
  severity: number;
  title: string;
  total: number;
  event_ids: number[];
}

function containerWidthToColumn(width: number): number {
  if (width > 1500) {
    return 4;
  } else if (width > 1000) {
    return 6;
  } else if (width > 850) {
    return 8;
  } else {
    return 12;
  }
}

function Card(props: Props, ref) {
  const { t } = useTranslation('AlertCurEvents');
  const { filter, refreshFlag } = props;
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const Ref = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const [span, setSpan] = useState<number>(4);
  const [rule, setRule] = useState<string>();
  const [cardList, setCardList] = useState<CardType[]>();
  const [openedCard, setOpenedCard] = useState<CardType>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [drawerList, setDrawerList] = useState<any>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    reloadCard();
  }, [filter, rule, refreshFlag]);

  const { run: reloadCard } = useDebounceFn(
    () => {
      if (!rule) return;
      const params: any = { ..._.omit(filter, 'range'), rule: rule.trim() };
      if (filter.range) {
        const parsedRange = parseRange(filter.range);
        params.stime = moment(parsedRange.start).unix();
        params.etime = moment(parsedRange.end).unix();
      }
      getAlertCards(params).then((res) => {
        setCardList(res.dat);
      });
    },
    {
      wait: 500,
    },
  );

  useLayoutEffect(() => {
    function updateSize() {
      const width = Ref.current?.offsetWidth;
      width && setSpan(containerWidthToColumn(width));
    }
    const debounceNotify = throttle(updateSize, 400);

    window.addEventListener('resize', debounceNotify);
    updateSize();
    return () => window.removeEventListener('resize', debounceNotify);
  }, []);

  const onClose = () => {
    setVisible(false);
  };

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
                      fetchCardDetail(openedCard!);
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
                          fetchCardDetail(openedCard!);
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

  const fetchCardDetail = (card: CardType) => {
    setVisible(true);
    setOpenedCard(card);
    getCardDetail(card.event_ids).then((res) => {
      setDrawerList(res.dat);
    });
  };

  useImperativeHandle(ref, () => ({
    reloadCard,
  }));

  return (
    <div className='cur-events p-2' ref={Ref}>
      <AggrRuleDropdown onRefreshRule={setRule} />
      <div className='w-full overflow-y-auto pt-2 h-[172px] gap-4 items-start'>
        {cardList?.map((card, i) => (
          <div
            key={i}
            className={`py-1 px-2 event-card-new cursor-pointer items-center mr-3 mb-2  inline-flex justify-between gap-4 border-radius-[2px] ${SeverityColor[card.severity - 1]}`}
            onClick={() => fetchCardDetail(card)}
          >
            <div className='truncate' style={{ color: 'inherit' }}>
              {card.title}
            </div>
            <span className={`event-card-circle ${SeverityColor[card.severity - 1]} flex items-center justify-center w-[20px] h-[20px] rounded-full `}>{card.total}</span>
          </div>
        ))}
      </div>
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{openedCard?.title}</span>
            <Dropdown
              disabled={selectedRowKeys.length === 0}
              overlay={
                <ul className='ant-dropdown-menu'>
                  <li
                    className='ant-dropdown-menu-item'
                    onClick={() =>
                      deleteAlertEventsModal(
                        selectedRowKeys,
                        () => {
                          setSelectedRowKeys([]);
                          fetchCardDetail(openedCard!);
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
                      fetchCardDetail(openedCard!);
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
          </div>
        }
        placement='right'
        onClose={onClose}
        visible={visible}
        width='80%'
      >
        <Table
          tableLayout='fixed'
          size='small'
          rowKey={'id'}
          className='card-event-drawer'
          rowClassName={(record: { severity: number }, index) => {
            return SeverityColor[record.severity - 1] + '-left-border';
          }}
          rowSelection={{
            selectedRowKeys: selectedRowKeys,
            onChange(selectedRowKeys, selectedRows) {
              setSelectedRowKeys(selectedRowKeys.map((key) => Number(key)));
            },
          }}
          dataSource={drawerList}
          columns={columns}
          pagination={{
            defaultPageSize: 30,
            showSizeChanger: true,
            showTotal: (total) => {
              return t('common:table.total', { total });
            },
            pageSizeOptions: ['30', '100', '200', '500'],
          }}
        />
      </Drawer>
    </div>
  );
}

export default React.forwardRef(Card);

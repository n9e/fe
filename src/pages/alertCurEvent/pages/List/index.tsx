import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Input, Checkbox, Collapse, Segmented, Button, Space, Row, Col } from 'antd';
import { AlertOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation, useHistory } from 'react-router-dom';
import { useDebounceFn } from 'ahooks';
import moment from 'moment';

import PageLayout from '@/components/pageLayout';
import { TimeRangePickerWithRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IS_PLUS } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { getAlertCards } from '@/services/warning';
import { parseRange } from '@/components/TimeRangePicker';

import { NS, MY_GRPUPS_CACHE_KEY } from '../../constants';
import getFilterByURLQuery from '../../utils/getFilter';
import deleteAlertEventsModal from '../../utils/deleteAlertEventsModal';
import getProdOptions from '../../utils/getProdOptions';
import getRequestParamsByFilter from '../../utils/getRequestParamsByFilter';
import { ackEvents } from '../../services';
import { CardType } from '../../types';
import DatasourceCheckbox from './DatasourceCheckbox';
import AggrRuleDropdown from './AggrRuleDropdown';
import AlertCard, { isEqualEventIds } from './AlertCard';
import AlertTable from './AlertTable';

const AlertCurEvent: React.FC = () => {
  const { t } = useTranslation(NS);
  const { feats } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const query = queryString.parse(location.search);
  const [range, setRange] = useState<IRawTimeRange>();
  const [aggrRuleCardEventIds, setAggrRuleCardEventIds] = useState<number[] | undefined>();
  const filter = useMemo(() => getFilterByURLQuery(query, range, aggrRuleCardEventIds), [JSON.stringify(query), range, aggrRuleCardEventIds]);
  const setFilter = (newFilter) => {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify(
        {
          ...query,
          ..._.omit(newFilter, ['range', 'event_ids']), // 这里不需要传递到 URL 中
        },
        { arrayFormat: 'comma' },
      ),
    });
    setAggrRuleCardEventIds(newFilter.event_ids);
    setRange(newFilter.range);
  };
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [cardList, setCardList] = useState<CardType[]>();
  const params = getRequestParamsByFilter(filter);

  const { run: reloadRuleCards } = useDebounceFn(
    () => {
      if (!filter.aggr_rule_id) {
        setCardList([]);
        return;
      }
      const requestParams: any = {
        view_id: filter.aggr_rule_id,
        my_groups: String(params.my_groups) === 'true',
        ..._.omit(params, ['range', 'my_groups']),
      };
      if (params.range) {
        const parsedRange = parseRange(params.range);
        requestParams.stime = moment(parsedRange.start).unix();
        requestParams.etime = moment(parsedRange.end).unix();
      }

      getAlertCards(requestParams).then((res) => {
        setCardList(res.dat);
        const isValidFilterEventIds = _.every(res.dat, (item) => {
          return !isEqualEventIds(item.event_ids, filter.event_ids);
        });
        if (isValidFilterEventIds) {
          setFilter({
            ...filter,
            event_ids: undefined,
          });
        }
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    reloadRuleCards();
  }, [filter.aggr_rule_id, JSON.stringify(params), refreshFlag]);

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className={`n9e ${NS}`}>
        <div className='n9e-fill-color-2 n9e-border-base h-full'>
          <div className='p-4 h-full'>
            <div className='flex flex-col h-full'>
              <div className='flex justify-between items-center mb-2'>
                <Space>
                  <Space>
                    <Segmented
                      shape='round'
                      className='whitespace-nowrap min-w-[190px]'
                      onChange={(value: string) => {
                        setFilter({
                          ...filter,
                          my_groups: value,
                        });
                        localStorage.setItem(MY_GRPUPS_CACHE_KEY, value);
                      }}
                      value={filter.my_groups}
                      block
                      options={[
                        { label: t('my_groups'), value: 'true' },
                        { label: t('all_groups'), value: 'false' },
                      ]}
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
                  </Space>
                  <Input
                    allowClear
                    style={{ width: '320px' }}
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
                <TimeRangePickerWithRefresh
                  allowClear={true}
                  value={filter.range}
                  onChange={(val) => {
                    setFilter({
                      ...filter,
                      range: val,
                    });
                  }}
                  onRefresh={() => {
                    setRefreshFlag(_.uniqueId('refresh_'));
                  }}
                  dateFormat='YYYY-MM-DD HH:mm:ss'
                />
              </div>
              <div className='h-full min-h-0 flex'>
                {/* 左侧筛选区 */}
                <div className='w-[190px] mr-[8px] overflow-hidden h-full shrink-0 flex flex-col gap-2 n9e-antd-collapse-height-full'>
                  <div className='flex-shrink-0'>
                    <Collapse className='w-full' bordered={false} defaultActiveKey={['prod']} expandIconPosition='start'>
                      <Collapse.Panel header={t('prod')} key='prod'>
                        <Checkbox.Group
                          value={filter.rule_prods}
                          onChange={(val) => {
                            setFilter({
                              ...filter,
                              rule_prods: val,
                            });
                          }}
                        >
                          {_.map(getProdOptions(feats), (item) => (
                            <div key={item.value}>
                              <Checkbox className='py-1' value={item.value}>
                                {item.label}
                                <br />
                              </Checkbox>
                            </div>
                          ))}
                        </Checkbox.Group>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                  <div className='flex-shrink-0'>
                    <Collapse className='w-full' bordered={false} defaultActiveKey={['severity']} expandIconPosition='start'>
                      <Collapse.Panel header={t('severity')} key='severity'>
                        <Checkbox.Group
                          value={filter.severity}
                          onChange={(val) => {
                            setFilter({
                              ...filter,
                              severity: val,
                            });
                          }}
                        >
                          <Checkbox className='py-1' value={1}>
                            <div className='inline-block mr-2 w-[4px] h-[12px] rounded-lg event-card-circle red' />
                            S1（Critical）
                          </Checkbox>
                          <br />
                          <Checkbox className='py-1' value={2}>
                            <div className='inline-block mr-2 w-[4px] h-[12px] rounded-lg event-card-circle orange' />
                            S2（Warning）
                          </Checkbox>
                          <br />
                          <Checkbox className='py-1' value={3}>
                            <div className='inline-block mr-2 w-[4px] h-[12px] rounded-lg event-card-circle yellow' />
                            S3（Info）
                          </Checkbox>
                          <br />
                        </Checkbox.Group>
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                  <div className='flex-1 h-full min-h-0'>
                    <Collapse className='w-full' bordered={false} defaultActiveKey={['datasource']} expandIconPosition='start'>
                      <Collapse.Panel header={t('datasources')} key='datasource'>
                        <DatasourceCheckbox
                          value={filter.datasource_ids}
                          onChange={(val: number[]) => {
                            setFilter({
                              ...filter,
                              datasource_ids: val,
                            });
                          }}
                        />
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                </div>
                {/* 右侧内容区 */}
                <div className='n9e-border-base flex-1 min-w-0 flex flex-col gap-2'>
                  <div
                    className='cur-events'
                    style={{
                      borderBottom: '1px solid var(--fc-border-color)',
                    }}
                  >
                    <div className='p-2'>
                      <AggrRuleDropdown cardList={cardList} filter={filter} setFilter={setFilter} reloadRuleCards={reloadRuleCards} />
                      <AlertCard filter={filter} setFilter={setFilter} cardList={cardList} />
                    </div>
                  </div>
                  {selectedRowKeys.length > 0 && (
                    <div className='flex-shrink-0 flex gap-2 justify-end mr-2'>
                      <Button
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
                      </Button>
                      {IS_PLUS && (
                        <>
                          <Button
                            className='ant-dropdown-menu-item'
                            onClick={() => {
                              ackEvents(selectedRowKeys).then(() => {
                                setSelectedRowKeys([]);
                                setRefreshFlag(_.uniqueId('refresh_'));
                              });
                            }}
                          >
                            {t('batch_claim')}
                          </Button>
                          <Button
                            className='ant-dropdown-menu-item'
                            onClick={() => {
                              ackEvents(selectedRowKeys, 'unack').then(() => {
                                setSelectedRowKeys([]);
                                setRefreshFlag(_.uniqueId('refresh_'));
                              });
                            }}
                          >
                            {t('batch_unclaim')}
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                  <div className='px-2 h-full min-h-0'>
                    <AlertTable
                      filter={filter}
                      setFilter={setFilter}
                      refreshFlag={refreshFlag}
                      selectedRowKeys={selectedRowKeys}
                      setSelectedRowKeys={setSelectedRowKeys}
                      params={params}
                      setRefreshFlag={setRefreshFlag}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AlertCurEvent;

import React, { useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Input, Checkbox, Collapse, Segmented, Button, Space, Row, Col } from 'antd';
import { AlertOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation, useHistory } from 'react-router-dom';
import { useDebounceFn, useRequest } from 'ahooks';
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
import { CardType, FilterType } from '../../types';
import DatasourceCheckbox from './DatasourceCheckbox';
import AggrRuleDropdown from './AggrRuleDropdown';
import AlertCard, { isEqualEventIds } from './AlertCard';
import AlertTable from './AlertTable';
import { useParamsAiAction } from '@/components/AiChat/utils/useHook';

const AlertCurEvent: React.FC = () => {
  const { t } = useTranslation(NS);
  const { feats } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const query = queryString.parse(location.search);
  const [paramsAiAction, setParamsAiAction] = useParamsAiAction();

  const [range, setRange] = useState<IRawTimeRange>();
  const [aggrRuleCardEventIds, setAggrRuleCardEventIds] = useState<number[] | undefined>();
  const rangeRef = useRef<IRawTimeRange | undefined>(range);
  const aggrRuleCardEventIdsRef = useRef<number[] | undefined>(aggrRuleCardEventIds);

  useEffect(() => {
    rangeRef.current = range;
  }, [range]);

  useEffect(() => {
    aggrRuleCardEventIdsRef.current = aggrRuleCardEventIds;
  }, [aggrRuleCardEventIds]);

  const filter = useMemo(() => getFilterByURLQuery(query, range, aggrRuleCardEventIds), [JSON.stringify(query), range, aggrRuleCardEventIds]);

  const [draftQuery, setDraftQuery] = useState<string>(filter.query ?? '');
  const queryFocusedRef = useRef(false);
  useEffect(() => {
    if (!queryFocusedRef.current) {
      setDraftQuery(filter.query ?? '');
    }
  }, [filter.query]);

  const normalizeFilterForUrl = useCallback((input: FilterType) => {
    const withoutLocalOnly = _.omit(input, ['range', 'event_ids']); // range 和 event_ids 不传递到 URL 中
    return _.omitBy(withoutLocalOnly, (v) => {
      if (v === undefined || v === '') return true;
      if (Array.isArray(v) && v.length === 0) return true;
      return false;
    });
  }, []);

  const setFilterPatch = useCallback(
    (patch: Partial<FilterType>) => {
      const latestQuery = queryString.parse(history.location.search);
      const currentFilter = getFilterByURLQuery(latestQuery, rangeRef.current, aggrRuleCardEventIdsRef.current);
      const nextFilter = { ...currentFilter, ...patch };
      // 只清理“本页实际管理过/正在管理的 key”，避免误删 URL 里其他同名参数
      const prevUrlFilter = normalizeFilterForUrl(currentFilter) as Record<string, unknown>;
      const managedKeys = _.uniq([...Object.keys(prevUrlFilter), ...Object.keys(patch)]);
      const baseQuery = _.omit(latestQuery, managedKeys);

      history.replace({
        pathname: history.location.pathname,
        search: queryString.stringify(
          {
            ...baseQuery,
            ...normalizeFilterForUrl(nextFilter),
          },
          { arrayFormat: 'comma' },
        ),
      });

      if (_.has(patch, 'event_ids')) {
        setAggrRuleCardEventIds(nextFilter.event_ids);
      }
      if (_.has(patch, 'range')) {
        setRange(nextFilter.range);
      }
    },
    [history, normalizeFilterForUrl],
  );

  const { run: commitQueryDebounced } = useDebounceFn(
    (next: string) => {
      setFilterPatch({ query: next ? next : undefined });
    },
    { wait: 400 },
  );
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const params = getRequestParamsByFilter(filter);

  type RuleCardsRequestParams = {
    view_id: number;
    my_groups: boolean;
    stime?: number;
    etime?: number;
    [k: string]: any;
  };
  const ruleCardsRequestParams = useMemo(() => {
    if (!filter.aggr_rule_id) return undefined;
    const requestParams: RuleCardsRequestParams = {
      view_id: filter.aggr_rule_id,
      my_groups: String(params.my_groups) === 'true',
      ..._.omit(params, ['range', 'my_groups']),
    };
    if (params.range) {
      const parsedRange = parseRange(params.range);
      requestParams.stime = moment(parsedRange.start).unix();
      requestParams.etime = moment(parsedRange.end).unix();
    }
    return requestParams;
  }, [filter.aggr_rule_id, JSON.stringify(params)]);

  const {
    refresh: reloadRuleCards,
    data: ruleCardsData,
  } = useRequest(
    () => {
      // ready 会保证这里不会在 undefined 时执行
      return getAlertCards(ruleCardsRequestParams as RuleCardsRequestParams);
    },
    {
      ready: !!ruleCardsRequestParams,
      debounceWait: 500,
      refreshDeps: [refreshFlag, JSON.stringify(ruleCardsRequestParams)],
      cacheKey: ruleCardsRequestParams ? `alertCurEvent_ruleCards_${JSON.stringify(ruleCardsRequestParams)}` : undefined,
      onSuccess: (res) => {
        const requestedAggrRuleId = ruleCardsRequestParams?.view_id;
        const latestQuery = queryString.parse(history.location.search);
        const currentFilter = getFilterByURLQuery(latestQuery, rangeRef.current, aggrRuleCardEventIdsRef.current);
        if (!requestedAggrRuleId || currentFilter.aggr_rule_id !== requestedAggrRuleId) return;

        const isValidFilterEventIds = _.every(res.dat, (item) => !isEqualEventIds(item.event_ids, aggrRuleCardEventIdsRef.current));
        if (isValidFilterEventIds) {
          setAggrRuleCardEventIds(undefined);
        }
      },
      onError: () => {
        // 保持旧 cardList，避免闪烁；错误提示由全局请求层处理（与仓库现有风格保持一致）
      },
    },
  );

  const cardList = useMemo(() => {
    if (!filter.aggr_rule_id) return [];
    return ruleCardsData?.dat ?? [];
  }, [filter.aggr_rule_id, ruleCardsData]);

  useEffect(() => {
    let parsedRange;
    if (filter.range) {
      parsedRange = parseRange(filter.range);
    }

    setParamsAiAction({
      page: 'alert_cur_event',
      active_alert: {
        start: parsedRange ? moment(parsedRange.start).unix() : undefined,
        end: parsedRange ? moment(parsedRange.end).unix() : undefined,
        my_groups: filter.my_groups === 'true',
        rule_prods: filter.rule_prods,
        severity: filter.severity?.map(String),
        datasource_ids: filter.datasource_ids?.map(String),
      },
    });
  }, [JSON.stringify(filter)]);

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className={`n9e ${NS}`}>
        <div className='bg-fc-100 fc-border rounded-lg h-full'>
          <div className='p-4 h-full'>
            <div className='flex flex-col h-full'>
              <div className='flex justify-between items-center mb-2'>
                <Space>
                  <Space>
                    <Segmented
                      shape='round'
                      className='whitespace-nowrap min-w-[190px]'
                      onChange={(value: 'true' | 'false') => {
                        setFilterPatch({ my_groups: value });
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
                        setFilterPatch({ bgid: val });
                      }}
                    />
                  </Space>
                  <Input
                    allowClear
                    style={{ width: '320px' }}
                    prefix={<SearchOutlined />}
                    placeholder={t('search_placeholder')}
                    value={draftQuery}
                    onFocus={() => {
                      queryFocusedRef.current = true;
                    }}
                    onBlur={() => {
                      queryFocusedRef.current = false;
                      setDraftQuery(filter.query ?? '');
                    }}
                    onChange={(e) => {
                      const next = e.target.value;
                      setDraftQuery(next);
                      commitQueryDebounced(next);
                    }}
                  />
                </Space>
                <TimeRangePickerWithRefresh
                  allowClear={true}
                  value={filter.range}
                  onChange={(val) => {
                    setFilterPatch({ range: val });
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
                          onChange={(val: string[]) => {
                            setFilterPatch({ rule_prods: val });
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
                            setFilterPatch({ severity: _.map(val, _.toNumber) });
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
                            setFilterPatch({ datasource_ids: val });
                          }}
                        />
                      </Collapse.Panel>
                    </Collapse>
                  </div>
                </div>
                {/* 右侧内容区 */}
                <div className='fc-border flex-1 min-w-0 flex flex-col gap-2'>
                  <div
                    className='cur-events'
                    style={{
                      borderBottom: '1px solid var(--fc-border-color)',
                    }}
                  >
                    <div className='p-2'>
                      <AggrRuleDropdown cardList={cardList} filter={filter} setFilter={setFilterPatch} reloadRuleCards={reloadRuleCards} />
                      <AlertCard filter={filter} setFilter={setFilterPatch} cardList={cardList} />
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
                      setFilter={setFilterPatch}
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

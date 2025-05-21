import React, { useContext, useState, useMemo, useEffect } from 'react';
import { Input, Checkbox, Collapse, Segmented, Button, Space } from 'antd';
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
import { getDefaultValue } from '@/components/TimeRangePicker';
import { IS_ENT, IS_PLUS } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import { getAlertCards } from '@/services/warning';
import { parseRange } from '@/components/TimeRangePicker';

import { NS, TIME_CACHE_KEY, AGGR_RULE_ID, AGGR_RULE_CARD_EVENT_IDS_CACHE_KEY } from '../../constants';
import getFilterByURLQuery from '../../utils/getFilter';
import deleteAlertEventsModal from '../../utils/deleteAlertEventsModal';
import getProdOptions from '../../utils/getProdOptions';
import getRequestParamsByFilter from '../../utils/getRequestParamsByFilter';
import { ackEvents } from '../../services';
import { CardType } from '../../types';
import DatasourceCheckbox from './DatasourceCheckbox';
import AggrRuleDropdown from './AggrRuleDropdown';
import AlertCard from './AlertCard';
import AlertTable from './AlertTable';

const AlertCurEvent: React.FC = () => {
  const { t } = useTranslation(NS);
  const { feats } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const query = queryString.parse(location.search);
  const localRange = getDefaultValue(TIME_CACHE_KEY, undefined);
  const localAggrRuleId = localStorage.getItem(AGGR_RULE_ID);
  const localEventIds = localStorage.getItem(AGGR_RULE_CARD_EVENT_IDS_CACHE_KEY);
  const filter = useMemo(() => getFilterByURLQuery(query), [JSON.stringify(query), localRange, localAggrRuleId, localEventIds]);
  const [aggrRuleId, setAggrRuleId] = useState<number | undefined>(filter.aggr_rule_id);
  const [eventIds, setEventIds] = useState<number[] | undefined>(filter.event_ids);
  const setFilter = (newFilter) => {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify(
        {
          ...query,
          ..._.omit(newFilter, ['range', 'aggr_rule_id', 'event_ids']), // range 仍然通过 loclalStorage 存储
        },
        { arrayFormat: 'comma' },
      ),
    });
    // range 也是通过 localStorage 存储的, 他是在日期选择器组件内部处理
    // 这里需要将 aggr_rule_id 和 event_ids 存储到 localStorage 中，避免放到 URL 中过长
    newFilter.aggr_rule_id ? window.localStorage.setItem(AGGR_RULE_ID, String(newFilter.aggr_rule_id)) : window.localStorage.removeItem(AGGR_RULE_ID);
    setAggrRuleId(newFilter.aggr_rule_id);
    newFilter.event_ids
      ? window.localStorage.setItem(AGGR_RULE_CARD_EVENT_IDS_CACHE_KEY, _.join(newFilter.event_ids, ','))
      : window.localStorage.removeItem(AGGR_RULE_CARD_EVENT_IDS_CACHE_KEY);
    setEventIds(newFilter.event_ids);
  };
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [cardList, setCardList] = useState<CardType[]>();
  const params = getRequestParamsByFilter(filter);

  useEffect(() => {
    reloadRuleCards();
  }, [filter.aggr_rule_id, params.my_groups, JSON.stringify(params.range), refreshFlag]);

  const { run: reloadRuleCards } = useDebounceFn(
    () => {
      if (!filter.aggr_rule_id) {
        setCardList([]);
        return;
      }
      const requestParams: any = {
        view_id: filter.aggr_rule_id,
        my_groups: String(params.my_groups) === 'true',
        ..._.omit(params, ['range', 'my_groups', 'severity', 'rule_prods']),
      };
      if (params.range) {
        const parsedRange = parseRange(params.range);
        requestParams.stime = moment(parsedRange.start).unix();
        requestParams.etime = moment(parsedRange.end).unix();
      }

      getAlertCards(requestParams).then((res) => {
        setCardList(res.dat);
      });
    },
    {
      wait: 500,
    },
  );

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className={`n9e ${NS}`}>
        <div className='n9e-fill-color-2 n9e-border-base p-4'>
          <div className='flex justify-between items-center'>
            <Space>
              <Segmented
                shape='round'
                className='whitespace-nowrap w-[190px]'
                onChange={(value) => {
                  setFilter({
                    ...filter,
                    my_groups: value,
                  });
                }}
                value={filter.my_groups}
                block
                options={[
                  { label: t('my_groups'), value: 'true' },
                  { label: t('all_groups'), value: 'false' },
                ]}
              />
              <div className='ml-[8px]'>
                <BusinessGroupSelectWithAll
                  value={filter.bgid}
                  onChange={(val: number) => {
                    setFilter({
                      ...filter,
                      bgid: val,
                    });
                  }}
                />
              </div>
              <Input
                allowClear
                style={{ width: '300px' }}
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
              localKey={TIME_CACHE_KEY}
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

          <div className='flex py-2'>
            {/* 左侧筛选区 */}
            <div className='w-[190px] mr-[16px] overflow-y-auto h-full'>
              <Collapse bordered={false} defaultActiveKey={['prod', 'severity', 'datasource']} expandIconPosition='start'>
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
                <Collapse.Panel header={t('detail.datasource_id')} key='datasource'>
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
            {/* 右侧内容区 */}
            <div className='n9e-border-base flex-1'>
              <div className='cur-events p-2'>
                <AggrRuleDropdown cardList={cardList} filter={filter} setFilter={setFilter} reloadRuleCards={reloadRuleCards} />
                <AlertCard filter={filter} setFilter={setFilter} cardList={cardList} />
              </div>

              <div className='h-[1px] bg-[var(--fc-border-color)]' />
              <div className='p-2'>
                <div className='flex gap-2 justify-end'>
                  {selectedRowKeys.length > 0 && (
                    <>
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
                    </>
                  )}
                </div>

                <AlertTable
                  filter={filter}
                  setFilter={setFilter}
                  refreshFlag={refreshFlag}
                  selectedRowKeys={selectedRowKeys}
                  setSelectedRowKeys={setSelectedRowKeys}
                  params={params}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AlertCurEvent;

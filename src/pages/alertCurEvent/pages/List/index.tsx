import React, { useContext, useState, useMemo } from 'react';
import { Input, Checkbox, Collapse, Segmented, Button, Space } from 'antd';
import { AlertOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation, useHistory } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import { TimeRangePickerWithRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { getDefaultValue } from '@/components/TimeRangePicker';
import { IS_ENT, IS_PLUS } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';

import { NS, TIME_CACHE_KEY } from '../../constants';
import getFilter from '../../utils/getFilter';
import deleteAlertEventsModal from '../../utils/deleteAlertEventsModal';
import { ackEvents } from '../../services';
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
  const filter = useMemo(() => getFilter(query), [JSON.stringify(query), localRange]);

  const setFilter = (newFilter) => {
    history.replace({
      pathname: location.pathname,
      search: queryString.stringify({
        ...query,
        ..._.omit(newFilter, 'range'), // range 仍然通过 loclalStorage 存储
      }),
    });
  };
  const [refreshFlag, setRefreshFlag] = useState<string>(_.uniqueId('refresh_'));
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [cardNum, setCardNum] = useState<number>(0);

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

  function renderHeader() {
    return (
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
          allowClear
          localKey={TIME_CACHE_KEY}
          value={filter.range}
          onChange={(val) => {
            setFilter({
              ...filter,
              range: val,
            });
          }}
          dateFormat='YYYY-MM-DD HH:mm:ss'
        />
      </div>
    );
  }

  const filterObj = Object.assign(
    { range: filter.range },
    filter.datasource_ids.length ? { datasource_ids: filter.datasource_ids } : {},
    filter.severity ? { severity: filter.severity } : {},
    filter.query ? { query: filter.query } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
    filter.rule_id ? { rule_id: filter.rule_id } : {},
    filter.event_ids.length ? { event_ids: filter.event_ids } : {},
    filter.my_groups ? { my_groups: filter.my_groups } : {},
  );

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className={`n9e ${NS}`}>
        <div className='n9e-fill-color-2 n9e-border-base p-4'>
          <div>{renderHeader()}</div>
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
                    {prodOptions.map((item) => (
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
                    value={filter.severity ? [filter.severity] : []}
                    onChange={(val) => {
                      setFilter({
                        ...filter,
                        severity: val.length ? val[0] : undefined,
                      });
                    }}
                  >
                    <Checkbox className='py-1' value={1}>
                      <div className='inline-block mr-2 w-[4px] h-[12px] rounded-lg event-card-circle yellow' />
                      S1（Critical）
                    </Checkbox>
                    <br />
                    <Checkbox className='py-1' value={2}>
                      <div className='inline-block mr-2 w-[4px] h-[12px] rounded-lg event-card-circle orange' />
                      S2（Warning）
                    </Checkbox>
                    <br />
                    <Checkbox className='py-1' value={3}>
                      <div className='inline-block mr-2 w-[4px] h-[12px] rounded-lg event-card-circle red' />
                      S3（Info）
                    </Checkbox>
                    <br />
                  </Checkbox.Group>
                </Collapse.Panel>
                <Collapse.Panel header={t('detail.datasource_id')} key='datasource'>
                  <DatasourceCheckbox
                    filter={filter}
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
                <AggrRuleDropdown cardNum={cardNum} onRefreshRule={(ruleId) => setFilter({ ...filter, rule_id: ruleId })} />
                <AlertCard
                  filter={filter}
                  onUpdateCardNum={(cardNum: number) => {
                    setCardNum(cardNum);
                  }}
                  onUpdateAlertEventIds={(eventIds: number[]) => {
                    setFilter({
                      ...filter,
                      event_ids: eventIds,
                    });
                  }}
                />
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
                  filterObj={filterObj}
                  setFilter={setFilter}
                  refreshFlag={refreshFlag}
                  selectedRowKeys={selectedRowKeys}
                  setSelectedRowKeys={setSelectedRowKeys}
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

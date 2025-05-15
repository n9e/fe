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
import React, { useContext, useState, useMemo } from 'react';
import { Input, message, Modal, Row, Col, Checkbox, Collapse, Segmented, Dropdown, Button } from 'antd';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation, useHistory } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import { deleteAlertEvents } from '@/services/warning';
import { TimeRangePickerWithRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import { getDefaultValue } from '@/components/TimeRangePicker';
import { IS_ENT } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';

import AggrRuleDropdown from './AggrRuleDropdown';
import AlertCard from './AlertCard';
import AlertTable from './AlertTable';
import './locale';
import './index.less';

// @ts-ignore
import DatasourceCheckbox from '@/pages/alertCurEvent/DatasourceCheckbox';
import BatchAckBtn from '@/plus/parcels/Event/Acknowledge/BatchAckBtn';
import { ackEvents } from '@/plus/parcels/Event/Acknowledge/services';

const CACHE_KEY = 'alert_active_events_range';
const getFilter = (query) => {
  return {
    range: getDefaultValue(CACHE_KEY, undefined),
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? Number(query.severity) : undefined,
    query: query.query ? query.query : undefined,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
    rule_id: query.rule_id ? Number(query.rule_id) : undefined,
    event_ids: query.event_ids ? _.split(query.event_ids, ',') : [],
    my_groups: query.my_groups ? query.my_groups : undefined,
  };
};

const { confirm } = Modal;
export const SeverityColor = ['red', 'orange', 'yellow', 'green'];
export function deleteAlertEventsModal(ids: number[], onSuccess = () => {}, t) {
  confirm({
    title: t('delete_confirm.title'),
    icon: <ExclamationCircleOutlined />,
    content: t('delete_confirm.content'),
    maskClosable: true,
    okButtonProps: { danger: true },
    zIndex: 1001,
    onOk() {
      return deleteAlertEvents(ids).then((res) => {
        message.success(t('common:success.delete'));
        onSuccess();
      });
    },
    onCancel() {},
  });
}

const AlertCurEvent: React.FC = () => {
  const { t } = useTranslation('AlertCurEvents');
  const { feats } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const query = queryString.parse(location.search);
  const localRange = getDefaultValue(CACHE_KEY, undefined);
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
      <Row justify='space-between'>
        <Row>
          <div>
            <Segmented
              shape='round'
              className='whitespace-nowrap  w-[190px]'
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
          </div>
          <div className='ml-[16px]'>
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
            className='search-input '
            style={{ width: '280px' }}
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
        </Row>
        <Col
          flex='100px'
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <TimeRangePickerWithRefresh
            allowClear
            localKey={CACHE_KEY}
            value={filter.range}
            onChange={(val) => {
              setFilter({
                ...filter,
                range: val,
              });
            }}
            dateFormat='YYYY-MM-DD HH:mm:ss'
          />
        </Col>
      </Row>
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
      <div className='event-container'>
        <div className='table-area n9e-border-base'>
          <div className=''>{renderHeader()}</div>

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

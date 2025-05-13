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
import React, { useContext, useState } from 'react';
import { Button, Input, message, Modal, Space, Row, Col, Dropdown, Checkbox, Collapse } from 'antd';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { useLocation, useHistory } from 'react-router-dom';

import PageLayout from '@/components/pageLayout';
import { deleteAlertEvents } from '@/services/warning';
import { AutoRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import TimeRangePicker, { getDefaultValue } from '@/components/TimeRangePicker';
import { IS_ENT } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';

import Card from './AlertCard';
import Table from './AlertTable';
import './locale';
import './index.less';

// @ts-ignore
import BatchAckBtn from 'plus:/parcels/Event/Acknowledge/BatchAckBtn';
import DatasourceCheckbox from '@/components/DatasourceSelect/DatasourceCheckbox';

const CACHE_KEY = 'alert_active_events_range';
const getFilter = (query) => {
  return {
    range: getDefaultValue(CACHE_KEY, undefined),
    datasource_ids: query.datasource_ids ? _.split(query.datasource_ids, ',').map(Number) : [],
    bgid: query.bgid ? Number(query.bgid) : undefined,
    severity: query.severity ? Number(query.severity) : undefined,
    query: query.query,
    is_recovered: query.is_recovered ? Number(query.is_recovered) : undefined,
    rule_prods: query.rule_prods ? _.split(query.rule_prods, ',') : [],
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
  const [view, setView] = useState<'card' | 'list'>('card');
  const { feats } = useContext(CommonStateContext);
  const location = useLocation();
  const history = useHistory();
  const query = queryString.parse(location.search);
  const filter = getFilter(query);
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
        <Space>
          <TimeRangePicker
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

          {/*选择我的业务组/全部业务组*/}

          <BusinessGroupSelectWithAll
            value={filter.bgid}
            onChange={(val: number) => {
              setFilter({
                ...filter,
                bgid: val,
              });
            }}
          />

          <Input
            className='search-input'
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
          {view === 'list' && (
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
          )}
          <AutoRefresh
            onRefresh={() => {
              setRefreshFlag(_.uniqueId('refresh_'));
            }}
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
  );

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      <div className='event-container'>
        <div className='table-area n9e-border-base'>
          <div className=''>{renderHeader()}</div>

          <div className='flex py-2'>
            {/* 左侧筛选区 */}
            <div className='w-[190px] pr-[16px] overflow-y-auto h-full'>
              <Collapse bordered={false} defaultActiveKey={['prod', 'severity', 'datasource']} expandIconPosition='start'>
                <Collapse.Panel header='监控类型' key='prod'>
                  <Checkbox.Group
                    style={{ width: '100%' }}
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
                <Collapse.Panel header='告警级别' key='severity'>
                  <Checkbox.Group
                    style={{ width: '100%' }}
                    value={filter.severity ? [filter.severity] : []}
                    onChange={(val) => {
                      setFilter({
                        ...filter,
                        severity: val.length ? val[0] : undefined,
                      });
                    }}
                  >
                    <Checkbox className='py-1' value={1}>
                      S1（Critical）
                    </Checkbox>
                    <br />
                    <Checkbox className='py-1' value={2}>
                      S2（Warning）
                    </Checkbox>
                    <br />
                    <Checkbox className='py-1' value={3}>
                      S3（Info）
                    </Checkbox>
                    <br />
                  </Checkbox.Group>
                </Collapse.Panel>
                <Collapse.Panel header='数据源' key='datasource'>
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
            <div className='n9e-border-base' style={{ flex: 1, minWidth: 0 }}>
              <Card filter={filterObj} refreshFlag={refreshFlag} />
              <div className='h-[1px]' style={{ backgroundColor: 'var(--fc-border-color)' }} />
              <div className='p-2'>
                <Table
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

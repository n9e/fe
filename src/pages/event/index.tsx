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
import { Button, Input, message, Modal, Select, Space, Row, Col, Dropdown, Menu } from 'antd';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { deleteAlertEvents } from '@/services/warning';
import { AutoRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';
import DatasourceSelect from '@/components/DatasourceSelect/DatasourceSelect';
import TimeRangePicker, { IRawTimeRange } from '@/components/TimeRangePicker';
import { IS_ENT } from '@/utils/constant';
import { BusinessGroupSelectWithAll } from '@/components/BusinessGroup';
import Card from './card';
import Table from './Table';
import './locale';
import './index.less';

// @ts-ignore
import BatchAckBtn from 'plus:/parcels/Event/Acknowledge/BatchAckBtn';

const CACHE_KEY = 'alert_active_events_range';

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

const Event: React.FC = () => {
  const { t } = useTranslation('AlertCurEvents');
  const [view, setView] = useState<'card' | 'list'>('card');
  const { busiGroups, feats } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<{
    range?: IRawTimeRange;
    cate?: string;
    datasourceIds: number[];
    bgid?: number;
    severity?: number;
    queryContent: string;
    rule_prods: string[];
  }>({
    range: undefined,
    datasourceIds: [],
    queryContent: '',
    rule_prods: [],
  });
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

  function renderLeftHeader() {
    return (
      <Row justify='space-between' style={{ width: '100%' }}>
        <Space>
          <Button icon={<AppstoreOutlined />} onClick={() => setView('card')} />
          <Button icon={<UnorderedListOutlined />} onClick={() => setView('list')} />
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
            value={filter.datasourceIds}
            onChange={(val: number[]) => {
              setFilter({
                ...filter,
                datasourceIds: val,
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
          >
            <Select.Option value={1}>S1</Select.Option>
            <Select.Option value={2}>S2</Select.Option>
            <Select.Option value={3}>S3</Select.Option>
          </Select>
          <Input
            className='search-input'
            prefix={<SearchOutlined />}
            placeholder={t('search_placeholder')}
            value={filter.queryContent}
            onChange={(e) => {
              setFilter({
                ...filter,
                queryContent: e.target.value,
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
                <Menu>
                  <Menu.Item
                    disabled={selectedRowKeys.length === 0}
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
                    {t('common:btn.batch_delete')}{' '}
                  </Menu.Item>
                  <BatchAckBtn
                    selectedIds={selectedRowKeys}
                    onOk={() => {
                      setSelectedRowKeys([]);
                      setRefreshFlag(_.uniqueId('refresh_'));
                    }}
                  />
                </Menu>
              }
              trigger={['click']}
            >
              <Button style={{ marginRight: 8 }}>{t('batch_btn')}</Button>
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
    filter.datasourceIds.length ? { datasource_ids: filter.datasourceIds } : {},
    filter.severity ? { severity: filter.severity } : {},
    filter.queryContent ? { query: filter.queryContent } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      {view === 'card' ? (
        <Card header={renderLeftHeader()} filter={filterObj} refreshFlag={refreshFlag} />
      ) : (
        <Table
          header={renderLeftHeader()}
          filter={filter}
          filterObj={filterObj}
          setFilter={setFilter}
          refreshFlag={refreshFlag}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
        />
      )}
    </PageLayout>
  );
};

export default Event;

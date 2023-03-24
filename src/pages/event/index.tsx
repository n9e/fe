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
import React, { useContext, useRef, useState } from 'react';
import { Button, Input, message, Modal, Select, Space, Row, Col } from 'antd';
import { AlertOutlined, ExclamationCircleOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { deleteAlertEvents } from '@/services/warning';
import { AutoRefresh } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import Card from './card';
import Table from './Table';
import { hoursOptions } from './constants';
import './locale';
import './index.less';

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
  const { busiGroups } = useContext(CommonStateContext);
  const [filter, setFilter] = useState<{
    hours: number;
    cate: string;
    datasourceIds: number[];
    bgid?: number;
    severity?: number;
    eventType?: number;
    queryContent: string;
    rule_prods: string[];
  }>({
    hours: 6,
    cate: '',
    datasourceIds: [],
    queryContent: '',
    rule_prods: [],
  });
  const tableRef = useRef({
    handleReload() {},
  });
  const cardRef = useRef({
    reloadCard() {},
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [refreshTableFlag, setRefreshTableFlag] = useState<string>(_.uniqueId('refresh_table_'));

  function renderLeftHeader() {
    return (
      <Row justify='space-between' style={{ width: '100%' }}>
        <Space>
          <Button icon={<AppstoreOutlined />} onClick={() => setView('card')} />
          <Button icon={<UnorderedListOutlined />} onClick={() => setView('list')} />
          <Select
            style={{ minWidth: 80 }}
            value={filter.hours}
            onChange={(val) => {
              setFilter({
                ...filter,
                hours: val,
              });
            }}
          >
            {hoursOptions.map((item) => {
              return <Select.Option value={item.value}>{t(`hours.${item.value}`)}</Select.Option>;
            })}
          </Select>
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
            <Select.Option value='host'>Host</Select.Option>
            <Select.Option value='metric'>Metric</Select.Option>
          </Select>
          <Select
            allowClear
            placeholder={t('common:business_group')}
            style={{ minWidth: 80 }}
            value={filter.bgid}
            onChange={(val) => {
              setFilter({
                ...filter,
                bgid: val,
              });
            }}
            dropdownMatchSelectWidth={false}
          >
            {_.map(busiGroups, (item) => {
              return (
                <Select.Option value={item.id} key={item.id}>
                  {item.name}
                </Select.Option>
              );
            })}
          </Select>
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
            <Select.Option value={1}>{t('common:severity.1')}</Select.Option>
            <Select.Option value={2}>{t('common:severity.2')}</Select.Option>
            <Select.Option value={3}>{t('common:severity.3')}</Select.Option>
          </Select>
          <Select
            allowClear
            style={{ minWidth: 80 }}
            placeholder={t('eventType')}
            value={filter.eventType}
            onChange={(val) => {
              setFilter({
                ...filter,
                eventType: val,
              });
            }}
          >
            <Select.Option value={0}>Triggered</Select.Option>
            <Select.Option value={1}>Recovered</Select.Option>
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
            onPressEnter={() => {
              if (view === 'list') {
                setRefreshTableFlag(_.uniqueId('refresh_table_'));
              }
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
            <Button
              danger
              style={{ marginRight: 8 }}
              disabled={selectedRowKeys.length === 0}
              onClick={() =>
                deleteAlertEventsModal(
                  selectedRowKeys,
                  () => {
                    setSelectedRowKeys([]);
                    view === 'list' && tableRef.current.handleReload();
                  },
                  t,
                )
              }
            >
              {t('common:btn.batch_delete')}
            </Button>
          )}
          <AutoRefresh
            onRefresh={() => {
              view === 'list' && tableRef.current.handleReload();
              view === 'card' && cardRef.current.reloadCard();
            }}
          />
        </Col>
      </Row>
    );
  }

  const filterObj = Object.assign(
    { hours: filter.hours },
    filter.datasourceIds.length ? { datasourceIds: filter.datasourceIds } : {},
    filter.severity ? { severity: filter.severity } : {},
    filter.queryContent ? { query: filter.queryContent } : {},
    { bgid: filter.bgid },
    filter.rule_prods.length ? { rule_prods: _.join(filter.rule_prods, ',') } : {},
  );

  return (
    <PageLayout icon={<AlertOutlined />} title={t('title')}>
      {view === 'card' ? (
        <Card ref={cardRef} header={renderLeftHeader()} filter={filterObj} />
      ) : (
        <Table header={renderLeftHeader()} filter={filter} filterObj={filterObj} setFilter={setFilter} refreshFlag={refreshTableFlag} />
      )}
    </PageLayout>
  );
};

export default Event;

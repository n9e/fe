import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useAntdTable, useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Select, Space, Tooltip, Input, Table, message, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import Markdown from '@/components/Markdown';
import usePagination from '@/components/usePagination';
import { getMetrics, Record, Filter, getTypes, getCollectors, buildLabelFilterAndExpression } from '@/pages/metricsBuiltin/services';
import { getComponents, Component } from '@/pages/builtInComponents/services';
import { escapePromQLString } from '@/pages/dashboard/VariableConfig/utils';

interface Props {
  selectedIdents: string[];
  setExplorerDrawerData: (data: Record) => void;
}

const FILTER_LOCAL_STORAGE_KEY = 'hosts-metricsBuiltin-filter';

export default function Metrics(props: Props) {
  const { selectedIdents, setExplorerDrawerData } = props;
  const { t, i18n } = useTranslation('metricsBuiltin');
  const pagination = usePagination({ PAGESIZE_KEY: 'hosts-metricsBuiltin-pagesize' });
  let defaultFilter = {
    typ: 'Linux',
  } as Filter;
  try {
    if (window.localStorage.getItem(FILTER_LOCAL_STORAGE_KEY)) {
      defaultFilter = JSON.parse(window.localStorage.getItem(FILTER_LOCAL_STORAGE_KEY) || '{}');
    }
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState<Filter>(defaultFilter as Filter);
  const [queryValue, setQueryValue] = useState(defaultFilter.query || '');
  const [typsMeta, setTypsMeta] = useState<Component[]>([]);
  const [typesList, setTypesList] = useState<string[]>([]);
  const [collectorsList, setCollectorsList] = useState<string[]>([]);
  const { tableProps } = useAntdTable(
    ({
      current,
      pageSize,
    }): Promise<{
      total: number;
      list: Record[];
    }> => {
      return getMetrics({ ...filter, limit: pageSize, p: current });
    },
    {
      refreshDeps: [JSON.stringify(filter), i18n.language],
      defaultPageSize: pagination.pageSize,
    },
  );
  const columns: (ColumnType<Record> & { RC_TABLE_INTERNAL_COL_DEFINE?: any })[] = [
    {
      title: t('typ'),
      dataIndex: 'typ',
      RC_TABLE_INTERNAL_COL_DEFINE: {
        style: {
          minWidth: 70,
        },
      },
      render: (val) => {
        return (
          <Space>
            <img src={_.find(typsMeta, (meta) => meta.ident === val)?.logo || '/image/default.png'} alt={val} style={{ width: 16, height: 16 }} />
            {val}
          </Space>
        );
      },
    },
    {
      title: t('collector'),
      dataIndex: 'collector',
    },
    {
      title: t('name'),
      dataIndex: 'name',
      render: (val, record) => {
        const recordClone = _.cloneDeep(record);
        return (
          <Tooltip overlayClassName='ant-tooltip-max-width-600 ant-tooltip-with-link' title={record.note ? <Markdown content={record.note} /> : undefined}>
            <a
              onClick={() => {
                const label_filter = `{ident=~"${_.join(
                  _.map(selectedIdents, (item) => {
                    return escapePromQLString(item);
                  }),
                  '|',
                )}"}`;
                if (label_filter) {
                  buildLabelFilterAndExpression({
                    label_filter,
                    promql: record.expression,
                  })
                    .then((res) => {
                      recordClone.expression = res;
                      setExplorerDrawerData(recordClone);
                    })
                    .catch(() => {
                      message.warning(t('filter.build_labelfilter_and_expression_error'));
                      setExplorerDrawerData(recordClone);
                    });
                } else {
                  setExplorerDrawerData(recordClone);
                }
              }}
            >
              {val}
            </a>
          </Tooltip>
        );
      },
    },
  ];

  const { run: queryChange } = useDebounceFn(
    (query) => {
      const newFilter = { ...filter, query };
      setFilter(newFilter);
      window.localStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    getComponents().then((res) => {
      setTypsMeta(res);
    });
    getTypes().then((res) => {
      setTypesList(res);
    });
    getCollectors().then((res) => {
      setCollectorsList(res);
    });
  }, []);
  return (
    <>
      <div className='mb1'>
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Select
              value={filter.typ}
              onChange={(val) => {
                const newFilter = { ...filter, typ: val };
                setFilter(newFilter);
                window.localStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
              }}
              options={_.map(typesList, (item) => {
                return {
                  label: (
                    <Space>
                      <img src={_.find(typsMeta, (meta) => meta.ident === item)?.logo || '/image/default.png'} alt={item} style={{ width: 16, height: 16 }} />
                      {item}
                    </Space>
                  ),
                  cleanLabel: item,
                  value: item,
                };
              })}
              showSearch
              optionFilterProp='cleanLabel'
              placeholder={t('typ')}
              style={{ width: '100%' }}
              allowClear
              dropdownMatchSelectWidth={false}
              optionLabelProp='cleanLabel'
            />
          </Col>
          <Col span={12}>
            <Select
              value={filter.collector}
              onChange={(val) => {
                const newFilter = { ...filter, collector: val };
                setFilter(newFilter);
                window.localStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
              }}
              options={_.map(collectorsList, (item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
              showSearch
              optionFilterProp='label'
              placeholder={t('collector')}
              style={{ width: '100%' }}
              allowClear
              dropdownMatchSelectWidth={false}
            />
          </Col>
          <Col span={24}>
            <Input
              placeholder={t('common:search_placeholder')}
              style={{ width: '100%' }}
              value={queryValue}
              onChange={(e) => {
                setQueryValue(e.target.value);
                queryChange(e.target.value);
              }}
              prefix={<SearchOutlined />}
            />
          </Col>
        </Row>
      </div>
      <Table
        style={{
          flexShrink: 1,
        }}
        className='n9e-hosts-explorer-metrics-list-table'
        tableLayout='auto'
        size='small'
        rowKey='id'
        {...tableProps}
        columns={columns}
        pagination={{
          ...pagination,
          ...tableProps.pagination,
        }}
        scroll={{ y: 'calc(100vh - 240px)' }}
      />
    </>
  );
}

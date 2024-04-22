import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Row, Col, Select, Tag } from 'antd';
import _ from 'lodash';
import { Filter, getTypes, getCollectors, getDefaultTypes, Record } from '@/pages/metricsBuiltin/services';
import Markdown from '@/components/Markdown';
import { getUnitLabel } from '@/pages/metricsBuiltin/utils';
import MetricsList from './MetricsList';

interface Props {
  onSelect: (expression: string) => void;
  setOpen: (open: boolean) => void;
}

export default function Content(props: Props) {
  const { t } = useTranslation('promQLInput');
  const { onSelect, setOpen } = props;
  const [filter, setFilter] = useState({} as Filter);
  const [typesList, setTypesList] = useState<string[]>([]);
  const [collectorsList, setCollectorsList] = useState<string[]>([]);
  const [defaultTypesList, setDefaultTypesList] = useState<string[]>([]);
  const [activeMetric, setActiveMetric] = useState<Record>();

  useEffect(() => {
    getTypes().then((res) => {
      setTypesList(res);
    });
    getCollectors().then((res) => {
      setCollectorsList(res);
    });
    getDefaultTypes().then((res) => {
      setDefaultTypesList(res);
    });
  }, []);

  return (
    <div className='promql-dropdown-built-in-metrics-container'>
      <div className='promql-dropdown-built-in-metrics-content'>
        <div className='promql-dropdown-built-in-metrics-list'>
          <Row gutter={[12, 12]} className='p2'>
            <Col span={24}>
              <Input
                prefix={<SearchOutlined />}
                value={filter.query}
                onChange={(e) => {
                  setFilter({ ...filter, query: e.target.value });
                }}
                placeholder={t('builtinMetrics.query_placeholder')}
              />
            </Col>
            <Col span={12}>
              <Select
                value={filter.typ}
                onChange={(val) => {
                  setFilter({ ...filter, typ: val });
                }}
                options={_.map(typesList, (item) => {
                  return {
                    label: item,
                    value: item,
                  };
                })}
                showSearch
                optionFilterProp='label'
                placeholder={t('metricsBuiltin:typ')}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
            <Col span={12}>
              <Select
                value={filter.collector}
                onChange={(val) => {
                  setFilter({ ...filter, collector: val });
                }}
                options={_.map(collectorsList, (item) => {
                  return {
                    label: item,
                    value: item,
                  };
                })}
                showSearch
                optionFilterProp='label'
                placeholder={t('metricsBuiltin:collector')}
                allowClear
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
          <div className='promql-dropdown-built-in-metrics-default-types pl2 pr2'>
            {_.map(defaultTypesList, (item) => {
              return (
                <Tag
                  key={item}
                  color='purple'
                  onClick={() => {
                    setFilter({ ...filter, typ: item });
                  }}
                >
                  {item}
                </Tag>
              );
            })}
          </div>
          <MetricsList
            filter={filter}
            activeMetric={activeMetric}
            setActiveMetric={setActiveMetric}
            onSelect={(expression) => {
              onSelect(expression);
              setOpen(false);
            }}
          />
        </div>
        {activeMetric && (
          <div className='promql-dropdown-built-in-metrics-detail'>
            <div className='promql-dropdown-built-in-metrics-detail-title'>{activeMetric?.name}</div>
            <div className='promql-dropdown-built-in-metrics-detail-row'>
              <div className='promql-dropdown-built-in-metrics-detail-label'>{t('metricsBuiltin:typ')}：</div>
              <div className='promql-dropdown-built-in-metrics-detail-value'>{activeMetric?.typ}</div>
            </div>
            <div className='promql-dropdown-built-in-metrics-detail-row'>
              <div className='promql-dropdown-built-in-metrics-detail-label'>{t('metricsBuiltin:collector')}：</div>
              <div className='promql-dropdown-built-in-metrics-detail-value'>{activeMetric?.collector}</div>
            </div>
            <div className='promql-dropdown-built-in-metrics-detail-row'>
              <div className='promql-dropdown-built-in-metrics-detail-label'>{t('metricsBuiltin:expression')}：</div>
              <div className='promql-dropdown-built-in-metrics-detail-value'>{activeMetric?.expression}</div>
            </div>
            <div className='promql-dropdown-built-in-metrics-detail-row'>
              <div className='promql-dropdown-built-in-metrics-detail-label'>{t('metricsBuiltin:unit')}：</div>
              <div className='promql-dropdown-built-in-metrics-detail-value'>{activeMetric?.unit ? getUnitLabel(activeMetric.unit, true) : '-'}</div>
            </div>
            <div
              className='promql-dropdown-built-in-metrics-detail-row'
              style={{
                overflow: 'hidden',
              }}
            >
              <div className='promql-dropdown-built-in-metrics-detail-label'>{t('metricsBuiltin:note')}：</div>
              <div
                className='promql-dropdown-built-in-metrics-detail-value'
                style={{
                  overflowY: 'auto',
                }}
              >
                {activeMetric?.note ? <Markdown content={activeMetric?.note}></Markdown> : '-'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

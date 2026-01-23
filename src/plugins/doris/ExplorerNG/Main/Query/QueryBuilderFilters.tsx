import React, { useMemo } from 'react';
import { Form, Row, Col, Tooltip, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { SIZE } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';

import { NAME_SPACE } from '../../../constants';
import QueryBuilderFilters from '../../../ExplorerNG/components/QueryBuilder/Filters';
import { Field, FieldSampleParams } from '../../types';

interface Props {
  indexData: Field[];
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;
}

export default function QueryBuilderFiltersCpt(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { indexData, snapRangeRef, executeQuery } = props;

  const eleRef = React.useRef<HTMLDivElement>(null);

  const datasourceCate = Form.useWatch('datasourceCate');
  const datasourceValue = Form.useWatch('datasourceValue');
  const queryValues = Form.useWatch('query');
  const fieldSampleParams = useMemo(() => {
    if (!queryValues || !queryValues.range) return {} as FieldSampleParams;
    const range = parseRange(queryValues.range);
    return {
      cate: datasourceCate,
      datasource_id: datasourceValue,
      database: queryValues.database,
      table: queryValues.table,
      time_field: queryValues.time_field,
      from: moment(range.start).unix(),
      to: moment(range.end).unix(),
      limit: 10,
      query: queryValues.query,
      default_field: queryValues.defaultSearchField,
      filters: queryValues?.query_builder_filter,
    };
  }, [
    datasourceCate,
    datasourceValue,
    queryValues?.database,
    queryValues?.table,
    queryValues?.time_field,
    queryValues?.query,
    queryValues?.defaultSearchField,
    JSON.stringify(queryValues?.query_builder_filter),
    JSON.stringify(queryValues?.range),
  ]);

  const validIndexData = useMemo(() => {
    return _.filter(indexData, (item) => {
      return item.indexable === true;
    });
  }, [indexData]);

  return (
    <div ref={eleRef}>
      <Row align='middle' gutter={SIZE}>
        <Col flex='none'>
          <Tooltip title={t('builder.filters.label_tip')}>
            <Space size={SIZE / 2}>
              <span>{t('builder.filters.label')}</span>
              <InfoCircleOutlined />
            </Space>
          </Tooltip>
        </Col>
        <Col flex='auto'>
          <Form.Item name={['query', 'query_builder_filter']} noStyle>
            <QueryBuilderFilters
              eleRef={eleRef}
              size='small'
              indexData={validIndexData}
              fieldSampleParams={fieldSampleParams}
              onChange={() => {
                snapRangeRef.current = {
                  from: undefined,
                  to: undefined,
                };
                executeQuery();
              }}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}

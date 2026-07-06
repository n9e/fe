import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Button, Form, Input, InputNumber, Row, Col, Select, Segmented, Space, Tooltip, Popover } from 'antd';
import { CloseOutlined, InfoCircleOutlined, PlusOutlined, PushpinOutlined, SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useRequest } from 'ahooks';

import { DatasourceCateEnum, SIZE } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import useOnClickOutside from '@/components/useOnClickOutside';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { getFieldNames, getFieldValues } from '../services';
import { FieldNameSuggestion, VictoriaLogsAggregation, VictoriaLogsFilter, VictoriaLogsMetricBuilderState, VictoriaLogsRawBuilderState } from '../types';
import { renderLogsQL, renderMetricLogsQL } from '../utils/logsQL';
import getOperatorsByFieldType from '../utils/getOperatorsByFieldType';

interface Props {
  visible: boolean;
  mode: 'raw' | 'metric';
  queryBuilderPinned: boolean;
  setQueryBuilderPinned: (pinned: boolean) => void;
  onClose: () => void;
  onExecute: (query: string, values: { raw?: VictoriaLogsRawBuilderState; metric?: VictoriaLogsMetricBuilderState; vizType?: 'table' | 'timeseries' }) => void;
  onPreviewQL: (query: string, values: { raw?: VictoriaLogsRawBuilderState; metric?: VictoriaLogsMetricBuilderState; vizType?: 'table' | 'timeseries' }) => void;
}

const filterOperators = [
  { label: '=', value: 'eq' },
  { label: '!=', value: 'neq' },
  { label: 'contains', value: 'contains' },
  { label: 'not contains', value: 'not_contains' },
  { label: 'regex', value: 'regex' },
  { label: 'not regex', value: 'not_regex' },
  { label: '>', value: 'gt' },
  { label: '>=', value: 'gte' },
  { label: '<', value: 'lt' },
  { label: '<=', value: 'lte' },
  { label: 'exists', value: 'exists' },
  { label: 'not exists', value: 'not_exists' },
];

const aggregationOptions = [
  { label: 'count', value: 'count' },
  { label: 'count_uniq', value: 'count_uniq' },
  { label: 'sum', value: 'sum' },
  { label: 'avg', value: 'avg' },
  { label: 'min', value: 'min' },
  { label: 'max', value: 'max' },
  { label: 'quantile', value: 'quantile' },
];

const SUGGESTION_DEBOUNCE_WAIT = 600;

function getRangeUnix(range: any) {
  if (!range) return undefined;
  const parsed = parseRange(range);
  return {
    start: moment(parsed.start).unix(),
    end: moment(parsed.end).unix(),
  };
}

function getSuggestionBaseQuery(filters?: VictoriaLogsFilter[], index?: number) {
  return renderLogsQL({ filters: typeof index === 'number' ? _.slice(filters || [], 0, index) : filters || [] });
}

function useFieldNameSuggestions(params: { datasourceValue?: number; range?: any; query: string; keyword: string; enabled?: boolean }) {
  const range = React.useMemo(() => getRangeUnix(params.range), [JSON.stringify(params.range)]);
  return useRequest(
    () => {
      return getFieldNames({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: params.datasourceValue!,
        query: params.query || '*',
        start: range!.start,
        end: range!.end,
        filter: params.keyword,
        limit: 100,
      });
    },
    {
      refreshDeps: [params.datasourceValue, range?.start, range?.end, params.query, params.keyword],
      ready: !!params.enabled && !!params.datasourceValue && !!range?.start && !!range?.end,
      debounceWait: SUGGESTION_DEBOUNCE_WAIT,
    },
  );
}

function FieldSelect(props: {
  value?: string;
  onChange?: (value?: string) => void;
  datasourceValue?: number;
  range?: any;
  query: string;
  disabled?: boolean;
  fieldsFilter?: (fields: FieldNameSuggestion[]) => FieldNameSuggestion[];
  onFieldChange?: (field?: FieldNameSuggestion) => void;
}) {
  const { value, onChange, datasourceValue, range, query, disabled, fieldsFilter, onFieldChange } = props;
  const [keyword, setKeyword] = useState('');
  const { data, loading } = useFieldNameSuggestions({ datasourceValue, range, query, keyword, enabled: !disabled });
  const fields = fieldsFilter ? fieldsFilter(data || []) : data || [];
  const options = React.useMemo(() => {
    const manualField = _.trim(keyword || value);
    const items = manualField && !_.find(fields, { field: manualField }) ? [{ field: manualField, type: 'unknown' as const }, ...fields] : fields;
    return _.map(items, (item) => ({ label: item.field, value: item.field, type: item.type }));
  }, [JSON.stringify(fields), value, keyword]);

  return (
    <Select
      allowClear
      disabled={disabled}
      loading={!disabled && loading}
      showSearch
      optionFilterProp='label'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      placeholder='请输入字段'
      value={value}
      options={options}
      onSearch={setKeyword}
      onChange={(next) => {
        onChange?.(next);
        onFieldChange?.(_.find(fields, { field: next }));
      }}
    />
  );
}

function LocalFieldSelect(props: { value?: string; onChange?: (value?: string) => void; disabled?: boolean; fields?: string[] }) {
  const { value, onChange, disabled, fields } = props;
  const [keyword, setKeyword] = useState('');
  const options = React.useMemo(() => {
    const manualField = _.trim(keyword || value);
    return _.map(_.uniq(_.compact([manualField, value, ...(fields || [])])), (field) => ({ label: field, value: field }));
  }, [JSON.stringify(fields), value, keyword]);

  return (
    <Select
      allowClear
      disabled={disabled}
      showSearch
      optionFilterProp='label'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      placeholder='请输入字段'
      value={value}
      options={options}
      onSearch={setKeyword}
      onChange={onChange}
    />
  );
}

function FieldTagsSelect(props: { value?: string[]; onChange?: (value?: string[]) => void; datasourceValue?: number; range?: any; query: string }) {
  const { value, onChange, datasourceValue, range, query } = props;
  const [keyword, setKeyword] = useState('');
  const { data, loading } = useFieldNameSuggestions({ datasourceValue, range, query, keyword, enabled: true });
  const options = React.useMemo(() => {
    const current = _.map(value || [], (field) => ({ field, type: 'unknown' as const }));
    const manual = _.trim(keyword) ? [{ field: _.trim(keyword), type: 'unknown' as const }] : [];
    return _.map(_.uniqBy([...manual, ...(data || []), ...current], 'field'), (item) => ({ label: item.field, value: item.field }));
  }, [JSON.stringify(data), JSON.stringify(value), keyword]);

  return (
    <Select
      size='small'
      className='min-w-[200px]'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      mode='tags'
      tokenSeparators={[',', ' ']}
      loading={loading}
      showSearch
      optionFilterProp='label'
      value={value}
      options={options}
      onSearch={setKeyword}
      onChange={onChange}
    />
  );
}

function FieldValueSelect(props: { value?: any; onChange?: (value?: any) => void; datasourceValue?: number; range?: any; query: string; field?: string }) {
  const { value, onChange, datasourceValue, range, query, field } = props;
  const [keyword, setKeyword] = useState('');
  const rangeUnix = React.useMemo(() => getRangeUnix(range), [JSON.stringify(range)]);
  const { data, loading } = useRequest(
    () => {
      return getFieldValues({
        cate: DatasourceCateEnum.victorialogs,
        datasource_id: datasourceValue!,
        query: query || '*',
        start: rangeUnix!.start,
        end: rangeUnix!.end,
        field: field!,
        filter: keyword,
        limit: 100,
      });
    },
    {
      refreshDeps: [datasourceValue, rangeUnix?.start, rangeUnix?.end, query, field, keyword],
      ready: !!datasourceValue && !!rangeUnix?.start && !!rangeUnix?.end && !!field,
      debounceWait: SUGGESTION_DEBOUNCE_WAIT,
    },
  );
  const options = React.useMemo(() => {
    const currentValue = _.toString(value);
    const manualValue = _.trim(keyword || currentValue);
    const current = manualValue && !_.find(data, { value: manualValue }) ? [{ value: manualValue, count: undefined }] : [];
    return [...current, ...(data || [])];
  }, [JSON.stringify(data), value, keyword]);

  return (
    <Select
      allowClear
      loading={loading}
      showSearch
      optionFilterProp='label'
      optionLabelProp='label'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      placeholder='请输入值'
      value={value}
      onSearch={setKeyword}
      onChange={onChange}
    >
      {_.map(options, (item) => (
        <Select.Option key={item.value} value={item.value} label={item.value}>
          <div className='flex items-center justify-between gap-3'>
            <span>{item.value}</span>
            {item.count ? <span className='text-hint'>{item.count}</span> : null}
          </div>
        </Select.Option>
      ))}
    </Select>
  );
}

function getOrderByFieldOptions(aggregations?: VictoriaLogsAggregation[], groupBy?: string[]) {
  const aggregationFields = _.map(aggregations || [], (item) => _.trim(item.alias) || item.func || 'count');
  return _.map(_.uniq(_.compact([...aggregationFields, ...(groupBy || [])])), (field) => ({ label: field, value: field }));
}

function Describe(props: { children: React.ReactNode; onClose: (e: React.MouseEvent) => void }) {
  const { children, onClose } = props;
  return (
    <div className='border border-antd rounded-sm hover:bg-fc-150 min-h-[24px] wrap-break-word whitespace-normal cursor-pointer flex items-center justify-between'>
      <div
        className='h-full px-[7px] flex items-center'
        style={{
          borderRight: '1px solid var(--fc-antd-border-color)',
        }}
      >
        {children}
      </div>
      <Button className='p-0 min-h-[22px] bg-fc-150 hover:bg-fc-200' size='small' icon={<CloseOutlined />} type='text' onClick={onClose} />
    </div>
  );
}

function filterText(item: VictoriaLogsFilter) {
  const opLabel = _.find(filterOperators, { value: item.op })?.label || item.op;
  if (item.op === 'exists' || item.op === 'not_exists') return opLabel;
  return `${opLabel} ${_.toString(item.value || '')}`;
}

function FilterPopover(props: {
  children: React.ReactNode;
  data?: VictoriaLogsFilter;
  filters?: VictoriaLogsFilter[];
  index?: number;
  datasourceValue?: number;
  range?: any;
  onChange?: (data: VictoriaLogsFilter) => void;
  onAdd?: (data: VictoriaLogsFilter) => void;
  ignoreNextOutsideClick: () => void;
}) {
  const { children, data, filters, index, datasourceValue, range, onChange, onAdd, ignoreNextOutsideClick } = props;
  const [visible, setVisible] = useState<boolean>();
  const [form] = Form.useForm();
  const op = Form.useWatch('op', form);
  const field = Form.useWatch('field', form);
  const suggestionQuery = React.useMemo(() => getSuggestionBaseQuery(filters, index), [JSON.stringify(filters), index]);

  return (
    <Popover
      overlayClassName='doris-query-builder-popup'
      trigger='click'
      placement='bottom'
      visible={visible}
      onVisibleChange={(v) => {
        ignoreNextOutsideClick();
        setVisible(v);
        if (v === false) {
          form.validateFields().then((values) => {
            const next = {
              id: data?.id || _.uniqueId('filter_'),
              fieldSource: 'inferred',
              valueType: 'unknown',
              ...values,
            } as VictoriaLogsFilter;
            if (data) {
              onChange?.(next);
            } else {
              form.resetFields();
              onAdd?.(next);
            }
          }).catch(_.noop);
        } else if (v === true) {
          form.resetFields();
          if (data) {
            form.setFieldsValue(data);
          }
        }
      }}
      content={
        <div className='w-[480px]'>
          <Form form={form} layout='vertical' validateTrigger={[]}>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item label='字段' name='field' rules={[{ required: true, message: '请选择字段' }]}>
                  <FieldSelect
                    datasourceValue={datasourceValue}
                    range={range}
                    query={suggestionQuery}
                    onFieldChange={(fieldData) => {
                      form.setFieldsValue({
                        op: _.head(getOperatorsByFieldType(fieldData?.type)) || 'eq',
                        value: undefined,
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='操作符' name='op' initialValue='eq' rules={[{ required: true, message: '请选择操作符' }]}>
                  <Select dropdownClassName='doris-query-builder-popup' placeholder='请选择操作符' options={filterOperators} />
                </Form.Item>
              </Col>
              {op !== 'exists' && op !== 'not_exists' && (
                <Col span={24}>
                  <Form.Item label='值' name='value' rules={[{ required: true, message: '请输入值' }]}>
                    <FieldValueSelect datasourceValue={datasourceValue} range={range} query={suggestionQuery} field={field} />
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Form>
        </div>
      }
    >
      <div>{children}</div>
    </Popover>
  );
}

function Filters(props: {
  value?: VictoriaLogsFilter[];
  onChange?: (values: VictoriaLogsFilter[]) => void;
  ignoreNextOutsideClick: () => void;
  datasourceValue?: number;
  range?: any;
}) {
  const { value, onChange, ignoreNextOutsideClick, datasourceValue, range } = props;
  return (
    <Space size={[SIZE, SIZE / 2]} wrap style={{ maxWidth: 'calc(100% - 200px)' }}>
      {_.map(value, (item, index) => {
        if (!item.field || !item.op) return null;
        return (
          <FilterPopover
            key={`${item.id}-${index}`}
            data={item}
            filters={value}
            index={index}
            datasourceValue={datasourceValue}
            range={range}
            ignoreNextOutsideClick={ignoreNextOutsideClick}
            onChange={(values) => {
              onChange?.(_.map(value, (v, i) => (i === index ? values : v)));
            }}
          >
            <Describe
              onClose={(e) => {
                e.stopPropagation();
                onChange?.(_.filter(value, (_, i) => i !== index));
              }}
            >
              <Space className='text-hint'>
                <span>{item.field}</span>
                <span>{filterText(item)}</span>
              </Space>
            </Describe>
          </FilterPopover>
        );
      })}
      <FilterPopover
        filters={value}
        index={(value || []).length}
        datasourceValue={datasourceValue}
        range={range}
        ignoreNextOutsideClick={ignoreNextOutsideClick}
        onAdd={(values) => onChange?.([...(value || []), values])}
      >
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          添加
        </Button>
      </FilterPopover>
    </Space>
  );
}

function AggregationPopover(props: {
  children: React.ReactNode;
  data?: VictoriaLogsAggregation;
  filters?: VictoriaLogsFilter[];
  onChange?: (data: VictoriaLogsAggregation) => void;
  onAdd?: (data: VictoriaLogsAggregation) => void;
  ignoreNextOutsideClick: () => void;
}) {
  const { children, data, filters, onChange, onAdd, ignoreNextOutsideClick } = props;
  const [visible, setVisible] = useState<boolean>();
  const [form] = Form.useForm();
  const func = Form.useWatch('func', form);
  const currentFunc = func || data?.func || 'count';
  const fieldOptions = React.useMemo(() => _.uniq(_.compact([data?.field, ..._.map(filters || [], 'field')])), [data?.field, JSON.stringify(filters)]);

  return (
    <Popover
      overlayClassName='doris-query-builder-popup'
      trigger='click'
      placement='bottom'
      visible={visible}
      onVisibleChange={(v) => {
        ignoreNextOutsideClick();
        setVisible(v);
        if (v === false) {
          form.validateFields().then((values) => {
            const next = { id: data?.id || _.uniqueId('aggregation_'), ...values } as VictoriaLogsAggregation;
            if (data) {
              onChange?.(next);
            } else {
              form.resetFields();
              onAdd?.(next);
            }
          }).catch(_.noop);
        } else if (v === true) {
          form.resetFields();
          if (data) {
            form.setFieldsValue(data);
          }
        }
      }}
      content={
        <div className='w-[480px]'>
          <Form form={form} layout='vertical' validateTrigger={[]}>
            <Row gutter={SIZE}>
              <Col span={12}>
                <Form.Item label='函数' name='func' initialValue='count' rules={[{ required: true, message: '请选择函数' }]}>
                  <Select
                    dropdownClassName='doris-query-builder-popup'
                    placeholder='请选择函数'
                    options={aggregationOptions}
                    onChange={(value) => {
                      if (value === 'count') {
                        form.setFieldsValue({ field: undefined });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='字段' name='field' rules={[{ required: currentFunc !== 'count', message: '请输入字段' }]}>
                  <LocalFieldSelect disabled={currentFunc === 'count'} fields={fieldOptions} />
                </Form.Item>
              </Col>
              {currentFunc === 'quantile' && (
                <Col span={12}>
                  <Form.Item label='分位值' name={['params', 'quantile']} initialValue={0.99} rules={[{ required: true, message: '请输入分位值' }]}>
                    <InputNumber className='w-full' min={0} max={1} step={0.01} />
                  </Form.Item>
                </Col>
              )}
              <Col span={currentFunc === 'quantile' ? 12 : 24}>
                <Form.Item label='别名' name='alias'>
                  <Input placeholder='请输入别名' />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      }
    >
      <div>{children}</div>
    </Popover>
  );
}

function Aggregates(props: {
  value?: VictoriaLogsAggregation[];
  onChange?: (values: VictoriaLogsAggregation[]) => void;
  ignoreNextOutsideClick: () => void;
  filters?: VictoriaLogsFilter[];
}) {
  const { value, onChange, ignoreNextOutsideClick, filters } = props;
  return (
    <Space size={[SIZE, SIZE / 2]} wrap>
      {_.map(value, (item, index) => {
        if (!item.func) return null;
        return (
          <AggregationPopover
            key={`${item.id}-${index}`}
            data={item}
            filters={filters}
            ignoreNextOutsideClick={ignoreNextOutsideClick}
            onChange={(values) => {
              onChange?.(_.map(value, (v, i) => (i === index ? values : v)));
            }}
          >
            <Describe
              onClose={(e) => {
                e.stopPropagation();
                onChange?.(_.filter(value, (_, i) => i !== index));
              }}
            >
              <Space className='text-hint'>
                <strong className='text-main bg-fc-200 px-1'>{item.func}</strong>
                {item.field && <span>{item.field}</span>}
                {item.alias ? (
                  <>
                    <strong className='text-main bg-fc-200 px-1'>AS</strong>
                    <span>{item.alias}</span>
                  </>
                ) : null}
              </Space>
            </Describe>
          </AggregationPopover>
        );
      })}
      <AggregationPopover
        filters={filters}
        ignoreNextOutsideClick={ignoreNextOutsideClick}
        onAdd={(values) => onChange?.([...(value || []), values])}
      >
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          添加
        </Button>
      </AggregationPopover>
    </Space>
  );
}

function OrderByPopover(props: {
  children: React.ReactNode;
  data?: { field: string; direction: 'asc' | 'desc' };
  fieldOptions: { label: string; value: string }[];
  onChange?: (data: { field: string; direction: 'asc' | 'desc' }) => void;
  onAdd?: (data: { field: string; direction: 'asc' | 'desc' }) => void;
  ignoreNextOutsideClick: () => void;
}) {
  const { children, data, fieldOptions, onChange, onAdd, ignoreNextOutsideClick } = props;
  const [visible, setVisible] = useState<boolean>();
  const [form] = Form.useForm();

  return (
    <Popover
      overlayClassName='doris-query-builder-popup'
      trigger='click'
      placement='bottom'
      visible={visible}
      onVisibleChange={(v) => {
        ignoreNextOutsideClick();
        setVisible(v);
        if (v === false) {
          form.validateFields().then((values) => {
            if (data) {
              onChange?.(values);
            } else {
              form.resetFields();
              onAdd?.(values);
            }
          });
        } else if (v === true && data) {
          form.setFieldsValue(data);
        }
      }}
      content={
        <div className='w-[400px]'>
          <Form form={form} layout='vertical'>
            <Row gutter={SIZE}>
              <Col span={16}>
                <Form.Item label='字段' name='field' rules={[{ required: true, message: '请输入字段' }]}>
                  <Select
                    dropdownClassName='doris-query-builder-popup'
                    dropdownMatchSelectWidth={false}
                    showSearch
                    optionFilterProp='label'
                    options={fieldOptions}
                    placeholder='请输入字段'
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label='排序' name='direction' initialValue='desc' rules={[{ required: true, message: '请选择排序' }]}>
                  <Select
                    dropdownClassName='doris-query-builder-popup'
                    options={[
                      { label: 'asc', value: 'asc' },
                      { label: 'desc', value: 'desc' },
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      }
    >
      <div>{children}</div>
    </Popover>
  );
}

function OrderBy(props: {
  value?: { field: string; direction: 'asc' | 'desc' }[];
  onChange?: (values: { field: string; direction: 'asc' | 'desc' }[]) => void;
  ignoreNextOutsideClick: () => void;
  fieldOptions: { label: string; value: string }[];
}) {
  const { value, onChange, ignoreNextOutsideClick, fieldOptions } = props;
  return (
    <Space size={SIZE} wrap>
      {_.map(value, (item, index) => {
        if (!item.field || !item.direction) return null;
        return (
          <OrderByPopover
            key={`${item.field}-${item.direction}-${index}`}
            data={item}
            fieldOptions={fieldOptions}
            ignoreNextOutsideClick={ignoreNextOutsideClick}
            onChange={(values) => onChange?.(_.map(value, (v, i) => (i === index ? values : v)))}
          >
            <Describe
              onClose={(e) => {
                e.stopPropagation();
                onChange?.(_.filter(value, (_, i) => i !== index));
              }}
            >
              <Space className='text-hint'>
                <span>{item.field}</span>
                <strong className='text-main bg-fc-200 px-1'>{item.direction}</strong>
              </Space>
            </Describe>
          </OrderByPopover>
        );
      })}
      <OrderByPopover fieldOptions={fieldOptions} ignoreNextOutsideClick={ignoreNextOutsideClick} onAdd={(values) => onChange?.([...(value || []), values])}>
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          添加
        </Button>
      </OrderByPopover>
    </Space>
  );
}

export default function Builder(props: Props) {
  const { visible, mode, queryBuilderPinned, setQueryBuilderPinned, onClose, onExecute, onPreviewQL } = props;
  const parentForm = Form.useFormInstance();
  const [form] = Form.useForm();
  const datasourceValue = Form.useWatch('datasourceValue', parentForm);
  const queryValues = Form.useWatch('query', parentForm);
  const filters = Form.useWatch('filters', form);
  const aggregates = Form.useWatch('aggregations', form);
  const groupBy = Form.useWatch('groupBy', form);
  const eleRef = React.useRef<HTMLDivElement>(null);
  const skipOutsideClickRef = React.useRef(false);
  const filterOnlyQuery = React.useMemo(() => getSuggestionBaseQuery(filters), [JSON.stringify(filters)]);
  const orderByFieldOptions = React.useMemo(() => getOrderByFieldOptions(aggregates, groupBy), [JSON.stringify(aggregates), JSON.stringify(groupBy)]);

  const ignoreNextOutsideClick = () => {
    skipOutsideClickRef.current = true;
  };

  useOnClickOutside(eleRef, (e) => {
    const target = (e as Event)?.target as HTMLElement | null;
    if (target && typeof target.closest === 'function' && target.closest('.doris-query-builder-popup')) {
      return;
    }
    if (skipOutsideClickRef.current) {
      skipOutsideClickRef.current = false;
      return;
    }
    onClose();
  });

  React.useEffect(() => {
    if (!visible) return;
    const builder = queryValues?.builder || {};
    if (mode === 'metric') {
      form.setFieldsValue({
        filters: builder.metric?.filters || builder.raw?.filters || [],
        aggregations: builder.metric?.aggregations || [],
        groupBy: builder.metric?.groupBy || [],
        orderBy: builder.metric?.orderBy || [],
        limit: builder.metric?.limit || undefined,
        vizType: queryValues?.vizType || builder.metric?.vizType || 'table',
      });
    } else {
      form.setFieldsValue({
        filters: builder.raw?.filters || builder.metric?.filters || [],
      });
    }
  }, [visible, mode]);

  const getRenderResult = () => {
    const values = form.getFieldsValue();
    if (mode === 'metric') {
      const metric = values as VictoriaLogsMetricBuilderState;
      return {
        query: renderMetricLogsQL(metric),
        values: {
          metric,
          raw: { filters: values.filters || [] },
          vizType: values.vizType,
        },
      };
    }
    const raw = values as VictoriaLogsRawBuilderState;
    return {
      query: renderLogsQL(raw),
      values: { raw },
    };
  };

  return (
    <div
      ref={eleRef}
      className={classNames('w-full border border-antd rounded-sm mb-2 mt-1 bg-fc-100 left-0 p-4 pt-2 shadow-lg', {
        absolute: !queryBuilderPinned,
        'top-[32px]': !queryBuilderPinned,
        'border-primary': !queryBuilderPinned,
        relative: queryBuilderPinned,
      })}
      style={{
        zIndex: 2,
        display: visible ? 'block' : 'none',
      }}
    >
      <Form form={form} layout='vertical'>
        <div className='w-full table border-separate border-spacing-y-3'>
          <div className='table-column w-[52px]' />
          <div className='table-column' />
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center'>
                <Tooltip title='所有筛选条件的关系为且。'>
                  <Space size={SIZE / 2}>
                    <span>筛选</span>
                    <InfoCircleOutlined />
                  </Space>
                </Tooltip>
              </div>
            </div>
            <div className='table-cell'>
              <Form.Item name='filters' noStyle>
                <Filters datasourceValue={datasourceValue} range={queryValues?.range} ignoreNextOutsideClick={ignoreNextOutsideClick} />
              </Form.Item>
            </div>
          </div>
          {mode === 'metric' && (
            <>
              <div className='table-row'>
                <div className='table-cell align-top'>
                  <div className='h-[24px] flex items-center'>聚合</div>
                </div>
                <div className='table-cell'>
                  <Form.Item name='aggregations' noStyle>
                    <Aggregates filters={filters} ignoreNextOutsideClick={ignoreNextOutsideClick} />
                  </Form.Item>
                </div>
              </div>
              <div className='table-row'>
                <div className='table-cell align-top'>
                  <div className='h-[24px] flex items-center'>展示</div>
                </div>
                <div className='table-cell'>
                  <Space size={SIZE} wrap>
                    <Form.Item name='vizType' noStyle initialValue='table'>
                      <Segmented
                        size='small'
                        options={[
                          { label: '统计值', value: 'table' },
                          { label: '时序图', value: 'timeseries' },
                        ]}
                      />
                    </Form.Item>
                    <InputGroupWithFormItem size='small' label='分组'>
                      <Form.Item name='groupBy' noStyle>
                        <FieldTagsSelect datasourceValue={datasourceValue} range={queryValues?.range} query={filterOnlyQuery} />
                      </Form.Item>
                    </InputGroupWithFormItem>
                    <InputGroupWithFormItem size='small' label='数量限制'>
                      <Form.Item name='limit' noStyle>
                        <InputNumber size='small' className='w-[100px]' min={1} max={10000000} />
                      </Form.Item>
                    </InputGroupWithFormItem>
                  </Space>
                </div>
              </div>
              <div className='table-row'>
                <div className='table-cell align-top'>
                  <div className='h-[24px] flex items-center'>排序</div>
                </div>
                <div className='table-cell'>
                  <Form.Item name='orderBy' noStyle>
                    <OrderBy fieldOptions={orderByFieldOptions} ignoreNextOutsideClick={ignoreNextOutsideClick} />
                  </Form.Item>
                </div>
              </div>
            </>
          )}
        </div>
        <Space size={SIZE} className='mt-3'>
          <Button
            size='small'
            type='primary'
            icon={<SearchOutlined />}
            onClick={() => {
              const res = getRenderResult();
              onExecute(res.query, res.values);
            }}
          >
            查询
          </Button>
          <Button
            size='small'
            onClick={() => {
              const res = getRenderResult();
              onPreviewQL(res.query, res.values);
            }}
          >
            预览 QL
          </Button>
        </Space>
      </Form>
      <div className='absolute top-2 right-2'>
        <Tooltip title={queryBuilderPinned ? '取消固定' : '固定'}>
          <Button
            type='text'
            icon={<PushpinOutlined />}
            onMouseDown={() => {
              ignoreNextOutsideClick();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setQueryBuilderPinned(!queryBuilderPinned);
            }}
          >
            {queryBuilderPinned ? '取消固定' : '固定'}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

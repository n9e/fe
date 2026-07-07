import React, { useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Alert, Button, Col, Form, Input, InputNumber, Popover, Row, Select, Segmented, Space, Tooltip } from 'antd';
import { CloseOutlined, PlusOutlined, PushpinOutlined, SearchOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum, SIZE } from '@/utils/constant';
import { parseRange } from '@/components/TimeRangePicker';
import useOnClickOutside from '@/components/useOnClickOutside';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import { NAME_SPACE } from '../../constants';
import { DEFAULT_RAW_LOG_LIMIT, MAX_RAW_LOG_LIMIT } from '../constants';
import { getLabelNames, getLabelValues, getParsedFields } from '../services';
import { FieldNameSuggestion, LokiLabelMatcher, LokiLineFilter, LokiMetricBuilderState, LokiParsedFieldFilter, LokiRawBuilderState } from '../types';
import { renderLogQLByMode, renderRawLogQL } from '../utils/logsQL';

interface Props {
  visible: boolean;
  mode: 'raw' | 'metric';
  queryBuilderPinned: boolean;
  setQueryBuilderPinned: (pinned: boolean) => void;
  onClose: () => void;
  onExecute: (query: string, values: { raw?: LokiRawBuilderState; metric?: LokiMetricBuilderState; vizType?: 'table' | 'timeseries' }) => void;
  onPreviewQL: (query: string, values: { raw?: LokiRawBuilderState; metric?: LokiMetricBuilderState; vizType?: 'table' | 'timeseries' }) => void;
}

const labelOperators = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '=~', value: '=~' },
  { label: '!~', value: '!~' },
];

const lineFilterOperators = [
  { label: '|=', value: '|=' },
  { label: '!=', value: '!=' },
  { label: '|~', value: '|~' },
  { label: '!~', value: '!~' },
];

const parsedFieldOperators = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '=~', value: '=~' },
  { label: '!~', value: '!~' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
];

const rangeFuncOptions = [
  { label: 'count_over_time', value: 'count_over_time' },
  { label: 'rate', value: 'rate' },
  { label: 'bytes_over_time', value: 'bytes_over_time' },
  { label: 'bytes_rate', value: 'bytes_rate' },
  { label: 'sum_over_time', value: 'sum_over_time' },
  { label: 'avg_over_time', value: 'avg_over_time' },
  { label: 'min_over_time', value: 'min_over_time' },
  { label: 'max_over_time', value: 'max_over_time' },
  { label: 'quantile_over_time', value: 'quantile_over_time' },
];

const unwrapRangeFuncs = ['sum_over_time', 'avg_over_time', 'min_over_time', 'max_over_time', 'quantile_over_time'];

const SUGGESTION_DEBOUNCE_WAIT = 500;
const parsedFieldsCache = new Map<string, FieldNameSuggestion[]>();

function getRangeMs(range: any) {
  if (!range) return undefined;
  const parsed = parseRange(range);
  return {
    start: moment(parsed.start).valueOf(),
    end: moment(parsed.end).valueOf(),
  };
}

function getLabelSuggestionQuery(labels?: LokiLabelMatcher[], index?: number) {
  const availableLabels: LokiLabelMatcher[] = typeof index === 'number' ? (labels || []).slice(0, index) : labels || [];
  const completeLabels = availableLabels.filter((item) => _.trim(item.label) && _.trim(_.toString(item.value)));
  return completeLabels.length === 0 ? '' : renderRawLogQL({ labels: completeLabels });
}

function normalizeSuggestionQuery(query?: string) {
  const value = _.trim(query);
  if (!value || value === '{}') return undefined;
  return value;
}

function isEmptyCompatibleLabelMatcher(item?: LokiLabelMatcher) {
  const op = item?.op || '=';
  const value = _.toString(item?.value ?? '');
  if (!_.trim(item?.label) || !_.trim(value)) return true;
  if (op === '=') return false;
  if (op === '=~') {
    try {
      return new RegExp(`^(?:${value})$`).test('');
    } catch (e) {
      return false;
    }
  }
  return true;
}

function hasRequiredLabelMatcher(labels?: LokiLabelMatcher[]) {
  return _.some(labels || [], (item) => !isEmptyCompatibleLabelMatcher(item));
}

function isUnwrappedRangeFunc(rangeFunc?: string) {
  return _.includes(unwrapRangeFuncs, rangeFunc);
}

function RequiredLabel(props: { children: React.ReactNode }) {
  return (
    <span className='relative inline-flex items-center'>
      <span style={{ color: '#ff4d4f' }} className='absolute right-full mr-1'>
        *
      </span>
      {props.children}
    </span>
  );
}

function getParsedFieldsQuery(values: Partial<LokiRawBuilderState>) {
  return renderRawLogQL({
    labels: values.labels || [],
    lineFilters: values.lineFilters || [],
    parser: values.parser,
  });
}

function useLabelNameSuggestions(params: { datasourceValue?: number; range?: any; query?: string; keyword: string; enabled?: boolean }) {
  const range = useMemo(() => getRangeMs(params.range), [JSON.stringify(params.range)]);
  return useRequest(
    () =>
      getLabelNames({
        cate: DatasourceCateEnum.loki,
        datasource_id: params.datasourceValue!,
        query: normalizeSuggestionQuery(params.query),
        start: range!.start,
        end: range!.end,
        filter: params.keyword,
        limit: 100,
      }),
    {
      refreshDeps: [params.datasourceValue, params.query, params.keyword, !!range?.start, !!range?.end],
      ready: !!params.enabled && !!params.datasourceValue && !!range?.start && !!range?.end,
      debounceWait: SUGGESTION_DEBOUNCE_WAIT,
    },
  );
}

function useParsedFieldSuggestions(params: { datasourceValue?: number; range?: any; query: string; enabled?: boolean }) {
  const range = useMemo(() => getRangeMs(params.range), [JSON.stringify(params.range)]);
  const cacheKey = `${params.datasourceValue || ''}:${params.query}`;
  return useRequest(
    async () => {
      if (parsedFieldsCache.has(cacheKey)) return parsedFieldsCache.get(cacheKey)!;
      const fields = await getParsedFields({
        cate: DatasourceCateEnum.loki,
        datasource_id: params.datasourceValue!,
        query: params.query || '{}',
        start: range!.start,
        end: range!.end,
        limit: 200,
      });
      parsedFieldsCache.set(cacheKey, fields);
      return fields;
    },
    {
      refreshDeps: [params.datasourceValue, params.query],
      ready: !!params.enabled && !!params.datasourceValue && !!range?.start && !!range?.end && /\|\s*(json|logfmt|regexp|pattern)\b/.test(params.query),
      debounceWait: SUGGESTION_DEBOUNCE_WAIT,
    },
  );
}

function FieldSelect(props: {
  value?: string;
  onChange?: (value?: string) => void;
  datasourceValue?: number;
  range?: any;
  query?: string;
  fields?: FieldNameSuggestion[];
  loading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, onChange, datasourceValue, range, query, fields, loading, disabled, size, className, onMouseDown } = props;
  const [keyword, setKeyword] = useState('');
  const labelSuggestion = useLabelNameSuggestions({ datasourceValue, range, query, keyword, enabled: !fields && !disabled });
  const sourceFields = fields || labelSuggestion.data || [];
  const options = useMemo(() => {
    const manualField = _.trim(keyword || value);
    const manual = manualField && !_.find(sourceFields, { field: manualField }) ? [{ field: manualField }] : [];
    return _.map(_.uniqBy([...manual, ...sourceFields], 'field'), (item) => ({ label: item.field, value: item.field }));
  }, [JSON.stringify(sourceFields), value, keyword]);

  return (
    <Select
      allowClear
      size={size}
      className={className}
      disabled={disabled}
      loading={!disabled && (loading || labelSuggestion.loading)}
      showSearch
      optionFilterProp='label'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      placeholder={t('builder.field_placeholder')}
      value={value}
      options={options}
      onMouseDown={onMouseDown}
      onSearch={setKeyword}
      onChange={onChange}
    />
  );
}

function LabelValueSelect(props: { value?: string; onChange?: (value?: string) => void; datasourceValue?: number; range?: any; query?: string; label?: string }) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, onChange, datasourceValue, range, query, label } = props;
  const [keyword, setKeyword] = useState('');
  const rangeMs = useMemo(() => getRangeMs(range), [JSON.stringify(range)]);
  const { data, loading } = useRequest(
    () =>
      getLabelValues({
        cate: DatasourceCateEnum.loki,
        datasource_id: datasourceValue!,
        query: normalizeSuggestionQuery(query),
        start: rangeMs!.start,
        end: rangeMs!.end,
        label: label!,
        filter: keyword,
        limit: 100,
      }),
    {
      refreshDeps: [datasourceValue, rangeMs?.start, rangeMs?.end, query, label, keyword],
      ready: !!datasourceValue && !!rangeMs?.start && !!rangeMs?.end && !!label,
      debounceWait: SUGGESTION_DEBOUNCE_WAIT,
    },
  );
  const options = useMemo(() => {
    const manualValue = _.trim(keyword || value);
    const manual = manualValue && !_.find(data, { value: manualValue }) ? [{ value: manualValue }] : [];
    return _.map(_.uniqBy([...manual, ...(data || [])], 'value'), (item) => ({ label: item.value, value: item.value }));
  }, [JSON.stringify(data), value, keyword]);

  return (
    <Select
      allowClear
      loading={loading}
      showSearch
      optionFilterProp='label'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      placeholder={t('builder.value_placeholder')}
      value={value}
      options={options}
      onSearch={setKeyword}
      onChange={onChange}
    />
  );
}

function Describe(props: { children: React.ReactNode; onClose: (e: React.MouseEvent) => void }) {
  const { children, onClose } = props;
  return (
    <div className='border border-antd rounded-sm hover:bg-fc-150 min-h-[24px] wrap-break-word whitespace-normal cursor-pointer flex items-center justify-between'>
      <div className='h-full px-[7px] flex items-center' style={{ borderRight: '1px solid var(--fc-antd-border-color)' }}>
        {children}
      </div>
      <Button className='p-0 min-h-[22px] bg-fc-150 hover:bg-fc-200' size='small' icon={<CloseOutlined />} type='text' onClick={onClose} />
    </div>
  );
}

function LabelPopover(props: {
  children: React.ReactNode;
  data?: LokiLabelMatcher;
  labels?: LokiLabelMatcher[];
  index?: number;
  datasourceValue?: number;
  range?: any;
  onChange?: (data: LokiLabelMatcher) => void;
  onAdd?: (data: LokiLabelMatcher) => void;
  ignoreNextOutsideClick: () => void;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const { children, data, labels, index, datasourceValue, range, onChange, onAdd, ignoreNextOutsideClick } = props;
  const [visible, setVisible] = useState<boolean>();
  const [form] = Form.useForm();
  const label = Form.useWatch('label', form);
  const suggestionQuery = useMemo(() => getLabelSuggestionQuery(labels, index), [JSON.stringify(labels), index]);

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
          form
            .validateFields()
            .then((values) => {
              const next = { id: data?.id || _.uniqueId('label_'), ...values } as LokiLabelMatcher;
              data ? onChange?.(next) : onAdd?.(next);
              if (!data) form.resetFields();
            })
            .catch(_.noop);
        } else if (v === true) {
          form.resetFields();
          if (data) form.setFieldsValue(data);
        }
      }}
      content={
        <div className='w-[520px]'>
          <Form form={form} layout='vertical' validateTrigger={[]}>
            <Row gutter={SIZE}>
              <Col span={9}>
                <Form.Item label={t('builder.label')} name='label' rules={[{ required: true, message: t('builder.label_required') }]}>
                  <FieldSelect datasourceValue={datasourceValue} range={range} query={suggestionQuery} />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label={t('builder.operator')} name='op' initialValue='=' rules={[{ required: true, message: t('builder.operator_required') }]}>
                  <Select dropdownClassName='doris-query-builder-popup' options={labelOperators} />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label={t('builder.value')} name='value' rules={[{ required: true, message: t('builder.value_required') }]}>
                  <LabelValueSelect datasourceValue={datasourceValue} range={range} query={suggestionQuery} label={label} />
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

function Labels(props: { value?: LokiLabelMatcher[]; onChange?: (values: LokiLabelMatcher[]) => void; ignoreNextOutsideClick: () => void; datasourceValue?: number; range?: any }) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, onChange, ignoreNextOutsideClick, datasourceValue, range } = props;
  return (
    <Space size={[SIZE, SIZE / 2]} wrap>
      {_.map(value, (item, index) => {
        if (!item.label || !item.op) return null;
        return (
          <LabelPopover
            key={`${item.id}-${index}`}
            data={item}
            labels={value}
            index={index}
            datasourceValue={datasourceValue}
            range={range}
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
                <span>{item.label}</span>
                <strong className='text-main bg-fc-200 px-1'>{item.op}</strong>
                <span>{item.value}</span>
              </Space>
            </Describe>
          </LabelPopover>
        );
      })}
      <LabelPopover
        labels={value}
        index={(value || []).length}
        datasourceValue={datasourceValue}
        range={range}
        ignoreNextOutsideClick={ignoreNextOutsideClick}
        onAdd={(values) => onChange?.([...(value || []), values])}
      >
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          {t('builder.add')}
        </Button>
      </LabelPopover>
    </Space>
  );
}

function LineFilters(props: { value?: LokiLineFilter[]; onChange?: (values: LokiLineFilter[]) => void }) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, onChange } = props;
  return (
    <Space size={[SIZE, SIZE / 2]} wrap>
      {_.map(value, (item, index) => (
        <Describe
          key={`${item.id}-${index}`}
          onClose={(e) => {
            e.stopPropagation();
            onChange?.(_.filter(value, (_, i) => i !== index));
          }}
        >
          <Space>
            <Select
              size='small'
              className='w-[72px]'
              dropdownClassName='doris-query-builder-popup'
              value={item.op}
              options={lineFilterOperators}
              onChange={(op) => onChange?.(_.map(value, (v, i) => (i === index ? { ...v, op } : v)))}
            />
            <Input
              size='small'
              className='w-[220px]'
              value={item.value}
              placeholder={t('builder.log_line_placeholder')}
              onChange={(e) => onChange?.(_.map(value, (v, i) => (i === index ? { ...v, value: e.target.value } : v)))}
            />
          </Space>
        </Describe>
      ))}
      <Button
        size='small'
        type='text'
        icon={<PlusOutlined />}
        className='hover:bg-fc-150'
        onClick={() => onChange?.([...(value || []), { id: _.uniqueId('line_'), op: '|=', value: '' }])}
      >
        {t('builder.add')}
      </Button>
    </Space>
  );
}

function ParsedFieldFilters(props: {
  value?: LokiParsedFieldFilter[];
  onChange?: (values: LokiParsedFieldFilter[]) => void;
  fields?: FieldNameSuggestion[];
  fieldsLoading?: boolean;
  ignoreNextOutsideClick: () => void;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, onChange, fields, fieldsLoading, ignoreNextOutsideClick } = props;
  return (
    <Space size={[SIZE, SIZE / 2]} wrap>
      {_.map(value, (item, index) => {
        if (!item.field || !item.op) return null;
        return (
          <ParsedFieldFilterPopover
            key={`${item.id}-${index}`}
            data={item}
            fields={fields}
            fieldsLoading={fieldsLoading}
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
                <strong className='text-main bg-fc-200 px-1'>{item.op}</strong>
                <span>{item.value}</span>
              </Space>
            </Describe>
          </ParsedFieldFilterPopover>
        );
      })}
      <ParsedFieldFilterPopover
        fields={fields}
        fieldsLoading={fieldsLoading}
        ignoreNextOutsideClick={ignoreNextOutsideClick}
        onAdd={(values) => onChange?.([...(value || []), values])}
      >
        <Button size='small' type='text' icon={<PlusOutlined />} className='hover:bg-fc-150'>
          {t('builder.add')}
        </Button>
      </ParsedFieldFilterPopover>
    </Space>
  );
}

function FieldTagsSelect(props: {
  value?: string[];
  onChange?: (value?: string[]) => void;
  fields?: FieldNameSuggestion[];
  loading?: boolean;
  onMouseDown?: React.MouseEventHandler<HTMLDivElement>;
}) {
  const { value, onChange, fields, loading } = props;
  const options = useMemo(
    () => _.map(_.uniqBy([...(fields || []), ..._.map(value || [], (field) => ({ field }))], 'field'), (item) => ({ label: item.field, value: item.field })),
    [JSON.stringify(fields), JSON.stringify(value)],
  );
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
      onMouseDown={props.onMouseDown}
      onChange={onChange}
    />
  );
}

function ParsedFieldValueSelect(props: {
  value?: string | number;
  onChange?: (value?: string) => void;
  field?: string;
  fields?: FieldNameSuggestion[];
  loading?: boolean;
  size?: 'small' | 'middle' | 'large';
  className?: string;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, onChange, field, fields, loading, size, className } = props;
  const [keyword, setKeyword] = useState('');
  const selectedField = useMemo(() => _.find(fields || [], { field }), [JSON.stringify(fields), field]);
  const sourceValues = selectedField?.values || [];
  const options = useMemo(() => {
    const manualValue = _.trim(keyword || _.toString(value ?? ''));
    const manual = manualValue && !_.includes(sourceValues, manualValue) ? [manualValue] : [];
    return _.map(_.uniq([...manual, ...sourceValues]), (item) => ({ label: item, value: item }));
  }, [JSON.stringify(sourceValues), value, keyword]);

  return (
    <Select
      allowClear
      size={size}
      className={className}
      loading={loading}
      showSearch
      optionFilterProp='label'
      dropdownClassName='doris-query-builder-popup'
      dropdownMatchSelectWidth={false}
      placeholder={t('builder.value')}
      value={_.isNil(value) ? undefined : _.toString(value)}
      options={options}
      onSearch={setKeyword}
      onChange={onChange}
    />
  );
}

function ParsedFieldFilterPopover(props: {
  children: React.ReactNode;
  data?: LokiParsedFieldFilter;
  fields?: FieldNameSuggestion[];
  fieldsLoading?: boolean;
  onChange?: (data: LokiParsedFieldFilter) => void;
  onAdd?: (data: LokiParsedFieldFilter) => void;
  ignoreNextOutsideClick: () => void;
}) {
  const { t } = useTranslation(NAME_SPACE);
  const { children, data, fields, fieldsLoading, onChange, onAdd, ignoreNextOutsideClick } = props;
  const [visible, setVisible] = useState<boolean>();
  const [form] = Form.useForm();
  const field = Form.useWatch('field', form);

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
          form
            .validateFields()
            .then((values) => {
              const next = { id: data?.id || _.uniqueId('parsed_'), ...values } as LokiParsedFieldFilter;
              data ? onChange?.(next) : onAdd?.(next);
              if (!data) form.resetFields();
            })
            .catch(_.noop);
        } else if (v === true) {
          form.resetFields();
          form.setFieldsValue(data || { op: '=' });
        }
      }}
      content={
        <div className='w-[620px]'>
          <Form form={form} layout='vertical' validateTrigger={[]}>
            <Row gutter={SIZE}>
              <Col span={9}>
                <Form.Item label={t('builder.field')} name='field' rules={[{ required: true, message: t('builder.field_required') }]}>
                  <FieldSelect fields={fields} loading={fieldsLoading} />
                </Form.Item>
              </Col>
              <Col span={5}>
                <Form.Item label={t('builder.operator')} name='op' initialValue='=' rules={[{ required: true, message: t('builder.operator_required') }]}>
                  <Select dropdownClassName='doris-query-builder-popup' options={parsedFieldOperators} />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label={t('builder.value')} name='value' rules={[{ required: true, message: t('builder.value_required') }]}>
                  <ParsedFieldValueSelect field={field} fields={fields} loading={fieldsLoading} />
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

export default function Builder(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { visible, mode, queryBuilderPinned, setQueryBuilderPinned, onClose, onExecute, onPreviewQL } = props;
  const parentForm = Form.useFormInstance();
  const [form] = Form.useForm();
  const [validationMessage, setValidationMessage] = useState<string>();
  const datasourceValue = Form.useWatch('datasourceValue', parentForm);
  const queryValues = Form.useWatch('query', parentForm);
  const labels = Form.useWatch('labels', form);
  const lineFilters = Form.useWatch('lineFilters', form);
  const parser = Form.useWatch('parser', form);
  const rangeFunc = Form.useWatch('rangeFunc', form);
  const parsedFieldsQuery = useMemo(() => getParsedFieldsQuery({ labels, lineFilters, parser }), [JSON.stringify(labels), JSON.stringify(lineFilters), JSON.stringify(parser)]);
  const eleRef = useRef<HTMLDivElement>(null);
  const skipOutsideClickRef = useRef(false);

  const { data: labelFields, loading: labelFieldsLoading } = useLabelNameSuggestions({
    datasourceValue,
    range: queryValues?.range,
    query: getLabelSuggestionQuery(labels),
    keyword: '',
    enabled: visible,
  });

  const { data: parsedFields, loading: parsedFieldsLoading } = useParsedFieldSuggestions({
    datasourceValue,
    range: queryValues?.range,
    query: parsedFieldsQuery,
    enabled: visible,
  });

  const ignoreNextOutsideClick = () => {
    skipOutsideClickRef.current = true;
  };

  const metricGroupFields = useMemo(() => _.uniqBy([...(labelFields || []), ...(parsedFields || [])], 'field'), [JSON.stringify(labelFields), JSON.stringify(parsedFields)]);

  const parserOptions = useMemo(
    () => [
      { label: t('builder.none'), value: '' },
      { label: 'json', value: 'json' },
      { label: 'logfmt', value: 'logfmt' },
      { label: 'regexp', value: 'regexp' },
      { label: 'pattern', value: 'pattern' },
    ],
    [t],
  );

  const vectorAggOptions = useMemo(
    () => [
      { label: t('builder.none'), value: '' },
      { label: 'sum', value: 'sum' },
      { label: 'avg', value: 'avg' },
      { label: 'min', value: 'min' },
      { label: 'max', value: 'max' },
      { label: 'count', value: 'count' },
      { label: 'topk', value: 'topk' },
      { label: 'bottomk', value: 'bottomk' },
    ],
    [t],
  );

  useOnClickOutside(eleRef, (e) => {
    const target = (e as Event)?.target as HTMLElement | null;
    if (target && typeof target.closest === 'function' && target.closest('.doris-query-builder-popup')) return;
    if (skipOutsideClickRef.current) {
      skipOutsideClickRef.current = false;
      return;
    }
    onClose();
  });

  React.useEffect(() => {
    if (!visible) {
      form.resetFields();
      return;
    }
    form.resetFields();
    const builder = queryValues?.builder || {};
    const source = mode === 'metric' ? builder.metric || builder.raw : builder.raw || builder.metric;
    form.setFieldsValue({
      labels: source?.labels || [],
      lineFilters: source?.lineFilters || [],
      parser: source?.parser || {},
      parsedFieldFilters: source?.parsedFieldFilters || [],
      limit: source?.limit || queryValues?.limit || DEFAULT_RAW_LOG_LIMIT,
      rangeFunc: builder.metric?.rangeFunc || 'count_over_time',
      range: builder.metric?.range || '5m',
      rangeParam: builder.metric?.rangeParam ?? 0.99,
      unwrapField: builder.metric?.unwrapField,
      vectorAgg: builder.metric?.vectorAgg || '',
      vectorParam: builder.metric?.vectorParam || 10,
      groupBy: builder.metric?.groupBy || [],
      vizType: queryValues?.vizType || builder.metric?.vizType || 'timeseries',
    });
  }, [visible, mode]);

  const getRenderResult = () => {
    const values = form.getFieldsValue();
    const raw: LokiRawBuilderState = {
      labels: values.labels || [],
      lineFilters: values.lineFilters || [],
      parser: values.parser,
      parsedFieldFilters: values.parsedFieldFilters || [],
      limit: Math.min(values.limit || DEFAULT_RAW_LOG_LIMIT, MAX_RAW_LOG_LIMIT),
    };
    if (mode === 'metric') {
      const metric: LokiMetricBuilderState = {
        ...raw,
        rangeFunc: values.rangeFunc || 'count_over_time',
        range: values.range || '5m',
        rangeParam: values.rangeParam,
        unwrapField: values.unwrapField,
        vectorAgg: values.vectorAgg || undefined,
        vectorParam: values.vectorParam,
        groupBy: values.groupBy || [],
        vizType: values.vizType || 'timeseries',
      };
      return {
        query: renderLogQLByMode('metric', metric),
        values: { raw, metric, vizType: metric.vizType },
      };
    }
    return {
      query: renderLogQLByMode('raw', raw),
      values: { raw },
    };
  };

  const validateBuilder = () => {
    const values = form.getFieldsValue();
    if (!hasRequiredLabelMatcher(values.labels)) {
      setValidationMessage(t('builder.labels_required'));
      return false;
    }
    if (mode === 'metric') {
      if (!values.rangeFunc) {
        setValidationMessage(t('builder.range_aggregation_required'));
        return false;
      }
      if (isUnwrappedRangeFunc(values.rangeFunc) && !_.trim(values.unwrapField)) {
        setValidationMessage(t('builder.unwrap_field_required'));
        return false;
      }
    }
    setValidationMessage(undefined);
    return true;
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
      style={{ zIndex: 20, display: visible ? 'block' : 'none', maxHeight: 'calc(100vh - 180px)', overflowY: 'auto' }}
    >
      <Form form={form} layout='vertical'>
        <div className='w-full table border-separate border-spacing-y-3'>
          <div className='table-column w-[72px]' />
          <div className='table-column' />
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center'>
                <RequiredLabel>{t('builder.labels')}</RequiredLabel>
              </div>
            </div>
            <div className='table-cell'>
              <Form.Item name='labels' noStyle>
                <Labels datasourceValue={datasourceValue} range={queryValues?.range} ignoreNextOutsideClick={ignoreNextOutsideClick} />
              </Form.Item>
            </div>
          </div>
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center'>{t('builder.line_filter')}</div>
            </div>
            <div className='table-cell'>
              <Form.Item name='lineFilters' noStyle>
                <LineFilters />
              </Form.Item>
            </div>
          </div>
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center'>{t('builder.parser')}</div>
            </div>
            <div className='table-cell'>
              <Space size={SIZE} wrap>
                <Form.Item name={['parser', 'type']} noStyle>
                  <Select className='w-[120px]' size='small' dropdownClassName='doris-query-builder-popup' options={parserOptions} />
                </Form.Item>
                {(parser?.type === 'regexp' || parser?.type === 'pattern') && (
                  <Form.Item name={['parser', 'expression']} noStyle>
                    <Input size='small' className='w-[320px]' placeholder={t('builder.parser_expression_placeholder')} />
                  </Form.Item>
                )}
              </Space>
            </div>
          </div>
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center'>{t('builder.parsed_field_filter')}</div>
            </div>
            <div className='table-cell'>
              <Form.Item name='parsedFieldFilters' noStyle>
                <ParsedFieldFilters fields={parsedFields} fieldsLoading={parsedFieldsLoading} ignoreNextOutsideClick={ignoreNextOutsideClick} />
              </Form.Item>
            </div>
          </div>
          <div className='table-row'>
            <div className='table-cell align-top'>
              <div className='h-[24px] flex items-center'>{t('builder.limit')}</div>
            </div>
            <div className='table-cell'>
              <Form.Item name='limit' noStyle initialValue={DEFAULT_RAW_LOG_LIMIT}>
                <InputNumber size='small' className='w-[120px]' min={1} max={MAX_RAW_LOG_LIMIT} />
              </Form.Item>
            </div>
          </div>
          {mode === 'metric' && (
            <>
              <div className='table-row'>
                <div className='table-cell align-top'>
                  <div className='h-[24px] flex items-center'>
                    <RequiredLabel>{t('builder.range_aggregation')}</RequiredLabel>
                  </div>
                </div>
                <div className='table-cell'>
                  <Space size={SIZE} wrap>
                    <Form.Item name='rangeFunc' noStyle initialValue='count_over_time'>
                      <Select
                        className='w-[180px]'
                        size='small'
                        dropdownClassName='doris-query-builder-popup'
                        options={rangeFuncOptions}
                        onChange={(value) => {
                          if (!isUnwrappedRangeFunc(value)) {
                            form.setFieldsValue({ unwrapField: undefined });
                          }
                        }}
                      />
                    </Form.Item>
                    <InputGroupWithFormItem size='small' label={t('builder.window')}>
                      <Form.Item name='range' noStyle initialValue='5m'>
                        <Input size='small' className='w-[90px]' />
                      </Form.Item>
                    </InputGroupWithFormItem>
                    {rangeFunc === 'quantile_over_time' && (
                      <InputGroupWithFormItem size='small' label={t('builder.quantile')}>
                        <Form.Item name='rangeParam' noStyle initialValue={0.99}>
                          <InputNumber size='small' className='w-[80px]' min={0} max={1} step={0.01} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    )}
                    {isUnwrappedRangeFunc(rangeFunc) && (
                      <InputGroupWithFormItem size='small' label={<RequiredLabel>{t('builder.unwrap_field')}</RequiredLabel>}>
                        <Form.Item name='unwrapField' noStyle>
                          <FieldSelect size='small' className='w-[140px]' fields={parsedFields} loading={parsedFieldsLoading} onMouseDown={ignoreNextOutsideClick} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    )}
                  </Space>
                </div>
              </div>
              <div className='table-row'>
                <div className='table-cell align-top'>
                  <div className='h-[24px] flex items-center'>{t('builder.display')}</div>
                </div>
                <div className='table-cell'>
                  <Space size={SIZE} wrap>
                    <Form.Item name='vizType' noStyle initialValue='timeseries'>
                      <Segmented
                        size='small'
                        options={[
                          { label: t('builder.table'), value: 'table' },
                          { label: t('builder.timeseries'), value: 'timeseries' },
                        ]}
                      />
                    </Form.Item>
                    <InputGroupWithFormItem size='small' label={t('builder.aggregation')}>
                      <Form.Item name='vectorAgg' noStyle>
                        <Select className='w-[100px]' size='small' dropdownClassName='doris-query-builder-popup' options={vectorAggOptions} />
                      </Form.Item>
                    </InputGroupWithFormItem>
                    <Form.Item shouldUpdate noStyle>
                      {() => {
                        const vectorAgg = form.getFieldValue('vectorAgg');
                        if (vectorAgg !== 'topk' && vectorAgg !== 'bottomk') return null;
                        return (
                          <InputGroupWithFormItem size='small' label='N'>
                            <Form.Item name='vectorParam' noStyle initialValue={10}>
                              <InputNumber size='small' className='w-[80px]' min={1} />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        );
                      }}
                    </Form.Item>
                    <InputGroupWithFormItem size='small' label={t('builder.group_by')}>
                      <Form.Item name='groupBy' noStyle>
                        <FieldTagsSelect fields={metricGroupFields} loading={labelFieldsLoading || parsedFieldsLoading} onMouseDown={ignoreNextOutsideClick} />
                      </Form.Item>
                    </InputGroupWithFormItem>
                  </Space>
                </div>
              </div>
            </>
          )}
        </div>
        {validationMessage && <Alert className='mt-3' showIcon type='warning' message={validationMessage} />}
        <Space size={SIZE} className='mt-3'>
          <Button
            size='small'
            type='primary'
            icon={<SearchOutlined />}
            onClick={() => {
              if (!validateBuilder()) return;
              const res = getRenderResult();
              onExecute(res.query, res.values);
            }}
          >
            {t('builder.execute')}
          </Button>
          <Button
            size='small'
            onClick={() => {
              if (!validateBuilder()) return;
              const res = getRenderResult();
              onPreviewQL(res.query, res.values);
            }}
          >
            {t('builder.preview_ql')}
          </Button>
        </Space>
      </Form>
      <div className='absolute top-2 right-2'>
        <Tooltip title={queryBuilderPinned ? t('builder.unpin') : t('builder.pin')}>
          <Button
            type='text'
            icon={<PushpinOutlined />}
            onMouseDown={ignoreNextOutsideClick}
            onClick={(e) => {
              e.stopPropagation();
              setQueryBuilderPinned(!queryBuilderPinned);
            }}
          >
            {queryBuilderPinned ? t('builder.unpin') : t('builder.pin')}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

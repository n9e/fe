/**
 * LogsViewer 渲染测试页（仅开发环境可用）
 *
 * 覆盖场景：
 * - 嵌套对象 / 数组
 * - null / boolean / number / 空字符串
 * - 多行文本
 * - JSON 字符串（会被 normalizeLogStructures 解析为对象）
 */
import React, { useState } from 'react';
import _ from 'lodash';
import { Radio, Switch, Space, Card, Typography, Modal } from 'antd';

import { LogsViewerStateContext } from './components/LogsViewer';
import Raw from './components/LogsViewer/Raw';
import Table from './components/LogsViewer/Table';
import LogFieldValue from './components/LogsViewer/components/LogFieldValue';
import { DEFAULT_OPTIONS } from './constants';
import { OnValueFilterParams } from './components/LogsViewer/types';

const { Title, Paragraph } = Typography;

// ====== Mock 数据 ======

const MOCK_LOGS = [
  {
    ___id___: '1',
    ___time___: 1717929600000,
    ___raw___: '{"level":"info","msg":"normal text log"}',
    level: 'info',
    message: '正常文本日志',
    count: 100,
    ratio: 0.85,
    active: true,
    empty: '',
    nothing: null,
    str_null: 'null',
    nested: { key1: 'value1', key2: 42, key3: { deep: 'nested', arr: [1, 2, 3] } },
    array_field: [1, 'two', { three: 3 }, [4, 5]],
    json_str: '{"parsed": "this will become an object after normalize"}',
    multiline: '第一行\n第二行\n第三行',
  },
  {
    ___id___: '2',
    ___time___: 1717929700000,
    ___raw___: '{"level":"warn","msg":"partial data"}',
    level: 'warn',
    message: '部分字段缺失',
    count: 0,
    ratio: 0.0,
    active: false,
    empty: '',
    nothing: null,
    str_null: 'null',
    nested: {},
    array_field: [],
    json_str: '{}',
    multiline: '',
  },
  {
    ___id___: '3',
    ___time___: 1717929800000,
    ___raw___: '{"level":"error","msg":"complex nested"}',
    level: 'error',
    message: '复杂嵌套',
    count: -1,
    ratio: 1,
    active: false,
    empty: '',
    nothing: null,
    str_null: 'null',
    nested: {
      service: 'api-gateway',
      latency: 2350,
      tags: ['prod', 'us-east-1', { az: 'a' }],
      metadata: {
        host: 'web-01',
        version: '2.1.0',
        deploy: {
          env: 'production',
          canary: false,
        },
      },
    },
    array_field: [
      { id: 1, name: 'item-1', attrs: { color: 'red', size: 'L' } },
      { id: 2, name: 'item-2', attrs: { color: 'blue', size: 'M' } },
    ],
    json_str: '{"status":"error","code":500,"details":{"stack":"at line 42","cause":"timeout"}}',
    multiline: [
      'Error: connection refused',
      '  at Socket.<anonymous> (/app/index.js:42)',
      '  at emitOne (events.js:116)',
      '  at maybePromise (node:internal/util:123)',
      '  at Socket.<anonymous> (/app/index.js:85)',
      '  at Object.onceWrapper (node:events:628)',
      '  at Socket.emit (node:events:527)',
      '  at addChunk (node:internal/streams:123)',
      '  at readableAddChunk (node:internal/streams:256)',
      '  at Readable.push (node:internal/streams:345)',
      '  at TCP.onStreamRead (node:internal/streams:456)',
      '  at TCP.callbackTrampoline (node:internal/async:789)',
      '  at processTicksAndRejections (node:internal/timers:567)',
      '  at runMicrotasks (<anonymous>)',
      '  at process.processImmediate (node:internal/timers:890)',
      '  at process.callback (node:internal/main:111)',
      '  at Module._compile (node:internal/modules/cjs:222)',
      '  at Module._extensions (node:internal/modules/cjs:333)',
      '  at Module.load (node:internal/modules/cjs:444)',
      '  at Module._load (node:internal/modules/cjs:555)',
      '  at executeUserEntryPoint (node:internal/modules/run_main:666)',
    ].join('\n'),
  },
  {
    ___id___: '4',
    ___time___: 1717929900000,
    ___raw___: '{"level":"debug","msg":"edge cases"}',
    level: 'debug',
    message: '边界值',
    count: Number.MAX_SAFE_INTEGER,
    ratio: -0.001,
    active: true,
    empty: '',
    nothing: null,
    str_null: 'null',
    nested: { onlyKey: 'onlyValue' },
    array_field: [null, true, 0, '', { nested: null }],
    json_str: '[]',
    multiline: 'single line',
  },
  {
    ___id___: '5',
    ___time___: 1717930000000,
    ___raw___: '{"level":"info","msg":"deep boolean & number"}',
    level: 'info',
    message: '深层布尔/数值',
    count: 42,
    ratio: 3.1415926,
    active: true,
    empty: '',
    nothing: null,
    str_null: 'null',
    nested: {
      bool_true: true,
      bool_false: false,
      int_zero: 0,
      float_zero: 0.0,
      negative: -999,
      deep: {
        flag: true,
        score: 100,
        label: 'deep-label',
      },
    },
    array_field: [true, false, 0, 1, -1, 3.14, null, 'str'],
    json_str: '{"a":1,"b":true,"c":null,"d":"hello"}',
    multiline: 'line1\nline2\nline3\nline4\nline5',
  },
];

const HL = { pre: '@n9e-highlighted-field@', post: '@/n9e-highlighted-field@' };
const HIGHLIGHTS: Record<string, string[]>[] = [
  { message: [`${HL.pre}正常${HL.post}`], nested: [`${HL.pre}value1${HL.post}`] },
  {},
  { message: [`${HL.pre}复杂${HL.post}`], array_field: [`${HL.pre}item-1${HL.post}`] },
  {},
  { nested: [`${HL.pre}deep${HL.post}`] },
];

// ====== 单个字段值测试数据 ======

const FIELD_VALUE_CASES: { label: string; value: any; desc: string }[] = [
  { label: '普通字符串', value: 'hello world', desc: '基本字符串' },
  { label: '数字', value: 12345, desc: '正整數' },
  { label: '浮点数', value: 3.1415926, desc: '浮点数' },
  { label: '零', value: 0, desc: '数值 0' },
  { label: '负数', value: -999, desc: '负数' },
  { label: '布尔 true', value: true, desc: '布尔值 true' },
  { label: '布尔 false', value: false, desc: '布尔值 false' },
  { label: 'null', value: null, desc: 'null' },
  { label: '字符串 null', value: 'null', desc: '字符串 "null"，应与 null 区分' },
  { label: '空字符串', value: '', desc: '空字符串，应显示 ""' },
  { label: '多行文本', value: '第一行\n第二行\n第三行', desc: '多行文本，应显示展开/折叠' },
  { label: '简单对象', value: { key: 'value', num: 42 }, desc: '简单对象，应 JSON.stringify 后展示' },
  { label: '深层嵌套对象', value: { a: { b: { c: [1, 2, { d: 'e' }] } } }, desc: '深层嵌套对象' },
  { label: '数组', value: [1, 'two', { three: 3 }], desc: '混合类型数组' },
  { label: '空对象', value: {}, desc: '空对象 -> {}' },
  { label: '空数组', value: [], desc: '空数组 -> []' },
  { label: '含 null 的数组', value: [null, true, 0, '', { a: null }], desc: '数组内含各种边界值' },
  { label: '复杂嵌套', value: { service: 'api', latency: 2350, tags: ['prod', 'us-east-1', { az: 'a' }] }, desc: '模拟实际日志嵌套场景' },
];

// ====== 组件 ======

function getValueType(v: any): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}

function FieldValueSection() {
  return (
    <Card title='单个字段值渲染测试 (LogFieldValue)' style={{ marginBottom: 24 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left', width: 120 }}>标签</th>
            <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left', width: 200 }}>说明</th>
            <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left' }}>渲染结果</th>
            <th style={{ padding: 8, border: '1px solid #e8e8e8', textAlign: 'left', width: 300 }}>实际值 (JSON)</th>
          </tr>
        </thead>
        <tbody>
          {FIELD_VALUE_CASES.map((c, i) => (
            <tr key={i}>
              <td style={{ padding: 8, border: '1px solid #e8e8e8', verticalAlign: 'top' }}>{c.label}</td>
              <td style={{ padding: 8, border: '1px solid #e8e8e8', verticalAlign: 'top' }}>{c.desc}</td>
              <td style={{ padding: 8, border: '1px solid #e8e8e8' }}>
                <LogFieldValue name={c.label} value={c.value} enableTooltip />
              </td>
              <td style={{ padding: 8, border: '1px solid #e8e8e8', fontSize: 12, wordBreak: 'break-all' }}>
                <code>{JSON.stringify(c.value)}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

function LogModeSection() {
  const [mode, setMode] = useState<'origin' | 'table'>('origin');
  const [lineBreak, setLineBreak] = useState(false);
  const [jsonType, setJsonType] = useState<'string' | 'tree'>('string');
  const [metaModal, setMetaModal] = useState<{ visible: boolean; name: string; value: any }>({ visible: false, name: '', value: undefined });

  const handleValueFilter = (params: OnValueFilterParams) => {
    setMetaModal({ visible: true, name: params.key, value: params.value });
  };

  return (
    <>
      <Card
        title='日志渲染测试 (Raw / Table)'
        style={{ marginBottom: 24 }}
        extra={
          <Space wrap>
            <span>
              换行: <Switch checked={lineBreak} onChange={setLineBreak} />
            </span>
            <span>
              JSON 展示:
              <Radio.Group value={jsonType} onChange={(e) => setJsonType(e.target.value)} size='small' style={{ marginLeft: 4 }}>
                <Radio.Button value='string'>string</Radio.Button>
                <Radio.Button value='tree'>tree</Radio.Button>
              </Radio.Group>
            </span>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio.Button value='origin'>Raw 模式</Radio.Button>
              <Radio.Button value='table'>Table 模式</Radio.Button>
            </Radio.Group>
          </Space>
        }
      >
        <LogsViewerStateContext.Provider
          value={{
            id_key: '___id___',
            raw_key: '___raw___',
            enableLogTextSelectMenu: false,
          }}
        >
          {mode === 'origin' ? (
            <Raw
              id_key='___id___'
              raw_key='___raw___'
              timeField='___time___'
              data={MOCK_LOGS}
              highlights={HIGHLIGHTS}
              options={{ ...DEFAULT_OPTIONS, logMode: 'origin', lineBreak: lineBreak ? 'true' : 'false', jsonDisplaType: jsonType }}
              onReverseChange={() => {}}
              onValueFilter={handleValueFilter}
            />
          ) : (
            <Table
              id_key='___id___'
              raw_key='___raw___'
              timeField='___time___'
              data={MOCK_LOGS}
              highlights={HIGHLIGHTS}
              options={{ ...DEFAULT_OPTIONS, logMode: 'table', lineBreak: lineBreak ? 'true' : 'false', jsonDisplaType: jsonType }}
              onReverseChange={() => {}}
              onValueFilter={handleValueFilter}
            />
          )}
        </LogsViewerStateContext.Provider>
      </Card>

      <Modal title='字段 Meta 信息' visible={metaModal.visible} onCancel={() => setMetaModal({ visible: false, name: '', value: undefined })} footer={null}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 12px', border: '1px solid #e8e8e8', fontWeight: 600, width: 80 }}>名称</td>
              <td style={{ padding: '8px 12px', border: '1px solid #e8e8e8' }}>{metaModal.name}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', border: '1px solid #e8e8e8', fontWeight: 600 }}>值</td>
              <td style={{ padding: '8px 12px', border: '1px solid #e8e8e8', wordBreak: 'break-all' }}>
                <code>{JSON.stringify(metaModal.value)}</code>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 12px', border: '1px solid #e8e8e8', fontWeight: 600 }}>JS 类型</td>
              <td style={{ padding: '8px 12px', border: '1px solid #e8e8e8' }}>
                <code>{getValueType(metaModal.value)}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </Modal>
    </>
  );
}

function DevWarning() {
  return (
    <div
      style={{
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        borderRadius: 6,
        padding: '12px 20px',
        marginBottom: 16,
      }}
    >
      <strong>⚠️ 开发环境测试页</strong> — 此页面仅在 <code>import.meta.env.DEV === true</code> 时可用。
      <br />
      用于验证 LogFieldValue / Token / Raw / Table 组件对各种类型的字段值（对象、数组、null、boolean、number、空字符串等）的渲染是否正确。
    </div>
  );
}

export default function LogViewerTestPage() {
  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <DevWarning />
      <Title level={3} style={{ marginBottom: 8 }}>
        LogsViewer 嵌套结构渲染测试
      </Title>
      <Paragraph type='secondary'>
        测试数据包含 5 条日志，覆盖：嵌套对象、数组、深层嵌套、空对象/数组、null、boolean、数值 0、负数、浮点数、空字符串、多行文本等边界情况。 Raw
        模式下点击字段值可查看操作菜单；Table 模式下可点击时间列展开侧边栏查看详情。
      </Paragraph>

      <FieldValueSection />
      <LogModeSection />
    </div>
  );
}

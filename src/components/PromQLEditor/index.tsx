import React, { useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as monaco from 'monaco-editor';
// import request from '@/utils/request';

interface PromQLEditorProps {
  value: string;
  onChange?: (value: string) => void;
  height?: string | number;
  width?: string | number;
  readOnly?: boolean;
  prometheusUrl?: string;
}

// 静态模拟数据
const mockMetrics = [
  'http_requests_total',
  'http_request_duration_seconds',
  'node_cpu_seconds_total',
  'node_memory_MemTotal_bytes',
  'process_cpu_seconds_total',
  'go_goroutines',
  'prometheus_http_requests_total',
];

const mockLabels = ['job', 'instance', 'status', 'method', 'path', 'code', 'handler', 'quantile', 'le', 'cpu', 'mode'];

// PromQL 函数列表
const promqlFunctions = [
  {
    name: 'sum',
    description: '计算所有时间序列的总和',
    syntax: 'sum(metric)',
  },
  {
    name: 'avg',
    description: '计算所有时间序列的平均值',
    syntax: 'avg(metric)',
  },
  {
    name: 'count',
    description: '计算时间序列的数量',
    syntax: 'count(metric)',
  },
  {
    name: 'min',
    description: '计算所有时间序列的最小值',
    syntax: 'min(metric)',
  },
  {
    name: 'max',
    description: '计算所有时间序列的最大值',
    syntax: 'max(metric)',
  },
  {
    name: 'rate',
    description: '计算每秒的平均增长率',
    syntax: 'rate(metric[5m])',
  },
  {
    name: 'increase',
    description: '计算指定时间范围内的增长量',
    syntax: 'increase(metric[5m])',
  },
  {
    name: 'irate',
    description: '计算每秒的瞬时增长率',
    syntax: 'irate(metric[5m])',
  },
  {
    name: 'delta',
    description: '计算相邻数据点之间的差值',
    syntax: 'delta(metric[5m])',
  },
  {
    name: 'deriv',
    description: '计算每秒的导数',
    syntax: 'deriv(metric[5m])',
  },
  {
    name: 'predict_linear',
    description: '预测时间序列的未来值',
    syntax: 'predict_linear(metric[5m], 3600)',
  },
  {
    name: 'histogram_quantile',
    description: '计算直方图的分位数',
    syntax: 'histogram_quantile(0.95, metric)',
  },
];

// 缓存 Prometheus 元数据
// let metricsCache: string[] = [];
// let labelsCache: string[] = [];
// let labelValuesCache: Record<string, string[]> = {};

// 获取所有 metrics
// async function fetchMetrics(prometheusUrl: string) {
//   try {
//     const res = await request(`${prometheusUrl}/api/v1/label/__name__/values`);
//     if (res?.data) {
//       metricsCache = res.data;
//     }
//   } catch (error) {
//     console.error('Failed to fetch metrics:', error);
//   }
// }

// 获取所有 labels
// async function fetchLabels(prometheusUrl: string) {
//   try {
//     const res = await request(`${prometheusUrl}/api/v1/labels`);
//     if (res?.data) {
//       labelsCache = res.data;
//     }
//   } catch (error) {
//     console.error('Failed to fetch labels:', error);
//   }
// }

// 获取特定 label 的所有值
// async function fetchLabelValues(label: string, prometheusUrl: string) {
//   if (labelValuesCache[label]) {
//     return labelValuesCache[label];
//   }
//   try {
//     const res = await request(`${prometheusUrl}/api/v1/label/${label}/values`);
//     if (res?.data) {
//       labelValuesCache[label] = res.data;
//       return res.data;
//     }
//   } catch (error) {
//     console.error(`Failed to fetch values for label ${label}:`, error);
//   }
//   return [];
// }

export default function PromQLEditor({
  value,
  onChange,
  height = '300px',
  width = '100%',
  readOnly = false,
  prometheusUrl = 'http://localhost:9090', // 默认 Prometheus 地址
}: PromQLEditorProps) {
  useEffect(() => {
    // 注册 PromQL 语言
    monaco.languages.register({ id: 'promql' });

    // 设置语法高亮
    monaco.languages.setMonarchTokensProvider('promql', {
      tokenizer: {
        root: [
          [
            /[a-zA-Z_]\w*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier',
              },
            },
          ],
          [/[0-9]+(\.[0-9]+)?/, 'number'],
          [/["'].*?["']/, 'string'],
          [/[+\-*/=<>!&|^~]+/, 'operator'],
          [/[{}[\]()]/, 'delimiter.bracket'],
          [/[;,]/, 'delimiter'],
        ],
      },
      keywords: [
        'sum',
        'avg',
        'count',
        'min',
        'max',
        'rate',
        'increase',
        'irate',
        'delta',
        'deriv',
        'predict_linear',
        'histogram_quantile',
        'by',
        'without',
        'on',
        'ignoring',
        'group_left',
        'group_right',
        'offset',
        'bool',
        'and',
        'or',
        'unless',
      ],
    });

    // 设置语言配置
    monaco.languages.setLanguageConfiguration('promql', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
      ],
    });

    // 注册补全提供者
    monaco.languages.registerCompletionItemProvider('promql', {
      triggerCharacters: ['.', '{', '}', '[', ']', '(', ')', ',', ' '],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = [];

        // 添加函数补全
        promqlFunctions.forEach((func) => {
          suggestions.push({
            label: func.name,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: func.name,
            detail: 'Function',
            documentation: {
              value: `**${func.name}**\n\n${func.description}\n\nSyntax: \`${func.syntax}\``,
              isTrusted: true,
            },
            range,
          });
        });

        // 添加 metrics 补全
        mockMetrics.forEach((metric) => {
          suggestions.push({
            label: metric,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: metric,
            detail: 'Metric',
            documentation: {
              value: `**${metric}**\n\nPrometheus metric`,
              isTrusted: true,
            },
            range,
          });
        });

        // 添加 labels 补全
        mockLabels.forEach((label) => {
          suggestions.push({
            label: label,
            kind: monaco.languages.CompletionItemKind.Property,
            insertText: label,
            detail: 'Label',
            documentation: {
              value: `**${label}**\n\nPrometheus label`,
              isTrusted: true,
            },
            range,
          });
        });

        return {
          suggestions,
        };
      },
    });

    // 注册悬浮提示
    monaco.languages.registerHoverProvider('promql', {
      provideHover: (model, position) => {
        const word = model.getWordAtPosition(position);
        if (!word) return null;

        // 检查是否是函数
        const func = promqlFunctions.find((f) => f.name === word.word);
        if (func) {
          return {
            contents: [{ value: `**Function**: ${func.name}` }, { value: func.description }, { value: `\nSyntax: \`${func.syntax}\`` }],
          };
        }

        // 检查是否是 metric
        if (mockMetrics.includes(word.word)) {
          return {
            contents: [{ value: `**Metric**: ${word.word}` }, { value: 'This is a Prometheus metric.' }],
          };
        }

        // 检查是否是 label
        if (mockLabels.includes(word.word)) {
          return {
            contents: [{ value: `**Label**: ${word.word}` }, { value: 'This is a Prometheus label.' }],
          };
        }

        return null;
      },
    });

    return () => {};
  }, []);

  return (
    <MonacoEditor
      width={width}
      height={height}
      language='promql'
      theme='vs-dark'
      value={value}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: true,
        wordBasedSuggestions: 'currentDocument',
        suggest: {
          showSnippets: true,
          showClasses: true,
          showFunctions: true,
          showVariables: true,
          showProperties: true,
          showValues: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
          showKeywords: true,
          showColors: true,
          showFiles: true,
          showReferences: true,
          showFolders: true,
          showTypeParameters: true,
        },
      }}
    />
  );
}

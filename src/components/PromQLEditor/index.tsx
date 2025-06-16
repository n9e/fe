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

// PromQL 语法验证函数
function validatePromQL(code: string): monaco.editor.IMarkerData[] {
  const markers: monaco.editor.IMarkerData[] = [];
  const lines = code.split('\n');

  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // 使用堆栈检查括号匹配
    const stack: Array<{ char: string; index: number }> = [];
    const brackets: { [key: string]: string } = {
      '(': ')',
      '[': ']',
      '{': '}',
    };
    const closingBrackets = new Set([')', ']', '}']);

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      // 如果是开括号，入栈
      if (brackets[char]) {
        stack.push({ char, index: i });
      }
      // 如果是闭括号，检查匹配
      else if (closingBrackets.has(char)) {
        if (stack.length === 0) {
          // 没有对应的开括号
          markers.push({
            severity: monaco.MarkerSeverity.Error,
            startLineNumber: lineIndex + 1,
            startColumn: i + 1,
            endLineNumber: lineIndex + 1,
            endColumn: i + 2,
            message: `多余的闭括号 '${char}'`,
          });
        } else {
          const lastOpen = stack.pop();
          const expectedClosing = brackets[lastOpen!.char];

          // 检查括号类型是否匹配
          if (char !== expectedClosing) {
            markers.push({
              severity: monaco.MarkerSeverity.Error,
              startLineNumber: lineIndex + 1,
              startColumn: i + 1,
              endLineNumber: lineIndex + 1,
              endColumn: i + 2,
              message: `括号类型不匹配，期望 '${expectedClosing}' 但得到 '${char}'`,
            });
          }
        }
      }
    }

    // 检查未闭合的开括号
    while (stack.length > 0) {
      const unclosed = stack.pop();
      const expectedClosing = brackets[unclosed!.char];
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineIndex + 1,
        startColumn: unclosed!.index + 1,
        endLineNumber: lineIndex + 1,
        endColumn: unclosed!.index + 2,
        message: `未闭合的 '${unclosed!.char}'，期望 '${expectedClosing}'`,
      });
    }

    // 检查未知函数
    const functionMatches = line.match(/([a-zA-Z_]\w*)\s*\(/g);
    if (functionMatches) {
      functionMatches.forEach((match) => {
        const funcName = match.replace(/\s*\($/, '');
        const knownFunctions = promqlFunctions.map((f) => f.name);
        if (!knownFunctions.includes(funcName)) {
          const startIndex = line.indexOf(match);
          markers.push({
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: lineIndex + 1,
            startColumn: startIndex + 1,
            endLineNumber: lineIndex + 1,
            endColumn: startIndex + funcName.length + 1,
            message: `未知函数: ${funcName}`,
          });
        }
      });
    }

    // 检查时间范围格式
    const timeRangeMatches = line.match(/\[([^\]]+)\]/g);
    if (timeRangeMatches) {
      timeRangeMatches.forEach((match) => {
        const timeRange = match.slice(1, -1); // 去掉方括号
        const validTimeUnits = /^[0-9]+[smhdwy]$/;
        if (!validTimeUnits.test(timeRange)) {
          const startIndex = line.indexOf(match);
          markers.push({
            severity: monaco.MarkerSeverity.Warning,
            startLineNumber: lineIndex + 1,
            startColumn: startIndex + 1,
            endLineNumber: lineIndex + 1,
            endColumn: startIndex + match.length + 1,
            message: `无效的时间范围格式: ${timeRange}。应该使用如 5m, 1h, 30s 等格式`,
          });
        }
      });
    }

    // 检查空的标签选择器
    if (line.includes('{}')) {
      const startIndex = line.indexOf('{}');
      markers.push({
        severity: monaco.MarkerSeverity.Info,
        startLineNumber: lineIndex + 1,
        startColumn: startIndex + 1,
        endLineNumber: lineIndex + 1,
        endColumn: startIndex + 3,
        message: '空的标签选择器',
      });
    }

    // 检查常见的语法错误
    if (line.includes(',,')) {
      const startIndex = line.indexOf(',,');
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineIndex + 1,
        startColumn: startIndex + 1,
        endLineNumber: lineIndex + 1,
        endColumn: startIndex + 3,
        message: '多余的逗号',
      });
    }

    // 检查字符串是否正确闭合
    let inString = false;
    let stringStartIndex = -1;
    let stringChar = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringStartIndex = i;
        stringChar = char;
      } else if (inString && char === stringChar && line[i - 1] !== '\\') {
        inString = false;
        stringStartIndex = -1;
        stringChar = '';
      }
    }

    // 如果字符串未闭合
    if (inString) {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineIndex + 1,
        startColumn: stringStartIndex + 1,
        endLineNumber: lineIndex + 1,
        endColumn: stringStartIndex + 2,
        message: `未闭合的字符串，缺少闭合的 '${stringChar}'`,
      });
    }
  });

  return markers;
}

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
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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

        // 获取当前行和光标前的文本
        const lineContent = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, position.column - 1);
        const textAfterCursor = lineContent.substring(position.column - 1);

        const suggestions: monaco.languages.CompletionItem[] = [];

        // 分析上下文，决定提供什么类型的补全
        const context = analyzeContext(textBeforeCursor, textAfterCursor);

        switch (context.type) {
          case 'function':
            // 函数补全：在表达式开始或操作符后
            promqlFunctions.forEach((func) => {
              suggestions.push({
                label: func.name,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${func.name}($0)`, // $0 是光标位置占位符
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'PromQL Function',
                documentation: {
                  value: `**${func.name}**\n\n${func.description}\n\n**语法:** \`${func.syntax}\``,
                  isTrusted: true,
                },
                range,
                sortText: '1_' + func.name, // 优先级排序
              });
            });
            break;

          case 'metric':
            // Metric 补全：在函数括号内或表达式开始
            mockMetrics.forEach((metric) => {
              suggestions.push({
                label: metric,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: metric,
                detail: 'Prometheus Metric',
                documentation: {
                  value: `**${metric}**\n\nPrometheus 指标\n\n点击查看更多信息...`,
                  isTrusted: true,
                },
                range,
                sortText: '2_' + metric,
              });
            });
            break;

          case 'label':
            // Label 补全：在 {} 内，统一生成 label="" 形式，光标在引号内
            mockLabels.forEach((label) => {
              suggestions.push({
                label: label,
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: `${label}="$0"`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Prometheus Label',
                documentation: {
                  value: `**${label}**\n\nPrometheus 标签键\n\n用于过滤时间序列`,
                  isTrusted: true,
                },
                range,
                sortText: '3_' + label,
              });
            });
            break;

          case 'operator':
            // 操作符补全
            const operators = [
              { name: 'by', desc: '按指定标签分组' },
              { name: 'without', desc: '排除指定标签' },
              { name: 'on', desc: '基于指定标签匹配' },
              { name: 'ignoring', desc: '忽略指定标签' },
              { name: 'group_left', desc: '左侧一对多匹配' },
              { name: 'group_right', desc: '右侧一对多匹配' },
            ];

            operators.forEach((op) => {
              suggestions.push({
                label: op.name,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: `${op.name} ($0)`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'PromQL Operator',
                documentation: {
                  value: `**${op.name}**\n\n${op.desc}`,
                  isTrusted: true,
                },
                range,
                sortText: '4_' + op.name,
              });
            });
            break;

          case 'string':
            // 在字符串内：可以提供一些常见的标签值
            const commonLabelValues = ['web', 'api', 'db', 'cache', 'frontend', 'backend', '200', '404', '500', 'GET', 'POST', 'PUT', 'DELETE'];
            commonLabelValues.forEach((value) => {
              suggestions.push({
                label: value,
                kind: monaco.languages.CompletionItemKind.Value,
                insertText: value,
                detail: '常用标签值',
                documentation: {
                  value: `**${value}**\n\n常见的标签值`,
                  isTrusted: true,
                },
                range,
                sortText: '5_' + value,
              });
            });
            break;

          case 'mixed':
          default:
            // 混合补全：不确定上下文时提供所有类型
            // 但按优先级排序

            // 1. 函数（最高优先级）
            promqlFunctions.slice(0, 5).forEach((func) => {
              // 只显示前5个常用函数
              suggestions.push({
                label: func.name,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: `${func.name}($0)`,
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Function',
                documentation: {
                  value: `**${func.name}**\n\n${func.description}`,
                  isTrusted: true,
                },
                range,
                sortText: '1_' + func.name,
              });
            });

            // 2. 常用 Metrics（中等优先级）
            mockMetrics.slice(0, 3).forEach((metric) => {
              // 只显示前3个
              suggestions.push({
                label: metric,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: metric,
                detail: 'Metric',
                range,
                sortText: '2_' + metric,
              });
            });
            break;
        }

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

  // 处理编辑器内容变化和错误检查
  const handleEditorChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }

    // 进行语法验证
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        const markers = validatePromQL(newValue);
        monaco.editor.setModelMarkers(model, 'promql', markers);
      }
    }
  };

  // 编辑器挂载后的回调
  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // 初始验证
    const model = editor.getModel();
    if (model && value) {
      const markers = validatePromQL(value);
      monaco.editor.setModelMarkers(model, 'promql', markers);
    }
  };

  return (
    <MonacoEditor
      width={width}
      height={height}
      language='promql'
      theme='vs-dark'
      value={value}
      onChange={handleEditorChange}
      editorDidMount={handleEditorDidMount}
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

// 上下文分析函数
function analyzeContext(
  textBefore: string,
  textAfter: string,
): {
  type: 'function' | 'metric' | 'label' | 'operator' | 'mixed' | 'string';
} {
  const trimmedBefore = textBefore.trim();

  // 检查是否在字符串/引号内
  let inString = false;
  let stringChar = '';

  for (let i = 0; i < textBefore.length; i++) {
    const char = textBefore[i];

    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && textBefore[i - 1] !== '\\') {
      inString = false;
      stringChar = '';
    }
  }

  // 如果在字符串内，返回字符串类型
  if (inString) {
    return { type: 'string' };
  }

  // 在标签选择器内 {job="web", |} 或 rate{job|}，但不在引号内
  if (trimmedBefore.includes('{') && !trimmedBefore.includes('}')) {
    return { type: 'label' };
  }

  // 在函数括号内 sum(|)
  const functionMatch = trimmedBefore.match(/(\w+)\s*\(\s*$/);
  if (functionMatch) {
    const funcName = functionMatch[1];
    if (promqlFunctions.some((f) => f.name === funcName)) {
      return { type: 'metric' };
    }
  }

  // 在表达式开始或操作符后
  if (trimmedBefore === '' || trimmedBefore.endsWith(' ') || trimmedBefore.endsWith('(') || /[+\-*/]$/.test(trimmedBefore)) {
    return { type: 'function' };
  }

  // 在聚合函数后，可能需要 by/without
  if (/\)\s*$/.test(trimmedBefore)) {
    return { type: 'operator' };
  }

  // 默认混合模式
  return { type: 'mixed' };
}

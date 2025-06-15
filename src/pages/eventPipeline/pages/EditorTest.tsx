import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';

import CodeMirror from '@/components/CodeMirror';
import PromQLEditor from '@/components/PromQLEditor';

export default function EditorTest() {
  const [code, setCode] = useState('sum(rate(http_requests_total[5m])) by (job)');
  const [sqlCode, setSqlCode] = useState('SELECT * FROM users WHERE id = 1');

  return (
    <div style={{ padding: 24 }}>
      <h3>CodeMirror 编辑器</h3>
      <CodeMirror height='200px' value={code} options={{ lineNumbers: true, mode: 'sql' }} onChange={setCode} />

      <h3 style={{ marginTop: 32 }}>Monaco Editor - PromQL 二次封装</h3>
      <PromQLEditor value={code} onChange={setCode} height={300} width={800} prometheusUrl='http://localhost:9090' />

      {/* 原生 Monaco Editor - 纯文本模式 */}
      <h3 style={{ marginTop: 32 }}>Monaco Editor - 原生纯文本</h3>
      <MonacoEditor height='200px' width='800px' language='plaintext' value={code} onChange={setCode} />

      {/* 原生 Monaco Editor - SQL 示例 */}
      <h3 style={{ marginTop: 32 }}>Monaco Editor - SQL 原生（有补全）</h3>
      <MonacoEditor
        height='200px'
        width='800px'
        language='sql'
        value={sqlCode}
        onChange={setSqlCode}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
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
    </div>
  );
}

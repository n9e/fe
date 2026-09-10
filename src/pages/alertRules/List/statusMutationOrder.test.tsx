/** @jest-environment jsdom */
import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { readFileSync } from 'fs';
import path from 'path';
import ts from 'typescript';
import useRowMutation from '@/components/EnhancedTable/useRowMutation';

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

it('serializes repeated row callbacks before applying the next status', async () => {
  const file = ts.createSourceFile('ListNG.tsx', readFileSync(path.join(__dirname, 'ListNG.tsx'), 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let callback = '';
  function visit(node: ts.Node) {
    if (ts.isJsxAttribute(node) && node.name.text === 'onChange' && node.getText(file).includes('updateAlertRules(')) {
      callback = (node.initializer as ts.JsxExpression).expression!.getText(file);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  expect(callback).not.toBe('');
  const { result } = renderHook(() => useRowMutation());
  const requests: ReturnType<typeof deferred>[] = [];
  let serverDisabled = 0;
  let displayedDisabled = 0;
  const updateAlertRules = jest.fn((payload: { fields: { disabled: number } }) => {
    serverDisabled = payload.fields.disabled;
    const request = deferred();
    requests.push(request);
    return request.promise;
  });
  const updateStatus = jest.fn((_ids: React.Key[], disabled: number) => {
    displayedDisabled = disabled;
  });
  const code = ts.transpile(`const callback = ${callback};`, { target: ts.ScriptTarget.ES2020 });
  const createToggle = (disabled: number) =>
    new Function('record', 'updateAlertRules', 'updateStatus', 'runMutation', `${code}; return callback;`)(
      { id: 1, disabled, group_id: 1 },
      updateAlertRules,
      updateStatus,
      result.current.run,
    );
  const toggle = createToggle(0);
  await act(async () => {
    toggle();
    toggle();
  });
  expect(updateAlertRules).toHaveBeenCalledTimes(1);
  await act(async () => {
    requests[0].resolve();
  });
  expect(updateAlertRules).toHaveBeenCalledTimes(2);
  expect(displayedDisabled).toBe(1);
  await act(async () => {
    createToggle(1)();
  });
  expect(updateAlertRules).toHaveBeenCalledTimes(2);
  await act(async () => {
    requests[1].resolve();
  });
  expect(updateAlertRules).toHaveBeenCalledTimes(3);
  await act(async () => {
    requests[2].resolve();
  });
  expect(updateStatus).toHaveBeenCalledTimes(3);
  expect(serverDisabled).toBe(0);
  expect(displayedDisabled).toBe(serverDisabled);
});

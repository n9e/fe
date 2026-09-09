import React from 'react';

/**
 * plus: 虚拟模块（vite 插件 plusResolve 解析）在 jest 下的统一存根。
 *
 * jest.config.ts 将 `plus:*` 映射到本文件，避免 ts-jest 无法解析 vite 虚拟模块。
 * 需要真实行为的测试应使用 `jest.mock('plus:...', factory, { virtual: true })` 覆盖。
 */
export default function PlusModuleStub() {
  return <div data-testid='plus-module-stub' />;
}

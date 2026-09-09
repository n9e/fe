/**
 * 让 @testing-library/jest-dom 的类型增强（toBeInTheDocument 等 matcher）进入
 * 主 tsconfig 的编译程序，从而让 *.test.tsx 文件通过 tsc 类型检查。
 *
 * 说明：tsconfig 的 `types` 选项只能自动包含 `@types/*` 包，无法直接引入
 * `@testing-library/jest-dom`；这里通过 import 把它的全局增强加载进程序，
 * 对 jest.Matchers / JestMatchers（由 Matchers 组合）同时生效。
 */
import '@testing-library/jest-dom';

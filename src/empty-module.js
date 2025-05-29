/**
 * 屏蔽postcss导致的浏览器控制台 node模块 警告
 *
 *
 * vite 为了浏览器兼容性而模块外部化
 * 当你在浏览器中使用一个 Node.js 模块时(如path, fs等)，Vite 会输出警告
 * https://cn.vitejs.dev/guide/troubleshooting#others
 * 如果必须使用 path 等模块, 可以尝试安装npm包来替代原生模块, 如path-browserify
 */
export default {};

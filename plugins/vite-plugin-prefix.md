# vite-plugin-prefix：子路径部署时自动补前缀

## 一句话说明

把系统部署在子路径下（例如 `https://host/flashcat/`）时，这个插件会在**构建阶段**，自动给代码里"直接交给浏览器的站内地址"补上 `/flashcat` 前缀。写代码时照常写 `/xxx` 即可，不用每处都手动拼 `basePrefix`。

## 什么时候生效

只在设置了 `VITE_PREFIX` 时生效，例如：

```bash
npm run build:prefix_advanced   # VITE_PREFIX=/flashcat
```

普通的 `npm run build` 不会设置前缀，插件什么都不做，产物和没有这个插件时完全一样。

## 为什么需要它

系统里有两类地址：

| 地址类型                 | 例子                                                               | 谁负责加前缀                     |
| ------------------------ | ------------------------------------------------------------------ | -------------------------------- |
| 路由跳转                 | `<Link to='/x'>`、`history.push('/x')`                             | React Router 的 `basename`       |
| 接口请求                 | `request('/api/...')`                                              | `src/utils/request.tsx`          |
| CSS / HTML 里的静态资源  | `url('/image/x.png')`、`index.html` 里的 `<script src>`            | Vite 的 `base` 配置              |
| **直接交给浏览器的地址** | `window.open('/x')`、`<img src='/image/x.png'>`、`fetch('/api/x')` | **以前没人管，现在由本插件负责** |

前三类原本就会自动带前缀。最后一类以前要靠每个人手动写 `basePrefix + '/x'`，很容易漏，漏了就会出现跳转到错误页面、图片 404、接口失败等问题。

## 插件做了什么

### 1. 找到这些位置，给地址补前缀

| 写法                                                                                                                        | 改写后（以 `/flashcat` 为例）          |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `window.open('/alert-rules')`                                                                                               | `window.open('/flashcat/alert-rules')` |
| `location.href = '/login'`、`window.location.href = ...`、`location.assign/replace(...)`                                    | 地址补前缀                             |
| `fetch('/api/n9e/version')`、`fetchEventSource('/api/...')`                                                                 | 地址补前缀                             |
| `new Audio('/alert.mp3')`、`new EventSource('/api/...')`                                                                    | 地址补前缀                             |
| `<img src='/image/x.png'>`，以及 `a`、`iframe`、`audio`、`video`、`source`、`embed`、`track` 上的 `src` / `href` / `poster` | 地址补前缀                             |
| antd 的 `<Button href>`、`<Image src>`、`<Avatar src>`                                                                      | 地址补前缀                             |

### 2. 写死的地址在构建时直接改好，变量交给运行时判断

```js
// 写死的字符串：构建时直接算好
window.open('/alert-rules')        →  window.open('/flashcat/alert-rules')

// 含变量的表达式：包一层函数，运行时再判断
window.open(`/reports/${id}`)      →  window.open(__n9eWithPrefix(`/reports/${id}`))
```

### 3. 不会重复加前缀，兼容已有写法

运行时函数会先检查地址，下面这些情况都原样返回：

| 地址                                                        | 结果                                |
| ----------------------------------------------------------- | ----------------------------------- |
| 已经带前缀：`/flashcat/x`（例如手写的 `basePrefix + '/x'`） | 不变                                |
| 外链：`https://...`、`//cdn...`                             | 不变                                |
| 相对路径、锚点、data URL：`a/b`、`#top`、`data:...`         | 不变                                |
| 排除项：默认 `/docs/`（官网文档站）                         | 不变                                |
| 其他以 `/` 开头的站内地址                                   | 加上前缀，例如 `/x` → `/flashcat/x` |

所以项目里已经手动写了 `basePrefix + '/x'` 的代码不用改，也不会变成 `/flashcat/flashcat/x`。

### 4. 生成改写报告

构建结束后，所有被处理的位置会写到 `node_modules/.cache/prefix-rewrites.json`，控制台也会输出一行汇总：

```
[prefix-plugin] /flashcat: rewrote 307 url sinks in 193 files, report: node_modules/.cache/prefix-rewrites.json
```

报告中的每一条：

```json
{ "file": "src/pages/notFound/OutOfService.tsx", "line": 23, "kind": "location.href", "code": "basePrefix || \"/\"" }
```

- `line` 是源码行号。
- `code` 是编译后的表达式，引号可能和源码不同。
- 报告列出的是**所有被处理过的位置**，不代表这些地方原来都有问题。像上面这条已经手动拼了 `basePrefix`，只是被包了一层，运行结果不变。

## 插件做不到的事情

插件只认识上面列出的"地址交给浏览器"的写法，下面这些情况需要**手动处理**。

### 1. 拿当前路径和写死的路由做比较

```ts
// 错：部署后 pathname 是 /flashcat/login，永远对不上
if (window.location.pathname === '/login') {
}

// 对
if (window.location.pathname === `${basePrefix}/login`) {
}
// 或者在 Router 内部使用 useLocation()，它返回的路径已经去掉了前缀
```

### 2. 拼出给外部使用的完整 URL

分享链接、SSO 回调地址、OAuth 回调地址这类以 `origin` 开头的完整地址，插件会当作外链跳过：

```ts
// 错
const link = `${window.location.origin}/share/alert-his-events/${id}`;

// 对
const link = `${window.location.origin}${basePrefix}/share/alert-his-events/${id}`;
```

注意 `pathname` 的来源，两种 `location` 不一样：

| 写法                       | `/flashcat/log/explorer` 页面上的值  | 拼完整 URL 时        |
| -------------------------- | ------------------------------------ | -------------------- |
| `useLocation().pathname`   | `/log/explorer`（Router 去掉了前缀） | 要补 `basePrefix`    |
| `window.location.pathname` | `/flashcat/log/explorer`             | 不要再补，否则会重复 |

```ts
// 错：日志检索、指标探索的"分享链接"曾经这样写，复制出来的链接缺少前缀
const location = useLocation();
copyToClipBoard(`${window.location.origin}${location.pathname}?${search}`);

// 对
copyToClipBoard(`${window.location.origin}${basePrefix}${location.pathname}?${search}`);
```

复制到剪贴板、显示在输入框里的地址，插件同样不会处理：它只处理会被浏览器直接访问的位置。

### 3. 重复拼前缀

`window.location.pathname` 本身已经带了前缀，再拼一次就会变成 `/flashcat/flashcat/...`。插件看到地址已经以前缀开头，会认为"已经加过了"，不会帮你去掉多出来的那一个：

```ts
// 错：结果是 /flashcat/flashcat/xxx
location.href = `${basePrefix}${location.pathname}`;

// 对
location.href = `${location.pathname}${location.search}`;
```

### 4. 单独创建的 Router

用 `createRoot` 单独渲染的弹窗（例如 `ModalHOC`）里如果新建了 `<BrowserRouter>`，要自己传 `basename`：

```tsx
<Router basename={basePrefix}>...</Router>
```

### 5. 地址经过对象或第三方库中转

插件只看"地址被直接传给浏览器"的那一刻。地址如果先存进配置对象，再交给自定义组件或第三方库使用，插件发现不了：

```ts
const menu = [{ label: '详情', url: '/detail' }];
<ThirdPartyMenu items={menu} />; // 组件内部怎么用 url，插件不知道
```

这种情况手动拼 `basePrefix`。如果是自己项目里常用的组件，也可以把它加进插件的 `components` 配置。

### 6. 地址不在 `src/` 下的 JS/TS 代码里

插件只处理 `src/` 下的 `ts/tsx/js/jsx` 文件（包括 `src/plus` 和合并进来的 `src/Packages`），不处理：

- `node_modules` 里的第三方代码；
- `index.html` 里内联脚本中拼出的地址（例如 `script.src = '/js/widget.js'`）；
- 后端返回的 HTML 或 markdown 内容里写死的地址。

### 7. 无法判断地址的本意

插件默认认为"以 `/` 开头的地址都属于本站，应该带前缀"。如果某个地址确实指向域名根下的其他系统，例如独立部署的文档站，需要把它加进 `exclude`：

```ts
prefixPlugin(baseName, { exclude: ['/docs/', '/other-system/'] });
```

后端返回的跳转地址（例如 `res.dat.redirect`）也遵循这条规则：完整 URL 原样使用；以 `/` 开头的会被补上前缀。

## 配置项

```ts
// vite.config.ts
prefixPlugin(baseName, {
  exclude: ['/docs/'], // 默认值：这些开头的地址不加前缀
  components: { Button: ['href'], Image: ['src'], Avatar: ['src'] }, // 默认值：额外处理的组件属性
  reportFile: 'node_modules/.cache/prefix-rewrites.json', // 默认值：报告输出位置
});
```

## 写代码时的建议

- 站内跳转优先用 `<Link>` 或 `history.push`，接口请求优先用 `request`。这两种方式本来就会带前缀，不依赖插件。
- `window.open`、`<img src>`、`fetch` 这些写法照常写 `/xxx` 即可，插件会处理。
- 遇到上面"做不到的事情"里的写法，记得手动用 `basePrefix`（从 `@/App` 引入）。
- 改完以后，可以用 `npm run build:prefix_advanced` 构建，然后看一眼改写报告，确认改动符合预期。

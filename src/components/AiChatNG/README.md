# AiChat

## 简介

AiChat 是一个 AI 对话组件，提供以下能力：

- 多轮会话
- 会话历史切换
- 首次发送时懒创建会话
- 流式回复渲染
- 自定义内容渲染
- 基于页面上下文传递业务参数

当前内置支持的内容块主要包括：

- thinking / reasoning
- markdown
- hint

对于 query 或其他业务自定义类型，建议通过 `customContentRenderer` 按场景接管渲染。

组件当前由入口壳组件、会话面板、历史页、工具栏、服务层和流式 Hook 组成，适合直接嵌入 Explorer、Dashboard、Alert 等页面。

## 参数

AiChat 默认导出组件的入参如下：

| 参数名                | 类型                          | 必填 | 说明                                                              |
| --------------------- | ----------------------------- | ---- | ----------------------------------------------------------------- |
| className             | string                        | 否   | 外层容器 className                                                |
| placeholder           | string                        | 否   | 输入框占位文案。未传时使用组件内置 i18n 文案                      |
| chatId                | string                        | 否   | 当前会话 ID。传入时加载指定会话；不传时在首次发送消息时创建会话   |
| queryPageFrom         | IAiChatPageInfo               | 是   | 消息查询请求里的 page_from 参数，同时用于创建会话时传递页面上下文 |
| queryAction           | IAiChatAction                 | 否   | 消息查询请求里的 action 参数，用于约束 AI 在当前场景的行为        |
| welcomeSlot           | React.ReactNode               | 否   | 自定义空态欢迎区。未传时使用内置欢迎内容                          |
| promptList            | string[]                      | 否   | 空态下展示的推荐提示词                                            |
| customContentRenderer | AiChatCustomContentRenderer   | 否   | 自定义 response 渲染器，用于扩展或接管业务内容块展示              |
| onChatChange          | (chat?) => void               | 否   | 当前会话变化时触发                                                |
| onError               | (error) => void               | 否   | 组件内部接口或流式异常回调                                        |

### 关键类型

| 类型                          | 说明                                 |
| ----------------------------- | ------------------------------------ |
| IAiChatPageInfo             | 页面来源信息，包含 page 和可选 param |
| IAiChatAction               | AI 动作定义，包含 key 和 param       |
| IAiChatHistoryItem          | 历史会话项结构                       |
| IAiChatMessage              | 单条消息完整结构                     |
| IAiChatRenderContext        | 自定义渲染器接收到的上下文对象       |
| AiChatCustomContentRenderer | 自定义内容渲染函数签名               |

## 文件结构

```text
src/components/AiChat/
├── README.md
├── ai-chat.md
├── index.tsx
├── types.ts
├── services.ts
├── useStream.ts
├── utils.ts
├── ChatPanel.tsx
├── ChatHistory.tsx
├── ToolsBar.tsx
├── MessageBlocks.tsx
├── customContentRenderer/
│   └── PromQLCard.tsx
└── locale/
    ├── index.ts
    ├── zh_CN.ts
    ├── en_US.ts
    ├── zh_HK.ts
    ├── ja_JP.ts
    └── ru_RU.ts
```

## 文件说明

| 文件                                 | 说明                                                                |
| ------------------------------------ | ------------------------------------------------------------------- |
| index.tsx                            | 组件入口壳层，负责工具栏、历史页与当前 ChatPanel 的视图切换         |
| ChatPanel.tsx                        | 单会话聊天面板，负责消息发送、懒创建会话、轮询和流式更新            |
| ChatHistory.tsx                      | 会话历史列表页，负责历史接口拉取、删除、选择会话                    |
| ToolsBar.tsx                         | 顶部操作栏，提供当前会话、新建会话、历史会话切换                    |
| MessageBlocks.tsx                    | 各类消息块渲染逻辑，包括 cur_step 状态、markdown、thinking、hint 等 |
| customContentRenderer/PromQLCard.tsx | 自定义 query 卡片示例，演示如何在业务侧接管 query 渲染              |
| services.ts                          | 与 AI 助手后端接口交互的 request 封装                               |
| useStream.ts                         | 流式响应消费 Hook，负责处理 SSE 数据                                |
| utils.ts                             | 通用工具方法，如 className 合并、时间格式化、消息合并               |
| types.ts                             | 组件公开类型与内部数据结构定义                                      |
| locale/\*                            | 组件命名空间 AiChat 的多语言文案                                    |
| ai-chat.md                           | 前后端交互协议和接口说明                                            |

## i18n 说明

- 当前 AiChat 使用 `AiChat` 作为 i18n namespace
- 入口文件 [src/components/AiChat/index.tsx](src/components/AiChat/index.tsx) 已引入 locale 注册
- 当前已覆盖工具栏、历史页、输入区和内置消息块的主要可见文案
- 如果后续新增 content_type，对应的展示文案也应继续补充到同一 namespace

## 渲染说明

- 当 `/message/detail` 返回 `cur_step` 且消息尚未结束时，组件会在回复内容正上方展示一行状态提示
- 状态提示样式为 loading 图标 + `cur_step` 文案，loading 资源位于 `/image/ai-chat/ai_loading.svg`
- 当消息完成或进入错误态后，这一行状态提示会自动隐藏
- 如果某条消息暂无 `response` 内容但仍在处理中，也会优先展示该状态行

## 自定义内容渲染

- `customContentRenderer` 会收到 `message`、`response`、`isStreaming`、`onExecuteAction` 和 `maybeScrollToBottom`
- 返回 `ReactNode` 时，组件使用业务侧的渲染结果
- 返回 `null` 时，未命中的内容类型会回退到默认的“不支持该类型”展示
- 当前 demo 中已经用 `PromQLCard` 演示了如何自定义渲染 query 类型

## 使用说明

```tsx
import AiChat from '@/components/AiChat';
import PromQLCard from '@/components/AiChat/customContentRenderer/PromQLCard';

<AiChat
  className='flex h-full min-h-0 flex-col'
  placeholder='请输入 PromQL 相关问题'
  queryPageFrom={{ page: 'explorer' }}
  queryAction={{
    key: 'query_generator',
    param: {
      datasource_type: 'prometheus',
      datasource_id: 849,
    },
  }}
  promptList={['帮我生成一条 CPU 使用率查询']}
  customContentRenderer={({ response, message }) => {
    if (response.content_type === 'query') {
      return (
        <PromQLCard
          response={response}
          message={message}
          onExecuteQuery={(promql) => {
            console.log(promql);
          }}
        />
      );
    }

    return null;
  }}
/>;
```

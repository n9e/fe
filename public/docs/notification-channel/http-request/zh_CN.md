本文档介绍如何在告警通知媒介中使用 HTTP 配置，通过自定义请求地址、请求头、请求参数和请求体，将告警消息发送到钉钉或其他任意自定义通知渠道。同时也介绍如何在这些配置项中使用 `{{$event}}`、`{{$tpl}}`、`{{$params}}`、`{{$sendto}}` 等变量，以实现发送不同的通知内容。

## 一、配置概览

在设置 HTTP 通知媒介时，我们常见的主要配置项包括：

1. **URL**
2. **请求头（Request Header）**
3. **请求参数（Query Parameters / Request Parameters）**
4. **请求体（Request Body）**

> 四个配置都支持使用 `{{$event}}`、`{{$tpl}}`、`{{$params}}`、`{{$sendto}}` 这四个变量。

变量说明

1. $tpl
- 表示经过渲染后的文本模板内容，一般就是最终要发送出去的消息文本。用户可以在消息模板管理创建模板，然后消息模板会先根据事件内容生成此文本写入 $tpl 变量，再通过 $tpl 引用。
- 如果使用的是 `{{$tpl.key}}` 变量，那么消息模板中需要配置添加了对应的 key 值。例如钉钉机器人消息模板中，需要配置 `title` 和 `content` 两个 key 值，这样在 $tpl 中就可以使用 `{{$tpl.title}}` 和 `{{$tpl.content}}` 来引用。

2. $params

- 表示自定义参数，可以在有些配置项中使用，例如 `{{$params.access_token}}`、`{{$params.token}}` 等。
- 这些参数的值可以在通知规则中由用户配置，然后在实际发送时动态传入。比如一个钉钉通知媒介，可以根据用户配置不同的 token 值，从而实现不同的钉钉群机器人发送。
- 使用 `{{$params.xxx}}` 时，需要在 “变量配置” 中添加参数标识 `xxx`，然后用户会在通知规则中，填入 `xxx` 的值，最终用户配置的 `xxx` 值会替换到 URL 中。

3. $sendto

- 表示本次通知要发送到的目标地址或列表，如手机号、邮箱、IM 的个人 token 等。
- 可以在请求体、URL、请求头等任意位置使用，用于区分不同的发送目标。
- 使用 `{{$sendto}}` 时，需要在 “变量配置” 中配置用户联系方式，最终会根据用户配置的联系方式，将 $sendto 变量替换为实际的联系方式。

4. $event

- 表示告警事件对象，适用于想直接引用事件原始数据或进行更多灵活拼接的场景。

另外还有以下配置：

- 请求超时时间、重试次数、并发数、重试间隔等。
- 是否跳过证书校验。
- 代理设置等。

当执行告警通知时，系统会根据这些配置进行一次或多次 HTTP 调用，从而实现将告警信息推送到第三方平台。

## 二、各项配置详解

### 1. URL

**作用**：目标通知接口地址，支持动态变量替换。  
**配置示例**

```text
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

如果使用了变量 `$params.access_token`，那么在“变量配置”处需要添加参数标识 `access_token`，然后用户会在通知规则中，填入 `access_token` 的值，最终用户配置的 `access_token` 值会替换到 URL 中。


**说明**

- 不同平台或不同接口的请求地址都可以写在这里，比如钉钉机器人、企业微信机器人、Slack Webhook 等。

### 2. 请求头（Request Header）

**作用**：定义 HTTP 请求头信息，如认证凭据、内容类型等。  
**配置示例**

| 参数名          | 参数值                 |
| --------------- | ---------------------- |
| `Content-Type`  | `application/json`     |
| `Authorization` | `Bearer {{$params.token}}` |

**说明**

- 一些平台要求在请求头中带有鉴权信息、或者指定 `Content-Type` 等。
- 如果需要自定义请求头，也可以添加更多字段。

### 3. 请求参数（Query Parameters / Request Parameters）

**作用**：通过 URL 参数传递轻量级数据。  
**配置示例**

| 参数名         | 参数值              |
| -------------- | ------------------- |
| `access_token` | `your-access-token` |

**说明**

- 在 URL 查询字符串（`?key=value`）上附加的参数可在这里配置，或者也可以直接写在 URL 中。
- 如果要将一些变量以 query param 的形式传递，既可以使用 `{{$params.xxx}}` 这种方式，也可以将 `{{$event}}`、`{{$tpl}}`、`{{$sendto}}` 的部分内容进行组合。

### 4. 请求体（Request Body）

**作用**：传递结构化通知内容（如 JSON 格式的告警详情）。  
**配置示例**

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "{{$tpl.title}}",
    "text": "{{$tpl.text}}"
  },
  "at": {
    "atMobiles": ["{{$params.ats}}"],
    "isAtAll": false
  }
}
```

**说明**

- 以 JSON 形式（通常常见于钉钉、企业微信机器人）或表单形式（application/x-www-form-urlencoded）发送。
- 在请求体中，可以直接嵌入 $event、$tpl、$params、$sendto 等变量进行动态替换。
- $tpl 通常代表告警模板渲染后的文本内容；$sendto 可以代表要通知的目标人（如手机号、企业微信账号等）。

## 三、示例：发送到钉钉机器人

以下示例展示了一个将告警消息发送到钉钉群机器人的配置思路。钉钉机器人的 access_token 和 @ 某个手机号的信息，已经通过配置通过规则，传入到 $params 变量中，然后通过 $params.access_token 和 $sendto 变量，在请求体中引用。

1.变量配置   
在变量配置中添加参数标识 `access_token` 和 `ats`

2.URL

```
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

3. 请求头（Request Header）

| 参数名 | 参数值 |
|---------------|--------------------|
| `Content-Type` | `application/json` |

4.请求参数
| 参数名 | 参数值 |
|--------------|---------------------|
| `access_token` | `your-access-token` |

5.请求体

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "{{$tpl.title}}",
    "text": "{{$tpl.text}}"
  },
  "at": {
    "atMobiles": ["{{$params.ats}}"],
    "isAtAll": false
  }
}
```

在该示例中：

- {{$params.access_token}} 被替换为实际的钉钉群机器人 access_token。
- {{$params.ats}} 被替换为实际的钉钉群内 @ 的手机号。
- {{$tpl.title}} 会是渲染后最终要发送的告警信息标题，比如 “CPU 使用率超出阈值”。
- {{$tpl.text}} 会是渲染后最终要发送的告警信息文本，比如 “CPU 使用率超出阈值,触发时间：2024-01-01 12:00:00”。

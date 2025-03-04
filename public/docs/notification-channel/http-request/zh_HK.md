本文檔介紹如何在告警通知媒介中使用 HTTP 配置，通過自定義請求地址、請求頭、請求參數和請求體，將告警消息發送到釘釘或其他任意自定義通知渠道。同時也介紹如何在這些配置項中使用 `{{$event}}`、`{{$tpl}}`、`{{$params}}`、`{{$sendto}}` 等變量，以實現發送不同的通知內容。

## 一、配置概覽

在設置 HTTP 通知媒介時，我們常見的主要配置項包括：

1. **URL**
2. **請求頭（Request Header）**
3. **請求參數（Query Parameters / Request Parameters）**
4. **請求體（Request Body）**

> 四個配置都支持使用 `{{$event}}`、`{{$tpl}}`、`{{$params}}`、`{{$sendto}}` 這四個變量。

變量說明

1. $tpl
- 表示經過渲染後的文本模板內容，一般就是最終要發送出去的消息文本。用戶可以在消息模板管理創建模板，然後消息模板會先根據事件內容生成此文本寫入 $tpl 變量，再通過 $tpl 引用。
- 如果使用的是 `{{$tpl.key}}` 變量，那麼消息模板中需要配置添加了對應的 key 值。例如釘釘機器人消息模板中，需要配置 `title` 和 `content` 兩個 key 值，這樣在 $tpl 中就可以使用 `{{$tpl.title}}` 和 `{{$tpl.content}}` 來引用。

2. $params

- 表示自定義參數，可以在有些配置項中使用，例如 `{{$params.access_token}}`、`{{$params.token}}` 等。
- 這些參數的值可以在通知規則中由用戶配置，然後在實際發送時動態傳入。比如一個釘釘通知媒介，可以根據用戶配置不同的 token 值，從而實現不同的釘釘群機器人發送。
- 使用 `{{$params.xxx}}` 時，需要在 "變量配置" 中添加參數標識 `xxx`，然後用戶會在通知規則中，填入 `xxx` 的值，最終用戶配置的 `xxx` 值會替換到 URL 中。

3. $sendto

- 表示本次通知要發送到的目標地址或列表，如手機號、郵箱、IM 的個人 token 等。
- 可以在請求體、URL、請求頭等任意位置使用，用於區分不同的發送目標。
- 使用 `{{$sendto}}` 時，需要在 "變量配置" 中配置用戶聯繫方式，最終會根據用戶配置的聯繫方式，將 $sendto 變量替換為實際的聯繫方式。

4. $event

- 表示告警事件對象，適用於想直接引用事件原始數據或進行更多靈活拼接的場景。

另外還有以下配置：

- 請求超時時間、重試次數、並發數、重試間隔等。
- 是否跳過證書校驗。
- 代理設置等。

當執行告警通知時，系統會根據這些配置進行一次或多次 HTTP 調用，從而實現將告警信息推送到第三方平台。

## 二、各項配置詳解

### 1. URL

**作用**：目標通知接口地址，支持動態變量替換。  
**配置示例**

```text
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

如果使用了變量 `$params.access_token`，那麼在"變量配置"處需要添加參數標識 `access_token`，然後用戶會在通知規則中，填入 `access_token` 的值，最終用戶配置的 `access_token` 值會替換到 URL 中。


**說明**

- 不同平台或不同接口的請求地址都可以寫在這裡，比如釘釘機器人、企業微信機器人、Slack Webhook 等。

### 2. 請求頭（Request Header）

**作用**：定義 HTTP 請求頭信息，如認證憑據、內容類型等。  
**配置示例**

| 參數名          | 參數值                 |
| --------------- | ---------------------- |
| `Content-Type`  | `application/json`     |
| `Authorization` | `Bearer {{$params.token}}` |

**說明**

- 一些平台要求在請求頭中帶有鑒權信息、或者指定 `Content-Type` 等。
- 如果需要自定義請求頭，也可以添加更多字段。

### 3. 請求參數（Query Parameters / Request Parameters）

**作用**：通過 URL 參數傳遞輕量級數據。  
**配置示例**

| 參數名         | 參數值              |
| -------------- | ------------------- |
| `access_token` | `your-access-token` |

**說明**

- 在 URL 查詢字符串（`?key=value`）上附加的參數可在這裡配置，或者也可以直接寫在 URL 中。
- 如果要將一些變量以 query param 的形式傳遞，既可以使用 `{{$params.xxx}}` 這種方式，也可以將 `{{$event}}`、`{{$tpl}}`、`{{$sendto}}` 的部分內容進行組合。

### 4. 請求體（Request Body）

**作用**：傳遞結構化通知內容（如 JSON 格式的告警詳情）。  
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

**說明**

- 以 JSON 形式（通常常見於釘釘、企業微信機器人）或表單形式（application/x-www-form-urlencoded）發送。
- 在請求體中，可以直接嵌入 $event、$tpl、$params、$sendto 等變量進行動態替換。
- $tpl 通常代表告警模板渲染後的文本內容；$sendto 可以代表要通知的目標人（如手機號、企業微信賬號等）。

## 三、示例：發送到釘釘機器人

以下示例展示了一個將告警消息發送到釘釘群機器人的配置思路。釘釘機器人的 access_token 和 @ 某個手機號的信息，已經通過配置通過規則，傳入到 $params 變量中，然後通過 $params.access_token 和 $sendto 變量，在請求體中引用。

1.變量配置   
在變量配置中添加參數標識 `access_token` 和 `ats`

2.URL

```
https://oapi.dingtalk.com/robot/send?access_token={{$params.access_token}}
```

3. 請求頭（Request Header）

| 參數名 | 參數值 |
|---------------|--------------------|
| `Content-Type` | `application/json` |

4.請求參數
| 參數名 | 參數值 |
|--------------|---------------------|
| `access_token` | `your-access-token` |

5.請求體

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

在該示例中：

- {{$params.access_token}} 被替換為實際的釘釘群機器人 access_token。
- {{$params.ats}} 被替換為實際的釘釘群內 @ 的手機號。
- {{$tpl.title}} 會是渲染後最終要發送的告警信息標題，比如 "CPU 使用率超出閾值"。
- {{$tpl.text}} 會是渲染後最終要發送的告警信息文本，比如 "CPU 使用率超出閾值,觸發時間：2024-01-01 12:00:00"。

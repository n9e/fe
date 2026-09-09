模板使用 [Go template 语法](https://pkg.go.dev/text/template)，可以引用告警事件(AlertCurEvent)的各個字段進行個性化消息配置。模板支持條件判斷、循環、變量賦值等豐富功能。

## 模板字段標識
消息模板的字段標識，在配置對應的消息媒介中會用到，所以在創建消息模板的時候，需要注意，使用的字段標識必須和對應通知媒介中可以匹配上。   

以釘釘消息模板舉例，在釘釘通知媒介中，消息模板在 body 配置中有使用
```
{"msgtype": "markdown", "markdown": {"title": "{{$tpl.title}}", "text": "{{$tpl.content}}}, "at": {"atMobiles": []}}
```
在釘釘通知媒介中，引用方式為：`{{$tpl.title}}` 和 `{{$tpl.content}}`。所以通知媒介為釘釘的消息模板，字段標識需要使用 `title` 和 `content`

其他的消息模板也類似，可以根據通知媒介中需要用到哪些字段，來創建對應的字段標識

## 模板示例
下面是一個簡單的模板示例，可以在告警事件觸發時，發送告警事件的基本信息。
```toml
級別狀態: S{{$event.Severity}} {{if $event.IsRecovered}}Recovered{{else}}Triggered{{end}}   
規則名稱: {{$event.RuleName}}{{if $event.RuleNote}}   
規則備註: {{$event.RuleNote}}{{end}}   
監控指標: {{$event.TagsJSON}}
{{if $event.IsRecovered}}恢復時間：{{timeformat $event.LastEvalTime}}{{else}}觸發時間: {{timeformat $event.TriggerTime}}
觸發時值: {{$event.TriggerValue}}{{end}}
發送時間: {{timestamp}}
事件詳情: {{$.domain}}/alert-his-events/{{$event.Id}}
```
> `{{$.domain}}` 是站點地址，由系統按「站點設置」自動填充，不需要自己聲明。
> 注意要寫 `{{$.domain}}` 而不是 `{{.domain}}`：`$` 恆指向根數據，放在 `range` / `with` 內部同樣成立。


## 模板示例
### 基礎模板示例
```toml
級別狀態: S{{$event.Severity}} {{if $event.IsRecovered}}Recovered{{else}}Triggered{{end}}   
規則名稱: {{$event.RuleName}}{{if $event.RuleNote}}   
規則備註: {{$event.RuleNote}}{{end}}   
監控指標: {{$event.TagsJSON}}
{{if $event.IsRecovered}}恢復時間：{{timeformat $event.LastEvalTime}}{{else}}觸發時間: {{timeformat $event.TriggerTime}}
觸發時值: {{$event.TriggerValue}}{{end}}
發送時間: {{timestamp}}
事件詳情: {{$.domain}}/alert-his-events/{{$event.Id}}
屏蔽1小時: {{$.domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
```

## 模板常用語法介紹

### 內置變量

模板渲染前系統已預先聲明了下面這些變量，可以直接使用：

| 變量 | 說明 |
| --- | --- |
| `$event` | 當前告警事件；多個事件聚合發送時為第一個事件 |
| `$events` | 本次通知包含的全部事件列表，`{{len $events}}` 取數量 |
| `$labels` | 等價於 `$event.TagsMap`，標籤 map，`{{$labels.instance}}` 取某個標籤 |
| `$value` | 等價於 `$event.TriggerValue`，觸發時的值（字符串） |
| `$.domain` | 站點地址，見上文說明 |

### 條件判斷

```
{{if eq $event.Severity 1}}
- 告警級別: 緊急
{{else if eq $event.Severity 2}}
- 告警級別: 警告
{{else}}
- 告警級別: 提醒
{{end}}
```

比較函數有 `eq`（等於）、`ne`（不等）、`lt`、`le`、`gt`、`ge`，邏輯組合用 `and`、`or`、`not`。`eq` 支持多個候選值，`{{if eq $event.Severity 1 2}}` 表示等於 1 或 2。

```
{{if and (not $event.IsRecovered) (ge $event.Severity 2)}}請儘快處理{{end}}
```

### 循環

```
{{range $i, $tag := $event.TagsJSON}}
- {{$tag}}
{{end}}

{{range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{end}}
```

### 變量賦值

```
{{$var := $event.TriggerValue}}
{{$duration := sub now.Unix $event.FirstTriggerTime}}
```

### 去除多餘空白

`{{-` 會吃掉左側的空白和換行，`-}}` 會吃掉右側的，用來避免 `if` / `range` 產生多餘空行：

```
{{- range $k, $v := $labels}}
{{$k}}={{$v}}
{{- end}}
```

### 註釋

```
{{/* 這裡是註釋，不會輸出 */}}
```

## 模板函數速查

函數調用寫法是「函數名 參數1 參數2 ...」，參數之間用空格分隔。需要把一個函數的結果作為另一個函數的參數時，用括號包起來；也可以用管道 `|` 把前一步的結果作為最後一個參數傳入：

```
{{humanize $event.TriggerValue}}
{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}
{{$event.RuleName | toUpper}}
```

下面示例中 `→` 右側是輸出結果。

### 時間

| 函數 | 說明 | 示例 |
| --- | --- | --- |
| `timeformat` | 把 unix 秒級時間戳格式化為時間字符串。第二個參數可選，為 Go 時間佈局，默認 `2006-01-02 15:04:05` | `{{timeformat $event.TriggerTime}}` → `2026-08-21 10:30:00`；`{{timeformat $event.TriggerTime "01-02 15:04"}}` → `08-21 10:30` |
| `timestamp` | 當前時間（發送時刻），參數同上 | `{{timestamp}}` → `2026-08-21 10:30:05`；`{{timestamp "2006/01/02"}}` → `2026/08/21` |
| `now` | 當前時間對象，可繼續調用 `.Unix`、`.Format` 等方法 | `{{now.Unix}}` → `1787200205`；`{{now.Format "15:04"}}` → `10:30` |
| `humanizeDuration` | 把秒數（字符串）轉成易讀時長 | `{{humanizeDuration "3725"}}` → `1h 2m 5s` |
| `humanizeDurationInterface` | 同上，但接受數字，常與 `sub` 配合算持續時長 | `{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}` → `2h 15m 30s` |
| `parseDuration` | 把 `1h30m` 這類時長字符串轉成秒數 | `{{parseDuration "1h30m"}}` → `5400` |

Go 時間佈局用固定的參考時間 `2006-01-02 15:04:05` 表示格式，例如 `2006年01月02日`、`15:04:05`、`Jan 2, 2006`。

### 數值格式化

這組函數的入參是字符串，`$event.TriggerValue` 本身就是字符串可以直接傳；數字類型的值先用 `toString` 轉一下。入參不是合法數字時原樣返回。

| 函數 | 說明 | 示例 |
| --- | --- | --- |
| `humanize` | 按 1000 進位加 k / M / G 等單位，保留兩位小數 | `{{humanize "1234567"}}` → `1.23M`；`{{humanize "0.00123"}}` → `1.23m` |
| `humanize1024` | 按 1024 進位加 ki / Mi / Gi 等單位，適合字節數 | `{{humanize1024 "1073741824"}}` → `1Gi`；`{{humanize1024 "1536"}}` → `1.5ki` |
| `humanizePercentage` | 把 0~1 的比例轉成百分比 | `{{humanizePercentage "0.8567"}}` → `85.67%` |
| `humanizePercentageH` | 值已經是百分數時只補 `%` 並保留兩位小數 | `{{humanizePercentageH "85.6789"}}` → `85.68%` |
| `formatDecimal` | 保留指定位數小數 | `{{formatDecimal $event.TriggerValue 2}}` → `93.46` |
| `printf` | 按 Go 格式串格式化一個值。數字字符串會先轉成浮點數；帶單位的（如 `85%`）原樣返回 | `{{printf "%.1f" $event.TriggerValue}}` → `93.5` |
| `toString` | 把任意值轉成字符串，便於傳給只接受字符串的函數 | `{{humanize (toString 1234567)}}` → `1.23M` |

注意：這裡的 `printf` 覆蓋了 Go 內置版本，只用來格式化數字：只接受「格式串 + 一個值」，不支持 `printf "%s-%s" a b` 這種多參數寫法；數字字符串會先被轉成浮點數，所以 `printf "%s" "1"` 會輸出 `%!s(float64=1)`。字符串拼接直接把表達式並排寫即可，例如 `S{{$event.Severity}}-{{$event.RuleName}}`。

### 數學運算

| 函數 | 說明 | 示例 |
| --- | --- | --- |
| `add` | 加 | `{{add 1 2}}` → `3`；`{{add $i 1}}` 常用於循環裡把下標從 1 開始編號 |
| `sub` | 減 | `{{sub now.Unix $event.FirstTriggerTime}}` → `8130`（已持續秒數） |
| `mul` | 乘 | `{{mul $event.Severity 10}}` → `20` |
| `div` | 除。兩個整數相除會取整，想要小數至少一個參數寫成小數 | `{{div 7 2}}` → `3`；`{{div 7.0 2}}` → `3.5` |

### 字符串

| 函數 | 說明 | 示例 |
| --- | --- | --- |
| `toUpper` / `toLower` | 轉大寫 / 小寫 | `{{toUpper "cpu"}}` → `CPU` |
| `title` | 每個單詞首字母大寫 | `{{title "disk usage high"}}` → `Disk Usage High` |
| `contains` | 判斷是否包含子串，參數順序是（原串, 子串） | `{{if contains $event.RuleName "CPU"}}CPU 相關{{end}}` |
| `match` | 正則匹配，參數順序是（正則, 原串） | `{{if match "^prod-" $event.TargetIdent}}生產環境{{end}}` |
| `reReplaceAll` | 正則替換，參數順序是（正則, 替換值, 原串）。正則裡的 `\` 要寫成 `\\` | `{{reReplaceAll ":\\d+$" "" "10.0.0.1:9100"}}` → `10.0.0.1` |
| `split` | 按分隔符切分成列表 | `{{index (split $labels.instance ":") 0}}` → `10.0.0.1` |
| `join` | 把列表用分隔符拼接 | `{{join $event.TagsJSON ", "}}` → `instance=10.0.0.1:9100, job=node` |
| `stripPort` | 去掉 `host:port` 裡的端口 | `{{stripPort "10.0.0.1:9100"}}` → `10.0.0.1` |
| `stripDomain` | 去掉主機名裡的域名部分，保留端口 | `{{stripDomain "web01.example.com:80"}}` → `web01:80` |
| `ats` | 把逗號或空格分隔的名單轉成 @ 列表 | `{{ats "zhangsan,lisi"}}` → `@zhangsan @lisi` |
| `b64enc` / `b64dec` | base64 編碼 / 解碼 | `{{b64enc "abc"}}` → `YWJj` |

### 標籤、列表與 JSON

| 函數 | 說明 | 示例 |
| --- | --- | --- |
| `index` | 按 key 或下標取值。標籤名含 `-`、`.` 等特殊字符時不能寫 `$labels.xxx`，只能用 `index` | `{{index $labels "service-name"}}`；`{{index $events 0}}` |
| `len` | 取長度 | `{{len $events}}` → `3` |
| `jsonMarshal` | 序列化為 JSON 字符串 | `{{jsonMarshal $event.TagsMap}}` → `{"instance":"10.0.0.1:9100","job":"node"}` |
| `tagsMapToStr` | 把標籤 map 轉成 `k=v,k=v`，按 key 排序 | `{{tagsMapToStr $event.TagsMap}}` → `instance=10.0.0.1:9100,job=node` |

### 轉義與 URL

除郵件以外的通知媒介，消息模板都按 html/template 渲染，`<`、`>`、`&`、`"` 等字符會被轉義成 `&lt;` 之類；渲染結果再嵌入通知媒介的 JSON body 時，系統會自動把 `"` 和換行轉義成 `\"`、`\n`，模板裡不需要自己處理。

| 函數 | 說明 | 示例 |
| --- | --- | --- |
| `unescaped` / `safeHtml` | 把字符串標記為可信內容，原樣輸出不做 HTML 轉義。輸出 HTML 片段或含 `&` 的鏈接時用它 | `{{unescaped "<b>緊急</b>"}}` → `<b>緊急</b>`；`{{unescaped $event.AnnotationsJSON.runbook_url}}` → 鏈接裡的 `&` 不會變成 `&amp;` |
| `urlconvert` | 把字符串標記為可信 URL，只在 HTML 的 `href` / `src` 屬性裡有意義，可跳過 html/template 對 URL 的安全檢查 | `<a href="{{urlconvert $event.AnnotationsJSON.runbook_url}}">Runbook</a>` |
| `escape` | URL 路徑片段轉義，把值拼進 URL 路徑時使用 | `{{escape "a b/c"}}` → `a%20b%2Fc` |

### 常用組合示例

```
{{/* 告警已持續時長 */}}
持續時長: {{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}

{{/* 觸發值按百分比展示，保留兩位小數 */}}
當前值: {{humanizePercentageH $event.TriggerValue}}

{{/* 只展示關心的標籤，去掉端口只留 IP */}}
主機: {{stripPort $labels.instance}}  服務: {{index $labels "service-name"}}

{{/* 按主機名前綴判斷環境 */}}
環境: {{if match "^prod-" $event.TargetIdent}}生產{{else}}測試{{end}}

{{/* 遍歷標籤逐行輸出 */}}
{{- range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{- end}}

{{/* 多事件聚合發送時列出全部規則 */}}
共 {{len $events}} 條告警：
{{- range $i, $e := $events}}
{{add $i 1}}. {{$e.RuleName}}（{{timeformat $e.TriggerTime "15:04"}}）
{{- end}}
```

以上只列出了常用函數，完整列表見 [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14)；Go 模板自身的語法和內置函數見 [text/template](https://pkg.go.dev/text/template)。

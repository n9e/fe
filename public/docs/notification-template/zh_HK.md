模板使用 [Go template 语法](https://pkg.go.dev/text/template)，可以引用告警事件(AlertCurEvent)的各個字段進行個性化消息配置。模板支持條件判斷、循環、變量賦值等豐富功能。

## 可用字段說明

以下是可在模板中使用的 AlertCurEvent 主要字段：

基本信息字段

| 字段名           | 類型   | 描述                     | 模板引用方式               |
| --------------- | ------ | ------------------------ | ------------------------- |
| Id              | int64  | 告警事件 ID              | {{$event.Id}}            |
| Cate            | string | 告警類別，如"prometheus" | {{$event.Cate}}          |
| Cluster         | string | 所屬數據源名稱            | {{$event.Cluster}}       |
| DatasourceId    | int64  | 數據源 ID                | {{$event.DatasourceId}}  |
| GroupId         | int64  | 業務組 ID                | {{$event.GroupId}}       |
| GroupName       | string | 業務組名稱               | {{$event.GroupName}}     |
| Hash            | string | 告警事件hash             | {{$event.Hash}}          |
| RuleId          | int64  | 規則 ID                  | {{$event.RuleId}}        |
| RuleName        | string | 規則名稱                 | {{$event.RuleName}}      |
| RuleNote        | string | 規則備註                 | {{$event.RuleNote}}      |
| Severity        | int    | 告警級別(1-3)            | {{$event.Severity}}      |
| PromQl          | string | 告警查詢語句             | {{$event.PromQl}}        |
| PromForDuration | int    | 持續時長(秒)             | {{$event.PromForDuration}}  |
| PromEvalInterval| int    | 評估間隔(秒)             | {{$event.PromEvalInterval}} |
| Status          | int    | 告警狀態                 | {{$event.Status}}          |
| SubRuleId       | int64  | 訂閱規則ID                 | {{$event.SubRuleId}}       |
| NotifyRuleIDs   | []int64  | 通知規則ID列表  | {{$event.NotifyRuleIDs}}     |
| RuleHash        | string | 規則哈希值               | {{$event.RuleHash}}        |

觸發相關字段

| 字段名           | 類型   | 描述         | 模板引用方式        |
| ---------------- | ------ | ------------ | ------------------- |
| TriggerTime      | int64  | 觸發時間戳   | {{$event.TriggerTime}}            |
| TriggerValue     | string | 觸發值       | {{$event.TriggerValue}}          |
| FirstTriggerTime | int64  | 首次觸發時間 | {{$event.FirstTriggerTime}}      |
| NotifyCurNumber  | int    | 當前通知次數 | {{$event.NotifyCurNumber}}       |
| LastEvalTime     | int64  | 最近評估時間 | {{$event.LastEvalTime}}          |
| LastSentTime     | int64  | 最近發送時間 | {{$event.LastSentTime}}          |

標籤和註釋

| 字段名          | 類型              | 描述           | 模板引用方式        |
| --------------- | ----------------- | -------------- | ------------------- |
| TagsJSON        | []string          | 標籤數組       | {{$event.TagsJSON}}        |
| TagsMap         | map[string]string | 標籤鍵值對映射 | {{$event.TagsMap}}         |
| AnnotationsJSON | map[string]string | 註釋鍵值對映射 | {{$event.AnnotationsJSON}} |

機器相關字段信息

| 字段名      | 類型   | 描述         | 模板引用方式        |   
| ----------- | ------ | ------------ | ------------------- |
| TargetIdent | string | 目標標識     | {{$event.TargetIdent}} |
| TargetNote  | string | 目標備註     | {{$event.TargetNote}}  |

通知相關字段

| 字段名            | 類型     | 描述           | 模板引用方式                 |
| ---------------- | -------- | -------------- | --------------------------- |
| NotifyRecovered  | int      | 是否通知恢復    | {{$event.NotifyRecovered}}   |
| NotifyChannelsJSON| []string | 通知渠道列表    | {{$event.NotifyChannelsJSON}}|
| NotifyGroupsJSON | []string | 通知組列表      | {{$event.NotifyGroupsJSON}}  |
| NotifyRuleIDs   | []int64  | 通知規則ID列表  | {{$event.NotifyRuleIDs}}     |

回調與擴展信息

| 字段名           | 類型                | 描述           | 模板引用方式               |
| --------------- | ------------------- | -------------- | ------------------------- |
| CallbacksJSON   | []string           | 回調URL列表     | {{$event.CallbacksJSON}}   |
| ExtraConfig     | interface{}        | 額外配置信息     | {{$event.ExtraConfig}}     |
| ExtraInfo       | []string           | 額外信息列表     | {{$event.ExtraInfo}}      |
| ExtraInfoMap    | []map[string]string| 額外信息映射     | {{$event.ExtraInfoMap}}    |

觸發值相關

| 字段名           | 類型   | 描述           | 模板引用方式                 |
| --------------- | ------ | -------------- | --------------------------- |
| TriggerValues   | string | 觸發值(原始格式) | {{$event.TriggerValues}}    |
| IsRecovered     | bool   | 是否已恢復      | {{$event.IsRecovered}}      |

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
{{$domain := "http://請聯繫管理員修改通知模板將域名替換為實際的域名" }}   
事件詳情: {{$domain}}/alert-his-events/{{$event.Id}}
屏蔽1小時: {{$domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
```

## 模板常用語法介紹
### 條件判斷
```plaintext
{{if eq $event.Severity 1}}
- 告警級別: 緊急
{{else if eq $event.Severity 2}}
- 告警級別: 警告
{{end}}
 ```

### 循環
```plaintext
{{range $i, $tag := $event.TagsJSON}}  
- {{$tag}}
{{end}}
 ```

### 變量賦值
```plaintext
{{$var := $event.TriggerValue}}
 ```

### 函數調用
```plaintext
{{timeformat $event.LastEvalTime}}
 ```

目前支持的模板函數，除了 go 內置的之外，額外支持的函數見 [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14)
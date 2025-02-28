模板使用 [Go template 语法](https://pkg.go.dev/text/template)，可以引用告警事件(AlertCurEvent)的各个字段进行个性化消息配置。模板支持条件判断、循环、变量赋值等丰富功能。

## 可用字段说明

以下是可在模板中使用的 AlertCurEvent 主要字段：

基本信息字段

| 字段名           | 类型   | 描述                     | 模板引用方式               |
| --------------- | ------ | ------------------------ | ------------------------- |
| Id              | int64  | 告警事件 ID              | {{$event.Id}}            |
| Cate            | string | 告警类别，如"prometheus" | {{$event.Cate}}          |
| Cluster         | string | 所属数据源名称            | {{$event.Cluster}}       |
| DatasourceId    | int64  | 数据源 ID                | {{$event.DatasourceId}}  |
| GroupId         | int64  | 业务组 ID                | {{$event.GroupId}}       |
| GroupName       | string | 业务组名称               | {{$event.GroupName}}     |
| Hash            | string | 告警事件hash             | {{$event.Hash}}          |
| RuleId          | int64  | 规则 ID                  | {{$event.RuleId}}        |
| RuleName        | string | 规则名称                 | {{$event.RuleName}}      |
| RuleNote        | string | 规则备注                 | {{$event.RuleNote}}      |
| Severity        | int    | 告警级别(1-3)            | {{$event.Severity}}      |
| PromQl          | string | 告警查询语句             | {{$event.PromQl}}        |
| PromForDuration | int    | 持续时长(秒)             | {{$event.PromForDuration}}  |
| PromEvalInterval| int    | 评估间隔(秒)             | {{$event.PromEvalInterval}} |
| Status          | int    | 告警状态                 | {{$event.Status}}          |
| SubRuleId       | int64  | 订阅规则ID                 | {{$event.SubRuleId}}       |
| NotifyRuleIDs   | []int64  | 通知规则ID列表  | {{$event.NotifyRuleIDs}}     |
| RuleHash        | string | 规则哈希值               | {{$event.RuleHash}}        |

触发相关字段

| 字段名           | 类型   | 描述         | 模板引用方式        |
| ---------------- | ------ | ------------ | ------------------- |
| TriggerTime      | int64  | 触发时间戳   | {{$event.TriggerTime}}            |
| TriggerValue     | string | 触发值       | {{$event.TriggerValue}}          |
| FirstTriggerTime | int64  | 首次触发时间 | {{$event.FirstTriggerTime}}      |
| NotifyCurNumber  | int    | 当前通知次数 | {{$event.NotifyCurNumber}}       |
| LastEvalTime     | int64  | 最近评估时间 | {{$event.LastEvalTime}}          |
| LastSentTime     | int64  | 最近发送时间 | {{$event.LastSentTime}}          |

标签和注释

| 字段名          | 类型              | 描述           | 模板引用方式        |
| --------------- | ----------------- | -------------- | ------------------- |
| TagsJSON        | []string          | 标签数组       | {{$event.TagsJSON}}        |
| TagsMap         | map[string]string | 标签键值对映射 | {{$event.TagsMap}}         |
| AnnotationsJSON | map[string]string | 注释键值对映射 | {{$event.AnnotationsJSON}} |

机器相关字段信息

| 字段名      | 类型   | 描述         | 模板引用方式        |   
| ----------- | ------ | ------------ | ------------------- |
| TargetIdent | string | 目标标识     | {{$event.TargetIdent}} |
| TargetNote  | string | 目标备注     | {{$event.TargetNote}}  |

通知相关字段

| 字段名            | 类型     | 描述           | 模板引用方式                 |
| ---------------- | -------- | -------------- | --------------------------- |
| NotifyRecovered  | int      | 是否通知恢复    | {{$event.NotifyRecovered}}   |
| NotifyChannelsJSON| []string | 通知渠道列表    | {{$event.NotifyChannelsJSON}}|
| NotifyGroupsJSON | []string | 通知组列表      | {{$event.NotifyGroupsJSON}}  |
| NotifyRuleIDs   | []int64  | 通知规则ID列表  | {{$event.NotifyRuleIDs}}     |

回调与扩展信息

| 字段名           | 类型                | 描述           | 模板引用方式               |
| --------------- | ------------------- | -------------- | ------------------------- |
| CallbacksJSON   | []string           | 回调URL列表     | {{$event.CallbacksJSON}}   |
| ExtraConfig     | interface{}        | 额外配置信息     | {{$event.ExtraConfig}}     |
| ExtraInfo       | []string           | 额外信息列表     | {{$event.ExtraInfo}}      |
| ExtraInfoMap    | []map[string]string| 额外信息映射     | {{$event.ExtraInfoMap}}    |

触发值相关

| 字段名           | 类型   | 描述           | 模板引用方式                 |
| --------------- | ------ | -------------- | --------------------------- |
| TriggerValues   | string | 触发值(原始格式) | {{$event.TriggerValues}}    |
| IsRecovered     | bool   | 是否已恢复      | {{$event.IsRecovered}}      |

## 模板示例
### 基础模板示例
```toml
级别状态: S{{$event.Severity}} {{if $event.IsRecovered}}Recovered{{else}}Triggered{{end}}   
规则名称: {{$event.RuleName}}{{if $event.RuleNote}}   
规则备注: {{$event.RuleNote}}{{end}}   
监控指标: {{$event.TagsJSON}}
{{if $event.IsRecovered}}恢复时间：{{timeformat $event.LastEvalTime}}{{else}}触发时间: {{timeformat $event.TriggerTime}}
触发时值: {{$event.TriggerValue}}{{end}}
发送时间: {{timestamp}}
{{$domain := "http://请联系管理员修改通知模板将域名替换为实际的域名" }}   
事件详情: {{$domain}}/alert-his-events/{{$event.Id}}
屏蔽1小时: {{$domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
```

## 模板常用语法介绍

### 条件判断

```
{{if eq $event.Severity 1}}
- 告警级别: 紧急
{{else if eq $event.Severity 2}}
- 告警级别: 警告
{{end}}
``` 

### 循环

```
{{range $i, $tag := $event.TagsJSON}}  
- {{$tag}}
{{end}}
``` 

### 变量赋值

```
{{$var := $event.TriggerValue}}
```     

### 函数调用

```
{{timeformat $event.LastEvalTime}}
```     
目前支持的模板函数，除了 go 内置的之外，额外支持的函数见 [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14)
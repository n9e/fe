模板使用 Go template 语法，可以引用告警事件(AlertCurEvent)的各个字段进行个性化消息配置。模板支持条件判断、循环、变量赋值等丰富功能。

## 可用字段说明

以下是可在模板中使用的 AlertCurEvent 主要字段：

基本信息字段

| 字段名       | 类型   | 描述                     |
| ------------ | ------ | ------------------------ |
| Id           | int64  | 告警事件 ID              |
| Cate         | string | 告警类别，如"prometheus" |
| Cluster      | string | 集群名称                 |
| DatasourceId | int64  | 数据源 ID                |
| GroupId      | int64  | 业务组 ID                |
| GroupName    | string | 业务组名称               |
| Hash         | string | 告警唯一标识             |
| RuleId       | int64  | 规则 ID                  |
| RuleName     | string | 规则名称                 |
| RuleNote     | string | 规则备注                 |
| RuleProd     | string | 规则产品类型             |
| RuleAlgo     | string | 规则算法                 |
| Severity     | int    | 告警级别(1-3)            |
| PromQl       | string | 告警查询语句             |

触发相关字段

| 字段名           | 类型   | 描述         |
| ---------------- | ------ | ------------ |
| TriggerTime      | int64  | 触发时间戳   |
| TriggerValue     | string | 触发值       |
| FirstTriggerTime | int64  | 首次触发时间 |
| NotifyCurNumber  | int    | 当前通知次数 |
| LastEvalTime     | int64  | 最近评估时间 |
| LastSentTime     | int64  | 最近发送时间 |

标签和注释

| 字段名          | 类型              | 描述           |
| --------------- | ----------------- | -------------- |
| TagsJSON        | []string          | 标签数组       |
| TagsMap         | map[string]string | 标签键值对映射 |
| AnnotationsJSON | map[string]string | 注释键值对映射 |

目标信息

| 字段名      | 类型   | 描述         |
| ----------- | ------ | ------------ |
| TargetIdent | string | 目标标识     |
| TargetNote  | string | 目标备注     |
| RunbookUrl  | string | 操作手册 URL |

模板示例
基础模板示例

```
## 【{{.Severity | severityString}}】{{.RuleName}}

- 告警级别: {{.Severity | severityString}}
- 规则名称: {{.RuleName}}
- 触发时间: {{.TriggerTime | unixTimeFormat}}
- 触发值: {{.TriggerValue}}
- 业务组: {{.GroupName}}
- 设备备注: {{.TargetNote}}
- 标签信息:
{{range $i, $tag := .TagsJSON}}  - {{$tag}}
{{end}}
```

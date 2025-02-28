Templates use [Go template syntax](https://pkg.go.dev/text/template), allowing you to reference various fields of alert events (AlertCurEvent) for personalized message configuration. Templates support rich features such as conditional statements, loops, variable assignments, and more.

## Available Field Descriptions

Below are the main fields of AlertCurEvent that can be used in templates:

Basic Information Fields

| Field Name      | Type   | Description                      | Template Reference Method   |
| --------------- | ------ | -------------------------------- | --------------------------- |
| Id              | int64  | Alert event ID                   | {{$event.Id}}              |
| Cate            | string | Alert category, e.g. "prometheus"| {{$event.Cate}}            |
| Cluster         | string | Data source name                 | {{$event.Cluster}}         |
| DatasourceId    | int64  | Data source ID                   | {{$event.DatasourceId}}    |
| GroupId         | int64  | Business group ID                | {{$event.GroupId}}         |
| GroupName       | string | Business group name              | {{$event.GroupName}}       |
| Hash            | string | Alert event hash                 | {{$event.Hash}}            |
| RuleId          | int64  | Rule ID                          | {{$event.RuleId}}          |
| RuleName        | string | Rule name                        | {{$event.RuleName}}        |
| RuleNote        | string | Rule note                        | {{$event.RuleNote}}        |
| Severity        | int    | Alert level (1-3)                | {{$event.Severity}}        |
| PromQl          | string | Alert query statement            | {{$event.PromQl}}          |
| PromForDuration | int    | Duration (seconds)               | {{$event.PromForDuration}} |
| PromEvalInterval| int    | Evaluation interval (seconds)    | {{$event.PromEvalInterval}}|
| Status          | int    | Alert status                     | {{$event.Status}}          |
| SubRuleId       | int64  | Subscription rule ID             | {{$event.SubRuleId}}       |
| NotifyRuleIDs   | []int64| Notification rule ID list        | {{$event.NotifyRuleIDs}}   |
| RuleHash        | string | Rule hash value                  | {{$event.RuleHash}}        |

Trigger-related Fields

| Field Name       | Type   | Description              | Template Reference Method     |
| ---------------- | ------ | ------------------------ | ----------------------------- |
| TriggerTime      | int64  | Trigger timestamp        | {{$event.TriggerTime}}       |
| TriggerValue     | string | Trigger value            | {{$event.TriggerValue}}      |
| FirstTriggerTime | int64  | First trigger time       | {{$event.FirstTriggerTime}}  |
| NotifyCurNumber  | int    | Current notification count| {{$event.NotifyCurNumber}}  |
| LastEvalTime     | int64  | Last evaluation time     | {{$event.LastEvalTime}}      |
| LastSentTime     | int64  | Last sent time           | {{$event.LastSentTime}}      |

Tags and Annotations

| Field Name      | Type              | Description           | Template Reference Method    |
| --------------- | ----------------- | --------------------- | ---------------------------- |
| TagsJSON        | []string          | Tag array             | {{$event.TagsJSON}}         |
| TagsMap         | map[string]string | Tag key-value mapping | {{$event.TagsMap}}          |
| AnnotationsJSON | map[string]string | Annotation key-value mapping | {{$event.AnnotationsJSON}} |

Machine-related Field Information

| Field Name   | Type   | Description      | Template Reference Method    |   
| ------------ | ------ | ---------------- | ---------------------------- |
| TargetIdent  | string | Target identifier| {{$event.TargetIdent}}      |
| TargetNote   | string | Target note      | {{$event.TargetNote}}       |

Notification-related Fields

| Field Name         | Type     | Description                | Template Reference Method      |
| ------------------ | -------- | -------------------------- | ------------------------------ |
| NotifyRecovered    | int      | Whether to notify recovery | {{$event.NotifyRecovered}}    |
| NotifyChannelsJSON | []string | Notification channel list  | {{$event.NotifyChannelsJSON}} |
| NotifyGroupsJSON   | []string | Notification group list    | {{$event.NotifyGroupsJSON}}   |
| NotifyRuleIDs      | []int64  | Notification rule ID list  | {{$event.NotifyRuleIDs}}      |

Callback and Extension Information

| Field Name      | Type                | Description              | Template Reference Method    |
| --------------- | ------------------- | ------------------------ | ---------------------------- |
| CallbacksJSON   | []string            | Callback URL list        | {{$event.CallbacksJSON}}    |
| ExtraConfig     | interface{}         | Additional configuration | {{$event.ExtraConfig}}      |
| ExtraInfo       | []string            | Additional info list     | {{$event.ExtraInfo}}        |
| ExtraInfoMap    | []map[string]string | Additional info mapping  | {{$event.ExtraInfoMap}}     |

Trigger Value Related

| Field Name     | Type   | Description                | Template Reference Method     |
| -------------- | ------ | -------------------------- | ----------------------------- |
| TriggerValues  | string | Trigger value (raw format) | {{$event.TriggerValues}}     |
| IsRecovered    | bool   | Whether recovered          | {{$event.IsRecovered}}       |

## Template Examples
### Basic Template Example
```toml
Level Status: S{{$event.Severity}} {{if $event.IsRecovered}}Recovered{{else}}Triggered{{end}}   
Rule Name: {{$event.RuleName}}{{if $event.RuleNote}}   
Rule Note: {{$event.RuleNote}}{{end}}   
Metrics: {{$event.TagsJSON}}
{{if $event.IsRecovered}}Recovery Time: {{timeformat $event.LastEvalTime}}{{else}}Trigger Time: {{timeformat $event.TriggerTime}}
Trigger Value: {{$event.TriggerValue}}{{end}}
Send Time: {{timestamp}}
{{$domain := "http://Please contact the administrator to modify the notification template and replace the domain with the actual domain" }}   
Event Details: {{$domain}}/alert-his-events/{{$event.Id}}
Silence for 1 hour: {{$domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
```

## Common Template Syntax Introduction
### Conditional Statements
```plaintext
{{if eq $event.Severity 1}}
- Alert Level: Critical
{{else if eq $event.Severity 2}}
- Alert Level: Warning
{{end}}
 ```

### Loops
```plaintext
{{range $i, $tag := $event.TagsJSON}}  
- {{$tag}}
{{end}}
 ```

### Variable Assignment
```plaintext
{{$var := $event.TriggerValue}}
 ```

### Function Calls
```plaintext
{{timeformat $event.LastEvalTime}}
 ```

Currently supported template functions, in addition to Go built-ins, additional supported functions can be found in [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14)
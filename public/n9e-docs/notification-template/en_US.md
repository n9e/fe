Templates use [Go template syntax](https://pkg.go.dev/text/template), allowing you to reference various fields of alert events (AlertCurEvent) for personalized message configuration. Templates support rich features such as conditional statements, loops, variable assignments, and more.

## Template Field Identifiers
The field identifiers in message templates are used when configuring corresponding message channels. When creating message templates, it's important to note that the field identifiers used must match those in the corresponding notification channel.

For example, with DingTalk message templates, the template is used in the body configuration of the DingTalk notification channel:
```
{"msgtype": "markdown", "markdown": {"title": "{{$tpl.title}}", "text": "{{$tpl.content}}}, "at": {"atMobiles": []}}
```
In the DingTalk notification channel, the reference methods are: `{{$tpl.title}}` and `{{$tpl.content}}`. Therefore, for message templates using DingTalk as the notification channel, the field identifiers must use `title` and `content`.

Other message templates work similarly. You can create corresponding field identifiers based on which fields are needed in the notification channel.

## Template Example
Below is a simple template example that can send basic alert event information when an alert event is triggered.
```toml
Level Status: S{{$event.Severity}} {{if $event.IsRecovered}}Recovered{{else}}Triggered{{end}}   
Rule Name: {{$event.RuleName}}{{if $event.RuleNote}}   
Rule Note: {{$event.RuleNote}}{{end}}   
Metrics: {{$event.TagsJSON}}
{{if $event.IsRecovered}}Recovery Time: {{timeformat $event.LastEvalTime}}{{else}}Trigger Time: {{timeformat $event.TriggerTime}}
Trigger Value: {{$event.TriggerValue}}{{end}}
Send Time: {{timestamp}}
{{$domain := "http://n9e-domain" }}   
Event Details: {{$domain}}/alert-his-events/{{$event.Id}}
```

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
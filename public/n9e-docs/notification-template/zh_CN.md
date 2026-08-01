模板使用 [Go template 语法](https://pkg.go.dev/text/template)，可以引用告警事件(AlertCurEvent)的各个字段进行个性化消息配置。模板支持条件判断、循环、变量赋值等丰富功能。

## 模板字段标识
消息模板的字段标识，在配置对应的消息媒介中会用到，所以在创建消息模板的时候，需要注意，使用的字段标识必须和对应通知媒介中可以匹配上。   

以钉钉消息模板举例，在钉钉通知媒介中，消息模板在 body 配置中有使用
```
{"msgtype": "markdown", "markdown": {"title": "{{$tpl.title}}", "text": "{{$tpl.content}}}, "at": {"atMobiles": []}}
```
在钉钉通知媒介中，引用方式为为：`{{$tpl.title}}` 和 `{{$tpl.content}}`。所以通知媒介为钉钉的消息模板，字段标识需要使用 `title` 和 `content`

其他的消息模板也类似，可以根据通知媒介中需要用到哪些字段，来创建对应的字段标识

## 模板示例
下面是一个简单的模板示例，可以在告警事件触发时，发送告警事件的基本信息。
```toml
级别状态: S{{$event.Severity}} {{if $event.IsRecovered}}Recovered{{else}}Triggered{{end}}   
规则名称: {{$event.RuleName}}{{if $event.RuleNote}}   
规则备注: {{$event.RuleNote}}{{end}}   
监控指标: {{$event.TagsJSON}}
{{if $event.IsRecovered}}恢复时间：{{timeformat $event.LastEvalTime}}{{else}}触发时间: {{timeformat $event.TriggerTime}}
触发时值: {{$event.TriggerValue}}{{end}}
发送时间: {{timestamp}}
{{$domain := "http://n9e-domain" }}   
事件详情: {{$domain}}/alert-his-events/{{$event.Id}}
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
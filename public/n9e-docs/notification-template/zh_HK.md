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
{{$domain := "http://n9e-domain" }}   
事件詳情: {{$domain}}/alert-his-events/{{$event.Id}}
```


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
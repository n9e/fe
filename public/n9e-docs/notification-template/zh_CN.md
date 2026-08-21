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
事件详情: {{$.domain}}/alert-his-events/{{$event.Id}}
```
> `{{$.domain}}` 是站点地址，由系统按「站点设置」自动填充，不需要自己声明。
> 注意要写 `{{$.domain}}` 而不是 `{{.domain}}`：`$` 恒指向根数据，放在 `range` / `with` 内部同样成立。

## 模板常用语法介绍

### 内置变量

模板渲染前系统已预先声明了下面这些变量，可以直接使用：

| 变量 | 说明 |
| --- | --- |
| `$event` | 当前告警事件；多个事件聚合发送时为第一个事件 |
| `$events` | 本次通知包含的全部事件列表，`{{len $events}}` 取数量 |
| `$labels` | 等价于 `$event.TagsMap`，标签 map，`{{$labels.instance}}` 取某个标签 |
| `$value` | 等价于 `$event.TriggerValue`，触发时的值（字符串） |
| `$.domain` | 站点地址，见上文说明 |

### 条件判断

```
{{if eq $event.Severity 1}}
- 告警级别: 紧急
{{else if eq $event.Severity 2}}
- 告警级别: 警告
{{else}}
- 告警级别: 提醒
{{end}}
```

比较函数有 `eq`（等于）、`ne`（不等）、`lt`、`le`、`gt`、`ge`，逻辑组合用 `and`、`or`、`not`。`eq` 支持多个候选值，`{{if eq $event.Severity 1 2}}` 表示等于 1 或 2。

```
{{if and (not $event.IsRecovered) (ge $event.Severity 2)}}请尽快处理{{end}}
```

### 循环

```
{{range $i, $tag := $event.TagsJSON}}
- {{$tag}}
{{end}}

{{range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{end}}
```

### 变量赋值

```
{{$var := $event.TriggerValue}}
{{$duration := sub now.Unix $event.FirstTriggerTime}}
```

### 去除多余空白

`{{-` 会吃掉左侧的空白和换行，`-}}` 会吃掉右侧的，用来避免 `if` / `range` 产生多余空行：

```
{{- range $k, $v := $labels}}
{{$k}}={{$v}}
{{- end}}
```

### 注释

```
{{/* 这里是注释，不会输出 */}}
```

## 模板函数速查

函数调用写法是「函数名 参数1 参数2 ...」，参数之间用空格分隔。需要把一个函数的结果作为另一个函数的参数时，用括号包起来；也可以用管道 `|` 把前一步的结果作为最后一个参数传入：

```
{{humanize $event.TriggerValue}}
{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}
{{$event.RuleName | toUpper}}
```

下面示例中 `→` 右侧是输出结果。

### 时间

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| `timeformat` | 把 unix 秒级时间戳格式化为时间字符串。第二个参数可选，为 Go 时间布局，默认 `2006-01-02 15:04:05` | `{{timeformat $event.TriggerTime}}` → `2026-08-21 10:30:00`；`{{timeformat $event.TriggerTime "01-02 15:04"}}` → `08-21 10:30` |
| `timestamp` | 当前时间（发送时刻），参数同上 | `{{timestamp}}` → `2026-08-21 10:30:05`；`{{timestamp "2006/01/02"}}` → `2026/08/21` |
| `now` | 当前时间对象，可继续调用 `.Unix`、`.Format` 等方法 | `{{now.Unix}}` → `1787200205`；`{{now.Format "15:04"}}` → `10:30` |
| `humanizeDuration` | 把秒数（字符串）转成易读时长 | `{{humanizeDuration "3725"}}` → `1h 2m 5s` |
| `humanizeDurationInterface` | 同上，但接受数字，常与 `sub` 配合算持续时长 | `{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}` → `2h 15m 30s` |
| `parseDuration` | 把 `1h30m` 这类时长字符串转成秒数 | `{{parseDuration "1h30m"}}` → `5400` |

Go 时间布局用固定的参考时间 `2006-01-02 15:04:05` 表示格式，例如 `2006年01月02日`、`15:04:05`、`Jan 2, 2006`。

### 数值格式化

这组函数的入参是字符串，`$event.TriggerValue` 本身就是字符串可以直接传；数字类型的值先用 `toString` 转一下。入参不是合法数字时原样返回。

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| `humanize` | 按 1000 进位加 k / M / G 等单位，保留两位小数 | `{{humanize "1234567"}}` → `1.23M`；`{{humanize "0.00123"}}` → `1.23m` |
| `humanize1024` | 按 1024 进位加 ki / Mi / Gi 等单位，适合字节数 | `{{humanize1024 "1073741824"}}` → `1Gi`；`{{humanize1024 "1536"}}` → `1.5ki` |
| `humanizePercentage` | 把 0~1 的比例转成百分比 | `{{humanizePercentage "0.8567"}}` → `85.67%` |
| `humanizePercentageH` | 值已经是百分数时只补 `%` 并保留两位小数 | `{{humanizePercentageH "85.6789"}}` → `85.68%` |
| `formatDecimal` | 保留指定位数小数 | `{{formatDecimal $event.TriggerValue 2}}` → `93.46` |
| `printf` | 按 Go 格式串格式化一个值。数字字符串会先转成浮点数；带单位的（如 `85%`）原样返回 | `{{printf "%.1f" $event.TriggerValue}}` → `93.5` |
| `toString` | 把任意值转成字符串，便于传给只接受字符串的函数 | `{{humanize (toString 1234567)}}` → `1.23M` |

注意：这里的 `printf` 覆盖了 Go 内置版本，只用来格式化数字：只接受「格式串 + 一个值」，不支持 `printf "%s-%s" a b` 这种多参数写法；数字字符串会先被转成浮点数，所以 `printf "%s" "1"` 会输出 `%!s(float64=1)`。字符串拼接直接把表达式并排写即可，例如 `S{{$event.Severity}}-{{$event.RuleName}}`。

### 数学运算

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| `add` | 加 | `{{add 1 2}}` → `3`；`{{add $i 1}}` 常用于循环里把下标从 1 开始编号 |
| `sub` | 减 | `{{sub now.Unix $event.FirstTriggerTime}}` → `8130`（已持续秒数） |
| `mul` | 乘 | `{{mul $event.Severity 10}}` → `20` |
| `div` | 除。两个整数相除会取整，想要小数至少一个参数写成小数 | `{{div 7 2}}` → `3`；`{{div 7.0 2}}` → `3.5` |

### 字符串

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| `toUpper` / `toLower` | 转大写 / 小写 | `{{toUpper "cpu"}}` → `CPU` |
| `title` | 每个单词首字母大写 | `{{title "disk usage high"}}` → `Disk Usage High` |
| `contains` | 判断是否包含子串，参数顺序是（原串, 子串） | `{{if contains $event.RuleName "CPU"}}CPU 相关{{end}}` |
| `match` | 正则匹配，参数顺序是（正则, 原串） | `{{if match "^prod-" $event.TargetIdent}}生产环境{{end}}` |
| `reReplaceAll` | 正则替换，参数顺序是（正则, 替换值, 原串）。正则里的 `\` 要写成 `\\` | `{{reReplaceAll ":\\d+$" "" "10.0.0.1:9100"}}` → `10.0.0.1` |
| `split` | 按分隔符切分成列表 | `{{index (split $labels.instance ":") 0}}` → `10.0.0.1` |
| `join` | 把列表用分隔符拼接 | `{{join $event.TagsJSON ", "}}` → `instance=10.0.0.1:9100, job=node` |
| `stripPort` | 去掉 `host:port` 里的端口 | `{{stripPort "10.0.0.1:9100"}}` → `10.0.0.1` |
| `stripDomain` | 去掉主机名里的域名部分，保留端口 | `{{stripDomain "web01.example.com:80"}}` → `web01:80` |
| `ats` | 把逗号或空格分隔的名单转成 @ 列表 | `{{ats "zhangsan,lisi"}}` → `@zhangsan @lisi` |
| `b64enc` / `b64dec` | base64 编码 / 解码 | `{{b64enc "abc"}}` → `YWJj` |

### 标签、列表与 JSON

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| `index` | 按 key 或下标取值。标签名含 `-`、`.` 等特殊字符时不能写 `$labels.xxx`，只能用 `index` | `{{index $labels "service-name"}}`；`{{index $events 0}}` |
| `len` | 取长度 | `{{len $events}}` → `3` |
| `jsonMarshal` | 序列化为 JSON 字符串 | `{{jsonMarshal $event.TagsMap}}` → `{"instance":"10.0.0.1:9100","job":"node"}` |
| `tagsMapToStr` | 把标签 map 转成 `k=v,k=v`，按 key 排序 | `{{tagsMapToStr $event.TagsMap}}` → `instance=10.0.0.1:9100,job=node` |

### 转义与 URL

除邮件以外的通知媒介，消息模板都按 html/template 渲染，`<`、`>`、`&`、`"` 等字符会被转义成 `&lt;` 之类；渲染结果再嵌入通知媒介的 JSON body 时，系统会自动把 `"` 和换行转义成 `\"`、`\n`，模板里不需要自己处理。

| 函数 | 说明 | 示例 |
| --- | --- | --- |
| `unescaped` / `safeHtml` | 把字符串标记为可信内容，原样输出不做 HTML 转义。输出 HTML 片段或含 `&` 的链接时用它 | `{{unescaped "<b>紧急</b>"}}` → `<b>紧急</b>`；`{{unescaped $event.AnnotationsJSON.runbook_url}}` → 链接里的 `&` 不会变成 `&amp;` |
| `urlconvert` | 把字符串标记为可信 URL，只在 HTML 的 `href` / `src` 属性里有意义，可跳过 html/template 对 URL 的安全检查 | `<a href="{{urlconvert $event.AnnotationsJSON.runbook_url}}">Runbook</a>` |
| `escape` | URL 路径片段转义，把值拼进 URL 路径时使用 | `{{escape "a b/c"}}` → `a%20b%2Fc` |

### 常用组合示例

```
{{/* 告警已持续时长 */}}
持续时长: {{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}

{{/* 触发值按百分比展示，保留两位小数 */}}
当前值: {{humanizePercentageH $event.TriggerValue}}

{{/* 只展示关心的标签，去掉端口只留 IP */}}
主机: {{stripPort $labels.instance}}  服务: {{index $labels "service-name"}}

{{/* 按主机名前缀判断环境 */}}
环境: {{if match "^prod-" $event.TargetIdent}}生产{{else}}测试{{end}}

{{/* 遍历标签逐行输出 */}}
{{- range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{- end}}

{{/* 多事件聚合发送时列出全部规则 */}}
共 {{len $events}} 条告警：
{{- range $i, $e := $events}}
{{add $i 1}}. {{$e.RuleName}}（{{timeformat $e.TriggerTime "15:04"}}）
{{- end}}
```

以上只列出了常用函数，完整列表见 [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14)；Go 模板自身的语法和内置函数见 [text/template](https://pkg.go.dev/text/template)。

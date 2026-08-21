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
Event Details: {{$.domain}}/alert-his-events/{{$event.Id}}
```
> `{{$.domain}}` is the site URL. It is filled in automatically from the site settings, so you do not need to declare it yourself.
> Write `{{$.domain}}` rather than `{{.domain}}`: `$` always refers to the root data, so it also works inside `range` / `with`.

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
Event Details: {{$.domain}}/alert-his-events/{{$event.Id}}
Silence for 1 hour: {{$.domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
```

## Common Template Syntax

### Built-in variables

The following variables are declared before the template is rendered and can be used directly:

| Variable | Description |
| --- | --- |
| `$event` | The current alert event; when several events are sent together, this is the first one |
| `$events` | All events included in this notification; `{{len $events}}` gives the count |
| `$labels` | Same as `$event.TagsMap`, the label map; `{{$labels.instance}}` reads one label |
| `$value` | Same as `$event.TriggerValue`, the value at trigger time (a string) |
| `$.domain` | The site URL, see above |

### Conditionals

```
{{if eq $event.Severity 1}}
- Level: Critical
{{else if eq $event.Severity 2}}
- Level: Warning
{{else}}
- Level: Info
{{end}}
```

Comparison functions are `eq` (equal), `ne` (not equal), `lt`, `le`, `gt`, `ge`; combine them with `and`, `or`, `not`. `eq` accepts several candidates: `{{if eq $event.Severity 1 2}}` means "equals 1 or 2".

```
{{if and (not $event.IsRecovered) (ge $event.Severity 2)}}Please handle ASAP{{end}}
```

### Loops

```
{{range $i, $tag := $event.TagsJSON}}
- {{$tag}}
{{end}}

{{range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{end}}
```

### Variable assignment

```
{{$var := $event.TriggerValue}}
{{$duration := sub now.Unix $event.FirstTriggerTime}}
```

### Trimming whitespace

`{{-` removes whitespace and line breaks on the left, `-}}` on the right. Use them to avoid blank lines produced by `if` / `range`:

```
{{- range $k, $v := $labels}}
{{$k}}={{$v}}
{{- end}}
```

### Comments

```
{{/* This is a comment and produces no output */}}
```

## Template Function Reference

Call a function as `name arg1 arg2 ...`, separating arguments with spaces. Wrap a call in parentheses to pass its result as an argument to another function, or use a pipe `|` to pass the previous result as the last argument:

```
{{humanize $event.TriggerValue}}
{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}
{{$event.RuleName | toUpper}}
```

In the examples below, the text after `→` is the output.

### Time

| Function | Description | Example |
| --- | --- | --- |
| `timeformat` | Formats a unix timestamp (seconds) as a time string. The optional second argument is a Go time layout, default `2006-01-02 15:04:05` | `{{timeformat $event.TriggerTime}}` → `2026-08-21 10:30:00`; `{{timeformat $event.TriggerTime "01-02 15:04"}}` → `08-21 10:30` |
| `timestamp` | The current time (when the message is sent); same optional layout argument | `{{timestamp}}` → `2026-08-21 10:30:05`; `{{timestamp "2006/01/02"}}` → `2026/08/21` |
| `now` | The current time object; you can call `.Unix`, `.Format` and other methods on it | `{{now.Unix}}` → `1787200205`; `{{now.Format "15:04"}}` → `10:30` |
| `humanizeDuration` | Converts seconds (as a string) to a readable duration | `{{humanizeDuration "3725"}}` → `1h 2m 5s` |
| `humanizeDurationInterface` | Same, but accepts a number; usually combined with `sub` to compute how long an alert has lasted | `{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}` → `2h 15m 30s` |
| `parseDuration` | Converts a duration string such as `1h30m` to seconds | `{{parseDuration "1h30m"}}` → `5400` |

Go time layouts describe the format using the fixed reference time `2006-01-02 15:04:05`, e.g. `2006/01/02`, `15:04:05`, `Jan 2, 2006`.

### Number formatting

These functions take a string. `$event.TriggerValue` is already a string and can be passed directly; convert numeric values with `toString` first. If the input is not a valid number it is returned unchanged.

| Function | Description | Example |
| --- | --- | --- |
| `humanize` | Adds k / M / G units in steps of 1000, keeping two decimals | `{{humanize "1234567"}}` → `1.23M`; `{{humanize "0.00123"}}` → `1.23m` |
| `humanize1024` | Adds ki / Mi / Gi units in steps of 1024, suited to byte counts | `{{humanize1024 "1073741824"}}` → `1Gi`; `{{humanize1024 "1536"}}` → `1.5ki` |
| `humanizePercentage` | Converts a 0–1 ratio to a percentage | `{{humanizePercentage "0.8567"}}` → `85.67%` |
| `humanizePercentageH` | For values that are already percentages: appends `%` and keeps two decimals | `{{humanizePercentageH "85.6789"}}` → `85.68%` |
| `formatDecimal` | Keeps the given number of decimals | `{{formatDecimal $event.TriggerValue 2}}` → `93.46` |
| `printf` | Formats one value with a Go format string. Numeric strings are converted to floats first; strings with a unit (such as `85%`) are returned unchanged | `{{printf "%.1f" $event.TriggerValue}}` → `93.5` |
| `toString` | Converts any value to a string so it can be passed to string-only functions | `{{humanize (toString 1234567)}}` → `1.23M` |

Note: this `printf` overrides the Go built-in and is meant for formatting numbers only. It accepts just "format + one value" (`printf "%s-%s" a b` with several arguments is not supported), and numeric strings are converted to floats first, so `printf "%s" "1"` outputs `%!s(float64=1)`. To concatenate strings just write the expressions next to each other, e.g. `S{{$event.Severity}}-{{$event.RuleName}}`.

### Arithmetic

| Function | Description | Example |
| --- | --- | --- |
| `add` | Addition | `{{add 1 2}}` → `3`; `{{add $i 1}}` is handy for 1-based numbering inside loops |
| `sub` | Subtraction | `{{sub now.Unix $event.FirstTriggerTime}}` → `8130` (seconds elapsed) |
| `mul` | Multiplication | `{{mul $event.Severity 10}}` → `20` |
| `div` | Division. Two integers divide to an integer; make at least one operand a decimal to get a fraction | `{{div 7 2}}` → `3`; `{{div 7.0 2}}` → `3.5` |

### Strings

| Function | Description | Example |
| --- | --- | --- |
| `toUpper` / `toLower` | Upper / lower case | `{{toUpper "cpu"}}` → `CPU` |
| `title` | Capitalizes the first letter of each word | `{{title "disk usage high"}}` → `Disk Usage High` |
| `contains` | Substring test; argument order is (string, substring) | `{{if contains $event.RuleName "CPU"}}CPU related{{end}}` |
| `match` | Regular-expression match; argument order is (pattern, string) | `{{if match "^prod-" $event.TargetIdent}}production{{end}}` |
| `reReplaceAll` | Regular-expression replace; argument order is (pattern, replacement, string). Write `\` in the pattern as `\\` | `{{reReplaceAll ":\\d+$" "" "10.0.0.1:9100"}}` → `10.0.0.1` |
| `split` | Splits into a list by separator | `{{index (split $labels.instance ":") 0}}` → `10.0.0.1` |
| `join` | Joins a list with a separator | `{{join $event.TagsJSON ", "}}` → `instance=10.0.0.1:9100, job=node` |
| `stripPort` | Removes the port from `host:port` | `{{stripPort "10.0.0.1:9100"}}` → `10.0.0.1` |
| `stripDomain` | Removes the domain part of a hostname, keeping the port | `{{stripDomain "web01.example.com:80"}}` → `web01:80` |
| `ats` | Turns a comma- or space-separated list of names into @-mentions | `{{ats "alice,bob"}}` → `@alice @bob` |
| `b64enc` / `b64dec` | Base64 encode / decode | `{{b64enc "abc"}}` → `YWJj` |

### Labels, lists and JSON

| Function | Description | Example |
| --- | --- | --- |
| `index` | Reads a value by key or position. Label names containing `-`, `.` or other special characters cannot be written as `$labels.xxx`; use `index` instead | `{{index $labels "service-name"}}`; `{{index $events 0}}` |
| `len` | Length | `{{len $events}}` → `3` |
| `jsonMarshal` | Serializes to a JSON string | `{{jsonMarshal $event.TagsMap}}` → `{"instance":"10.0.0.1:9100","job":"node"}` |
| `tagsMapToStr` | Converts a label map to `k=v,k=v`, sorted by key | `{{tagsMapToStr $event.TagsMap}}` → `instance=10.0.0.1:9100,job=node` |

### Escaping and URLs

For every channel except email, message templates are rendered with html/template, so `<`, `>`, `&`, `"` and similar characters are escaped to `&lt;` etc. When the rendered result is embedded in the channel's JSON body, the system automatically escapes `"` and line breaks to `\"` and `\n`; you do not need to handle that in the template.

| Function | Description | Example |
| --- | --- | --- |
| `unescaped` / `safeHtml` | Marks a string as trusted content so it is output as-is without HTML escaping. Use it for HTML fragments or links containing `&` | `{{unescaped "<b>Critical</b>"}}` → `<b>Critical</b>`; `{{unescaped $event.AnnotationsJSON.runbook_url}}` → the `&` in the link stays `&` instead of `&amp;` |
| `urlconvert` | Marks a string as a trusted URL. Only meaningful inside an HTML `href` / `src` attribute, where it skips html/template's URL safety checks | `<a href="{{urlconvert $event.AnnotationsJSON.runbook_url}}">Runbook</a>` |
| `escape` | URL path-segment escaping, for putting a value into a URL path | `{{escape "a b/c"}}` → `a%20b%2Fc` |

### Common snippets

```
{{/* How long the alert has lasted */}}
Duration: {{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}

{{/* Show the trigger value as a percentage with two decimals */}}
Current value: {{humanizePercentageH $event.TriggerValue}}

{{/* Show only the labels you care about; drop the port and keep the IP */}}
Host: {{stripPort $labels.instance}}  Service: {{index $labels "service-name"}}

{{/* Decide the environment from the hostname prefix */}}
Env: {{if match "^prod-" $event.TargetIdent}}production{{else}}staging{{end}}

{{/* Print every label on its own line */}}
{{- range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{- end}}

{{/* List every rule when several events are sent together */}}
{{len $events}} alerts in total:
{{- range $i, $e := $events}}
{{add $i 1}}. {{$e.RuleName}} ({{timeformat $e.TriggerTime "15:04"}})
{{- end}}
```

Only the commonly used functions are listed here; see [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14) for the full list, and [text/template](https://pkg.go.dev/text/template) for Go template syntax and built-in functions.

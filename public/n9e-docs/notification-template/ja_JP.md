テンプレートは [Go template 構文](https://pkg.go.dev/text/template) を使用し、アラートイベント(AlertCurEvent)の各フィールドを参照してパーソナライズされたメッセージを設定できます。テンプレートは条件判断、ループ、変数代入などの豊富な機能をサポートしています。

## テンプレートフィールド識別子
メッセージテンプレートのフィールド識別子は、対応するメッセージチャネルの設定で使用されます。そのため、メッセージテンプレートを作成する際は、使用するフィールド識別子が対応する通知チャネルと一致する必要があることに注意してください。

DingTalkメッセージテンプレートを例に挙げると、DingTalk通知チャネルでは、メッセージテンプレートはbody設定で使用されます：
```
{"msgtype": "markdown", "markdown": {"title": "{{$tpl.title}}", "text": "{{$tpl.content}}}, "at": {"atMobiles": []}}
```
DingTalk通知チャネルでは、参照方法は `{{$tpl.title}}` と `{{$tpl.content}}` です。したがって、DingTalkを通知チャネルとするメッセージテンプレートでは、フィールド識別子として `title` と `content` を使用する必要があります。

他のメッセージテンプレートも同様で、通知チャネルで必要なフィールドに基づいて、対応するフィールド識別子を作成できます。

## テンプレート例
以下は簡単なテンプレート例で、アラートイベントがトリガーされた時にアラートイベントの基本情報を送信できます。
```toml
レベル状態: S{{$event.Severity}} {{if $event.IsRecovered}}復旧済み{{else}}発生中{{end}}   
ルール名: {{$event.RuleName}}{{if $event.RuleNote}}   
ルール備考: {{$event.RuleNote}}{{end}}   
監視指標: {{$event.TagsJSON}}
{{if $event.IsRecovered}}復旧時間：{{timeformat $event.LastEvalTime}}{{else}}トリガー時間: {{timeformat $event.TriggerTime}}
トリガー値: {{$event.TriggerValue}}{{end}}
送信時間: {{timestamp}}
イベント詳細: {{$.domain}}/alert-his-events/{{$event.Id}}
```
> `{{$.domain}}` はサイト URL で、システムが「サイト設定」から自動的に埋め込みます。自分で宣言する必要はありません。
> `{{.domain}}` ではなく `{{$.domain}}` と書いてください。`$` は常にルートデータを指すため、`range` / `with` の内部でも同様に使えます。

## テンプレート例
### 基本テンプレート例
```toml
レベル状態: S{{$event.Severity}} {{if $event.IsRecovered}}復旧済み{{else}}発生中{{end}}   
ルール名: {{$event.RuleName}}{{if $event.RuleNote}}   
ルール備考: {{$event.RuleNote}}{{end}}   
監視指標: {{$event.TagsJSON}}
{{if $event.IsRecovered}}復旧時間：{{timeformat $event.LastEvalTime}}{{else}}トリガー時間: {{timeformat $event.TriggerTime}}
トリガー値: {{$event.TriggerValue}}{{end}}
送信時間: {{timestamp}}
イベント詳細: {{$.domain}}/alert-his-events/{{$event.Id}}
1時間ミュート: {{$.domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
```

## テンプレートの一般的な構文紹介
### 条件判断
```plaintext
{{if eq $event.Severity 1}}
- アラートレベル: 緊急
{{else if eq $event.Severity 2}}
- アラートレベル: 警告
{{end}}
 ```

### ループ
```plaintext
{{range $i, $tag := $event.TagsJSON}}  
- {{$tag}}
{{end}}
 ```

### 変数代入
```plaintext
{{$var := $event.TriggerValue}}
 ```

### 関数呼び出し
```plaintext
{{timeformat $event.LastEvalTime}}
 ```

現在サポートされているテンプレート関数は、Goの組み込み関数に加えて、追加でサポートされている関数は [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14) を参照してください
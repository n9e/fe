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

## テンプレートの一般的な構文

### 組み込み変数

テンプレートのレンダリング前に以下の変数が宣言済みで、そのまま使用できます：

| 変数 | 説明 |
| --- | --- |
| `$event` | 現在のアラートイベント。複数イベントをまとめて送信する場合は最初のイベント |
| `$events` | 今回の通知に含まれる全イベントのリスト。`{{len $events}}` で件数を取得 |
| `$labels` | `$event.TagsMap` と同じ。ラベルの map で、`{{$labels.instance}}` のように個別のラベルを取得 |
| `$value` | `$event.TriggerValue` と同じ。トリガー時の値（文字列） |
| `$.domain` | サイト URL。上記の説明を参照 |

### 条件判断

```
{{if eq $event.Severity 1}}
- アラートレベル: 緊急
{{else if eq $event.Severity 2}}
- アラートレベル: 警告
{{else}}
- アラートレベル: 通知
{{end}}
```

比較関数は `eq`（等しい）、`ne`（等しくない）、`lt`、`le`、`gt`、`ge`、論理結合は `and`、`or`、`not` です。`eq` は複数の候補を受け付け、`{{if eq $event.Severity 1 2}}` は「1 または 2 に等しい」を意味します。

```
{{if and (not $event.IsRecovered) (ge $event.Severity 2)}}至急対応してください{{end}}
```

### ループ

```
{{range $i, $tag := $event.TagsJSON}}
- {{$tag}}
{{end}}

{{range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{end}}
```

### 変数代入

```
{{$var := $event.TriggerValue}}
{{$duration := sub now.Unix $event.FirstTriggerTime}}
```

### 余分な空白の除去

`{{-` は左側の空白と改行を、`-}}` は右側のものを取り除きます。`if` / `range` による余分な空行を避けるのに使います：

```
{{- range $k, $v := $labels}}
{{$k}}={{$v}}
{{- end}}
```

### コメント

```
{{/* これはコメントで、出力されません */}}
```

## テンプレート関数リファレンス

関数は「関数名 引数1 引数2 ...」の形式で呼び出し、引数はスペースで区切ります。ある関数の結果を別の関数の引数に渡すには括弧で囲みます。パイプ `|` で前の結果を最後の引数として渡すこともできます：

```
{{humanize $event.TriggerValue}}
{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}
{{$event.RuleName | toUpper}}
```

以下の例では `→` の右側が出力結果です。

### 時間

| 関数 | 説明 | 例 |
| --- | --- | --- |
| `timeformat` | unix 秒タイムスタンプを時刻文字列にフォーマットします。省略可能な第 2 引数は Go の時刻レイアウトで、デフォルトは `2006-01-02 15:04:05` | `{{timeformat $event.TriggerTime}}` → `2026-08-21 10:30:00`；`{{timeformat $event.TriggerTime "01-02 15:04"}}` → `08-21 10:30` |
| `timestamp` | 現在時刻（送信時刻）。引数は同上 | `{{timestamp}}` → `2026-08-21 10:30:05`；`{{timestamp "2006/01/02"}}` → `2026/08/21` |
| `now` | 現在時刻のオブジェクト。`.Unix`、`.Format` などのメソッドを続けて呼べます | `{{now.Unix}}` → `1787200205`；`{{now.Format "15:04"}}` → `10:30` |
| `humanizeDuration` | 秒数（文字列）を読みやすい期間に変換 | `{{humanizeDuration "3725"}}` → `1h 2m 5s` |
| `humanizeDurationInterface` | 同上ですが数値を受け付けます。`sub` と組み合わせて継続時間を計算するのによく使います | `{{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}` → `2h 15m 30s` |
| `parseDuration` | `1h30m` のような期間文字列を秒数に変換 | `{{parseDuration "1h30m"}}` → `5400` |

Go の時刻レイアウトは固定の参照時刻 `2006-01-02 15:04:05` で書式を表します。例：`2006年01月02日`、`15:04:05`、`Jan 2, 2006`。

### 数値フォーマット

このグループの関数は文字列を受け取ります。`$event.TriggerValue` はもともと文字列なのでそのまま渡せます。数値型の値は先に `toString` で変換してください。入力が有効な数値でない場合はそのまま返します。

| 関数 | 説明 | 例 |
| --- | --- | --- |
| `humanize` | 1000 単位で k / M / G などの単位を付け、小数第 2 位まで保持 | `{{humanize "1234567"}}` → `1.23M`；`{{humanize "0.00123"}}` → `1.23m` |
| `humanize1024` | 1024 単位で ki / Mi / Gi などの単位を付けます。バイト数向け | `{{humanize1024 "1073741824"}}` → `1Gi`；`{{humanize1024 "1536"}}` → `1.5ki` |
| `humanizePercentage` | 0〜1 の比率をパーセントに変換 | `{{humanizePercentage "0.8567"}}` → `85.67%` |
| `humanizePercentageH` | 値がすでにパーセントの場合、`%` を付けて小数第 2 位まで保持 | `{{humanizePercentageH "85.6789"}}` → `85.68%` |
| `formatDecimal` | 指定した桁数の小数を保持 | `{{formatDecimal $event.TriggerValue 2}}` → `93.46` |
| `printf` | Go の書式文字列で 1 つの値をフォーマットします。数値文字列は先に浮動小数点に変換され、単位付き（`85%` など）はそのまま返します | `{{printf "%.1f" $event.TriggerValue}}` → `93.5` |
| `toString` | 任意の値を文字列に変換し、文字列のみを受け付ける関数に渡せるようにします | `{{humanize (toString 1234567)}}` → `1.23M` |

注意：この `printf` は Go 組み込み版を上書きしており、数値のフォーマット専用です。「書式文字列 + 値 1 つ」のみ受け付け（`printf "%s-%s" a b` のような複数引数は使えません）、数値文字列は先に浮動小数点に変換されるため `printf "%s" "1"` は `%!s(float64=1)` を出力します。文字列の連結は式を並べて書くだけで済みます。例：`S{{$event.Severity}}-{{$event.RuleName}}`。

### 算術演算

| 関数 | 説明 | 例 |
| --- | --- | --- |
| `add` | 加算 | `{{add 1 2}}` → `3`；`{{add $i 1}}` はループ内で 1 始まりの番号を振るのに便利 |
| `sub` | 減算 | `{{sub now.Unix $event.FirstTriggerTime}}` → `8130`（経過秒数） |
| `mul` | 乗算 | `{{mul $event.Severity 10}}` → `20` |
| `div` | 除算。整数同士は整数になります。小数が必要なら少なくとも一方を小数で書きます | `{{div 7 2}}` → `3`；`{{div 7.0 2}}` → `3.5` |

### 文字列

| 関数 | 説明 | 例 |
| --- | --- | --- |
| `toUpper` / `toLower` | 大文字 / 小文字に変換 | `{{toUpper "cpu"}}` → `CPU` |
| `title` | 各単語の先頭を大文字に | `{{title "disk usage high"}}` → `Disk Usage High` |
| `contains` | 部分文字列を含むか判定。引数の順序は（文字列, 部分文字列） | `{{if contains $event.RuleName "CPU"}}CPU 関連{{end}}` |
| `match` | 正規表現マッチ。引数の順序は（パターン, 文字列） | `{{if match "^prod-" $event.TargetIdent}}本番環境{{end}}` |
| `reReplaceAll` | 正規表現置換。引数の順序は（パターン, 置換値, 文字列）。パターン内の `\` は `\\` と書きます | `{{reReplaceAll ":\\d+$" "" "10.0.0.1:9100"}}` → `10.0.0.1` |
| `split` | 区切り文字でリストに分割 | `{{index (split $labels.instance ":") 0}}` → `10.0.0.1` |
| `join` | リストを区切り文字で結合 | `{{join $event.TagsJSON ", "}}` → `instance=10.0.0.1:9100, job=node` |
| `stripPort` | `host:port` からポートを除去 | `{{stripPort "10.0.0.1:9100"}}` → `10.0.0.1` |
| `stripDomain` | ホスト名のドメイン部分を除去し、ポートは保持 | `{{stripDomain "web01.example.com:80"}}` → `web01:80` |
| `ats` | カンマまたはスペース区切りの名前リストを @ メンションに変換 | `{{ats "alice,bob"}}` → `@alice @bob` |
| `b64enc` / `b64dec` | base64 エンコード / デコード | `{{b64enc "abc"}}` → `YWJj` |

### ラベル・リスト・JSON

| 関数 | 説明 | 例 |
| --- | --- | --- |
| `index` | キーまたは添字で値を取得。ラベル名に `-` や `.` などの特殊文字を含む場合は `$labels.xxx` と書けないため `index` を使います | `{{index $labels "service-name"}}`；`{{index $events 0}}` |
| `len` | 長さを取得 | `{{len $events}}` → `3` |
| `jsonMarshal` | JSON 文字列にシリアライズ | `{{jsonMarshal $event.TagsMap}}` → `{"instance":"10.0.0.1:9100","job":"node"}` |
| `tagsMapToStr` | ラベルの map を `k=v,k=v` に変換（キー順にソート） | `{{tagsMapToStr $event.TagsMap}}` → `instance=10.0.0.1:9100,job=node` |

### エスケープと URL

メール以外の通知チャネルでは、メッセージテンプレートは html/template でレンダリングされるため、`<`、`>`、`&`、`"` などは `&lt;` のようにエスケープされます。レンダリング結果を通知チャネルの JSON body に埋め込む際、システムが `"` と改行を自動的に `\"`、`\n` にエスケープするので、テンプレート側で対処する必要はありません。

| 関数 | 説明 | 例 |
| --- | --- | --- |
| `unescaped` / `safeHtml` | 文字列を信頼できる内容としてマークし、HTML エスケープせずそのまま出力します。HTML 断片や `&` を含むリンクを出力する際に使います | `{{unescaped "<b>緊急</b>"}}` → `<b>緊急</b>`；`{{unescaped $event.AnnotationsJSON.runbook_url}}` → リンク内の `&` が `&amp;` にならない |
| `urlconvert` | 文字列を信頼できる URL としてマークします。HTML の `href` / `src` 属性内でのみ意味があり、html/template の URL 安全チェックをスキップします | `<a href="{{urlconvert $event.AnnotationsJSON.runbook_url}}">Runbook</a>` |
| `escape` | URL パスセグメントのエスケープ。値を URL パスに組み込む際に使用 | `{{escape "a b/c"}}` → `a%20b%2Fc` |

### よく使う組み合わせ例

```
{{/* アラートの継続時間 */}}
継続時間: {{humanizeDurationInterface (sub now.Unix $event.FirstTriggerTime)}}

{{/* トリガー値をパーセントで表示し、小数第 2 位まで保持 */}}
現在値: {{humanizePercentageH $event.TriggerValue}}

{{/* 必要なラベルだけ表示。ポートを除去して IP のみ残す */}}
ホスト: {{stripPort $labels.instance}}  サービス: {{index $labels "service-name"}}

{{/* ホスト名の接頭辞で環境を判定 */}}
環境: {{if match "^prod-" $event.TargetIdent}}本番{{else}}検証{{end}}

{{/* ラベルを 1 行ずつ出力 */}}
{{- range $k, $v := $labels}}
- {{$k}}: {{$v}}
{{- end}}

{{/* 複数イベントをまとめて送信する際に全ルールを列挙 */}}
合計 {{len $events}} 件のアラート：
{{- range $i, $e := $events}}
{{add $i 1}}. {{$e.RuleName}}（{{timeformat $e.TriggerTime "15:04"}}）
{{- end}}
```

ここではよく使う関数のみ挙げています。完全な一覧は [tplx.go](https://github.com/ccfos/nightingale/blob/main/pkg/tplx/tplx.go#L14) を、Go テンプレート自体の構文と組み込み関数は [text/template](https://pkg.go.dev/text/template) を参照してください。

テンプレートは [Go template 構文](https://pkg.go.dev/text/template) を使用し、アラートイベント(AlertCurEvent)の各フィールドを参照してパーソナライズされたメッセージを設定できます。テンプレートは条件判断、ループ、変数代入などの豊富な機能をサポートしています。

## 利用可能なフィールドの説明

以下はテンプレートで使用できる AlertCurEvent の主要フィールドです：

基本情報フィールド

| フィールド名     | 型     | 説明                     | テンプレート参照方法        |
| --------------- | ------ | ------------------------ | ------------------------- |
| Id              | int64  | アラートイベント ID       | {{$event.Id}}            |
| Cate            | string | アラートカテゴリ（例："prometheus"） | {{$event.Cate}}          |
| Cluster         | string | データソース名            | {{$event.Cluster}}       |
| DatasourceId    | int64  | データソース ID           | {{$event.DatasourceId}}  |
| GroupId         | int64  | ビジネスグループ ID       | {{$event.GroupId}}       |
| GroupName       | string | ビジネスグループ名        | {{$event.GroupName}}     |
| Hash            | string | アラートイベントハッシュ   | {{$event.Hash}}          |
| RuleId          | int64  | ルール ID                | {{$event.RuleId}}        |
| RuleName        | string | ルール名                 | {{$event.RuleName}}      |
| RuleNote        | string | ルール備考               | {{$event.RuleNote}}      |
| Severity        | int    | アラートレベル(1-3)       | {{$event.Severity}}      |
| PromQl          | string | アラートクエリ文          | {{$event.PromQl}}        |
| PromForDuration | int    | 継続時間(秒)             | {{$event.PromForDuration}}  |
| PromEvalInterval| int    | 評価間隔(秒)             | {{$event.PromEvalInterval}} |
| Status          | int    | アラート状態              | {{$event.Status}}          |
| SubRuleId       | int64  | サブスクリプションルールID | {{$event.SubRuleId}}       |
| NotifyRuleIDs   | []int64  | 通知ルールIDリスト      | {{$event.NotifyRuleIDs}}     |
| RuleHash        | string | ルールハッシュ値          | {{$event.RuleHash}}        |

トリガー関連フィールド

| フィールド名      | 型     | 説明         | テンプレート参照方法        |
| ---------------- | ------ | ------------ | ------------------- |
| TriggerTime      | int64  | トリガータイムスタンプ | {{$event.TriggerTime}}            |
| TriggerValue     | string | トリガー値    | {{$event.TriggerValue}}          |
| FirstTriggerTime | int64  | 初回トリガー時間 | {{$event.FirstTriggerTime}}      |
| NotifyCurNumber  | int    | 現在の通知回数 | {{$event.NotifyCurNumber}}       |
| LastEvalTime     | int64  | 最新評価時間  | {{$event.LastEvalTime}}          |
| LastSentTime     | int64  | 最新送信時間  | {{$event.LastSentTime}}          |

タグと注釈

| フィールド名      | 型                | 説明           | テンプレート参照方法        |
| --------------- | ----------------- | -------------- | ------------------- |
| TagsJSON        | []string          | タグ配列        | {{$event.TagsJSON}}        |
| TagsMap         | map[string]string | タグキーバリューマッピング | {{$event.TagsMap}}         |
| AnnotationsJSON | map[string]string | 注釈キーバリューマッピング | {{$event.AnnotationsJSON}} |

マシン関連フィールド情報

| フィールド名   | 型     | 説明         | テンプレート参照方法        |   
| ----------- | ------ | ------------ | ------------------- |
| TargetIdent | string | ターゲット識別子 | {{$event.TargetIdent}} |
| TargetNote  | string | ターゲット備考  | {{$event.TargetNote}}  |

通知関連フィールド

| フィールド名        | 型       | 説明           | テンプレート参照方法                 |
| ---------------- | -------- | -------------- | --------------------------- |
| NotifyRecovered  | int      | 復旧通知するかどうか | {{$event.NotifyRecovered}}   |
| NotifyChannelsJSON| []string | 通知チャネルリスト | {{$event.NotifyChannelsJSON}}|
| NotifyGroupsJSON | []string | 通知グループリスト | {{$event.NotifyGroupsJSON}}  |
| NotifyRuleIDs   | []int64  | 通知ルールIDリスト | {{$event.NotifyRuleIDs}}     |

コールバックと拡張情報

| フィールド名      | 型                 | 説明           | テンプレート参照方法               |
| --------------- | ------------------- | -------------- | ------------------------- |
| CallbacksJSON   | []string           | コールバックURLリスト | {{$event.CallbacksJSON}}   |
| ExtraConfig     | interface{}        | 追加設定情報     | {{$event.ExtraConfig}}     |
| ExtraInfo       | []string           | 追加情報リスト    | {{$event.ExtraInfo}}      |
| ExtraInfoMap    | []map[string]string| 追加情報マッピング | {{$event.ExtraInfoMap}}    |

トリガー値関連

| フィールド名      | 型     | 説明           | テンプレート参照方法                 |
| --------------- | ------ | -------------- | --------------------------- |
| TriggerValues   | string | トリガー値(生フォーマット) | {{$event.TriggerValues}}    |
| IsRecovered     | bool   | 復旧したかどうか   | {{$event.IsRecovered}}      |

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
{{$domain := "http://管理者に連絡してテンプレートの通知ドメインを実際のドメインに変更してください" }}   
イベント詳細: {{$domain}}/alert-his-events/{{$event.Id}}
1時間ミュート: {{$domain}}/alert-mutes/add?busiGroup={{$event.GroupId}}&cate={{$event.Cate}}&datasource_ids={{$event.DatasourceId}}&prod={{$event.RuleProd}}{{range $key, $value := $event.TagsMap}}&tags={{$key}}%3D{{$value}}{{end}}`
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
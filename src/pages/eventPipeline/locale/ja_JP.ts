const ja_JP = {
  title: 'ワークフロー',
  title_add: 'イベントパイプラインの追加',
  title_edit: 'イベントパイプラインの編集',
  teams: '権限のあるチーム',
  teams_tip:
    'この設定を表示および変更できるチームメンバーを制限します。複数のチームを関連付けることができます<br />例：infra-teamに設定を付与すると、infra-teamのメンバーのみがこの設定にアクセスまたは調整できます。',
  basic_configuration: '基本設定',
  filter_enable: 'フィルター条件',
  label_filters: '適用ラベル',
  label_filters_tip:
    'イベント処理のタグ フィルタ条件を設定します。イベントは、ここでの設定に一致するタグが含まれている場合にのみ処理されます。 <br />例: service=mon と入力します。これは、イベントにラベル service=mon が含まれている場合にのみこの処理フローが開始されることを意味します。',
  attribute_filters: '適用属性',
  attribute_filters_tip:
    'イベント処理の属性フィルタ条件を設定します。イベントは、ここでの設定に一致する属性が含まれている場合にのみ処理されます。 <br />例: Business Group == DefaultBusiGroup と入力します。これは、イベントの「ビジネス グループ」属性が DefaultBusiGroup の場合にのみ、この処理フローが開始されることを意味します。',
  attribute_filters_value: '属性値',
  attribute_filters_options: {
    group_name: 'ビジネスグループ',
    cluster: 'データソース',
    is_recovered: '回復イベントですか？',
  },
  processor: {
    title: 'プロセッサー',
    add_btn: 'プロセッサーを追加',
    typ: 'タイプ',
    help_btn: '使用説明',
  },
  label_enrich: {
    label_source_type: {
      label: 'ラベルソース',
      options: {
        built_in_mapping: '組み込みマッピング',
      },
    },
    label_mapping_id: 'ラベルマッピング名',
    help: 'ソースラベルで指定されたラベルを使用してマッピングを照会し、「追加ラベル」設定に従って、マッピングから照会されたフィールドをアラームイベントに追加します',
    source_keys: {
      label: 'ソースラベル',
      text: 'マッピングのフィールド <strong>{{field}}</strong> は、イベントのラベルに対応しています',
      target_key_placeholder: 'ラベルキー',
      target_key_required: 'ラベルキーは空にできません',
    },
    append_keys: {
      label: '追加ラベル',
      source_key_placeholder: 'マッピングのフィールド',
      rename_key: 'ラベルキーを変更',
      target_key_placeholder: 'ラベルキー',
    },
  },
  test_modal: {
    title: {
      settings: 'アラームイベントを選択',
      result: 'イベントプレビュー',
    },
  },
  callback: {
    url: 'URL',
    advanced_settings: '詳細設定',
    basic_auth_user: 'ユーザー名',
    basic_auth_user_placeholder: 'ユーザー名を入力してください',
    basic_auth_pass: 'パスワード',
    basic_auth_pass_placeholder: 'パスワードを入力してください',
  },
  event_drop: {
    content: '判定ロジック',
    content_placeholder: '使用 go template 構文，如果最後表示為 true，將會將 event 在此環節丟棄',
  },
  ai_summary: {
    url_placeholder: 'APIサービスアドレスを入力してください',
    url_required: 'URLを入力してください',
    api_key_placeholder: 'APIキー',
    api_key_required: 'API Keyを入力してください',
    model_name: 'モデル名',
    model_name_placeholder: '例: deepseek-chat',
    model_name_required: 'モデル名を入力してください',
    prompt_template: 'プロンプトテンプレート',
    prompt_template_required: 'プロンプトテンプレートを入力してください',
    advanced_config: '高度な設定',
    custom_params: 'AIモデルパラメータ設定',
    custom_params_key_label: 'パラメータ名 (例: temperature)',
    custom_params_value_label: 'パラメータ値 (例: 0.7)',
    proxy_placeholder: '例: http://proxy.example.com:8080',
    timeout_placeholder: 'タイムアウト（秒）',
    timeout_required: 'タイムアウトを入力してください',
    url_tip: `- **説明**: AIサービスのAPIエンドポイントアドレス\n- **例**: \`https://api.deepseek.com/v1/chat/completions\``,
    api_key_tip: `- **説明**: AIサービスプロバイダーが提供するAPIキー\n- **取得方法**:\n  - OpenAI: OpenAI公式サイトで申請\n  - DeepSeek: DeepSeek公式サイトで登録して取得`,
    model_name_tip: `- **説明**: 使用するAIモデル名を指定\n- **一般的なモデル**:\n  - \`gpt-3.5-turbo\` (OpenAI)\n  - \`gpt-4\` (OpenAI)\n  - \`deepseek-chat\` (DeepSeek)`,
    prompt_template_tip: `プロンプトテンプレートはAI分析のコアです。{{$event}}でイベントの各フィールドを参照できます。イベントの詳細な構造は[アラート履歴テーブル](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v6/schema/alert_his_event/)を参照してください。まずはデフォルトテンプレートから始めてください。`,
    custom_params_tip: `- AIモデルパラメータ設定\n\nAIモデルの動作を細かく調整するために使用します：\n\n| パラメータ名 | 説明 | 推奨値 | 例 |\n|--------|------|--------|------|\n| temperature | 応答のランダム性を制御 | 0.3-0.7 | 0.7 |\n| max_tokens | 最大出力トークン数 | 200-500 | 300 |\n| top_p | サンプリング閾値 | 0.8-1.0 | 0.9 |\n\n**設定方法**:\n1. "Custom Params"横の + ボタンをクリック\n2. 「パラメータ名」欄にパラメータ名を入力（例: temperature）\n3. 「パラメータ値」欄に値を入力（例: 0.7）`,
    prompt_template_placeholder: `以下のアラームイベント情報を分析し、簡潔で明確な概要を提供してください：
アラートルール: {{$event.RuleName}}
重大度: {{$event.Severity}}
アラートステータス: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}
発生時刻: {{$event.TriggerTime}}
トリガー値: {{$event.TriggerValue}}
ルール説明: {{$event.RuleNote}}
タグ情報: {{$event.Tags}}
注釈情報: {{$event.Annotations}}

100語以内で要点をまとめた要約を記入してください：
1. どのシステム/サービスでどんな問題が発生したか
2. 問題の重大度
3. 予想される影響
4. 簡単な対応案
要約は簡潔で、運用担当者がアラート状況を素早く把握できるようにしてください。`,
  },
  script: {
    timeout: 'タイムアウト時間（ミリ秒）',
    timeout_tooltip: 'スクリプトの最大実行時間。この時間を超えるとスクリプトは終了します',
    timeout_placeholder: 'タイムアウト時間を入力してください',
    content: 'スクリプトの内容',
    content_tooltip: 'イベントを JSON オブジェクトとして標準出力に出力するようにスクリプトを記述します',
    content_placeholder: 'スクリプトの内容を入力してください',
    script_content: 'スクリプトの内容',
  },
  inhibit: {
    help: 'イベント抑制プロセッサー。あるアラートが送信された際、他のアラート通知を抑制し、通知数を減らします。よくあるシナリオとしては、同じアラートルールでP1レベルのアクティブ障害が存在する場合、P2やP3レベルのアラート通知を無視します。詳細は<a>使用文書</a>を参照してください',
    tip1: '<b>新しいアラート</b>が以下の条件を満たす場合',
    tip2: 'かつ',
    tip3: '秒以内に以下の条件を満たす<b>アクティブアラート</b>が存在する',
    tip4: 'かつ<b>新しいアラート</b>と<b>アクティブアラート</b>に以下の共通項目がある',
    tip5: '上記すべての条件を満たす場合、現在のアラートは抑制され、通知されません',
    duration_required: '抑制時間は必須です',
    duration_max: '抑制時間は600秒を超えてはいけません',
    match_label_keys: 'ラベル',
    match_label_keys_required: 'ラベルは必須です',
    match_attribute_keys: '属性',
    match_attribute_keys_required: '属性は必須です',
    keys_at_least_one_required: '少なくとも1つのラベルまたは属性が必要です',
    preview:
      'ルールプレビュー：「<b>新しいアラート：{{newAlertLabelsAttrs}}</b>」かつ過去「<b>{{duration}}秒</b>」以内に「<b>アクティブアラート：{{activeAlertLabelsAttrs}}</b>」が存在し、両者が「<b>{{matchLabelsAttrs}}</b>」で一致する場合、新しいアラートの通知を抑制します。',
    labels_filter: {
      label: 'ラベル',
      label_tip:
        'これらのラベル条件を満たすアラートイベントのみ抑制します。影響範囲を狭めるために使用します。未設定は制限なしを意味します。既存のラベルキーのドロップダウン選択（推奨）または手動入力が可能です',
      label_placeholder: 'app / cluster / alertname など、マッチングに使うラベルキーを入力または選択してください',
    },
    labels_filter_value_placeholder: 'マッチングに使うラベル値を手動入力または選択してください',
    attributes_filter: {
      label: '属性',
      label_tip: 'イベント属性で抑制範囲を限定します。同時にこれらの属性に一致するアラートのみ抑制されます。空欄の場合はすべてのアラートが対象です',
    },
    active_event_labels_filter: {
      label: 'ラベル',
      label_tip: `**アクティブアラートの範囲を限定するために使用**
- 未設定：ラベルによるフィルタリングを行いません
- 設定あり：ドロップダウンから既存のラベルキーを選択（推奨）または手動入力が可能。アクティブアラートがこれらのラベル条件をすべて満たす場合のみ、フィルタ対象となります。

例：service=mon と入力すると、イベントにラベル service=mon が含まれる場合のみ、後続の抑制ロジックに参加します。`,
    },
    active_event_attributes_filter: {
      label: '属性',
      label_tip: `**アクティブアラートの範囲を限定するために使用**
- 未設定：属性によるフィルタリングを行いません
- 設定あり：アクティブアラートがこれらの属性条件をすべて満たす場合のみ、フィルタ対象となります。

例：ビジネスグループ==DefaultBusiGroup と入力すると、アクティブイベントの「ビジネスグループ」属性が DefaultBusiGroup の場合のみ、後続のイベント抑制処理の対象となります`,
    },
  },
  inhibit_qd: {
    help: 'クエリ結果に基づくイベント抑制：アラートがトリガーされると、以下のデータクエリが実行されます。少なくとも1件のデータが返された場合、本アラートは抑制され（通知されません）。データがない場合は通常通り通知されます。詳細は<a>使用文書</a>を参照してください',
    t_1: 'かつ 以下の<b>データ</b>をクエリ',
  },
};

export default ja_JP;

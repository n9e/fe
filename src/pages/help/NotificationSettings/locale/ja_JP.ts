const ja_JP = {
  title: "通知設定",
  webhooks: {
    help_content:
      "コールバック機構、夜莺と他のシステムとの統合に使用されます。夜莺がアラートイベントを生成した後、各コールバックアドレスにプッシュします。夜莺がコールバックする際に使用する HTTP メソッドは POST です。HTTP リクエストボディにアラートイベントの内容を JSON フォーマットで置きます。イベントデータの構造については、[ここ](https://github.com/ccfos/nightingale/blob/main/models/alert_cur_event.go#L19)を参照してください。夜莺とネットワークが互通可能なマシン（例えば、その IP が 10.1.2.3 であると仮定）を探し、そこで nc を使用してポートを立ち上げることができます。例えば、`nc -k -l 4321` です。これで、`http://10.1.2.3:4321` をコールバックアドレスに設定し、アラートルールを作成し、トリガーが発生すると、夜莺がこのアドレスにコールバックします。すると、nc コマンドの出力に夜莺がコールバックしてきた詳細なデータフォーマットを見ることができます。",
    title: "コールバックアドレス",
    enable: "有効",
    note: "備考",
    url: "URL",
    timeout: "タイムアウト (単位: s)",
    basic_auth_user: "ユーザー名 (Basic Auth)",
    basic_auth_password: "パスワード (Basic Auth)",
    skip_verify: "SSL 検証をスキップ",
    add: "追加",
    help: "\n      すべての夜莺アラートイベントを別のプラットフォームに転送する場合は、ここでのグローバルコールバックアドレスを使用して実現できます。\n      <br />\n      <br />\n      通常、監視システムはデータの収集、保存、分析、アラートイベントの生成に集中し、アラートイベントの後の分配、降噪、認領、昇格、シフト、協力は、別の製品が解決します。このような製品は、イベント OnCall 類の製品と呼ばれ、OnCall 製品は SRE 理念を実践する会社で広く適用されています。\n      <br />\n      <br />\n      OnCall 製品は、Prometheus、Nightingale、Zabbix、ElastAlert、藍鲸、各種クラウド監視など、各種監視システムと接続できます。各監視システムは、WebHook の方法でアラートイベントを OnCall 中心にプッシュし、ユーザーは OnCall 中心で後の分配、降噪、処理を完了します。\n      <br />\n      <br />\n      OnCall 製品は、国外では最初に <a1>PagerDuty</a1> が、国内では最初に <a2>FlashDuty</a2> が推進されました。みなさんは無料で登録して試用できます。\n    ",
  },
  script: {
    title: "通知スクリプト",
    enable: "有効",
    timeout: "タイムアウト (単位: s)",
    type: ["スクリプトを使用", "パスを使用"],
    path: "ファイルパス",
    content: "スクリプト内容",
  },
  channels: {
    title: "通知メディア",
    name: "名前",
    ident: "識別子",
    ident_msg1:
      "識別子は、文字、数字、下線、ハイフンのみを含めることができます",
    ident_msg2: "識別子は既に存在します",
    hide: "非表示",
    add: "追加",
    add_title: "通知メディアを追加",
    edit_title: "通知メディアを編集",
    enabled: "有効",
  },
  contacts: {
    title: "連絡先",
    add_title: "連絡先を追加",
    edit_title: "連絡先を編集",
  },
  smtp: {
    title: "SMTP 設定",
    testMessage: "テストメールを送信しました。受信してください",
  },
  ibex: {
    title: "自愈設定",
  },
};

export default ja_JP;

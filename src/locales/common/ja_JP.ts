const ja_JP = {
  auth: {
    '403': 'このページにアクセスする権限がありません。管理者に連絡してください！',
    '404': 'アクセスしようとしたページは存在しません！',
    '404_btn': 'ホームに戻る',
  },
  business_group: 'ビジネスグループ',
  business_groups: 'ビジネスグループ',
  search_placeholder: '検索キーワードを入力してください',
  my_business_group: '私のビジネスグループ',
  all_business_group: 'すべてのビジネスグループ',
  not_grouped: 'グループ化されていません',
  nodata: 'データがありません',
  log_detail: 'ログの詳細',
  document_link: '使用説明',
  required: '必須項目',
  unit: '単位',
  page_help: '使用説明',
  and: 'および',
  yes: 'はい',
  no: 'いいえ',
  host: {
    tags: 'ユーザータグ',
    tags_tip: 'ユーザーがページで構成したタグは、このマシンが報告した時系列データに追加されます',
    host_tags: '報告されたタグ',
    host_tags_tip:
      'categraf global.labels で構成されたタグはここに表示され、このマシンが報告した時系列データに追加されます。この機能をサポートするには、categrafをv0.3.80以上にアップグレードする必要があります',
  },
  btn: {
    add: '新規',
    create: '作成',
    modify: '修正',
    delete: '削除',
    clone: 'クローン',
    detail: '詳細',
    execute: 'クエリ',
    export: 'エクスポート',
    import: 'インポート',
    save: '保存',
    ok: '確定',
    cancel: 'キャンセル',
    view: '表示',
    more: 'その他の操作',
    back: '戻る',
    edit: '編集',
    submit: '提出',
    operations: '操作',
    testAndSave: 'テストして保存',
    batch_operations: '一括操作',
    batch_delete: '一括削除',
    batch_clone: '一括クローン',
    batch_modify: '一括修正',
    batch_export: '一括エクスポート',
    batch_import: '一括インポート',
    test: 'テスト',
    expand: '展開',
    collapse: '折りたたむ',
    copy: 'コピー',
  },
  table: {
    name: '名前',
    ident: '識別',
    tag: 'タグ',
    update_at: '更新時間',
    update_by: '更新者',
    create_at: '作成時間',
    create_by: '作成者',
    status: 'ステータス',
    enabled: '有効',
    note: '備考',
    operations: '操作',
    total: '合計 {{total}} 件',
    host: 'マシン',
    error_msg: 'エラー',
    username: 'ユーザー名',
    nickname: '表示名',
  },
  datasource: {
    prod: '監視タイプ',
    name: 'データソース',
    type: 'データソースタイプ',
    id: 'データソース',
    id_required: 'データソースを選択してください',
    empty_modal: {
      title: 'データソースの設定がありません。管理者に連絡してデータソースを追加してください',
      btn1: '設定に移動',
      btn2: '了解',
    },
    queries: {
      label: 'データソースフィルタ',
      match_type_0: '完全一致',
      match_type_1: '部分一致',
      match_type_1_tip: `2つのワイルドカードをサポートします<br>* 0個以上の任意の文字を一致させる<br>? 1文字だけ一致させる`,
      match_type_2: '全データソース',
      op_in: '含む',
      op_not_in: '含まない',
      preview: 'データソースプレビュー',
    },
    managePageLink: 'データソース管理',
  },
  confirm: {
    delete: '削除しますか？',
    clone: 'クローンしますか？',
    save: '保存しますか？',
  },
  success: {
    submit: '提出成功',
    modify: '修正成功',
    edit: '編集成功',
    create: '作成成功',
    add: '追加成功',
    delete: '削除成功',
    clone: 'クローン成功',
    sort: 'ソート成功',
    import: 'インポート成功',
    save: '保存成功',
  },
  error: {
    clone: 'クローン失敗',
    import: 'インポート失敗',
  },
  time: {
    millisecond: 'ミリ秒',
    second: '秒',
    minute: '分',
    hour: '時間',
    weekdays: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  },
  severity: {
    '1': '一次警報（Critical）',
    '2': '二次警報（Warning）',
    '3': '三次警報（Info）',
  },
  download_json: 'JSONをダウンロード',
  batch: {
    export: {
      copy: 'JSONをクリップボードにコピー',
    },
  },
  invalidDatasource: '無効なデータソース',
  tpl: '自己修復スクリプト',
  'tpl.create': '作成',
  'tpl.tag.bind': 'タグをバインド',
  'tpl.tag.unbind': 'タグをアンバインド',
  'tpl.tag.bind.title': '複数のタグをバインド',
  'tpl.tag.bind.field': 'バインドするタグ',
  'tpl.tag.bind.success': '複数のタグをバインドしました',
  'tpl.tag.unbind.title': '複数のタグをアンバインド',
  'tpl.tag.unbind.field': 'アンバインドするタグ',
  'tpl.tag.unbind.success': '複数のタグをアンバインドしました',
  'tpl.node.modify': 'ノードを修正',
  'tpl.node.modify.title': '複数のノードを修正',
  'tpl.batch.modify.group': '複数の所属グループを一括修正',
  'tpl.title': 'タイトル',
  'tpl.title.tpl.help': 'タイトル、このスクリプトの目的を説明します',
  'tpl.title.task.help': 'タイトル、このタスクの目的を説明します',
  'tpl.tags': 'タグ',
  'tpl.tags.help': 'タグ、分類に使用します',
  'tpl.creator': '作成者',
  'tpl.last_updator': '最終更新者',
  'tpl.last_updated': '最終更新時間',
  'tpl.account.help': '実行アカウント、rootを使用するのは慎用してください。操作システムの意志を代表する場合を除き',
  'tpl.batch.help': '並行度、デフォルトは0、全て並行して実行します。1は順次実行、2は2台ずつ実行します',
  'tpl.tolerance.help': '許容する失敗台数、デフォルトは0、1台も許容しません。失敗したらすぐに一時停止します',
  'tpl.timeout.help': '単一のスクリプトの実行タイムアウト、単位は秒です',
  'tpl.pause.help': '一時停止ポイント、1台を終えたら一時停止します',
  'tpl.host.help': '実行するマシンのリスト',
  'tpl.host.help2': '前提依存：目標マシンにはcategrafをデプロイし、ibexの設定enableをtrueに設定します',
  'tpl.host.filter_btn': 'マシンをフィルタ',
  'tpl.script.help': '実行するスクリプトの内容',
  'tpl.args.help': 'スクリプトの後に付けるパラメータ、複数のパラメータはダブルコンマ,,で区切ります。例：arg1,,arg2,,arg3',
  'tpl.modify': 'スクリプトを編集',
  'tpl.create.task': 'タスクを作成',
  'tpl.callback': '警報自己修復コールバックアドレス',
  'tpl.allOptionLabel': '全スクリプト',

  task: '自己修復タスク',
  'task.create': 'タスクを作成',
  'task.title': 'タイトル',
  'task.done': '完了したか',
  'task.clone': 'タスクをクローン',
  'task.meta': 'メタ情報',
  'task.creator': '作成者',
  'task.created': '作成時間',
  'task.only.mine': '自分だけを見る',
  'task.host': 'Host',
  'task.status': 'ステータス',
  'task.output': '出力',
  'task.refresh': 'リフレッシュ',
  'task.control.params': 'コントロールパラメータ',
  'task.account': '実行アカウント',
  'task.batch': '並行度',
  'task.tolerance': '許容度',
  'task.timeout': 'タイムアウト時間',
  'task.script': 'スクリプト内容',
  'task.script.args': 'スクリプトパラメータ',
  'task.pause': '一時停止ポイント',
  'task.host.list': 'マシンリスト',
  'task.clone.new': '新しいタスクをクローン',
  'task.temporary.create': '一時タスクを作成',
  'task.save.temporarily': '一時保存して実行しない',
  'task.save.execute': '保存してすぐに実行',
  'task.tip.title': 'ヒント情報',
  'task.tip.content': 'もしロールが管理者なら、どのマシンでもスクリプトを実行できます。それ以外は、管理権限のあるビジネスグループのマシンでのみスクリプトを実行できます',
  'task.allOptionLabel': '全スクリプト',

  'last.7.days': '最近 7 日',
  'last.15.days': '最近 15 日',
  'last.30.days': '最近 30 日',
  'last.60.days': '最近 60 日',
  'last.90.days': '最近 90 日',
  'msg.submit.success': '提出成功',
  'msg.modify.success': '修正成功',
  'msg.create.success': '作成成功',
  'msg.add.success': '追加成功',
  'msg.delete.success': '削除成功',
  'msg.clone.success': 'クローン成功',
  'msg.clone.error': 'クローン失敗',
  'msg.sort.success': 'ソート成功',
  copy_success: 'コピー成功 {{num}} 件のレコード',
  request_fail_msg: 'ネットワークリクエストタイムアウト、しばらくしてから再試行してください',
};

export default ja_JP;

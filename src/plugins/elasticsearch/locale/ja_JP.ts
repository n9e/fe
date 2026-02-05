const ja_JP = {
  preview: 'データプレビュー',
  query: {
    title: 'クエリ統計',
    execute: 'クエリ',
    project: 'プロジェクト',
    project_msg: 'プロジェクトを選択してください',
    project_tip:
      '\n      <1>プロジェクトはログサービスのリソース管理単位であり、多数のユーザーを隔離し、アクセス制御を行う主要な境界です。詳細については、<1>\n      <2>プロジェクト</2>\n    ',
    logstore: 'ログストア',
    logstore_msg: 'ログストアを選択してください',
    logstore_tip: '\n      <1>ログストアはログサービスのログデータの収集、保存、クエリ単位です。詳細については、<1>\n      <2>ログストア</2>\n    ',
    range: 'クエリ範囲',
    power_sql: 'SQL 強化',
    query: 'クエリ条件',
    query_required: 'クエリ条件を入力してください',
    mode: {
      raw: 'ログ原文',
      metric: '統計グラフ',
    },
    submode: {
      table: 'テーブルグラフ',
      timeSeries: '時系列グラフ',
    },
    dashboard: {
      mode: {
        label: 'クエリモード',
        table: '非時系列データ',
        timeSeries: '時系列データ',
      },
      time: '時間選択',
      timeTip: 'クエリ範囲を指定できます。デフォルトはダッシュボードの全体時間範囲です',
      time_series: 'x軸パラメータを自動補完',
      time_series_tip:
        'ベータ版<1 />時系列モードでは、クエリ文に__time__フィールドが含まれていない場合、システムが自動的にこのパラメータを補完し、x軸がタイムスタンプ形式であることを確認します',
      removeFirstAndLastPoints: '最初と最後の点を削除',
    },
    advancedSettings: {
      title: '高度な設定',
      valueKey: '値フィールド',
      valueKey_tip:
        'このフィールドを使用して、返された結果から値を抽出します。例えば、クエリ条件が `* | select count(1) as PV` 結果が PV:11 の場合、ValueKey に PV を書いた場合、PV:11 から 11 を抽出し、クエリ結果の値として使用します',
      valueKey_required: '値フィールドを入力してください',
      tags_placeholder: '複数入力可能',
      labelKey: 'ラベルフィールド',
      labelKey_tip:
        'このフィールドとその対応する値を、タグとして監視データのラベルに追加します。例えば、クエリ条件が `* | select count(1) as PV group by host` 結果が `[{PV:11 host:dev01},{PV:10 host:dev02}]`, LabelKey に host を書いた場合、最初のデータの host=dev01 がタグとして使用されます',
      timeKey: '時間フィールド',
      timeKey_tip: 'どのフィールドが時間フィールドかを指定します。これは、グラフのx軸の座標として使用されます',
      timeKey_required: '時間フィールドを入力してください',
      timeFormat: '時間形式',
      timeFormat_tip: '時間のフォーマット。このフォーマットに従って、時間をタイムスタンプに変換します',
    },
    query_raw_tip: `ログ原文のクエリ:
  - 成功したGET/POSTリクエストのログをクエリ: (request_method:GET or request_method:POST) and status in [200 299]
  - 失敗したGET/POSTリクエストのログをクエリ: (request_method:GET or request_method:POST) and status not in [200 299]
  - request_uriフィールドが/requestで始まるログをクエリ: request_uri:/request*`,
    query_timeseries_tip: `時系列値のクエリ:
  - 成功したGET/POSTリクエストの件数をカウントします。表示する時間形式に特別な要件がない場合、[time_series](https://help.aliyun.com/document_detail/63451.htm) を省略できます
    - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count
    - (request_method:GET or request_method:POST) and status in [200 299]|count(1) as count, select time_series(__time__, '1m', '%H:%i:%s' ,'0') as Time group by Time order by Time limit 100`,
    query_document: `詳細ドキュメント:
  - [クエリ構文](https://help.aliyun.com/document_detail/29060.htm)
  - [分析構文](https://help.aliyun.com/document_detail/53608.html)
  - [関数一覧](https://help.aliyun.com/document_detail/321454.html)`,
    variable_help:
      'クエリされたログ内のすべてのフィールドの値を組み合わせて重複を排除し、変数のオプションとして使用します。デフォルトでは、最初の500件のログのみがクエリされます。',
  },
  trigger: {
    title: 'アラート条件',
    value_msg: '式の値を入力してください',
  },
  logs: {
    title: 'ログ詳細',
    count: '結果数',
    filter_fields: 'フィルタフィールド',
    settings: {
      mode: {
        origin: '元の',
        table: 'テーブル',
      },
      breakLine: '改行',
      reverse: '時間',
      organizeFields: {
        title: 'フィールド列設定',
        allFields: '利用可能なフィールド',
        showFields: '表示フィールド',
        showFields_empty: 'ログのデフォルト表示フィールドを全て表示',
      },
      jsonSettings: {
        title: 'JSON設定',
        displayMode: 'デフォルト表示タイプ',
        displayMode_tree: 'ツリー表示',
        displayMode_string: '文字列表示',
        expandLevel: 'デフォルト展開レベル',
      },
    },
    tagsDetail: 'Tag 詳細',
    expand: '展開',
    collapse: '折りたたむ',
    fieldValues_topnNoData: 'データなし',
    stats: {
      numberOfUniqueValues: 'ユニークな値の数',
      min: '最小値',
      max: '最大値',
      sum: '合計',
      avg: '平均値',
    },
    fieldLabelTip: 'フィールドが統計に対応していないため、統計分析を行うことができません',
    filterAnd: 'この検索に追加',
    filterNot: 'この検索から除外',
    total: 'ログの数',
    context: {
      title: 'コンテキストビューア',
      back_lines_btn: '前のログ',
      current_lines_btn: '現在のログ',
      forward_lines_btn: '後のログ',
      organize_fields: 'フィールド設定',
      organize_fields_tip: '現在、フィールド {{fields}} のみが表示されています',
      filter_keywords: 'フィルター',
      filter_keywords_add: 'フィルター追加',
      highlight_keywords: 'ハイライト',
      highlight_keywords_add: 'ハイライト追加',
      no_more_top: 'これ以上前のログはありません',
      no_more_bottom: 'これ以上新しいログはありません',
    },
  },
  enrich_queries: {
    title: '追加クエリ',
  },
};

export default ja_JP;

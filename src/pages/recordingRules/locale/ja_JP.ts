const ja_JP = {
  title: '記録ルール',
  search_placeholder: '名前またはタグで検索',
  name: '指標名',
  name_msg: '指標名が無効です',
  name_tip: 'promqlの周期的な計算によって、新しい指標が生成されます。この新しい指標の名前をここに入力してください',
  note: '備考',
  disabled: '有効',
  append_tags: '追加タグ',
  append_tags_msg: 'タグの形式が間違っています。確認してください',
  append_tags_msg1: 'タグの長さは 64 文字以下にしてください',
  append_tags_msg2: 'タグの形式は key=value です。key はアルファベットまたはアンダースコアで始まり、アルファベット、数字、アンダースコアで構成されます',
  append_tags_placeholder: 'タグの形式は key=value です。改行または空白で区切ってください',
  batch: {
    must_select_one: 'どのルールも選択されていません',
    import: {
      title: '記録ルールをインポート',
      name: '記録ルール',
    },
    export: {
      title: '記録ルールをエクスポート',
      copy: 'JSONをクリップボードにコピー',
    },
    delete: '記録ルールを削除',
    update: {
      title: '記録ルールを更新',
      field: 'フィールド',
      changeto: '変更する値',
      options: {
        datasource_ids: 'データソース',
        disabled: '有効',
        append_tags: '追加タグ',
        cron_pattern: '実行頻度',
      },
    },
  },
};

export default ja_JP;

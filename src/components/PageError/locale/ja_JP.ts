const ja_JP = {
  '403': {
    title: 'アクセス権限がありません',
    desc: 'このページにアクセスする権限がありません',
    desc_with_resource: '「{{resource}}」にアクセスする権限がありません',
    contact_admin: '管理者に権限の付与を依頼してください',
    contact_owners: '{{owners}} に権限の付与を依頼してください',
    owners_more: ' ほか{{count}}名',
  },
  '404': { title: 'ページが見つかりません', desc: 'このページは存在しません。削除されたかURLが誤っている可能性があります' },
  '500': { title: 'サービスに問題が発生しました', desc: 'しばらくしてから再度お試しください' },
  action: { back: '前のページへ', home: 'ホームへ', retry: '再試行' },
  diagnosis: {
    title: '診断情報',
    copy: '診断情報をコピー',
    status: 'ステータスコード',
    path: 'パス',
    resource: '対象リソース',
    required_perm: '必要な権限',
    action: '操作',
    from: '参照元',
    occurred_at: '発生時刻',
  },
};
export default ja_JP;

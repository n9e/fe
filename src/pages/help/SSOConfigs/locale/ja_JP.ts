const ja_JP = {
  title: 'シングルサインオン管理',
  LDAP: 'LDAP',
  CAS: 'CAS',
  OIDC: 'OIDC',
  OAuth2: 'OAuth2',
  dingtalk: 'DingTalk',
  dingtalk_setting: {
    enable: '有効化',
    display_name: '表示名',
    corpId: '組織ID',
    corpId_tip: '組織ID。指定された場合、DingTalkログインページで指定された組織で直接ログインされ、組織選択ページは表示されません',
    client_id: 'Client ID',
    client_secret: 'Client Secret',
    cover_attributes: 'ユーザー情報を更新',
    cover_attributes_tip: 'ログインするたびに、ユーザー情報が変更された場合、DingTalkのユーザー情報でNightingaleのユーザー情報（電話番号、メール）を上書きします',
    username_field: 'ユーザー名フィールド',
    username_field_map: {
      phone: '電話番号',
      name: '名前',
      email: 'メール',
    },
    default_roles: 'デフォルトロール',
    auth_url: '認証URL',
    proxy: 'プロキシアドレス',
    use_member_info: 'ユーザー詳細',
    use_member_info_tip: 'アドレス帳管理下のメンバー情報読み取り権限、メールなどの個人情報、企業従業員の電話番号情報などの権限が必要です',
    dingtalk_api: 'DingTalk API',
    dingtalk_api_tip: 'アドレス帳の従業員情報を照会するAPIエンドポイントを設定',
  },
};

export default ja_JP;

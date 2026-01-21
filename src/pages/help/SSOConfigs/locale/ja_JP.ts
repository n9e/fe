const ja_JP = {
  title: 'シングルサインオン管理',
  LDAP: 'LDAP',
  CAS: 'CAS',
  OIDC: 'OIDC',
  OAuth2: 'OAuth2',
  dingtalk: 'DingTalk',
  feishu: 'Feishu',
  callback_url: 'コールバックURL',
  feishu_setting: {
    app_id_tip:
      'フィシュオープンプラットフォームアプリケーションの一意の識別子。アプリケーションを作成すると、システムによって自動的に生成され、ユーザーは変更できません。アプリケーションの<1>開発者バックエンド</1>の証明書と基本情報ページでapp_idを確認できます',
    app_secret_tip: 'アプリケーションのシークレット。アプリケーションを作成すると、システムによって自動的に生成されます',
    cover_attributes_tip: 'ログインするたびに、ユーザー情報が変更された場合、フィシュのユーザー情報でNightingaleのユーザー情報（電話番号、メール）を上書きします',
  },
  dingtalk_setting: {
    enable: '有効化',
    display_name: '表示名',
    corpId: '組織ID',
    corpId_tip: '組織ID、DingTalkオープンプラットフォームのホームページでCorpIdを確認できます',
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
    use_member_info_tip:
      'アドレス帳から従業員情報を取得するには、「アドレス帳ユーザー詳細」権限を有効にする必要があります。DingTalkオープンプラットフォームで対応する権限を追加してください',
    dingtalk_api: 'DingTalk API',
    dingtalk_api_tip: 'アドレス帳の従業員情報を照会するAPIエンドポイントを設定',
  },
};

export default ja_JP;

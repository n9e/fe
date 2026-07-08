const ja_JP = {
  title: 'MCP 管理',
  add_btn: 'MCP Server を追加',
  name: '名前',
  description: '説明',
  url: 'MCP Server URL',
  enabled: '有効',
  disabled: '無効',
  cannot_delete_when_enabled: '有効状態の MCP Server は削除できません',
  form: {
    add_title: 'MCP Server を追加',
    edit_title: 'MCP Server を編集',
    name_placeholder: 'MCP Server の名前を入力してください',
    description_placeholder: 'MCP Server の説明を入力してください',
    url_placeholder: 'MCP Server の URL を入力してください',
    headers: 'HTTP ヘッダー',
    headers_tip: '任意項目。カスタム HTTP ヘッダーで、リクエストとともに MCP Server へ送信されます',
    headers_key: 'ヘッダー名',
    headers_value: 'ヘッダー値',
    add_header: 'ヘッダーを追加',
    help_title: 'MCP Server 接続について',
    help_content: 'リモート MCP Server のみサポートします。Server は次のいずれかを満たす必要があります：認証不要、またはカスタム Authorization ヘッダーによる認証に対応。',
    test_connection: '接続をテスト',
    test_connection_success: '接続成功',
    test_connection_failure: '接続失敗',
  },
  tool: {
    name: 'ツール名',
    description: 'ツールの説明',
  },
};

export default ja_JP;

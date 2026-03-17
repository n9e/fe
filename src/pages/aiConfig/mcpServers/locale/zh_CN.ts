const zh_CN = {
  title: 'MCP 管理',
  add_btn: '新增 MCP Server',
  name: '名称',
  description: '描述',
  url: 'MCP Server URL',
  enabled: '启用',
  cannot_delete_when_enabled: '启用状态的 LLM 配置无法删除',

  form: {
    add_title: '新增 MCP Server',
    edit_title: '编辑 MCP Server',
    name_placeholder: '请输入 MCP Server 名称',
    description_placeholder: '请输入 MCP Server 描述信息',
    url_placeholder: '请输入 MCP Server URL 地址',
    headers: 'HTTP 请求头',
    headers_tip: '可选项，自定义 HTTP 请求头，将随请求发送至 MCP Server',
    headers_key: 'Header 名',
    headers_value: 'Header 值',
    add_header: '添加请求头',
    help_title: 'MCP Server 接入说明',
    help_content: '仅支持远程 MCP Server。Server 需满足以下条件之一：无需认证、支持自定义 Authorization Header 认证。',
    test_connection: '测试连接',
    test_connection_success: '连接成功',
    test_connection_failure: '连接失败',
  },
};
export default zh_CN;

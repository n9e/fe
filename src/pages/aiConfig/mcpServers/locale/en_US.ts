const en_US = {
  title: 'MCP Servers',
  add_btn: 'Add MCP Server',
  name: 'Name',
  description: 'Description',
  url: 'MCP Server URL',
  enabled: 'Enabled',
  disabled: 'Disabled',
  cannot_delete_when_enabled: 'Enabled MCP Servers cannot be deleted',

  form: {
    add_title: 'Add MCP Server',
    edit_title: 'Edit MCP Server',
    name_placeholder: 'Please enter the MCP Server name',
    description_placeholder: 'Please enter the MCP Server description',
    url_placeholder: 'Please enter the MCP Server URL',
    headers: 'HTTP headers',
    headers_tip: 'Optional. Custom HTTP headers sent along with requests to the MCP Server',
    headers_key: 'Header name',
    headers_value: 'Header value',
    add_header: 'Add header',
    help_title: 'MCP Server integration notes',
    help_content: 'Only remote MCP Servers are supported. The server must meet one of the following: no authentication required, or authentication via a custom Authorization header.',
    test_connection: 'Test connection',
    test_connection_success: 'Connection succeeded',
    test_connection_failure: 'Connection failed',
  },

  tool: {
    name: 'Tool name',
    description: 'Tool description',
  },
};
export default en_US;

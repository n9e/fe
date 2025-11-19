const en_US = {
  title: 'Single Sign-On settings',
  LDAP: 'LDAP',
  CAS: 'CAS',
  OIDC: 'OIDC',
  OAuth2: 'OAuth2',
  dingtalk: 'DingTalk',
  dingtalk_setting: {
    enable: 'Enable',
    display_name: 'Display Name',
    corpId: 'Corporation ID',
    corpId_tip:
      'Corporation ID. If specified, users will be logged in directly with the specified organization on the DingTalk login page without the organization selection page appearing',
    client_id: 'Client ID',
    client_secret: 'Client Secret',
    cover_attributes: 'Update User Information',
    cover_attributes_tip:
      'After each login, if user information has changed, the user information from DingTalk will overwrite the user information in Nightingale (phone number, email)',
    username_field: 'Username Field',
    username_field_map: {
      phone: 'Phone Number',
      name: 'Name',
      email: 'Email',
    },
    default_roles: 'Default Roles',
    auth_url: 'Authentication URL',
    proxy: 'Proxy Address',
    use_member_info: 'User Details',
    use_member_info_tip:
      'Requires permissions for reading member information under address book management, personal information such as email, and employee phone number information',
    dingtalk_api: 'DingTalk API',
    dingtalk_api_tip: 'Set the API endpoint for querying employee information in the address book',
  },
};
export default en_US;

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
    corpId_tip: 'Corporation ID, you can find the CorpId on the homepage of the DingTalk Open Platform',
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
      'This feature needs to be enabled when you need to access employee emails and phone numbers in your address book. Enabling this feature requires granting the "Address Book User Details" permission. Please add the corresponding permission on the DingTalk Open Platform',
    dingtalk_api: 'DingTalk API',
    dingtalk_api_tip: 'Set the API endpoint for querying employee information in the address book',
  },
};
export default en_US;

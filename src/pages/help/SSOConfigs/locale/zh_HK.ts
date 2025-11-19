const zh_HK = {
  title: '單點登入管理',
  LDAP: 'LDAP',
  CAS: 'CAS',
  OIDC: 'OIDC',
  OAuth2: 'OAuth2',
  dingtalk: '釘釘',
  dingtalk_setting: {
    enable: '啟用',
    display_name: '顯示名稱',
    corpId: '所屬組織 ID',
    corpId_tip: '所屬組織 ID，如果指定了組織 ID，在釘釘登入頁面，會直接用指定組織登入，不會出現選擇組織頁面',
    client_id: 'Client ID',
    client_secret: 'Client secret',
    cover_attributes: '更新用戶信息',
    cover_attributes_tip: '每次登入後，如果用戶信息有變化，會使用釘釘中用戶的信息覆蓋夜鶯中用戶的信息(手機號、郵箱)',
    username_field: '用戶名字段',
    username_field_map: {
      phone: '手機號',
      name: '名稱',
      email: '郵箱',
    },
    default_roles: '默認角色',
    auth_url: '登入認證地址',
    proxy: '代理地址',
    use_member_info: '用戶詳情',
    use_member_info_tip: '需要通訊錄管理下的成員信息讀權限、郵箱等個人信息、企業員工手機號信息等權限',
    dingtalk_api: '釘釘 API',
    dingtalk_api_tip: '設置通訊錄員工信息查詢 API 接口',
  },
};

export default zh_HK;

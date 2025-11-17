const ru_RU = {
  title: 'Управление SSO',
  LDAP: 'LDAP',
  CAS: 'CAS',
  OIDC: 'OIDC',
  OAuth2: 'OAuth2',
  dingtalk: 'DingTalk',
  dingtalk_setting: {
    enable: 'Включить',
    display_name: 'Отображаемое имя',
    corpId: 'ID организации',
    corpId_tip: 'ID организации. Если указан, пользователи будут входить напрямую с указанной организацией на странице входа DingTalk без появления страницы выбора организации',
    client_id: 'Client ID',
    client_secret: 'Client Secret',
    cover_attributes: 'Обновить информацию о пользователе',
    cover_attributes_tip:
      'После каждого входа, если информация о пользователе изменилась, информация из DingTalk перезапишет информацию пользователя в Nightingale (номер телефона, электронная почта)',
    username_field: 'Поле имени пользователя',
    username_field_map: {
      phone: 'Номер телефона',
      name: 'Имя',
      email: 'Электронная почта',
    },
    default_roles: 'Роли по умолчанию',
    auth_url: 'URL аутентификации',
    proxy: 'Адрес прокси',
    use_member_info: 'Детали пользователя',
    use_member_info_tip:
      'Требуются разрешения на чтение информации о членах в управлении адресной книгой, личной информации, такой как электронная почта, и информации о телефонных номерах сотрудников компании',
    dingtalk_api: 'DingTalk API',
    dingtalk_api_tip: 'Установить конечную точку API для запроса информации о сотрудниках в адресной книге',
  },
};

export default ru_RU;

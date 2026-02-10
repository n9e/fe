const ru_RU = {
  title: 'Управление SSO',
  LDAP: 'LDAP',
  CAS: 'CAS',
  OIDC: 'OIDC',
  OAuth2: 'OAuth2',
  dingtalk: 'DingTalk',
  feishu: 'Feishu',
  callback_url: 'URL обратного вызова',
  feishu_setting: {
    app_id_tip:
      'Feishu Open Platform application unique identifier, generated automatically when the application is created, and users cannot modify it themselves. You can view the app_id in the Credentials and Basic Information page of the <1>Developer Backend</1>',
    app_secret_tip: 'Application secret. Generated automatically when the application is created',
    cover_attributes_tip:
      'After each login, if user information has changed, the user information from Feishu will overwrite the user information in Nightingale (phone number, email)',
  },
  dingtalk_setting: {
    enable: 'Включить',
    display_name: 'Отображаемое имя',
    corpId: 'ID организации',
    corpId_tip: 'ID организации, вы можете найти CorpId на главной странице DingTalk Open Platform',
    client_id: 'Client ID',
    client_secret: 'Client Secret',
    cover_attributes: 'Обновить информацию о пользователе',
    cover_attributes_tip:
      'После каждого входа, если информация о пользователе изменилась, информация из DingTalk перезапишет информацию пользователя в Nightingale (номер телефона, электронная почта)',
    username_field: 'Поле имени пользователя',
    default_team: 'По умолчанию команда',
    username_field_map: {
      phone: 'Номер телефона',
      name: 'Имя',
      email: 'Электронная почта',
      userid: 'UserId',
    },
    default_roles: 'Роли по умолчанию',
    auth_url: 'URL аутентификации',
    proxy: 'Адрес прокси',
    use_member_info: 'Детали пользователя',
    use_member_info_tip:
      'Чтобы получить информацию о сотрудниках из адресной книги, необходимо включить разрешение "Детали пользователя адресной книги". Пожалуйста, добавьте соответствующие разрешения в DingTalk Open Platform',
    dingtalk_api: 'DingTalk API',
    dingtalk_api_tip: 'Установить конечную точку API для запроса информации о сотрудниках в адресной книге',
  },
};

export default ru_RU;

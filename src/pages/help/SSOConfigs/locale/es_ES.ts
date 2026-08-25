const es_ES = {
  "title": "Gestión del inicio de sesión único",
  "LDAP": "LDAP",
  "CAS": "CAS",
  "OIDC": "OIDC",
  "OAuth2": "OAuth2",
  "dingtalk": "DingTalk",
  "feishu": "Feishu",
  "callback_url": "URL de devolución de llamada",
  "feishu_setting": {
    "app_id_tip": "Identificador único de la aplicación en la plataforma abierta de Feishu, generado automáticamente al crearla y no editable. El app_id puede consultarse en la página de credenciales e información básica de la <1>consola de desarrollador</1>",
    "app_secret_tip": "Clave secreta de la aplicación, generada automáticamente al crearla",
    "cover_attributes_tip": "En cada inicio de sesión, si los datos del usuario han cambiado, los de Feishu (teléfono y correo) sobrescriben los de Nightingale"
  },
  "dingtalk_setting": {
    "enable": "Activar",
    "display_name": "Nombre para mostrar",
    "corpId": "ID de la organización",
    "corpId_tip": "ID de la organización; el CorpId aparece en la página principal de la plataforma abierta de DingTalk",
    "client_id": "Client ID",
    "client_secret": "Client secret",
    "cover_attributes": "Actualizar los datos del usuario",
    "cover_attributes_tip": "En cada inicio de sesión, si los datos del usuario han cambiado, los de DingTalk (teléfono y correo) sobrescriben los de Nightingale",
    "username_field": "Campo del nombre de usuario",
    "default_team": "Equipo predeterminado",
    "username_field_map": {
      "phone": "Teléfono",
      "name": "Nombre",
      "email": "Correo electrónico",
      "userid": "ID del usuario"
    },
    "default_roles": "Rol predeterminado",
    "auth_url": "Dirección de autenticación",
    "proxy": "Dirección del proxy",
    "use_member_info": "Detalles del usuario",
    "use_member_info_tip": "Actívalo si necesitas obtener el correo y el teléfono de los empleados del directorio. Para ello hay que conceder el permiso de detalles de usuario del directorio en la plataforma abierta de DingTalk",
    "dingtalk_api": "API de DingTalk",
    "dingtalk_api_tip": "Define la API que se usa para consultar los datos de los empleados del directorio"
  }
};

export default es_ES;

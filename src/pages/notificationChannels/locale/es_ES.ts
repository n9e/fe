const es_ES = {
  "title": "Medios de notificación",
  "basic_configuration": "Configuración básica",
  "default_values": {
    "access_key_id": "Sustitúyelo por el access_key_id real",
    "access_key_secret": "Sustitúyelo por el access_key_secret real",
    "show_number": "Sustitúyelo por el show_number real; si se deja vacío, no se muestra nada",
    "voice_code": "Sustitúyelo por el voice_code real",
    "sign_name": "Sustitúyelo por la firma real",
    "template_id": "Sustitúyelo por el id de plantilla real",
    "secret_id": "Sustitúyelo por el secret_id real",
    "secret_key": "Sustitúyelo por el secret_key real",
    "region": "Sustitúyelo por la region real",
    "app_id": "Sustitúyelo por el appid real",
    "ali_voice_tts_param": "Incidencia {{$tpl.incident}}. Pulsa 1 para asignártela",
    "ali_sms_template_param": "Incidencia {{$tpl.incident}}. Atiéndela cuanto antes"
  },
  "ident": "Tipo de medio",
  "ident_tip": "Categoría del medio de notificación. Varios medios de DingTalk, por ejemplo, pueden tener el tipo dingtalk. El tipo puede escribirse libremente, sin limitarse a las opciones de la lista; es por él como se relacionan los medios de notificación y las plantillas de mensaje",
  "note_tip": "Usa este campo para describir el medio de notificación o sus casos de uso, algo que ayuda en el mantenimiento y el trabajo en equipo",
  "enable_tip": "Define si esta configuración está activa. Desactivada, deja de aplicarse y no se envía ninguna notificación por ella",
  "advanced_settings": "Ajustes avanzados",
  "variable_configuration": {
    "title": "Configuración de variables",
    "contact_key": "Contacto",
    "contact_key_tip": "Corresponde a los contactos de «Personas y organización - Gestión de usuarios» y determina por dónde sale la notificación. «Phone», por ejemplo, pasa el teléfono del usuario a la solicitud o al script de devolución de llamada. Los tipos de contacto nuevos se crean en la página «Personas y organización - Contactos»",
    "params": {
      "title": "Configuración de parámetros",
      "title_tip": "Define los parámetros personalizados que necesita este medio, como el token del bot de DingTalk o una API Key. Al elegir el medio en una regla de notificación, también pueden indicarse sus valores",
      "key": "Identificador del parámetro",
      "key_required": "El identificador del parámetro no puede estar vacío",
      "cname": "Nombre del parámetro",
      "cname_required": "El nombre del parámetro no puede estar vacío"
    }
  },
  "request_configuration": {
    "http": "Configuración HTTP",
    "smtp": "Configuración SMTP",
    "script": "Configuración del script",
    "flashduty": "Configuración de FlashDuty",
    "pagerduty": "Configuración de PagerDuty",
    "dingtalkapp": "Configuración de la aplicación de DingTalk",
    "wecomapp": "Configuración de la aplicación de WeCom",
    "feishuapp": "Configuración de la aplicación de Feishu"
  },
  "request_type": "Tipo de envío",
  "http_request_config": {
    "title": "HTTP",
    "url": "URL",
    "url_tip": "Dirección de destino que recibe las solicitudes de notificación",
    "method": "Método de la solicitud",
    "header": "Cabeceras de la solicitud",
    "header_tip": "Cabeceras HTTP personalizadas que se envían en la solicitud, como las credenciales de BasicAuth. La URL, las cabeceras, los valores de los parámetros y el cuerpo admiten {{.nombre_de_la_variable}} para referenciar variables de «Configuración del sistema - Configuración de variables», de modo que los tokens y otras credenciales no tienen que quedar aquí en texto plano",
    "header_key": "Nombre del parámetro",
    "header_value": "Valor del parámetro",
    "timeout": "Tiempo de espera (milisegundos)",
    "concurrency": "Concurrencia",
    "concurrency_tip": "Número máximo de solicitudes simultáneas. Aumentarlo acelera el envío, pero respeta la capacidad del servicio de destino",
    "retry_times": "Reintentos",
    "retry_interval": "Intervalo entre reintentos (milisegundos)",
    "insecure_skip_verify": "Omitir la verificación del certificado",
    "proxy": "Proxy",
    "proxy_tip": "Dirección del proxy HTTP, para los casos en que hace falta",
    "params": "Parámetros de la solicitud",
    "params_key": "Nombre del parámetro",
    "params_value": "Valor del parámetro",
    "body": "Cuerpo de la solicitud"
  },
  "smtp_request_config": {
    "title": "SMTP",
    "host": "Servidor",
    "host_tip": "Dirección del servidor SMTP que se usa para enviar, por ejemplo smtp.example.com",
    "port": "Puerto",
    "port_tip": "Puerto del servidor SMTP. Los más habituales son el 25, el 465 (SSL) y el 587 (STARTTLS); confírmalo con tu proveedor",
    "username": "Nombre de usuario",
    "username_tip": "Usuario para autenticarse en el servidor SMTP, normalmente la dirección de correo",
    "password": "Contraseña",
    "password_tip": "Contraseña o contraseña de aplicación del usuario SMTP; te recomendamos la de aplicación por ser más segura",
    "from": "Remitente",
    "from_tip": "Nombre o alias que se muestra como remitente y que ayuda al destinatario a reconocer el origen del mensaje. Ejemplo de formato: Flashcat <no-reply@notice.flashcat.cloud>",
    "insecure_skip_verify": "Omitir la verificación del certificado",
    "insecure_skip_verify_tip": "Cuando se activa, no se verifica el certificado del servidor SMTP, algo que suele servir para pruebas o certificados autofirmados",
    "batch": "Envío en lote",
    "batch_tip": "Cuántos correos enviar en una sola conexión SMTP"
  },
  "script_request_config": {
    "title": "Script",
    "script": {
      "option": "Usar un script",
      "label": "Contenido del script"
    },
    "path": {
      "option": "Usar una ruta",
      "label": "Ruta del archivo"
    },
    "timeout": "Tiempo de espera (milisegundos)"
  },
  "flashduty_request_config": {
    "title": "FlashDuty",
    "integration_url": "URL",
    "integration_url_tip": "Introduce aquí la dirección de integración creada en el centro de Flashduty; puedes generarla en https://console.flashcat.cloud/settings/source/alert/add/n9e",
    "proxy": "Proxy",
    "proxy_tip": "Dirección del proxy HTTP, para los casos en que hace falta",
    "timeout": "Tiempo de espera (milisegundos)",
    "retry_times": "Reintentos"
  },
  "pagerduty_request_config": {
    "title": "PagerDuty",
    "api_key": "API Key",
    "api_key_tip": "Introduce aquí la API Key de integración de PagerDuty; consulta cómo obtenerla en https://developer.pagerduty.com/docs/authentication",
    "proxy": "Proxy",
    "proxy_tip": "Dirección del proxy HTTP, para los casos en que hace falta",
    "timeout": "Tiempo de espera (milisegundos)",
    "retry_times": "Reintentos"
  },
  "dingtalkapp_request_config": {
    "app_key": "Identificador único de la aplicación",
    "app_secret": "Clave secreta de la aplicación",
    "alert_shot_tip": "Para enviar imágenes en las alertas, crea una aplicación de DingTalk siguiendo la documentación y rellena los datos aquí"
  },
  "wecomapp_request_config": {
    "corp_id": "ID de la empresa",
    "corp_secret": "Clave secreta de la empresa",
    "agentid": "Agent ID"
  },
  "feishuapp_request_config": {
    "app_id": "ID de la aplicación",
    "app_secret": "Clave secreta de la aplicación",
    "receive_id_type": "Tipo de ID del destinatario",
    "alert_shot_tip": "Para enviar imágenes en las alertas, crea una aplicación de Feishu siguiendo la documentación y rellena los datos aquí",
    "lark_alert_shot_tip": "Para enviar imágenes en las alertas, crea una aplicación de Lark siguiendo la documentación y rellena los datos aquí"
  },
  "types_search_placeholder": "Tipo de búsqueda",
  "name_search_placeholder": "Buscar por nombre",
  "disabled": "Desactivar",
  "status_select": {
    "placeholder": "Estado",
    "enable": "Activar",
    "disable": "Desactivar"
  },
  "types_select_placeholder": "Tipo",
  "types": {
    "flashduty": "FlashDuty",
    "callback": "Devolución de llamada",
    "email": "Correo electrónico",
    "dingtalk": "DingTalk",
    "dingtalkapp": "Aplicación de DingTalk",
    "wecom": "WeCom",
    "wecomapp": "Aplicación de WeCom",
    "feishucard": "Tarjeta de Feishu",
    "feishu": "Feishu",
    "feishuapp": "Aplicación de Feishu",
    "larkcard": "Tarjeta de Lark",
    "lark": "Lark",
    "telegram": "Telegram",
    "ali-voice": "Voz de Alibaba Cloud",
    "ali-sms": "SMS de Alibaba Cloud",
    "tx-voice": "Voz de Tencent Cloud",
    "tx-sms": "SMS de Tencent Cloud",
    "slackbot": "Slack Bot",
    "slackwebhook": "Slack Webhook",
    "mattermostbot": "Mattermost Bot",
    "mattermostwebhook": "Mattermost Webhook",
    "discord": "Discord",
    "jsm_alert": "JSM Alert",
    "jira": "JIRA",
    "pagerduty": "PagerDuty",
    "script": "Script"
  },
  "test": {
    "btn": "Probar",
    "run": "Enviar una prueba",
    "back": "Volver y editar",
    "desc": "Envía de verdad un mensaje con la configuración actual del formulario, sin necesidad de guardar antes. Sirve para comprobar la dirección, las credenciales y la red.",
    "script_blocked": "Los medios de tipo script hay que guardarlos antes de probarlos",
    "params_title": "Parámetros del medio",
    "receivers_title": "Destinatarios",
    "pagerduty_keys_title": "Integration Key",
    "pagerduty_keys_tip": "PagerDuty entrega por Integration Key. Tras guardar, podrás elegir por «Servicio/Integración» en las reglas de notificación; aquí introduce las claves a mano, tantas como necesites.",
    "pagerduty_keys_placeholder": "Escribe la Integration Key y pulsa Intro",
    "user_ids": "Seleccionar usuarios",
    "user_group_ids": "Seleccionar equipos",
    "mode": {
      "history": "Eventos históricos",
      "mock": "Evento simulado"
    },
    "empty_alert": "Este entorno aún no tiene eventos de alerta en el historial",
    "switch_btn": "Probar con un evento simulado",
    "result_success": "Enviado correctamente",
    "result_success_desc": "Comprueba en el grupo o el correo correspondiente si ha llegado el mensaje",
    "result_failed": "Error en el envío"
  }
};

export default es_ES;

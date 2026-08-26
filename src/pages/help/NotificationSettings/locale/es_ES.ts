const es_ES = {
  "title": "Ajustes de notificación",
  "disabled": "Desactivar",
  "webhooks": {
    "help_content": "Los callbacks integran Nightingale con otros sistemas. Cuando se genera un evento de alerta, se envía a cada URL configurada; puedes desarrollar tu propia API HTTP, apuntarla aquí e implementar la lógica automatizada que necesites. Nightingale llama a esas direcciones por POST, con el contenido del evento en JSON en el cuerpo de la solicitud; la estructura de los datos está descrita [aquí](https://github.com/ccfos/nightingale/blob/main/models/alert_cur_event.go#L19). Para probarlo, usa una máquina que vea a Nightingale por la red (digamos, 10.1.2.3) y abre un puerto con nc, por ejemplo `nc -k -l 4321`, que hace que nc escuche en el puerto 4321. Configura `http://10.1.2.3:4321` como URL de callback, crea una regla de alerta y, en cuanto se dispare, Nightingale llamará a esa dirección y verás en la salida de nc el formato exacto de los datos enviados.",
    "title": "URL de callback",
    "enable": "Activar",
    "note": "Observación",
    "url": "URL",
    "timeout": "Tiempo de espera (s)",
    "basic_auth_user": "Usuario (Basic Auth)",
    "basic_auth_password": "Contraseña (Basic Auth)",
    "skip_verify": "Omitir la verificación SSL",
    "add": "Añadir",
    "help": "\n      Si quieres reenviar todos los eventos de alerta de Nightingale a otra plataforma, usa la URL de callback global de abajo.\n      <br />\n      <br />\n      Por lo general, un sistema de monitorización se ocupa de la recolección, el almacenamiento, el análisis y la generación de los eventos, mientras que la distribución, la reducción de ruido, la asignación, el escalado, los turnos de guardia y la colaboración corren a cargo de un producto aparte, de tipo OnCall, muy extendido en las empresas que aplican SRE.\n      <br />\n      <br />\n      Los productos de OnCall suelen integrarse con distintos sistemas de monitorización, como Prometheus, Nightingale, Zabbix, ElastAlert, BlueKing y las monitorizaciones de las nubes públicas. Cada uno de ellos envía los eventos al centro de OnCall mediante webhooks, y allí es donde se distribuyen, se filtra el ruido y se tratan.\n      <br />\n      <br />\n      Entre los productos de OnCall destacamos <a1>PagerDuty</a1> fuera de China y <a2>FlashDuty</a2> dentro; ambos ofrecen registro gratuito de prueba.\n    "
  },
  "script": {
    "title": "Script de notificación",
    "enable": "Activar",
    "timeout": "Tiempo de espera (s)",
    "type": [
      "Usar un script",
      "Usar una ruta"
    ],
    "path": "Ruta del archivo",
    "content": "Contenido del script"
  },
  "channels": {
    "title": "Medios de notificación",
    "name": "Nombre",
    "ident": "Identificador",
    "ident_msg1": "El identificador solo puede contener letras, números, guiones bajos y guiones",
    "ident_msg2": "Este identificador ya existe",
    "hide": "Ocultar",
    "add": "Añadir",
    "add_title": "Añadir medio de notificación",
    "edit_title": "Editar medio de notificación",
    "enabled": "Activar"
  },
  "contacts": {
    "title": "Contacto",
    "add_title": "Añadir contacto",
    "edit_title": "Editar contacto"
  },
  "smtp": {
    "title": "Configuración SMTP",
    "testMessage": "Correo de prueba enviado; revisa tu bandeja de entrada"
  },
  "ibex": {
    "title": "Configuración de autorreparación"
  }
};

export default es_ES;

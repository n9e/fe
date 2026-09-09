const es_ES = {
  "title": "Regla de notificación",
  "empty_guide": {
    "title": "Aún no hay reglas de notificación",
    "desc": "La regla de notificación determina a quién va la alerta y por qué medio. Solo después de configurarla los eventos llegan de verdad a DingTalk, al correo o a otro canal.",
    "config_channel": "Configura antes un medio de notificación"
  },
  "rule_select": {
    "label": "Regla de notificación",
    "select": "Seleccionar regla de notificación",
    "create": "Nueva regla de notificación",
    "view": "Ver",
    "manage": "Gestión de reglas de notificación",
    "total": "{{total}} en total",
    "footer_total": "{{total}} reglas en total",
    "quick_create": {
      "action": "Creación rápida",
      "title": "Creación rápida de regla de notificación",
      "hint": "Pega la URL del webhook del bot de mensajería o la dirección de integración de Flashduty (con integration_key). El tipo —DingTalk, WeCom, tarjeta de Feishu, tarjeta de Lark o Flashduty— se detecta automáticamente y, tras comprobar duplicados, la regla se reutiliza o se crea.",
      "url_label": "Webhook o dirección de integración",
      "url_placeholder": "Por ejemplo: https://oapi.dingtalk.com/robot/send?access_token=xxx\no: https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx",
      "url_required": "Pega la URL del webhook o la dirección de integración de Flashduty",
      "name_label": "Nombre de la regla de notificación",
      "name_placeholder": "Se genera automáticamente al pegar el webhook; puedes cambiarlo",
      "name_required": "Introduce el nombre de la regla de notificación",
      "user_group_required": "Selecciona los equipos autorizados",
      "user_group_placeholder": "Selecciona los equipos autorizados",
      "detected": "Detectado como {{channel}} (terminado en {{suffix}})",
      "invalid_url": "El formato de la URL no es válido",
      "missing_param": "A la URL le falta {{key}}",
      "unrecognized": "No se pudo detectar el tipo (se admiten DingTalk, WeCom, tarjeta de Feishu, tarjeta de Lark y Flashduty)",
      "reused_rule": "Ya existe una regla de notificación con el mismo token, y se ha seleccionado automáticamente",
      "created": "Regla de notificación creada y seleccionada",
      "create_channel_no_perm": "Falta el medio de notificación {{channel}} y no tienes permiso para crearlo. Pide al administrador que lo cree primero",
      "create_channel_failed": "Error al crear el medio de notificación {{channel}}",
      "create_rule_failed": "Error al crear la regla de notificación",
      "channel_description": "Creado automáticamente por la creación rápida",
      "rule_description": "Creado por la creación rápida a partir de la URL del webhook",
      "submit": "Crear"
    }
  },
  "basic_configuration": "Configuración básica",
  "basic_configuration_desc": "Nombre, equipos autorizados y observaciones de la regla de notificación",
  "name_auto_tip": "El nombre se genera automáticamente tras elegir el medio y los equipos destinatarios, y puede cambiarse en cualquier momento",
  "name_auto_separator": ", ",
  "add_note_btn": "Añadir observación",
  "user_group_ids": "Equipos autorizados",
  "user_group_ids_tip": "Los miembros de los equipos que indiques aquí podrán gestionar o ver esta regla de notificación",
  "enabled_tip": "Define si esta regla de notificación está activa",
  "note_tip": "Usa este campo para detallar la regla de notificación y facilitar su mantenimiento",
  "notification_configuration": {
    "title": "Configuración de notificación",
    "section_desc": "Determina a quién va la alerta y por qué medio: elige el medio de notificación, la plantilla de mensaje y los destinatarios. Puedes añadir varios conjuntos",
    "item_title": "Configuración de notificación",
    "add_btn": "Añadir configuración de notificación",
    "filters": {
      "title": "Filtros",
      "tip": "Restringe esta configuración a los eventos que cumplan los criterios: severidad, franja horaria, etiquetas y atributos. Si no se configura, no hay restricción",
      "severities_all": "Todas las severidades",
      "severities_none": "No hay ninguna severidad marcada; no se corresponderá con ningún evento",
      "time_ranges_count": "{{count}} franjas horarias",
      "label_keys_count": "{{count}} condiciones de etiqueta",
      "attributes_count": "{{count}} condiciones de atributo",
      "no_extra": "Sin restricción de franja horaria, etiqueta ni atributo"
    },
    "test_mode": {
      "history": "Seleccionar un evento del historial",
      "mock": "Usar un evento simulado"
    },
    "mock_test": {
      "empty_alert": "Este entorno aún no tiene eventos de alerta; usa un evento simulado para probar el canal de notificación",
      "switch_btn": "Usar un evento simulado",
      "desc": "Se enviará un evento de alerta simulado al medio y a los destinatarios de esta configuración para comprobar si el canal funciona. La prueba simulada no evalúa los filtros",
      "preview_title": "Vista previa del evento simulado",
      "preview_rule_name": "Nombre de la regla",
      "preview_severity": "Severidad de la alerta",
      "preview_tags": "Etiquetas",
      "rule_name": "Evento simulado para probar la notificación"
    },
    "channel": "Medios de notificación",
    "channel_tip": "Elige por qué medio se enviará la notificación. Si los medios existentes no te sirven, pide al administrador que cree otro",
    "channel_msg": "Selecciona el medio de notificación",
    "template": "Plantillas de mensaje",
    "template_tip": "Plantilla del contenido de la notificación; puedes usar plantillas distintas según el escenario",
    "template_msg": "Selecciona la plantilla de mensaje",
    "severities": "Severidades aplicables",
    "severities_tip": "Elige qué severidades generan notificación; solo se avisa de las marcadas. Si no marcas ninguna, este medio no se corresponderá con ningún evento, lo que equivale a desactivarlo",
    "time_ranges": "Franjas horarias aplicables",
    "time_ranges_tip": "La regla de notificación puede aplicarse solo en determinadas franjas horarias; si no se configura, no hay restricción",
    "effective_time_start": "Inicio",
    "effective_time_end": "Fin",
    "effective_time_week_msg": "Selecciona los días de la semana",
    "effective_time_start_msg": "Selecciona la hora de inicio",
    "effective_time_end_msg": "Selecciona la hora de fin",
    "fetch_integration_key_failed_remove": "Error al obtener estas claves de PagerDuty: {list}. Prueba a seleccionarlas de nuevo",
    "label_keys": "Etiquetas aplicables",
    "label_keys_tip": "La regla de notificación puede aplicarse solo a los eventos que cumplan filtros de etiqueta; si no se configura, no hay restricción",
    "attributes": "Atributos aplicables",
    "attributes_value": "Valor del atributo",
    "attributes_tip": "La regla de notificación puede aplicarse solo a los eventos que cumplan determinados atributos; si no se configura, no hay restricción",
    "attributes_options": {
      "group_name": "Grupo de negocio",
      "cluster": "Origen de datos",
      "is_recovered": "¿Es un evento de recuperación?",
      "rule_id": "Regla de alerta",
      "severity": "Severidad de la alerta",
      "target_group": "Grupo de negocio de la máquina"
    },
    "run_test_btn": "Prueba de notificación",
    "run_test_btn_tip": "Elige algunos eventos ya generados para probar esta configuración; si es correcta, deberías recibir la notificación",
    "run_test_request_result": "La notificación de prueba se ha enviado y el destino respondió:",
    "user_info": {
      "user_ids": "Destinatarios",
      "user_group_ids": "Equipos destinatarios",
      "error": "Los destinatarios y los equipos destinatarios no pueden estar ambos vacíos"
    },
    "flashduty": {
      "ids": "Espacio de colaboración"
    },
    "pagerduty": {
      "services": "Servicio/integración"
    }
  },
  "user_group_id_invalid_tip": "El equipo autorizado no existe",
  "channel_invalid_tip": "El medio de notificación no existe",
  "disabled": "Desactivar",
  "pipeline_configuration": {
    "title": "Flujo de procesamiento de eventos",
    "section_desc": "Antes del envío, el evento pasa por un flujo de procesamiento que puede etiquetarlo, enriquecerlo o reducir el ruido",
    "manage_btn": "Gestionar los flujos de procesamiento de eventos",
    "name_placeholder": "Selecciona el flujo de procesamiento de eventos",
    "name_required": "El flujo de procesamiento de eventos no puede estar vacío",
    "add_btn": "Añadir flujo de procesamiento de eventos",
    "disable": "Desactivar",
    "enable": "Activar"
  },
  "escalations": {
    "title": "Configuración del escalado",
    "section_desc": "Cuando una alerta lleva mucho tiempo sin recuperarse o sin asignar, la notificación se escala a otro canal para que no quede sin seguimiento",
    "title_tip": "Pasado el tiempo definido sin recuperarse, el sistema escala la notificación al canal indicado según las condiciones de abajo, para que la alerta no quede sin seguimiento. Más detalles en la <a>documentación de uso</a>",
    "item_title": "Escalado de la notificación",
    "item_add_btn": "Añadir escalado",
    "interval": "Periodo de comprobación",
    "interval_required": "El periodo de comprobación no puede estar vacío",
    "duration_required": "La duración no puede estar vacía",
    "duration_1": "Cuando el evento anómalo supere",
    "duration_2": "y siga en estado",
    "duration_3": ", esta configuración envía la notificación.",
    "repeating_notification": "Configuración de las notificaciones repetidas",
    "repeating_notification_tip": "Con esta opción desactivada, el escalado de un mismo evento solo avisa una vez",
    "repeating_notification_1": "Cada",
    "repeating_notification_2": "minutos, notificar una vez, como máximo",
    "repeating_notification_3": "veces",
    "notification_interval_required": "El intervalo entre notificaciones no puede estar vacío",
    "notification_max_times_required": "El número máximo de notificaciones repetidas no puede estar vacío",
    "event_status_options": {
      "0": "Sin recuperar",
      "1": "Sin recuperar y sin asignar"
    },
    "time_ranges": {
      "label_tip": "El escalado puede limitarse a los días y las horas marcados; si no se configura, no hay restricción"
    },
    "labels_filter": {
      "label_tip": "Escala solo los eventos que cumplan estas condiciones de etiqueta, lo que acota el alcance de la regla; si no se configura, no hay restricción. Puedes elegir claves existentes en la lista (recomendado) o escribirlas"
    },
    "attributes_filter": {
      "label_tip": "Escala solo las alertas que cumplan todos estos atributos; si no se configura, no hay restricción. Las condiciones se combinan con Y"
    }
  },
  "notify_aggr_configs": {
    "title": "Configuración de la agregación",
    "section_desc": "Agrupa las alertas similares por etiqueta o atributo en una sola notificación, lo que reduce las interrupciones",
    "enable": "Activar la agregación",
    "group_enable": "Agregación detallada",
    "group_title": "Agregación detallada",
    "group_add_btn": "Añadir agregación detallada",
    "group_tip1": "Cumplidas las condiciones siguientes",
    "group_tip2": "agrupa por estas dimensiones y envía una sola notificación",
    "group_label_keys": "Etiquetas",
    "group_label_keys_required": "La etiqueta no puede estar vacía",
    "group_attribute_keys": "Atributo",
    "group_attribute_keys_required": "El atributo no puede estar vacío",
    "group_keys_at_least_one_required": "Introduce al menos una etiqueta o un atributo",
    "group_duration_1": "Tras recibir la alerta, las alertas del mismo grupo que lleguen en",
    "group_duration_2": "segundos se agrupan y se envían juntas",
    "group_duration_required": "La duración de la agregación no puede estar vacía",
    "default_title": "Dimensiones predeterminadas",
    "default_tip": "Cuando no se cumplan los filtros anteriores, <b>agrupa por estas dimensiones y envía una sola notificación</b>",
    "default_duration_tip": "Ten en cuenta que un intervalo de agregación demasiado grande retrasa el envío de las alertas",
    "default_duration_tip2": "El intervalo máximo de agregación no puede superar los 3600 segundos",
    "attribute_keys_map": {
      "cluster": "Origen de datos",
      "cate": "Tipo de origen de datos",
      "group_name": "Grupo de negocio",
      "rule_id": "Regla de alerta",
      "rule_prod": "Tipo de monitorización",
      "severity": "Severidad de la alerta",
      "is_recovered": "Recuperado"
    },
    "enable_tip": "Cuando se activa, las alertas que cumplen la regla se combinan por dimensión en una sola notificación <a>Documentación de uso</a>",
    "labels_filter": {
      "label_tip": "Agrupa solo los eventos que cumplan estas condiciones de etiqueta, lo que acota el alcance de la regla; si no se configura, no hay restricción. Puedes elegir claves existentes en la lista (recomendado) o escribirlas"
    },
    "attributes_filter": {
      "label_tip": "Solo las alertas que cumplan estos filtros de etiqueta participan en la agregación; las demás no se ven afectadas por esta regla<br />Las condiciones se combinan con Y, también con los filtros de atributo de abajo"
    },
    "label_keys": {
      "tip": "Si configuras ident, los eventos con el mismo ident se reúnen en un grupo y generan una sola notificación, algo que suele reducir el ruido en SMS y mensajería",
      "placeholder": "Por ejemplo, ident o app. Puedes elegir claves existentes en la lista (recomendado) o escribirlas"
    },
    "attribute_keys": {
      "tip": "Si configuras el grupo de negocio, los eventos del mismo grupo se reúnen y generan una sola notificación",
      "placeholder": "Por ejemplo: grupo de negocio"
    }
  },
  "statistics": {
    "total_notify_events": "Notificaciones enviadas en los últimos {{days}} días",
    "total_notify_events_tip": "Cuenta solo las notificaciones realmente enviadas; los eventos <b>agregados, suprimidos o silenciados</b> no se contabilizan",
    "escalation_events": "Eventos escalados en los últimos {{days}} días",
    "escalation_events_tip": "Número de eventos que cumplieron la regla de escalado y subieron de prioridad. Una cifra alta suele indicar tiempos de atención largos, lo que aconseja revisar el <b>SLA de respuesta, los umbrales de escalado o la estrategia de reducción de alertas</b>",
    "noise_reduction_ratio": "Tasa de reducción de ruido en los últimos {{days}} días",
    "noise_reduction_ratio_tip": "Tasa de reducción de ruido = <b>(1 − notificaciones enviadas ÷ eventos de alerta originales) × 100 %</b>. Cuanto más cerca del <b>100 %</b>, mejor es la <b>reducción de ruido</b>"
  },
  "tabs": {
    "events": "Lista de eventos",
    "rules": "Regla de alerta",
    "sub_rules": "Reglas de suscripción"
  }
};

export default es_ES;

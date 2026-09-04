const es_ES = {
  "title": "Reglas de suscripción",
  "search_placeholder": "Buscar por nombre de la suscripción, regla suscrita, etiqueta o grupo destinatario",
  "rule_name": "Reglas suscritas",
  "sub_rule_name": "Suscribirse a reglas de alerta",
  "sub_rule_selected": "Reglas seleccionadas",
  "tags": "Etiquetas suscritas",
  "user_groups": "Grupos destinatarios",
  "notify_rule_ids": "Regla de notificación",
  "tag": {
    "key": {
      "label": "Claves de etiqueta suscritas",
      "tip": "Las etiquetas de aquí son las del evento de alerta, y las reglas de abajo filtran los eventos por ellas",
      "required": "La clave de la etiqueta no puede estar vacía",
      "placeholder": "Introduce la clave de la etiqueta"
    },
    "func": {
      "label": "Operador"
    },
    "value": {
      "label": "Valor de la etiqueta",
      "equal_placeholder": "Introduce el valor",
      "include_placeholder": "Puedes introducir varios valores separados por Intro",
      "regex_placeholder": "Introduce la expresión regular de coincidencia",
      "required": "El valor de la etiqueta no puede estar vacío"
    }
  },
  "group": {
    "key": {
      "label": "Grupos de negocio suscritos",
      "placeholder": "Grupo de negocio"
    },
    "func": {
      "label": "Operador"
    },
    "value": {
      "label": "Valor",
      "required": "El valor no puede estar vacío"
    }
  },
  "redefine_severity": "Redefinir la severidad de la alerta",
  "redefine_channels": "Redefinir el medio de notificación",
  "redefine_webhooks": "Redefinir la URL de callback",
  "user_group_ids": "Grupos destinatarios de la suscripción",
  "for_duration": "Suscribirse a eventos con una duración superior a (segundos)",
  "for_duration_tip": "Por ejemplo, con el valor 300: la primera vez que se capta un evento, no coincide con la suscripción. Las siguientes veces se calcula la diferencia entre el disparo actual y el primero captado; si supera los 300 segundos, la suscripción se cumple y la notificación sigue su curso. Por debajo, no ocurre nada. Esto sirve como escalado: el responsable del equipo puede suscribirse a eventos de más de una hora (3600 s) de duración y ponerse a sí mismo como destinatario, de modo que ninguna alerta quede sin seguimiento.",
  "webhooks": "Nueva URL de callback",
  "webhooks_msg": "La URL de callback no puede estar vacía",
  "prod": "Tipo de monitorización",
  "subscribe_btn": "Suscripción",
  "basic_configs": "Configuración básica",
  "severities": "Severidades suscritas",
  "severities_msg": "Las severidades suscritas no pueden estar vacías",
  "tags_groups_require": "Introduce al menos una etiqueta o un grupo destinatario",
  "note": "Nombre de la suscripción",
  "filter_configs": "Configuración de los filtros",
  "notify_configs": "Configuración de notificación",
  "and": "Y",
  "btn_add_rule": "Añadir regla",
  "basic_configs_desc": "Nombre y estado de activación de la regla de suscripción; el nombre puede generarse automáticamente a partir de la configuración de arriba",
  "filter_configs_desc": "Determina qué eventos capta esta suscripción. Las condiciones de abajo se combinan con Y; si se dejan todas vacías, se captan todos los eventos",
  "notify_configs_desc": "Los eventos captados se notifican de nuevo según las reglas de abajo, algo que suele servir para escalar o derivar a otro equipo",
  "no_filter_warning": "No hay ningún filtro configurado: esta suscripción captará todos los eventos de alerta",
  "sub_rule_select": "Seleccionar reglas de alerta",
  "for_duration_placeholder": "Vacío o 0 significa sin límite",
  "note_msg": "El nombre de la suscripción no puede estar vacío",
  "notify_rule_ids_msg": "Selecciona al menos una regla de notificación; sin ella, los eventos captados no avisan a nadie",
  "name_auto": {
    "tip": "El nombre se genera automáticamente a partir de los filtros y las notificaciones de arriba, y puede cambiarse en cualquier momento",
    "all": "Todas las alertas",
    "escalation": "Escalar",
    "separator": ", ",
    "joiner": "-",
    "clone_suffix": "-copia"
  },
  "section_summary": {
    "severities_all": "Todas las severidades",
    "severities_none": "No se ha seleccionado ninguna severidad; no se corresponderá con ningún evento",
    "rules_count": "{{count}} reglas",
    "busi_groups_count": "{{count}} condiciones de grupo de negocio",
    "tags_count": "{{count}} condiciones de etiqueta",
    "for_duration": "Con una duración superior a {{count}} segundos",
    "no_extra": "Sin otras restricciones",
    "notify_rules_none": "No se ha seleccionado ninguna regla de notificación",
    "user_groups_none": "No se ha seleccionado ningún grupo destinatario",
    "unnamed": "Sin nombre",
    "enabled": "Activado",
    "disabled": "Desactivado"
  },
  "empty_guide": {
    "title": "Aún no hay reglas de suscripción",
    "doc": "Ver la documentación de uso"
  },
  "scenario_tips": {
    "title": "Las reglas de suscripción encajan bien en tres escenarios",
    "cross_team": "Suscribirte a alertas ajenas: el servicio del que dependes lo lleva otro equipo, pero un fallo allí te afecta, así que conviene recibir sus alertas de SLI",
    "escalation": "Escalado de respaldo: las alertas que llevan más de una hora sin recuperarse avisan también al responsable del equipo",
    "global_callback": "Callback global: todos los eventos de alerta llaman a un webhook para automatizar",
    "more": "Más información"
  },
  "filter_disabled": {
    "0": "Activado",
    "1": "Desactivado",
    "placeholder": "Estado de activación"
  }
};

export default es_ES;

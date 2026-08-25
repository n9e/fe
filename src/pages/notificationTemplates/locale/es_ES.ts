const es_ES = {
  "title": "Plantillas de mensaje",
  "add_title": "Añadir plantilla de mensaje",
  "edit_title": "Editar plantilla de mensaje",
  "clone_title": "Clonar plantilla de mensaje",
  "user_group_ids": "Equipos autorizados",
  "private": {
    "0": "Pública",
    "1": "Privado",
    "title": "Modo de visualización"
  },
  "notify_channel_ident": "Tipo de medio",
  "content": {
    "add_title": "Añadir campo de la plantilla",
    "edit_title": "Editar campo de la plantilla",
    "preview": "Ver el contenido de la plantilla",
    "contentKey": "Identificador del campo",
    "tip": "Campo que puede usarse en el medio de notificación; referencia su contenido con $tpl.{{contentKey}}",
    "prompt": "El contenido se ha modificado. ¿Quieres descartar los cambios?",
    "value_msg": "Introduce el contenido del campo",
    "ai_generate": "Generar con IA"
  },
  "preview": {
    "mode": {
      "history": "Eventos históricos",
      "mock": "Evento simulado"
    },
    "empty_alert": "Este entorno aún no tiene eventos de alerta en el historial",
    "switch_btn": "Ver la vista previa con un evento simulado",
    "select_events": "Seleccionar evento de alerta",
    "result": "Vista previa del resultado"
  },
  "starter": {
    "rule_name": "Regla",
    "severity": "Severidad",
    "status": "Estado",
    "firing": "Disparo",
    "recovered": "Recuperado",
    "tags": "Etiquetas",
    "trigger_value": "Valor en el disparo",
    "time": "Tiempo",
    "detail": "Detalles"
  },
  "empty_guide": {
    "title": "Crear la primera plantilla de mensaje",
    "desc": "La plantilla de mensaje define el formato del contenido de la notificación. Al crear una, generamos automáticamente una versión lista para usar según el medio elegido, que puedes ajustar."
  },
  "fields_panel": {
    "desc": "Variables del evento de alerta que pueden usarse en la plantilla. Pulsa cualquiera para copiarla y pégala en el editor de la izquierda.",
    "fields": {
      "event": "El objeto completo del evento de alerta, útil para inspeccionar todos los campos",
      "labels": "Mapa de etiquetas del evento, equivalente a $event.TagsMap",
      "value": "Valor en el disparo, equivalente a $event.TriggerValue",
      "domain": "Dirección del sitio, usada para construir el enlace a los detalles del evento",
      "timestamp": "Hora actual, que suele usarse como hora de envío del mensaje",
      "timeformat": "Convierte una marca de tiempo en una fecha legible; sirve con cualquier campo de tiempo",
      "Id": "ID del evento de alerta",
      "Cate": "Categoría de la alerta, por ejemplo 'prometheus'",
      "Cluster": "Nombre del origen de datos",
      "DatasourceId": "ID del origen de datos",
      "GroupId": "ID del grupo de negocio",
      "GroupName": "Nombre del grupo de negocio",
      "Hash": "Hash del evento de alerta",
      "RuleId": "ID de la regla",
      "RuleName": "Nombre de la regla",
      "RuleNote": "Observación de la regla",
      "RuleHash": "Hash de la regla",
      "Severity": "Severidad de la alerta (1-3)",
      "Status": "Estado de la alerta",
      "PromQl": "Consulta de la alerta",
      "PromForDuration": "Duración (segundos)",
      "PromEvalInterval": "Intervalo de evaluación (segundos)",
      "SubRuleId": "ID de la regla de suscripción",
      "TriggerTime": "Marca de tiempo del disparo",
      "TriggerValue": "Valor en el disparo",
      "TriggerValues": "Valor en el disparo (formato bruto)",
      "FirstTriggerTime": "Primer disparo",
      "IsRecovered": "Ya recuperado",
      "NotifyCurNumber": "Notificaciones ya enviadas",
      "LastEvalTime": "Última evaluación",
      "LastSentTime": "Último envío",
      "TagsJSON": "Lista de etiquetas",
      "TagsMap": "Mapa de etiquetas en pares clave-valor",
      "TagsMap_instance": "Obtiene una etiqueta concreta; sustituye instance por el nombre de tu etiqueta",
      "AnnotationsJSON": "Mapa de anotaciones en pares clave-valor",
      "AnnotationsJSON_summary": "Obtiene una anotación concreta; sustituye summary por el nombre de tu anotación",
      "TargetIdent": "Identificador del objeto",
      "TargetNote": "Observación del objeto",
      "NotifyRecovered": "Notificar la recuperación",
      "NotifyChannelsJSON": "Lista de canales de notificación",
      "NotifyGroupsJSON": "Lista de grupos destinatarios",
      "NotifyRuleIds": "Lista de ID de las reglas de notificación",
      "CallbacksJSON": "Lista de URL de devolución de llamada",
      "ExtraConfig": "Configuración adicional",
      "ExtraInfo": "Lista de información adicional",
      "ExtraInfoMap": "Mapa de información adicional"
    },
    "search_placeholder": "Buscar campos",
    "no_match": "No hay ningún campo que coincida",
    "copy_tip": "Pulsa para copiar",
    "groups": {
      "common": "Más usados",
      "basic": "Datos básicos",
      "trigger": "Relacionados con el disparo",
      "tags": "Etiquetas y anotaciones",
      "target": "Relacionados con la máquina",
      "notify": "Relacionados con la notificación",
      "extra": "Devoluciones de llamada y extensiones"
    }
  }
};

export default es_ES;

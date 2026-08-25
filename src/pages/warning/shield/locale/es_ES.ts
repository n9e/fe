const es_ES = {
  "title": "Reglas de silenciamiento",
  "edit_missing_params": "Faltan parámetros obligatorios y no se puede editar. Ponte en contacto con el administrador",
  "search_placeholder": "Buscar por título de la regla, etiqueta o motivo del silenciamiento",
  "datasource_type": "Tipo de origen de datos",
  "datasource_id": "Origen de datos",
  "cause": "Motivo del silenciamiento",
  "cause_tip": "Deja constancia del contexto de este silenciamiento para que el equipo entienda por qué existe y cuándo puede levantarse",
  "cause_placeholder": "Por ejemplo: despliegue del servicio de pedidos, previsto para una hora",
  "time": "Periodo del silenciamiento",
  "note": "Título de la regla",
  "btime": "Inicio del silenciamiento",
  "btime_msg": "El inicio del silenciamiento no puede estar vacío",
  "duration": "Duración del silenciamiento",
  "duration_quick": "Duraciones rápidas",
  "duration_quick_tip": "El fin se calcula a partir del inicio del silenciamiento; también puedes editar las fechas de abajo directamente",
  "etime": "Fin del silenciamiento",
  "etime_msg": "El fin del silenciamiento no puede estar vacío",
  "etime_before_btime_msg": "El fin del silenciamiento debe ser posterior al inicio",
  "expired_tip": "Esta regla ha caducado y ya no silencia ninguna alerta. Para reactivarla, elige una duración rápida o cambia la fecha de fin",
  "long_duration_tip": "El silenciamiento supera los {{days}} días, y las alertas quedarán invisibles todo ese tiempo. Confirma que es lo que quieres",
  "prod": "Tipo de monitorización",
  "severities": "Severidad del evento",
  "severities_tip": "Solo se silencian las severidades marcadas; las demás siguen alertando con normalidad",
  "severities_msg": "La severidad del evento no puede estar vacía",
  "scope_unlimited_tip": "Sin origen de datos ni etiquetas configurados, esta regla silenciará todos los eventos del grupo de negocio seleccionado. Confirma que es lo que quieres",
  "mute_type": {
    "0": "Periodo fijo",
    "1": "Periodo recurrente",
    "label": "Tipo de periodo",
    "days_of_week": "Periodo del silenciamiento",
    "days_preset": {
      "everyday": "Todos los días",
      "workday": "Días laborables",
      "weekend": "Fines de semana"
    },
    "start": "Inicio",
    "start_msg": "El inicio no puede estar vacío",
    "end": "Fin",
    "end_msg": "El fin no puede estar vacío",
    "periodic_tip": "El silenciamiento recurrente no caduca: cada semana se silencian las alertas que caigan en las franjas indicadas. Un inicio y un fin iguales significan todo el día"
  },
  "mute_method": {
    "0": "Silenciar el evento y la notificación",
    "1": "Silenciar solo la notificación",
    "hint_title": "Cómo elegir entre los dos modos",
    "hint_notify_only": "Silenciar solo la notificación: el evento se sigue generando y registrando, simplemente no avisa a nadie. Es lo adecuado para reinicios y ventanas de mantenimiento, porque después aún puedes revisar qué pasó.",
    "hint_all": "Silenciar el evento y la notificación: ni siquiera se genera el evento. Es lo adecuado para el ruido que ya sabes que no necesitas seguir.",
    "hint_dismiss": "No volver a mostrar",
    "label": "Modo de silenciamiento",
    "0_desc": "(no genera evento ni notificación)",
    "1_desc": "(registra el evento con normalidad, simplemente no notifica)",
    "tip": "Con «Silenciar solo la notificación», las alertas que coincidan durante el periodo siguen generando y registrando eventos, simplemente sin avisar. Así puedes detectar anomalías ocurridas durante el cambio y levantar el silenciamiento cuando todo esté resuelto."
  },
  "tag": {
    "key": {
      "label": "Etiquetas del evento",
      "tip": "Las etiquetas de aquí son las del evento de alerta, y las reglas de abajo filtran los eventos por ellas. Se admiten varios operadores:\n\n- `==` coincide con un valor concreto; solo admite uno. Para varios a la vez, usa `in`\n- `=~` admite una expresión regular, lo que permite coincidencias flexibles\n- `in` coincide con varios valores, como el `in` de SQL\n- `not in` excluye varios valores, como el `not in` de SQL\n- `!=` distinto de, para excluir un valor concreto\n- `!~` expresión regular negada: se excluyen todos los valores que coincidan con ella, como el `!~` de PromQL"
    }
  },
  "name_auto_tip": "El título se genera automáticamente a partir de los filtros de arriba y puede cambiarse en cualquier momento",
  "name_auto_template": "Silenciar {{scope}}",
  "name_auto_separator": "、",
  "name_auto_all_alerts": "Todas las alertas",
  "summary": {
    "severities_all": "Todas las severidades",
    "tags_none": "Sin restricción de etiqueta",
    "tags_count": "{{count}} condiciones de etiqueta",
    "periodic_count": "{{count}} franjas horarias"
  },
  "basic_configs": "Datos básicos",
  "basic_configs_desc": "Título de la regla y motivo del silenciamiento, lo que facilita el trabajo en equipo y las búsquedas posteriores",
  "filter_configs": "Filtros",
  "filter_configs_desc": "Determina qué eventos se silencian: grupo de negocio, origen de datos, severidad y etiquetas. Las condiciones se combinan con Y; si se dejan vacías, no hay restricción",
  "mute_configs": "Configuración del silenciamiento",
  "mute_configs_desc": "Determina cuándo y hasta qué punto silenciar: un periodo fijo o una franja semanal recurrente",
  "alert_content": "Para evitar que una configuración errónea silencie todas las alertas de la empresa, esta regla solo se aplica a los eventos de un grupo de negocio concreto",
  "preview_muted_title": "Ver los eventos relacionados",
  "preview_muted_desc": "Abajo están los eventos de alerta ya existentes que cumplen estos filtros. Tras guardar, los eventos nuevos del mismo tipo se silenciarán, pero los que ya existen no desaparecen solos; si quieres, elimínalos aquí.",
  "preview_muted_save_only": "Solo guardar",
  "preview_muted_save_and_delete": "Guardar y eliminar los eventos relacionados",
  "expired": "Caducado",
  "empty_guide": {
    "title": "Aún no hay reglas de silenciamiento",
    "desc": "Durante despliegues, mantenimientos y simulacros, usa una regla de silenciamiento para contener temporalmente las alertas conocidas y no molestar a quien está de guardia. Caduca sola, sin necesidad de intervenir.",
    "select_busi_group": "Elige un grupo de negocio a la izquierda para poder crear una regla de silenciamiento"
  },
  "delete_mutes": {
    "title": "Limpieza de reglas de silenciamiento",
    "alert_message": "Una vez eliminados, los datos no se pueden recuperar. Procede con cuidado.",
    "timestamp": "Filtro por fecha",
    "timestamp_options": {
      "1": "Hace más de 1 mes",
      "3": "Hace más de 3 meses",
      "6": "Hace más de 6 meses",
      "12": "Hace más de 1 año"
    }
  },
  "filter_disabled": {
    "0": "Activar",
    "1": "Desactivar",
    "placeholder": "Situación"
  }
};

export default es_ES;

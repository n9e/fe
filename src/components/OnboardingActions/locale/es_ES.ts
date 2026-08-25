const es_ES = {
  "close": "Cerrar",
  "card": {
    "title": "Siguientes pasos",
    "later": "También puedes continuar más tarde desde la lista de máquinas",
    "optional": "Opcional",
    "dismiss": "No volver a mostrar",
    "rows": {
      "collect": {
        "title": "Configurar la recolección",
        "desc": "Las métricas básicas del sistema operativo ya se recogen automáticamente; las bases de datos y el middleware se configuran según haga falta",
        "action": "Configurar"
      },
      "pack": {
        "title": "Aplicar el panel de hosts y activar las alertas de host",
        "desc": "Importa los paneles y las reglas de alerta integrados con un clic",
        "action": "Activar con un clic"
      },
      "notify": {
        "title": "Vincular notificaciones",
        "desc": "Basta con pegar el webhook del bot de DingTalk, Feishu o WeCom",
        "action": "Creación rápida"
      },
      "test": {
        "title": "Enviar alerta de prueba",
        "desc": "Comprueba que la alerta llega realmente hasta ti",
        "action": "Enviar"
      }
    }
  },
  "pack": {
    "title": "Activar el paquete básico de monitorización de hosts",
    "intro": "Se importarán y activarán:",
    "boards": "Panel",
    "rules": "Regla de alerta",
    "boards_count": "Paneles × {{count}}",
    "rules_count": "Reglas de alerta × {{count}}, activadas justo tras importarlas",
    "preview": "Ver y seleccionar",
    "existing": "(ya existe)",
    "existing_skipped": "El grupo de negocio de destino ya tiene un panel con este nombre; se omitirá",
    "rule_existing_skipped": "El grupo de negocio de destino ya tiene una regla de alerta con este nombre; se omitirá y no se sobrescribirá la configuración existente",
    "already_imported": "Todos los paneles seleccionados ya existen en este grupo de negocio; solo se añadirán las reglas de alerta",
    "boards_incomplete": "No se encontró ninguna plantilla de panel de hosts integrada; abre «Ver y seleccionar» y elígelas manualmente",
    "notify_rules": "Regla de notificación",
    "notify_rules_tip": "Sin una regla de notificación vinculada, la alerta genera eventos pero no se envía a nadie",
    "notify_rules_placeholder": "Elige una regla de notificación existente o pulsa «Creación rápida» arriba para crear una",
    "quick_create": "Creación rápida",
    "submit": "Activar con un clic",
    "view_board": "Ver el panel de hosts",
    "next_test": "Enviar alerta de prueba",
    "no_notify_warning": "Estas reglas de alerta aún no tienen una regla de notificación vinculada, así que no avisarán a nadie cuando se disparen",
    "go_bind_notify": "Ir a la lista de reglas y vincularlas en lote",
    "component_missing": "No se encontró la integración de Linux integrada; no se puede activar con un clic",
    "load_failed": "No se pudieron leer las plantillas integradas",
    "go_components": "Importar manualmente desde el centro de integraciones",
    "bad_template": "No se pudieron interpretar las plantillas integradas",
    "unknown_error": "Error desconocido"
  },
  "notify": {
    "bind_hint": "La regla de notificación se creó, pero las alertas de host ya activas aún no están vinculadas a ella, así que las alertas reales siguen sin avisar a nadie"
  },
  "test": {
    "title": "Enviar alerta de prueba",
    "rule_label": "Qué regla de notificación usar para el envío",
    "send": "Enviar alerta de prueba",
    "result_title": "Resultado del envío",
    "sent": "Se invocó el medio de notificación y devolvió lo siguiente",
    "sent_hint": "Comprueba en el grupo o en el correo si llegó el mensaje de prueba: solo así sabrás que la cadena de notificación funciona de verdad",
    "no_rule": "Aún no hay reglas de notificación configuradas",
    "go_create_rule": "Crear una regla de notificación",
    "rule_without_config": "Esta regla de notificación aún no tiene un medio configurado, así que no se puede enviar",
    "no_channel": "No se ha seleccionado ningún medio de notificación",
    "channel_fallback": "Medio de notificación {{index}}",
    "go_check_channel": "Revisar los medios de notificación",
    "channel_doc": "Ver la documentación de configuración",
    "unknown_error": "Error en el envío: error desconocido"
  }
};

export default es_ES;

const es_ES = {
  "toolbar": {
    "current_chat": "Sesión actual",
    "new_chat": "Nueva sesión",
    "history": "Historial de sesiones",
    "share": "Compartir",
    "share_copied": "Enlace para compartir copiado",
    "switch_to_drawer": "Cambiar a modo panel lateral",
    "switch_to_floating": "Cambiar a modo ventana flotante"
  },
  "history": {
    "untitled": "Nueva sesión",
    "today": "Hoy",
    "yesterday": "Ayer",
    "earlier": "Anteriores",
    "unknown_time": "--:--",
    "delete_confirm": "¿Eliminar esta sesión?",
    "empty": "No hay sesiones en el historial",
    "search_placeholder": "Buscar sesiones",
    "share": "Compartir sesión",
    "rename": "Renombrar",
    "more_actions": "Más acciones de la sesión"
  },
  "nightingale": {
    "title": "Nightingale AI",
    "new_chat": "Nueva sesión",
    "sessions": "Sesión",
    "llm_configs": "Gestión de LLM",
    "skills": "Gestión de skills",
    "mcp_servers": "Gestión de MCP",
    "ai_task": "Canal de tareas",
    "collapse_sidebar": "Contraer el panel de IA",
    "expand_sidebar": "Expandir el panel de IA",
    "welcome_cards": {
      "overview": {
        "title": "Conoce Nightingale rápidamente",
        "description": "Entiende en un minuto qué pueden hacer el producto y el asistente de IA",
        "prompt": "Preséntame en un minuto las funciones principales de Nightingale y qué puedes hacer por mí"
      },
      "alerts": {
        "title": "Revisar mis alertas",
        "description": "Qué reglas se disparan demasiado y cuáles no se han disparado nunca",
        "prompt": "Haz un balance de mis reglas de alerta: cuáles se dispararon con más frecuencia en los últimos 7 días y cuáles no se dispararon ninguna vez"
      },
      "create_alert": {
        "title": "Crea una alerta con una frase",
        "description": "Describe el escenario y yo genero la PromQL y el umbral",
        "prompt": "Crea una regla de alerta: que se dispare cuando el uso de CPU del host supere el 80 % durante 5 minutos"
      }
    }
  },
  "input": {
    "placeholder": "Escribe tu pregunta. Enter envía, Shift + Enter añade un salto de línea",
    "share_readonly_placeholder": "Modo de compartición de solo lectura"
  },
  "query": {
    "title": "Consulta",
    "copied": "Consulta copiada",
    "copy": "Copiar",
    "execute": "Ejecutar consulta",
    "execute_disabled": "No se proporcionó un callback de ejecución; solo se podrá copiar"
  },
  "action": {
    "query_generator": "Generar consulta"
  },
  "message": {
    "generating": "Pensando...",
    "processing": "Aún procesando",
    "hint": "Aviso",
    "no_llm_title": "No hay ningún modelo de lenguaje configurado en este entorno",
    "no_llm_content": "Ve a la página de <a>gestión de LLM</a> para añadir una configuración de modelo",
    "stopped": "Generación detenida",
    "request_failed": "La solicitud falló",
    "cancelled": "Esta respuesta se canceló.",
    "retry_later": "Inténtalo de nuevo más tarde.",
    "empty_response": "No hay respuesta disponible",
    "thinking": "Razonamiento",
    "unsupported_type": "Tipo de contenido no admitido: {{type}}"
  },
  "form_select": {
    "title": "Completa los datos siguientes para continuar:",
    "approval_title": "Confirma si deseas ejecutar la acción anterior:",
    "busi_group": "Grupo de negocio",
    "datasource": "Origen de datos",
    "team": "Equipo",
    "skill_scope": "Visibilidad",
    "placeholder_select": "Selecciona",
    "confirm": "Aceptar"
  },
  "alert_rule": {
    "title": "Regla de alerta",
    "copy": "Copiar",
    "copied": "ID de la regla copiado",
    "duration_seconds": "Durante {{seconds}} segundos",
    "field": {
      "id": "ID de la regla",
      "name": "Nombre de la regla",
      "group": "Grupo de negocio",
      "datasource": "Origen de datos",
      "cate": "Tipo de origen de datos",
      "severity": "Severidad de la alerta",
      "metric": "Métrica monitorizada",
      "condition": "Condición de disparo",
      "note": "Contenido de la alerta"
    },
    "severity": {
      "critical": "Critical",
      "warning": "Warning",
      "info": "Info"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "copied": "ID del dashboard copiado",
    "field": {
      "id": "ID del dashboard",
      "name": "Nombre",
      "group": "Grupo de negocio",
      "datasource": "Origen de datos predeterminado",
      "panels_count": "Paneles",
      "variables_count": "Variables",
      "tags": "Etiquetas"
    }
  },
  "empty": {
    "greeting_prefix": "Hola, soy"
  },
  panel: {
    open: 'Generar consulta con IA',
    untitled: 'Generado por IA',
    intro: 'Describe lo que quieres ver con palabras normales. Verifico la respuesta en esta fuente de datos antes de ponerla en el campo de arriba y ejecutarla.',
    based_on: 'basado en {{name}}',
    running: 'Generando',
    adopted: 'Adoptado',
    failed: 'Sin resultado',
    close: 'Cerrar',
    step: {
      command: '{{count}} comando(s) ejecutado(s)',
      read_file: '{{count}} archivo(s) leído(s)',
      edit_file: '{{count}} archivo(s) escrito(s)',
      separator: ' · ',
    },
    written_back: 'Escrito en el campo de arriba y ejecutado',
    undo: 'Deshacer',
    regenerate: 'Regenerar',
    another_way: 'Otra forma',
    another_way_prompt: 'Escríbela de otra forma: una expresión equivalente, redactada distinto',
    send: 'Enviar',
    follow_up_placeholder: 'Sigue, p. ej. «agrupar por pod»',
    answer_below: 'Responde abajo para continuar',
    needs_answer: 'Falta respuesta',
    error_detail: 'Detalle del error',
    nothing_delivered: 'Ninguna expresión utilizable',
    failed_title: "Generation failed",
    failed_hint: "Try again; if it keeps failing, check the AI model configuration.",
    retry: "Retry",
    stop: "Stop",
    refill: "Fill in again",
    restored: "Your original content is back",
    understanding: "Reading your question…",
    verified_by: "Checked by: {{detail}}",
    first_placeholder: "What do you want to see?",
    answer_placeholder: "Answer the question above…",
    timeout: 'Tiempo agotado, inténtalo de nuevo',
    stopped: "Stopped",
    stopped_hint: "Stopped. The field above is unchanged.",
    copy: "Copy",
    field_changed: "The field has been edited",
    timeout_title: "Five minutes with no result",
    unreachable_title: "Cannot reach the AI service",
    unreachable_hint: "Check the network and try again.",
    no_model_hint: "No AI model is available. Ask an administrator to add or enable one.",
    example_fallback: "CPU usage per host",

  },
};

export default es_ES;

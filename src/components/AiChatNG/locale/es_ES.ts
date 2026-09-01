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
  "ui_action": {
    "title": "Acción de página",
    "generating": "Generando la acción de página…",
    "invalid_json": "Esta acción no es un JSON válido y no se puede ejecutar",
    "unsupported": "La página actual no ofrece la acción \"{{name}}\"",
    "args": "Parámetros",
    "execute": "Ejecutar",
    "executing": "Ejecutando",
    "succeeded": "Ejecutada",
    "failed": "Error al ejecutar"
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
  }
};

export default es_ES;

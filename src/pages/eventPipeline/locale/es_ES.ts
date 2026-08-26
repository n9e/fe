const es_ES = {
  "title": "Flujos de trabajo",
  "title_add": "Añadir flujo de trabajo",
  "title_edit": "Editar flujo de trabajo",
  "title_clone": "Clonar flujo de trabajo",
  "teams": "Equipos autorizados",
  "teams_tip": "Define qué equipos pueden ver y modificar esta configuración; se pueden asociar varios<br />Por ejemplo, si la autorizas al equipo infra-team, solo sus miembros podrán acceder a ella o ajustarla.",
  "basic_configuration": "Configuración básica",
  "filter_enable": "Filtro",
  "label_filters": "Etiquetas aplicables",
  "label_filters_tip": "Define el filtro de etiquetas del procesamiento: solo entran los eventos cuyas etiquetas coincidan con lo configurado aquí.<br />Por ejemplo, con service=mon, solo los eventos que tengan la etiqueta service=mon siguen este flujo.",
  "attribute_filters": "Atributos aplicables",
  "attribute_filters_tip": "Define el filtro de atributos del procesamiento: solo entran los eventos cuyos atributos coincidan con lo configurado aquí.<br />Por ejemplo, con grupo de negocio == DefaultBusiGroup, solo los eventos cuyo atributo de grupo de negocio sea DefaultBusiGroup siguen este flujo.",
  "attribute_filters_value": "Valor del atributo",
  "attribute_filters_options": {
    "group_name": "Grupo de negocio",
    "cluster": "Origen de datos",
    "is_recovered": "¿Es un evento de recuperación?",
    "severity": "Niveles de alerta"
  },
  "use_case": {
    "label": "Finalidad",
    "firemap": "Firemap",
    "event_pipeline": "Procesamiento de eventos"
  },
  "processors_col": "Procesador",
  "clone_suffix": "-copia",
  "unsaved_confirm": "Hay cambios sin guardar. ¿Quieres cerrar?",
  "search_placeholder": "Buscar por nombre, observación o tipo de procesador",
  "empty_guide": {
    "title": "Aún no hay flujos de trabajo",
    "doc": "Ver la documentación de uso",
    "mount_hint": "Crear un flujo de trabajo no lo pone en marcha: solo se ejecuta cuando lo referencia una regla de alerta o de notificación"
  },
  "scenario_tips": {
    "title": "Los flujos de trabajo encajan bien en tres escenarios",
    "denoise": "Reducción de ruido: descartar o suprimir alertas de baja severidad o repetidas antes de notificar",
    "enrich": "Enriquecimiento: añadir a la alerta etiquetas de negocio, un resumen generado por IA o el contexto obtenido en una consulta",
    "dispatch": "Integración externa: enviar la alerta a sistemas de tickets o automatización, o lanzar un script de autorreparación",
    "more": "Más información"
  },
  "trigger_mode": {
    "label": "Modo de activación",
    "event": "Por evento",
    "api": "Por API"
  },
  "disabled": {
    "filter_placeholder": "Estado de activación",
    "form_label": "Activar",
    "label": "Activar",
    "false": "Activar",
    "true": "Desactivar"
  },
  "inputs": {
    "label": "Variables de entrada",
    "help": "Las variables de entrada pueden referenciarse en los procesadores de abajo mediante {{$inputs.nombre_de_la_variable}}. Por ejemplo, define una variable ident y usa {{$inputs.ident}} en un procesador para indicar en qué máquina se ejecutará el script.",
    "add_btn": "Añadir variable",
    "key": "Nombre de la variable",
    "key_required": "El nombre de la variable no puede estar vacío",
    "value": "Valor predeterminado de la variable",
    "description": "Descripción de la variable"
  },
  "executions": {
    "title": "Registros de ejecución",
    "search_placeholder": "Introduce la palabra clave de búsqueda",
    "status": {
      "label": "Estado",
      "running": "En ejecución",
      "success": "Correcto",
      "failed": "Fallido",
      "terminated": "Interrumpido",
      "skipped": "Omitido",
      "streaming": "Transmitiendo la salida"
    },
    "id": "ID de la ejecución",
    "pipeline_name": "Nombre del flujo de trabajo",
    "mode": "Modo de activación",
    "created_at": "Inicio",
    "finished_at": "Fin",
    "duration_ms": "Duración de la ejecución",
    "trigger_by": "Activado por",
    "detail_title": "Detalles de la ejecución",
    "detail_basic_info": "Datos básicos",
    "error_message": "Mensaje de error",
    "message": "Mensaje de la ejecución",
    "error_node": "Nodo con error",
    "inputs_snapshot": "Instantánea de las variables de entrada",
    "node_results_parsed_title": "Resultado por nodo",
    "event_id": "ID del evento",
    "view_all": "Ver todo",
    "filtered_by": "Flujo de trabajo: {{name}}",
    "trigger_by_alert_rule": "Regla de alerta n.º {{id}}",
    "trigger_by_notify_rule": "Regla de notificación n.º {{id}}",
    "empty_guide": {
      "title": "No hay registros de ejecución en este periodo",
      "desc": "Cada ejecución del flujo de trabajo lanzada por una regla de alerta o de notificación aparece aquí. Amplía el intervalo de tiempo de arriba o relaja los filtros para ver más."
    }
  },
  "test_modal": {
    "title": {
      "settings": "Seleccionar evento de prueba",
      "result": "Resultado de la ejecución de prueba"
    },
    "result_success": "Ejecutado correctamente",
    "result_failed": "Error en la ejecución",
    "dropped": "El evento se descartó o suprimió en esta etapa; los procesadores siguientes no se ejecutan y no se genera ninguna notificación",
    "steps_title": "Resultado nodo a nodo",
    "event_preview_title": "Evento tras el procesamiento",
    "back_btn": "Elegir otro evento",
    "back_btn_mock": "Volver a configurar el evento de ejemplo",
    "fidelity_note": "La ejecución de prueba usa la ruta de activación por API y omite parte del flujo real, como la evaluación de los filtros, así que el resultado puede diferir de una alerta real. Toma los eventos reales como referencia.",
    "fidelity_note_mock": "La ejecución de prueba usa la ruta de activación por API y omite parte del flujo real, como la evaluación de los filtros. Esta prueba usó un evento de ejemplo, no una alerta real; vuelve a validarlo con un evento real antes de pasar a producción.",
    "mode": {
      "history": "Eventos históricos",
      "mock": "Evento de ejemplo"
    },
    "mock": {
      "desc": "El evento de ejemplo lo compone el sistema y no se guarda en la base de datos, lo que permite validar los procesadores incluso en entornos nuevos sin historial de alertas. La severidad y el estado de recuperación son ajustables, de modo que cubren los procesadores que se ramifican por esos criterios.",
      "preview_title": "Evento de ejemplo",
      "severity": "Severidad de la alerta",
      "is_recovered": "Evento de recuperación",
      "tags": "Etiquetas del evento",
      "empty_alert": "No hay eventos de alerta históricos en este periodo",
      "switch_btn": "Probar con un evento de ejemplo"
    }
  },
  "batch": {
    "not_select": "Selecciona primero los flujos de trabajo",
    "export": {
      "title": "Exportar en lote"
    },
    "delete": "Eliminar en lote",
    "enable": "Activar en lote",
    "disable": "Desactivar en lote",
    "already_enabled": "Todos los flujos seleccionados ya están activos",
    "already_disabled": "Todos los flujos seleccionados ya están desactivados",
    "enable_confirm": "¿Confirmas la activación de los {{count}} flujos seleccionados?",
    "disable_confirm": "¿Confirmas la desactivación de los {{count}} flujos seleccionados?",
    "delete_enabled_confirm": "{{count}} de ellos siguen activos y se desactivarán antes de eliminarlos. ¿Quieres continuar?",
    "delete_confirm": "¿Confirmas la eliminación de los {{count}} flujos seleccionados? Las reglas de alerta y de notificación que los usan dejarán de funcionar."
  },
  "relabel_fields": {
    "action": "Acción",
    "target_label": "Etiqueta de destino",
    "replacement": "Valor de la etiqueta",
    "source_labels": "Etiqueta de origen",
    "separator": "Separador",
    "regex": "Expresión regular",
    "replace_hint": "replace: extrae el valor de la etiqueta de origen con la expresión regular y lo escribe en la etiqueta de destino. Si solo rellenas la etiqueta de destino y el valor, el evento recibe una etiqueta fija. Con la etiqueta de destino vacía, este procesador no hace nada."
  },
  "processor_message": {
    "drop_hit": "Se cumplió la condición de descarte y el evento se descartó",
    "drop_miss": "No se cumplió la condición de descarte y el evento continúa",
    "no_change": "Sin cambios"
  },
  "processor": {
    "title": "Procesador",
    "add_btn": "Añadir procesador",
    "typ": "Tipo",
    "typ_required": "Elige el tipo de procesador; sin un tipo definido, falla con todos los eventos",
    "help_btn": "Instrucciones de uso",
    "options": {
      "relabel": "Reescritura de etiquetas del evento",
      "label_enrich": "Enriquecimiento de etiquetas del evento",
      "inhibit": "Supresión de eventos",
      "event_drop": "Descarte de eventos",
      "event_update": "Actualización de eventos",
      "inhibit_qd": "Supresión de eventos (por consulta)",
      "annotation_qd": "Enriquecimiento con información adicional (por consulta)",
      "callback": "Callback por webhook",
      "ai_summary": "Resumen generado por IA",
      "script": "Ejecución de script",
      "event_recover": "Autorreparación",
      "alert_shot": "Captura de pantalla de la alerta"
    },
    "category": {
      "rewrite": "Transformar el evento",
      "denoise": "Reducir el ruido",
      "enrich": "Enriquecer",
      "dispatch": "Integrar y ejecutar",
      "other": "Otros"
    },
    "options_desc": {
      "relabel": "Modifica, añade o elimina etiquetas del evento",
      "event_drop": "Descarta el evento según una condición e interrumpe el procesamiento",
      "event_update": "Llama a una API HTTP y actualiza el evento con la respuesta",
      "callback": "Envía el evento a un sistema externo, como tickets o automatización",
      "ai_summary": "Usa un modelo de lenguaje para generar un resumen del evento",
      "label_enrich": "Añade etiquetas al evento a partir del glosario integrado",
      "script": "Ejecuta un script para tratar el evento",
      "inhibit": "Suprime esta notificación cuando hay una alerta activa de mayor severidad",
      "inhibit_qd": "Suprime el evento según el resultado de una consulta",
      "annotation_qd": "Añade información al evento según el resultado de una consulta",
      "event_recover": "Lanza una tarea de autorreparación",
      "alert_shot": "Captura la pantalla de un dashboard o una página y la adjunta a la alerta"
    },
    "delete_confirm": "¿Confirmas la eliminación de este procesador?",
    "switch_type_confirm": "Cambiar el tipo borra la configuración actual de este procesador. ¿Confirmas?",
    "drag_tip": "Arrastra para reordenar",
    "move_up": "Subir",
    "move_down": "Bajar",
    "copy_tip": "Duplicar este procesador"
  },
  "form_section": {
    "filter": {
      "title": "Ámbito de procesamiento",
      "desc": "Define qué eventos entran en este flujo. Las condiciones se combinan con Y; si las dejas todas vacías, entran todos los eventos"
    },
    "processor": {
      "title": "Procesador",
      "desc": "Los eventos pasan por los procesadores de arriba abajo"
    },
    "basic": {
      "title": "Datos básicos",
      "desc": "Nombre, equipos autorizados y estado de activación del flujo de trabajo"
    }
  },
  "no_filter_warning": "No hay ningún filtro configurado: este flujo procesará todos los eventos de alerta",
  "section_summary": {
    "label_count": "{{count}} condiciones de etiqueta",
    "attr_count": "{{count}} condiciones de atributo",
    "no_filter": "Todos los eventos",
    "processor_count": "{{count}} procesadores",
    "unnamed": "Sin nombre",
    "enabled": "Activado",
    "disabled": "Desactivado"
  },
  "name_auto": {
    "tip": "El nombre se genera automáticamente a partir del ámbito y los procesadores de arriba, y puede cambiarse en cualquier momento",
    "all": "Todas las alertas",
    "arrow": "→",
    "joiner": "-"
  },
  "saved_guide": {
    "title": "Flujo de trabajo guardado",
    "hint": "Todavía no está en uso: los eventos solo pasarán por él cuando una regla de notificación lo referencie.",
    "to_notify_rule": "Vincularlo en una regla de notificación",
    "done": "Finalizar"
  },
  "label_enrich": {
    "label_source_type": {
      "label": "Origen de las etiquetas",
      "options": {
        "built_in_mapping": "Glosario integrado de etiquetas"
      }
    },
    "label_mapping_id": "Nombre del glosario",
    "help": "Consulta el glosario usando las etiquetas de origen indicadas y añade al evento los campos encontrados, según la configuración de nuevas etiquetas",
    "source_keys": {
      "label": "Etiqueta de origen",
      "text": "El campo <strong>{{field}}</strong> del glosario corresponde a esta etiqueta del evento",
      "target_key_placeholder": "Clave de la etiqueta",
      "target_key_required": "La clave de la etiqueta no puede estar vacía"
    },
    "append_keys": {
      "label": "Añadir etiqueta",
      "source_key_placeholder": "Campo del glosario",
      "rename_key": "Renombrar la clave de la etiqueta",
      "target_key_placeholder": "Clave de la etiqueta"
    }
  },
  "callback": {
    "url": "URL",
    "advanced_settings": "Ajustes avanzados",
    "basic_auth_user": "Usuario de autenticación",
    "basic_auth_user_placeholder": "Introduce el usuario de autenticación",
    "basic_auth_pass": "Contraseña de autenticación",
    "basic_auth_pass_placeholder": "Introduce la contraseña de autenticación"
  },
  "event_drop": {
    "hint": "El evento se descarta cuando la plantilla devuelve true; cualquier otra salida lo deja pasar. Variables disponibles: $event.Severity (1/2/3), $event.IsRecovered, $event.RuleName y $event.TagsMap.nombre_de_la_etiqueta",
    "snippets_label": "Insertar un ejemplo",
    "snippets": {
      "severity": "Descartar las alertas informativas S3",
      "recovered": "Descartar las notificaciones de recuperación",
      "tag": "Descartar por etiqueta",
      "rule_name": "Descartar por nombre de regla"
    },
    "replace_confirm": "La lógica actual se sustituirá por el ejemplo. ¿Quieres continuar?",
    "content": "Lógica de decisión",
    "content_placeholder": "Usa la sintaxis de Go template; si el resultado final es true, el evento se descarta en esta etapa"
  },
  "ai_summary": {
    "llm_config": "Reutilizar una configuración de LLM",
    "llm_config_placeholder": "Elige un LLM ya configurado (si lo dejas vacío, rellena los parámetros de abajo a mano)",
    "llm_config_tip": "Elige una configuración existente en «Configuración de IA - Configuración de LLM» para reaprovechar su modelo, clave y dirección. Si lo dejas vacío, se usan los parámetros que rellenes abajo.",
    "url_placeholder": "Introduce la dirección de la API",
    "url_required": "Introduce la URL",
    "api_key_placeholder": "Clave de la API",
    "api_key_required": "Introduce la API Key",
    "model_name": "Nombre del modelo",
    "model_name_placeholder": "Por ejemplo, deepseek-chat",
    "model_name_required": "Introduce el nombre del modelo",
    "prompt_template": "Plantilla del prompt",
    "prompt_template_required": "Introduce la plantilla del prompt",
    "advanced_config": "Configuración avanzada",
    "custom_params": "Parámetros del modelo de IA",
    "custom_params_key_label": "Nombre del parámetro (por ejemplo, temperature)",
    "custom_params_value_label": "Valor del parámetro (por ejemplo, 0.7)",
    "proxy_placeholder": "Por ejemplo: http://proxy.example.com:8080",
    "timeout_placeholder": "Tiempo de espera (segundos)",
    "timeout_required": "Introduce el tiempo de espera",
    "url_tip": "- **Descripción**: dirección de la API del servicio de IA\n- **Ejemplo**: `https://api.deepseek.com/v1/chat/completions`",
    "api_key_tip": "- **Descripción**: clave de API del proveedor del servicio de IA\n- **Cómo obtenerla**:\n  - OpenAI: solicítala en el sitio oficial de OpenAI\n  - DeepSeek: regístrate en el sitio oficial de DeepSeek",
    "model_name_tip": "- **Descripción**: nombre del modelo de IA que se usará\n- **Modelos habituales**:\n  - `gpt-3.5-turbo` (OpenAI)\n  - `gpt-4` (OpenAI)\n  - `deepseek-chat` (DeepSeek)",
    "prompt_template_tip": "La plantilla del prompt es el núcleo del análisis con IA. Usa {{$event}} para referenciar los campos del evento; su estructura completa está descrita en la [tabla de historial de alertas](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/events/alert-history/). Para empezar, basta con la plantilla predeterminada",
    "prompt_template_placeholder": "Analiza la información del evento de alerta siguiente y redacta un resumen claro y conciso en español:\nRegla de alerta: {{$event.RuleName}}\nSeveridad: {{$event.Severity}}\nEstado: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       \nHora del disparo: {{$event.TriggerTime}}\nValor en el disparo: {{$event.TriggerValue}}\nObservación de la regla: {{$event.RuleNote}}\nEtiquetas: {{$event.Tags}}\nAnotaciones: {{$event.Annotations}}\n\nEscribe un resumen de menos de 100 palabras que destaque:\n1. Qué sistema o servicio ha tenido qué problema\n2. La gravedad del problema\n3. Los posibles impactos\n4. Una recomendación sencilla de actuación\nEl resumen debe ser breve y directo, para que el equipo de operaciones entienda la alerta rápidamente.",
    "custom_params_tip": "Para ajustar en detalle el comportamiento del modelo de IA:\n\n| Parámetro | Descripción | Valor recomendado | Ejemplo |\n|--------|------|--------|------|\n| temperature | Controla la aleatoriedad de la respuesta | 0.3-0.7 | 0.7 |\n| max_tokens | Máximo de tokens en la salida | 200-500 | 300 |\n| top_p | Umbral de probabilidad del muestreo | 0.8-1.0 | 0.9 |\n\n**Cómo configurarlo**:\n1. Pulsa el botón + junto a «Custom Params»\n2. Escribe el nombre del parámetro (por ejemplo, temperature)\n3. Escribe su valor (por ejemplo, 0.7)"
  },
  "script": {
    "timeout": "Tiempo de espera (milisegundos)",
    "timeout_tooltip": "Tiempo máximo de ejecución del script; pasado ese límite, se detiene",
    "timeout_placeholder": "Introduce el tiempo de espera",
    "content": "Contenido del script",
    "content_tooltip": "Escribe el script que tratará el evento. El evento de alerta llega por stdin y el script debe devolverlo como objeto JSON por stdout",
    "content_placeholder": "Introduce el contenido del script"
  },
  "inhibit": {
    "help": "El procesador de supresión evita que una alerta genere notificación cuando otra ya se ha enviado, lo que reduce el ruido. Un caso habitual: mientras haya una incidencia P1 activa en la misma regla, ignorar las notificaciones P2 y P3. Más información en la <a>documentación de uso</a>",
    "tip1": "Cuando la <b>alerta nueva</b> cumpla las condiciones siguientes",
    "tip2": "Y",
    "tip3": "segundos haya una <b>alerta activa</b> que cumpla las condiciones siguientes",
    "tip4": "y la <b>alerta nueva</b> coincida con la <b>alerta activa</b> en los elementos siguientes",
    "tip5": "Cumplidas todas las condiciones anteriores, la alerta actual se suprime y no genera notificación",
    "duration_required": "La duración de la supresión no puede estar vacía",
    "duration_max": "La duración de la supresión no puede superar los 600 segundos",
    "match_label_keys": "Etiquetas",
    "match_label_keys_required": "La etiqueta no puede estar vacía",
    "match_attribute_keys": "Atributo",
    "match_attribute_keys_required": "El atributo no puede estar vacío",
    "keys_at_least_one_required": "Hace falta al menos una etiqueta o un atributo",
    "labels_conflict": "La etiqueta {{label}} tiene valores distintos; no se puede suprimir",
    "attributes_conflict": "El atributo {{attribute}} tiene valores distintos; no se puede suprimir",
    "preview": "Vista previa de la regla: cuando llegue una <b>alerta nueva: {{newAlertLabelsAttrs}}</b> y en los últimos <b>{{duration}} segundos</b> exista una <b>alerta activa: {{activeAlertLabelsAttrs}}</b>, y ambas coincidan en <b>{{matchLabelsAttrs}}</b>, se suprime la notificación de la alerta nueva.",
    "labels_filter": {
      "label": "Etiquetas",
      "label_tip": "Suprime solo los eventos que cumplan estas condiciones de etiqueta, lo que acota el alcance de la regla; si no se configura, no hay restricción. Puedes elegir claves existentes en la lista (recomendado) o escribirlas",
      "label_placeholder": "Escribe o selecciona la clave de etiqueta usada en la coincidencia, por ejemplo app / cluster / alertname"
    },
    "labels_filter_value_placeholder": "Escribe o selecciona el valor de etiqueta usado en la coincidencia",
    "attributes_filter": {
      "label": "Atributo",
      "label_tip": "Acota la supresión por los atributos del evento: solo se suprimen las alertas que cumplan todos ellos. Si se deja vacío, se aplica a todas"
    },
    "active_event_labels_filter": {
      "label": "Etiquetas",
      "label_tip": "**Acota el conjunto de alertas activas que se tienen en cuenta**\n- Sin configurar: no se aplica ningún filtro por etiqueta\n- Configurado: elige claves existentes en la lista (recomendado) o escríbelas; solo entran en el conjunto las alertas activas que cumplan todas esas condiciones.\n\nEjemplo: con service=mon, solo los eventos que tengan la etiqueta service=mon participan en la lógica de supresión."
    },
    "active_event_attributes_filter": {
      "label": "Atributo",
      "label_tip": "**Acota el conjunto de alertas activas que se tienen en cuenta**\n- Sin configurar: no se aplica ningún filtro por atributo\n- Configurado: solo entran en el conjunto las alertas activas que cumplan todas esas condiciones.\n\nEjemplo: con grupo de negocio == DefaultBusiGroup, solo se tienen en cuenta los eventos activos cuyo atributo de grupo de negocio sea DefaultBusiGroup en la supresión"
    }
  },
  "inhibit_qd": {
    "help": "Supresión por resultado de consulta: al dispararse la alerta se ejecuta la consulta de abajo. Si devuelve al menos un registro, la alerta se suprime y no notifica; si no hay datos, la notificación sigue su curso. Más información en la <a>documentación de uso</a>",
    "t_1": "y la consulta devuelva los <b>datos</b> siguientes"
  },
  "annotation_qd": {
    "help": "El procesador de consulta complementaria enriquece la alerta: al dispararse, busca información relacionada en el origen de datos, como logs, y la adjunta a la alerta. Más detalles en la <a>documentación de uso</a>",
    "query_configs": "Consulta de datos",
    "use_event_datasource": "Usar el origen de datos del evento",
    "use_event_datasource_help": "Cuando se activa, solo pueden elegirse eventos de ejemplo compatibles con el tipo de origen de datos",
    "datasource_cate_required": "El tipo de origen de datos no puede estar vacío",
    "datasource_ids_required": "El origen de datos no puede estar vacío",
    "select_alert_event_btn": "Seleccionar un evento de alerta de ejemplo",
    "select_alert_event_tip": "Elige un evento de ejemplo para resolver las variables de la consulta y ver una vista previa de los datos",
    "select_alert_event_label": "Evento de ejemplo seleccionado",
    "query_required": "La condición de consulta no puede estar vacía",
    "sql_limit_valid": "La consulta SQL debe incluir la cláusula LIMIT",
    "oracle_sql_limit_valid": "La consulta SQL debe incluir la cláusula ROWNUM",
    "annotation_configs": "Datos adjuntos",
    "annotation_configs_tip": "Configura pares clave/valor para adjuntar el resultado de la consulta a la alerta",
    "annotation_key_tip": "Define la clave del nuevo campo; te recomendamos usar solo letras latinas",
    "annotation_val_tip": "Plantilla del valor del nuevo campo; consulta la documentación de uso para la sintaxis",
    "annotation_key_placeholder": "Nombre del campo adjunto",
    "annotation_val_placeholder": "Contenido del campo adjunto; admite sintaxis de plantilla para rellenar el resultado de la consulta como variable",
    "annotation_key_required": "El nombre del campo adjunto no puede estar vacío",
    "annotation_val_required": "El contenido del campo adjunto no puede estar vacío",
    "data_preview": "Vista previa de los datos",
    "data_preview_query": "Consulta",
    "data_preview_no_eventid": "Selecciona antes un evento de alerta",
    "query_limit": "Límite de registros devueltos"
  },
  "event_recover": {
    "help": "El procesador de autorreparación ejecuta un script de shell en la máquina cuando se dispara la alerta, ya sea para recopilar información o para lanzar una rutina de recuperación. <a>Documentación de uso</a>",
    "title": "Autorreparación de alertas",
    "create_btn": "Crear plantilla de autorreparación",
    "tpl_id": "Plantilla de autorreparación",
    "tpl_id_required": "La plantilla de autorreparación no puede estar vacía",
    "host": "Máquina de ejecución",
    "host_placeholder": "Puede quedar vacío; en ese caso, la máquina se toma de la etiqueta ident del evento",
    "args": "Parámetros",
    "args_tip": "Argumentos que se pasan al script; separa varios con comas dobles, por ejemplo arg1,,arg2,,arg3",
    "save_result": "Guardar el resultado de la ejecución",
    "save_result_tip": "Guarda el resultado del script en el evento de alerta",
    "timeout": "Tiempo de espera de la ejecución",
    "timeout_tip": "Si el script no termina dentro de ese tiempo, no se espera el resultado",
    "timeout_max_warning": "El tiempo de espera no puede superar los 60 segundos",
    "select_host": "Filtrar máquinas"
  },
  "alert_shot": {
    "help": "<a>Documentación de uso</a>",
    "title": "Captura de pantalla de la alerta",
    "shot_type": {
      "label": "Tipo de objeto",
      "options": {
        "board": "Dashboard",
        "url": "Dirección URL"
      }
    },
    "advanced_settings": "Ajustes avanzados",
    "board_shot_opts": {
      "busi_group": "Grupo de negocio",
      "board_id": "Dashboard",
      "board_url": "URL del dashboard",
      "timeout": "Tiempo de espera (milisegundos)",
      "width": "Ancho de la imagen"
    },
    "url_shot_opts": {
      "url": "Dirección URL",
      "headers": "Cabeceras de la solicitud",
      "proxy": "Configuración del proxy",
      "insecure_skip_verify": "Omitir la verificación del certificado",
      "timeout": "Tiempo de espera (milisegundos)",
      "width": "Ancho de la imagen"
    }
  }
};

export default es_ES;

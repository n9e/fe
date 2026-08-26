const es_ES = {
  "quick_query": "Consulta rápida",
  "quick_query_tip": "La consulta rápida genera el SQL a partir de una plantilla fija: para el campo A mayor que cero, basta con escribir A > 0. Este botón cambia al modo personalizado, donde puedes ver y editar el SQL",
  "custom_query": "Consulta personalizada",
  "custom_query_tip": "La consulta personalizada permite escribir libremente la instrucción en SQL",
  "current_database": "Base de datos actual",
  "table": "Tabla",
  "database_table_required": "Selecciona antes la base de datos y la tabla",
  "enrich_queries": {
    "title": "Consulta complementaria"
  },
  "query": {
    "mode": {
      "query": "Modo Query",
      "sql": "Modo SQL"
    },
    "submode": {
      "raw": "Texto bruto del log",
      "timeSeries": "Gráfico de series temporales"
    },
    "query_tip": "Ejemplos de SQL:<br />\n    1. Contar los logs de los últimos 5 minutos: SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)<br />\n    2. Contar los logs del intervalo elegido: SELECT COUNT(*) AS `cnt` FROM `database`.`table` WHERE $__timeFilter(`timestamp`)<br />\n    Más detalles sobre el modo SQL en <a>Modo SQL de Doris</a>",
    "query_placeholder": "SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m",
    "execute": "Consulta",
    "database": "Bases de datos",
    "database_msg": "Selecciona la base de datos",
    "table": "Tabla",
    "table_msg": "Selecciona la tabla",
    "time_field": "Campo de fecha",
    "time_field_msg": "Selecciona el campo de fecha",
    "time_field_tip": "<span>Usa una macro de tiempo en la consulta para que este selector tenga efecto</span><br/>Cómo usar las macros de tiempo: <a>detalles</a>",
    "query": "Condición de consulta",
    "query_required": "La condición de consulta no puede estar vacía",
    "advancedSettings": {
      "title": "Ajustes auxiliares",
      "tags_placeholder": "Pulsa Intro para añadir varios",
      "valueKey": "Campo de valor",
      "valueKey_tip": "El resultado de una consulta SQL suele tener varias columnas; indica cuáles de ellas se dibujarán en el gráfico",
      "valueKey_required": "El campo de valor no puede estar vacío",
      "labelKey": "Campo de etiqueta",
      "labelKey_tip": "El resultado de una consulta SQL suele tener varias columnas; indica cuáles servirán como etiquetas de las series"
    },
    "get_index_fail": "Error al obtener los índices de la tabla",
    "warn_message_btn_1": "Ejecutar la consulta de todos modos",
    "warn_message_btn_2": "Volver y editar",
    "warn_message": "La consulta no usa ninguna macro de tiempo, así que el intervalo elegido no tendrá efecto.",
    "warn_message_content_1": "Esta consulta puede recorrer la tabla entera. Valora el impacto en el rendimiento del almacenamiento y decide si continúas o vuelves y añades una macro de tiempo.",
    "warn_message_content_2": "Macros de tiempo más usadas: ",
    "warn_message_content_3": "Ejemplo:",
    "warn_message_content_4": "Cómo usar las macros de tiempo: <a>detalles</a>",
    "editMode": {
      "switch_to_builder_confirm_title": "Cambiar al modo constructor",
      "switch_to_builder_confirm_content": "El SQL actual no puede convertirse en opciones del constructor, y el cambio descartará lo que hayas editado. ¿Quieres continuar?",
      "no_builder_config": "Configura antes la consulta",
      "require_db_table": "Selecciona antes la base de datos y la tabla",
      "build_sql_failed": "Error al generar el SQL"
    },
    "dashboard": {
      "mode": {
        "label": "Modo de consulta",
        "table": "Datos que no son series temporales",
        "timeSeries": "Series temporales"
      }
    },
    "stackByField": "Campo de apilado",
    "stack_disabled_tip": "El gráfico apilado requiere entre 2 y 10 valores distintos",
    "stack_tip_pin": "Activar el gráfico apilado",
    "stack_tip_unpin": "Desactivar el gráfico apilado",
    "stack_group_by_tip": "Usar el valor de este campo en el gráfico de tendencia apilado",
    "sql_format": {
      "title": "Vista previa del SQL",
      "tip": "Las consultas SQL más complejas, como el máximo, el mínimo o los percentiles de un campo, pueden verse pulsando en la lista de campos de la izquierda.",
      "origin": "Ver el texto bruto del log",
      "origin_tip": "Puedes copiarlo a la vista de la estructura de la tabla, en modo tabla, para ver los datos",
      "timeseries": "Ver el gráfico de series temporales",
      "timeseries_tip": "Puedes copiarlo a la vista de la estructura de la tabla, en modo serie temporal, para ver los datos, o usarlo en un dashboard para dibujar series a partir de Doris.",
      "table": "Ver los valores estadísticos",
      "table_tip": "Sirve para crear reglas de alerta y de registro de Doris, y métricas de Northstar."
    },
    "defaultSearchField": "Campos de búsqueda predeterminados",
    "default_search_tip_1": "Establecer como campo de búsqueda predeterminado",
    "default_search_tip_2": "Quitar de los campos de búsqueda predeterminados",
    "default_search_by_tip": "Campos de búsqueda predeterminados",
    "datasource_disabled_tip": "Selecciona antes el origen de datos",
    "interval": "Intervalo de la consulta",
    "interval_tip": "El intervalo de la consulta solo tiene efecto cuando el SQL usa la macro $__timeFilter.<br />El sistema de alertas usa esa ventana para limitar los datos recorridos, lo que preserva la puntualidad de las alertas y el rendimiento de la base de datos",
    "offset": "Consulta con retardo",
    "offset_tip": "Desplaza la consulta unos segundos hacia atrás antes de ejecutarla, como el offset de PromQL.<br />Suele servir para lidiar con retrasos en la escritura o en la red, y evitar falsas alertas por datos que aún no han llegado",
    "sql_warning_1": "Te recomendamos encarecidamente usar $__timeFilter(campo_de_tiempo) en el WHERE para acotar el intervalo; sin ello pueden producirse <b>una carga anómala en la base de datos y tiempos de espera agotados en las consultas de alerta</b>",
    "sql_warning_2": "El SQL usa $__timeGroup, así que la consulta devuelve varios instantes. En ese caso, <b>el sistema solo tiene en cuenta el resultado del instante más reciente</b>",
    "duration": "Duración",
    "count": "Cantidad",
    "click_doc": "Pulsa para ver la documentación de <a>condiciones de consulta</a>",
    "navMode": {
      "fields": "Vista por campos",
      "schema": "Vista de la estructura de la tabla"
    },
    "syntax": {
      "query": "Modo Query",
      "sql": "Modo SQL"
    },
    "sqlVizType": {
      "table": "Tabla",
      "timeseries": "Gráfico de series temporales"
    },
    "add_to": {
      "btn": "Añadir a…",
      "recording_rule": "Añadir a una regla de registro",
      "add_recording_rule_title": "Añadir regla de registro"
    }
  },
  "builder": {
    "to_pinned_btn": "Fijo",
    "open_builder": "Abrir el constructor",
    "config_required": "La configuración del constructor no puede estar vacía",
    "to_unpinned_btn": "Dejar de fijar",
    "database_table": {
      "label": "Base de datos y tabla",
      "database": "Bases de datos",
      "table": "Tabla"
    },
    "filters": {
      "label": "Filtrar",
      "label_tip": "Todos los filtros se combinan con Y.",
      "add": "Añadir",
      "field": "Campo",
      "field_placeholder": "Selecciona el campo",
      "operator": "Operador",
      "operator_placeholder": "Selecciona el operador",
      "value": "Valor",
      "value_placeholder": "Selecciona el valor",
      "disabled": "Desactivar",
      "tip_1": "Este campo no tiene índice NGram BloomFilter, lo que puede provocar un recorrido completo de la tabla. Te recomendamos crear el índice o elegir otro operador"
    },
    "aggregates": {
      "label": "Agregación",
      "add": "Añadir",
      "func": "Función de agregación",
      "func_placeholder": "Selecciona la función de agregación",
      "field": "Campo",
      "field_placeholder": "Selecciona el campo",
      "percentile": "Percentil",
      "percentile_placeholder": "Introduce el percentil",
      "precision": "Precisión",
      "precision_placeholder": "Introduce la precisión",
      "n": "Valor de N",
      "n_placeholder": "Introduce el valor de N",
      "alias": "Alias",
      "alias_placeholder": "Introduce el alias",
      "options": {
        "COUNT": "Número de logs",
        "CPS": "Recuento por segundo",
        "AVG": "Media",
        "SUM": "Suma",
        "MIN": "Mínimo",
        "MAX": "Máximo",
        "PERCENTILE": "Percentil",
        "UNIQUE_COUNT": "Valores distintos",
        "EXIST_RATIO": "Proporción de logs en los que aparece el recurso",
        "TOPN": "N valores más frecuentes"
      }
    },
    "display_label": "Visualización",
    "mode": {
      "table": "Valor estadístico",
      "timeseries": "Gráfico de series temporales"
    },
    "group_by": "Grupo",
    "order_by": {
      "label": "Orden",
      "add": "Añadir",
      "field": "Campo",
      "field_placeholder": "Selecciona el campo",
      "direction": "Sentido de la ordenación",
      "direction_placeholder": "Selecciona el sentido de la ordenación",
      "asc": "Ascendente",
      "desc": "Descendente"
    },
    "limit": "Límite de registros",
    "excute": "Consulta",
    "preview_sql": "Vista previa del SQL",
    "btn_tip": "Al pulsarlo, se sustituirá el contenido del campo de SQL",
    "btn_failed_tip": "Error en la conversión. Inténtalo de nuevo o ajusta el formulario",
    "preview_and_run": "Vista previa del SQL y consultar",
    "builder_content_modified": "El constructor ha cambiado; genera la vista previa del SQL actualizado"
  }
};

export default es_ES;

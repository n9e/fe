const es_ES = {
  "explorer": {
    "execute": "Consulta",
    "query": "Condición de consulta",
    "query_required": "La condición de consulta no puede estar vacía",
    "query_lanaguage_docs": "Documentación del lenguaje de consulta",
    "limit": "Límite de registros",
    "hits": "Resultados coincidentes",
    "graph_settings": {
      "title": "Configuración del gráfico",
      "stacked": "Apilado",
      "fill": "Relleno"
    },
    "view": {
      "group": "Grupo",
      "table": "Tabla",
      "json": "JSON"
    },
    "total_logs_returned": "Total de logs devueltos",
    "total_groups": "Total de grupos",
    "page_size": "Elementos por página",
    "page_size_all": "Todos",
    "expand_all": "Expandir todo",
    "collapse_all": "Contraer todo",
    "group_view": {
      "ungrouped": "Sin grupo",
      "group_by_field": "Agrupado por «{{field}}»",
      "entries": "elementos",
      "show_field_tip": "Campos mostrados",
      "hide_field_tip": "Ocultar el campo",
      "group_by_field_icon_tip": "Agrupar por este campo"
    },
    "group_view_settings": {
      "title": "Configuración de la vista agrupada",
      "group_by_field": "Campo de agrupación",
      "group_by_field_help": "Elige un campo para agrupar los logs (predeterminado: _stream)",
      "ungrouped": "No agrupar",
      "display_fields": "Campos mostrados",
      "display_fields_help": "Elige los campos que quieres mostrar (predeterminado: _msg)",
      "date_format": "Formato de fecha",
      "date_format_help01": "Define el formato de fecha (por ejemplo, YYYY-MM-DD HH:mm:ss). <a>Consulta esta documentación para saber más</a>",
      "date_format_help02": "Tu formato de fecha actual: {{dateFormat}}"
    },
    "table_view_settings": {
      "title": "Configuración de la vista de tabla",
      "customize_columns": "Columnas personalizadas",
      "search_columns": "Buscar columnas",
      "check_all": "Seleccionar todo"
    },
    "copy_json": "Copiar el JSON",
    "parse_failed": "No se pudo interpretar",
    "timeseries": {
      "value_field": "Campo de valor",
      "value_field_tip": "Campos numéricos que se usan en el gráfico de series temporales; puedes indicar varios",
      "value_field_required": "Selecciona el campo de valor",
      "label_field": "Campo de etiqueta",
      "label_field_tip": "Campos de etiqueta que distinguen las series; puedes indicar varios",
      "unit": "Unidad"
    }
  },
  "builder": {
    "filter": "Filtrar",
    "add": "Añadir",
    "field": "Campo",
    "operator": "Operador",
    "value": "Valor",
    "function": "Función",
    "quantile": "Percentil",
    "alias": "Alias",
    "order_by": "Orden",
    "direction": "Orden",
    "field_placeholder": "Introduce el campo",
    "value_placeholder": "Introduce el valor",
    "operator_placeholder": "Selecciona el operador",
    "function_placeholder": "Selecciona la función",
    "alias_placeholder": "Introduce el alias",
    "select_field": "Selecciona el campo",
    "select_operator": "Selecciona el operador",
    "input_value": "Introduce el valor",
    "select_function": "Selecciona la función",
    "input_field": "Introduce el campo",
    "input_quantile": "Introduce el percentil",
    "select_direction": "Selecciona la ordenación",
    "aggregation": "Agregación",
    "aggregation_required": "Configura al menos una agregación",
    "display": "Visualización",
    "filter_relation_tip": "Todos los filtros se combinan con Y.",
    "statistical_value": "Valor estadístico",
    "timeseries": "Gráfico de series temporales",
    "group_by": "Grupo",
    "limit": "Límite de registros",
    "execute": "Consulta",
    "preview_ql": "Vista previa de la consulta",
    "pin": "Fijo",
    "unpin": "Dejar de fijar"
  },
  "datasource": {},
  "alert": {
    "query_warning_no_time": "Te recomendamos encarecidamente usar _time, el campo de tiempo, en la consulta para acotar el intervalo; sin ello pueden producirse <b>una carga anómala en el almacenamiento y tiempos de espera agotados en las consultas de alerta</b>"
  }
};

export default es_ES;

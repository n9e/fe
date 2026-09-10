const es_ES = {
  "title": "Búsqueda de logs",
  "tab": {
    "rename": "Renombrar"
  },
  "query": "Condición de consulta",
  "query_is_required": "La condición de consulta no puede estar vacía",
  "execute": "Consulta",
  "mode": {
    "label": "Modo",
    "raw_logs": "Texto bruto del log",
    "statistical_charts": "Gráficos estadísticos"
  },
  "mode_switch": {
    "confirm_title": "Confirmar el cambio de modo",
    "confirm_content": "La consulta actual del modo de gráficos usa el operador de tubería (|), que no existe en el modo de texto bruto. Al cambiar, se borrará la consulta. ¿Quieres continuar?",
    "confirm_ok": "Cambiar de todos modos",
    "confirm_cancel": "Cancelar"
  },
  "before_query": "Pulsa <b>Consultar</b> para mostrar los datos",
  "loading": "Cargando datos…",
  "no_data": "La consulta no devolvió datos",
  "histogram_hide": "Ocultar el gráfico",
  "histogram_show": "Mostrar el gráfico",
  "share_btn": "Enlace para compartir",
  "share_tip": "Pulsa para copiar el enlace para compartir",
  "log_viewer_drawer_trigger_tip": "Pulsa para ver los detalles del log",
  "log_viewer_drawer_title": "Detalles del log",
  "copy_to_clipboard": "Copiar al portapapeles",
  "unindexable": "Las estadísticas no están activadas para este campo, así que no puede analizarse",
  "topn_no_data": "Sin datos",
  "stats": {
    "unique_count": "Valores distintos",
    "min": "Mínimo",
    "max": "Máximo",
    "sum": "Suma",
    "avg": "Media",
    "exist_ratio": "Proporción de logs en los que aparece el campo",
    "median": "Mediana",
    "p95": "Percentil (P95)"
  },
  "field_popover_info_alert": "Pulsa el valor para ver el gráfico estadístico y el SQL",
  "field_search_placeholder": "Buscar campos",
  "field_list": {
    "show_fields": "Campos mostrados",
    "available_fields": "Campos disponibles"
  },
  "field_actions": {
    "and": "Añadir a esta búsqueda",
    "not": "Excluir de esta búsqueda",
    "exists": "Filtrar los documentos que tengan este campo"
  },
  "field_values_topn": {
    "title": "{{n}} valores más frecuentes",
    "settings": {
      "title": "Configuración de los N valores más frecuentes"
    },
    "no_data": "Este campo existe en el mapping, pero no aparece en los 500 documentos mostrados",
    "quick_view_count": "Número de logs",
    "quick_view_ratio": "Proporción"
  },
  "empty_value_not_supported_tip": "Todavía no se pueden buscar valores vacíos",
  "unsupported_datasource_type": "No se puede representar el tipo de origen de datos {{type}}, que no está admitido",
  "no_supported_datasource_types_title": "No hay ningún tipo de origen de datos disponible",
  "no_supported_datasource_types_desc": "Configúralo en la página de <a>gestión de orígenes de datos</a> o pídeselo al administrador. Los tipos admitidos por ahora son: {{types}},",
  "field_tip": "Pulsa para ver las estadísticas",
  "field_value_statistic": {
    "view_statistic": "Ver los valores estadísticos",
    "view_timeseries": "Ver el gráfico de series temporales"
  },
  "field_type": "Tipo",
  "field_type_map": {
    "float": "Coma flotante",
    "float64": "Coma flotante de 64 bits",
    "scaled_float": "Coma flotante escalada",
    "double": "Coma flotante de doble precisión",
    "integer": "Entero",
    "int64": "Entero de 64 bits",
    "long": "Entero largo",
    "date": "Fecha",
    "date_nanos": "Fecha en nanosegundos",
    "string": "Texto",
    "text": "Texto",
    "nested": "Objeto anidado",
    "histogram": "Histograma",
    "boolean": "Booleano"
  },
  "logs": {
    "title": "Datos de log",
    "stream_fields_count": "{{count}}",
    "text": "Texto del log",
    "duration": "Duración",
    "count": "Cantidad",
    "filter_fields": "Campos de filtro",
    "settings": {
      "mode": {
        "origin": "Bruto",
        "table": "Tabla",
        "timeseries": "Gráfico de series temporales",
        "clustering": "Agrupar"
      },
      "breakLine": "Salto de línea",
      "reverse": "Tiempo",
      "lines": "Número de línea",
      "time": "Hora del log",
      "organizeFields": {
        "title": "Configuración de las columnas",
        "allFields": "Campos disponibles",
        "showFields": "Campos mostrados",
        "showFields_empty": "Por defecto se muestran todos los campos del log",
        "tip": "Ahora mismo solo se muestran los campos {{fields}}; usa el icono de configuración para mostrarlos todos"
      },
      "jsonSettings": {
        "title": "Configuración del JSON",
        "displayMode": "Formato de visualización predeterminado",
        "displayMode_tree": "En árbol",
        "displayMode_string": "Como texto",
        "expandLevel": "Niveles expandidos por defecto"
      },
      "pageLoadMode": {
        "title": "Modo de navegación",
        "pagination": "Paginación",
        "infiniteScroll": "Desplazamiento infinito"
      },
      "topNSettings": {
        "title": "Configuración de los N valores más frecuentes"
      }
    },
    "fieldLabelTip": "Las estadísticas no están activadas para este campo, así que no puede analizarse",
    "filterAnd": "Añadir «{{token}}» a esta búsqueda",
    "filterNot": "Excluir «{{token}}» de esta búsqueda",
    "filterAllAnd": "Añadir todo a esta búsqueda",
    "filterAllNot": "Excluir todo de esta búsqueda",
    "filterExists": "Filtrar los documentos que tengan este campo",
    "add_drilldown_link": "Añadir enlace de profundización",
    "drilldown_link_default_name": "Enlace de profundización",
    "total": "Número de logs",
    "stack_group_by_tip": "Usar el valor de este campo en el gráfico de tendencia apilado",
    "collapse": "Contraer",
    "expand": "Expandir",
    "copy_field_value": "Copiar el valor del campo"
  },
  "clustering": {
    "count": "Cantidad",
    "log_data": "Datos de log",
    "row_number": "Número de línea",
    "log_statistics": "Estadísticas de los logs",
    "back_to_all_logs": "Volver a todos los logs",
    "all_log_statistics": "Estadísticas de todos los logs",
    "current_page_field": "Por ahora, para los campos de esta página",
    "aggregate": "agrupados,",
    "cannot_aggregate": "Todavía no se pueden agrupar",
    "full_aggregate_logs": "Agrupación de todos los logs",
    "need_aggregate": "Para agrupar los",
    "click_to_aggregate": "logs, pulsa",
    "full_aggregate": "Agrupar todo",
    "field_label": "Campo de agrupación",
    "scope_current_page": "Página actual",
    "scope_current_page_desc": "Agrupa solo los campos de esta página",
    "scope_full": "Agrupar todo",
    "scope_full_desc_prefix": "Para los",
    "scope_full_desc_disable_prefix": "Todavía no se pueden agrupar los",
    "scope_full_desc_suffix": "logs devueltos por la consulta",
    "scope_label": "Ámbito",
    "aggregate_field": "Campo de agrupación:",
    "log_count": "Volumen de logs:",
    "duration": "Duración:",
    "top5_title": "5 valores más frecuentes",
    "no_data": "No hay datos",
    "loading_title": "Agrupando, espera un momento",
    "loading_info": "Logs agrupados:",
    "loading_field": "Campo de agrupación:",
    "loading_tip": "No cierres esta página. Para una consulta nueva,",
    "loading_new_tab": "abre otra pestaña",
    "loading_tip_suffix": "y haz allí la búsqueda de logs",
    "sampled_tip": "Hay demasiados logs, así que esta agrupación se ha generado a partir de una muestra"
  },
  "view_placeholder": "Vista de los logs"
};

export default es_ES;

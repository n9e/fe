const es_ES = {
  "title": "Consulta instantánea",
  "log_title": "Búsqueda de logs",
  "add_btn": "Añadir un panel de consulta",
  "query_btn": "Consulta",
  "query_tab": "Consulta",
  "addPanel": "Añadir panel",
  "log": {
    "search_placeholder": "Buscar campos",
    "available": "Campos disponibles",
    "selected": "Campos seleccionados",
    "interval": "Intervalo",
    "mode": {
      "indexPatterns": "Index Patterns",
      "indices": "Indices"
    },
    "hideChart": "Ocultar el gráfico",
    "showChart": "Mostrar el gráfico",
    "fieldValues_topn": "5 valores más frecuentes",
    "fieldValues_topnNoData": "Este campo existe en el mapping, pero no aparece en los 500 documentos mostrados",
    "copyToClipboard": "Copiar al portapapeles",
    "show_conext": "Show Context",
    "context": "Contexto del log",
    "context_result_count": "Número de resultados",
    "context_lines": "{{num}} logs antes y después",
    "limit": "Número de resultados",
    "sort": {
      "NEWEST_FIRST": "Más recientes primero",
      "OLDEST_FIRST": "Más antiguos primero"
    },
    "download": "Descargar los logs",
    "export": "Historial de descargas",
    "log_download": {
      "title": "Descargar",
      "download_title": "Descargar los datos de log",
      "range": "Intervalo de tiempo",
      "filter": "Expresión de búsqueda",
      "query_condition": "Condición de consulta",
      "format": "Formato de los datos",
      "time_sort": "Ordenación de los logs",
      "count": "Número de logs",
      "time_sort_desc": "Fecha descendente",
      "time_sort_asc": "Fecha ascendente",
      "all": "Todos",
      "custom": "Personalizado",
      "custom_validated": "La cantidad no puede superar {{maxCount}}",
      "all_quantity": "Total aproximado",
      "createSuccess": "Tarea creada correctamente"
    },
    "log_export": {
      "title": "Historial de exportaciones (los archivos se conservan 3 días)",
      "fileName": "Nombre del archivo",
      "create_time": "Creado el",
      "describe": "Descripción del archivo",
      "status": "Estado",
      "status0": "En espera",
      "status1": "Generado",
      "status2": "Archivo caducado",
      "operation": "Acciones",
      "delSuccess": "Tarea eliminada",
      "del_btn_tips": "¿Confirmas la eliminación?",
      "del_btn": "Eliminar",
      "emptyText": "Aún no hay exportaciones. Consulta los logs y pulsa descargar",
      "size": "Tamaño del archivo",
      "reload_btn_tip": "Actualizar"
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
      }
    }
  },
  "drilldown_settings": "Configuración de la profundización",
  "historicalRecords": {
    "button": "Historial",
    "searchPlaceholder": "Buscar en el historial"
  },
  "share_tip": "Pulsa para copiar el enlace para compartir",
  "share_tip_2": "Pulsa para copiar el enlace para compartir; por ahora solo puede compartirse la búsqueda sobre el texto bruto de los logs",
  "help": "Instrucciones de uso",
  "clear_tabs": "Vaciar",
  "clear_tabs_tip": "Conservar solo esta pestaña",
  "stats": {
    "unique_count": "Valores distintos",
    "min": "Mínimo",
    "max": "Máximo",
    "sum": "Suma",
    "avg": "Media",
    "topn_no_data": "Sin datos",
    "unindexable": "Las estadísticas no están activadas para este campo, así que no puede analizarse"
  },
  "field_list": {
    "show_fields": "Campos mostrados",
    "available_fields": "Campos disponibles"
  },
  "empty_value_not_supported_tip": "Todavía no se pueden buscar valores vacíos",
  "logs": {
    "title": "Datos de log",
    "count": "Número de resultados",
    "filter_fields": "Campos de filtro",
    "settings": {
      "mode": {
        "origin": "Bruto",
        "table": "Tabla"
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
      }
    },
    "tagsDetail": "Detalles de la etiqueta",
    "expand": "Expandir",
    "collapse": "Contraer",
    "fieldValues_topnNoData": "Sin datos",
    "stats": {
      "numberOfUniqueValues": "Valores distintos",
      "min": "Mínimo",
      "max": "Máximo",
      "sum": "Suma",
      "avg": "Media"
    },
    "fieldLabelTip": "Las estadísticas no están activadas para este campo, así que no puede analizarse",
    "filterAnd": "Añadir a esta búsqueda",
    "filterNot": "Excluir de esta búsqueda",
    "total": "Número de logs",
    "stack_group_by_tip": "Usar el valor de este campo en el gráfico de tendencia apilado"
  }
};

export default es_ES;

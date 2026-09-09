const es_ES = {
  "es": {
    "ref": "Nombre",
    "index": "Índice",
    "index_tip": "\n      Se admiten varias formas de configuración\n      <1 />\n      1. Un solo índice: gb busca todos los documentos del índice gb\n      <1 />\n      2. Varios índices: gb,us busca todos los documentos de los índices gb y us\n      <1 />\n      3. Prefijo de índice: g*,u* busca todos los documentos de cualquier índice que empiece por g o u\n      <1 />\n      ",
    "index_msg": "El índice no puede estar vacío",
    "indexPattern": "Patrón de índice",
    "indexPatterns": "Patrón de índice",
    "indexPattern_msg": "El patrón de índice no puede estar vacío",
    "indexPatterns_manage": "Gestionar patrones de índice",
    "filter": "Filtro",
    "index_placeholder": "Índice log-* (se admiten comodines)",
    "index_pattern_placeholder": "Seleccionar patrón de índice",
    "filter_placeholder": "Filtro status:500 AND method:GET",
    "syntax": "Sintaxis",
    "time_label": "Granularidad temporal",
    "date_field": "Campo de fecha",
    "date_field_msg": "El campo de fecha no puede estar vacío",
    "interval": "Intervalo",
    "value": "Extracción de valores",
    "func": "Función",
    "funcField": "Nombre del campo",
    "histogram": {
      "interval": "Paso"
    },
    "terms": {
      "label": "Agrupar por el campo indicado",
      "more": "Ajustes avanzados",
      "size": "Número de coincidencias",
      "min_doc_count": "Mínimo de documentos"
    },
    "raw": {
      "limit": "Número de logs",
      "date_format": "Formato de fecha",
      "date_format_tip": "Usa los patrones de formato de Moment.js, por ejemplo YYYY-MM-DD HH:mm:ss.SSS"
    },
    "alert": {
      "query": {
        "title": "Estadísticas de la consulta",
        "preview": "Vista previa de los datos"
      },
      "trigger": {
        "title": "Condición de alerta",
        "builder": "Modo simple",
        "code": "Modo expresión",
        "label": "Etiqueta asociada"
      },
      "prom_eval_interval_tip": "Consulta el almacenamiento cada {{num}} segundos",
      "prom_for_duration_tip": "Normalmente la duración es mayor que la frecuencia de ejecución: dentro de la duración la consulta se ejecuta varias veces y la alerta solo se genera si todas ellas se disparan. Con la duración a 0, basta con que una consulta cumpla la condición para generar la alerta",
      "advancedSettings": "Ajustes avanzados",
      "delay": "Ejecución con retardo"
    },
    "event": {
      "groupBy": "Agrupado por {{field}}, {{size}} coincidencias, mínimo de {{min_doc_count}} documentos",
      "logs": {
        "title": "Detalles del log",
        "size": "Número de resultados",
        "fields": "Campos de filtro",
        "jsonParseError": "Error al interpretar"
      }
    },
    "syntaxOptions": "Opciones de sintaxis",
    "queryFailed": "La consulta falló. Inténtalo de nuevo más tarde",
    "offset_tip": "Consulta los datos anteriores al periodo indicado, como el offset de PromQL, en segundos"
  },
  "datasource": {
    "max_query_rows": "Número máximo de filas que devuelve una sola solicitud",
    "max_idle_conns": "Máximo de conexiones inactivas",
    "max_open_conns": "Máximo de conexiones abiertas",
    "conn_max_lifetime": "Vida máxima de la conexión (en segundos)",
    "timeout": "Tiempo de espera (en segundos)",
    "timeout_ms": "Tiempo de espera (en milisegundos)"
  },
  "query": {
    "title": "Estadísticas de la consulta",
    "execute": "Consulta",
    "query": "Condición de consulta",
    "query_required": "La condición de consulta no puede estar vacía",
    "query_placeholder": "Escribe el SQL de la consulta; usa Shift+Enter para añadir un salto de línea",
    "query_placeholder2": "Usa Shift+Enter para añadir un salto de línea",
    "advancedSettings": {
      "title": "Ajustes auxiliares",
      "tags_placeholder": "Pulsa Intro para añadir varios",
      "valueKey": "Campo de valor",
      "valueKey_tip": "El resultado de una consulta SQL suele tener varias columnas; indica cuáles de ellas se dibujarán en el gráfico",
      "valueKey_required": "El campo de valor no puede estar vacío",
      "labelKey": "Campo de etiqueta",
      "labelKey_tip": "El resultado de una consulta SQL suele tener varias columnas; indica cuáles servirán como etiquetas de las series"
    }
  }
};

export default es_ES;

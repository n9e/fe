const es_ES = {
  "preview": "Vista previa de los datos",
  "query": {
    "title": "Estadísticas de la consulta",
    "execute": "Consulta",
    "query": "SQL",
    "query_required": "El SQL no puede estar vacío",
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
    },
    "schema": "Metadatos",
    "document": "Documentación de uso",
    "dashboard": {
      "mode": {
        "label": "Modo de consulta",
        "table": "Datos que no son series temporales",
        "timeSeries": "Series temporales"
      }
    },
    "historicalRecords": {
      "button": "Historial",
      "searchPlaceholder": "Buscar en el historial"
    },
    "compass_btn_tip": "Pulsa para ver los datos de la tabla",
    "database": "Bases de datos",
    "database_msg": "Selecciona la base de datos",
    "table": "Tabla",
    "table_msg": "Selecciona la tabla",
    "time_field": "Campo de fecha",
    "time_field_msg": "Selecciona el campo de fecha",
    "duration": "Duración",
    "count": "Cantidad",
    "navMode": {
      "fields": "Vista por campos",
      "schema": "Vista de la estructura de la tabla"
    },
    "add_to": {
      "btn": "Añadir a…",
      "recording_rule": "Añadir a una regla de grabación",
      "add_recording_rule_title": "Añadir regla de grabación"
    },
    "sql_format": {
      "title": "Vista previa del SQL",
      "tip": "Las consultas SQL más complejas, como el máximo, el mínimo o los percentiles de un campo, pueden verse pulsando en la lista de campos de la izquierda.",
      "origin": "Ver el texto bruto del log",
      "origin_tip": "Puedes copiarlo a la vista de la estructura de la tabla, en modo tabla, para ver los datos",
      "timeseries": "Ver el gráfico de series temporales",
      "timeseries_tip": "Puedes copiarlo a la vista de la estructura de la tabla, en modo serie temporal, para ver los datos, o usarlo en un panel para dibujar series a partir de ClickHouse.",
      "table": "Ver los valores estadísticos",
      "table_tip": "Sirve para crear reglas de alerta y de grabación de ClickHouse, y métricas de NorthStar."
    },
    "warn_message_btn_1": "Ejecutar la consulta de todos modos",
    "warn_message_btn_2": "Volver y editar",
    "warn_message": "La consulta no usa ninguna macro de tiempo, así que el intervalo elegido no tendrá efecto.",
    "warn_message_content_1": "Esta consulta puede recorrer la tabla entera. Valora el impacto en el rendimiento del almacenamiento y decide si continúas o vuelves y añades una macro de tiempo.",
    "warn_message_content_2": "Macros de tiempo más usadas: ",
    "warn_message_content_3": "Ejemplo:",
    "warn_message_content_4": "Cómo usar las macros de tiempo: <a>detalles</a>",
    "default_search_by_tip": "Campos de búsqueda predeterminados",
    "default_search_tip_1": "Establecer como campo de búsqueda predeterminado",
    "default_search_tip_2": "Quitar de los campos de búsqueda predeterminados",
    "stack_disabled_tip": "El gráfico apilado requiere entre 2 y 10 valores distintos",
    "stack_tip_pin": "Activar el gráfico apilado",
    "stack_tip_unpin": "Desactivar el gráfico apilado",
    "stack_group_by_tip": "Usar el valor de este campo en el gráfico de tendencia apilado",
    "syntax": {
      "query": "Modo Query",
      "sql": "Modo SQL"
    },
    "sqlVizType": {
      "table": "Tabla",
      "timeseries": "Gráfico de series temporales"
    }
  },
  "builder": {
    "to_pinned_btn": "Fijo",
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
        "TOPN": "N valores más frecuentes",
        "RATIO": "Proporción",
        "VARIANCE": "Varianza",
        "STDDEV": "Desviación estándar"
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
  },
  "trigger": {
    "title": "Condición de alerta",
    "value_msg": "Introduce el valor de la expresión"
  }
};

export default es_ES;

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
    "compass_btn_tip": "Pulsa para ver los datos de la tabla"
  },
  "trigger": {
    "title": "Condición de alerta",
    "value_msg": "Introduce el valor de la expresión"
  },
  "datasource": {
    "shards": {
      "title": "Datos básicos del origen de datos",
      "title_tip": "La conexión con la base de datos depende de que el DBA haya autorizado al usuario. Si falla por ese motivo, sigue con el resto de la configuración y valídala más tarde.",
      "addr": "Dirección de la base de datos",
      "addr_tip": "La dirección de la base de datos debe ser única",
      "user": "Nombre de usuario",
      "password": "Contraseña",
      "help": "Nota: la cuenta necesita permiso de lectura sobre la base de datos para los pasos siguientes. Si cambias de cuenta, usa preferiblemente una de solo lectura."
    }
  }
};

export default es_ES;

const es_ES = {
  "title": "Dashboards de monitorización",
  "list": "Lista de dashboards",
  "back_icon_tip": "Vuelve a la página anterior o, si no la hay, a la lista de dashboards",
  "back_icon_tip_is_built_in": "Vuelve a la página anterior o, si no la hay, al centro de plantillas",
  "name": "Nombre del dashboard",
  "tags": "Etiquetas de categoría",
  "ident": "Identificador en inglés",
  "ident_msg": "Usa solo letras, números y guiones",
  "search_placeholder": "Nombre del dashboard, etiquetas de categoría",
  "empty_guide": {
    "title": "Aún no hay dashboards",
    "desc": "Crea un dashboard o importa las plantillas integradas con un clic.",
    "from_template": "Importar desde una plantilla"
  },
  "refresh_tip": "Un intervalo de actualización menor que el paso ({{num}}s) no traerá datos nuevos",
  "refresh_btn": "Actualizar",
  "share_btn": "Compartir",
  "export_btn": "Exportar (CSV)",
  "clear_cache_btn": "Vaciar la caché",
  "clear_cache_btn_tip": "Vacía la caché del ancho de las columnas; el cambio se aplica al actualizar la página",
  "inspect_btn": "Diagnosticar",
  "table_upgrade": {
    "switch_title": "Actualizar a TableNG",
    "switch_content": "¿Migrar automáticamente la configuración de la tabla antigua?",
    "auto_upgrade": "Migrar automáticamente",
    "switch_only": "Solo cambiar el tipo"
  },
  "public": {
    "name": "Público",
    "unpublic": "No público",
    "public_cate": "Tipo",
    "cate": {
      "0": "Acceso anónimo",
      "1": "Acceso autenticado",
      "2": "Acceso autorizado"
    },
    "bgids": "Grupos de negocio autorizados",
    "theme_link": {
      "dark": "Enlace con tema oscuro",
      "light": "Enlace con tema claro"
    }
  },
  "sharing_link": {
    "title": "Generar enlace para compartir",
    "title_anonymous": "Generar enlace para compartir (acceso anónimo)",
    "allow_anonymous": "Permitir el acceso anónimo sin iniciar sesión",
    "expire_at": "Validez",
    "theme": "Tema",
    "theme_default": "Seguir al sistema",
    "theme_dark": "Oscuro",
    "theme_light": "Claro",
    "note": "Observación",
    "note_placeholder": "Observación (obligatoria), por ejemplo: para que lo vea el cliente",
    "generate": "Generar enlace",
    "link": "Enlace para compartir",
    "expire_time": "Caduca el",
    "expired": "Caducado",
    "create_by": "Creado por",
    "revoke": "Revocar",
    "revoke_confirm": "Al revocarlo, el enlace deja de funcionar de inmediato. ¿Confirmas?",
    "revoked": "Revocado",
    "anonymous_tip": "Mientras esté vigente, el enlace anónimo permite ver este dashboard sin iniciar sesión y consultar los datos de los orígenes referenciados. Compártelo con cuidado",
    "recommend_tip": "El acceso anónimo se hace mediante el enlace de abajo, que durante su vigencia no requiere iniciar sesión. Para dejarlo público mucho tiempo, elige una validez en años",
    "unit_hour": "Horas",
    "unit_day": "Días",
    "unit_month": "Meses",
    "unit_year": "Años",
    "fetch_failed": "Error al cargar la lista de enlaces para compartir",
    "generate_failed": "Error al generar el enlace para compartir",
    "revoke_failed": "Error al revocar el enlace para compartir",
    "config_load_failed": "Error al leer la configuración del dashboard; por ahora no se puede establecer el acceso anónimo. Ciérralo e inténtalo de nuevo",
    "revoke_all_confirm_title": "¿Revocar todos los enlaces anónimos para compartir?",
    "revoke_all_confirm_content": "Este dashboard todavía tiene {{num}} enlaces anónimos vigentes. Su validez no depende de la configuración de visibilidad: aun después del cambio seguirían abriendo el dashboard sin iniciar sesión. Al confirmar, se revocarán todos los enlaces de este dashboard y se guardará la configuración. La revocación no se puede deshacer.",
    "revoke_all_ok": "Revocar y guardar",
    "revoke_all_check_failed": "No se pudo comprobar si quedan enlaces anónimos; la configuración de visibilidad se guardó. Abre la ventana de enlaces para comprobarlo manualmente"
  },
  "default_filter": {
    "title": "Filtros predefinidos",
    "public": "Dashboards públicos",
    "all": "Dashboards de mis grupos de negocio",
    "all_tip": "Esta opción muestra todos los dashboards de los grupos de negocio a los que perteneces"
  },
  "create_title": "Crear dashboard",
  "edit_title": "Editar dashboard",
  "add_panel": "Añadir gráfico",
  "cluster": "Clúster",
  "full_screen": "Pantalla completa",
  "exit_full_screen": "Salir de la pantalla completa",
  "copyPanelTip": "Configuración del gráfico copiada. Usa «Añadir gráfico» > «Pegar gráfico» para crear uno a partir del JSON",
  "batch": {
    "import": "Importar un JSON de dashboard de Nightingale",
    "label": "JSON del dashboard",
    "import_grafana": "Importar un dashboard de Grafana (no recomendado)",
    "import_grafana_tip": "Solo pueden importarse dashboards con orígenes de datos Prometheus y con los tipos de gráfico y funciones que admite Nightingale <a>Informar de un problema</a>",
    "import_grafana_tip_version_error": "No se pueden importar configuraciones de dashboard anteriores a la v7",
    "import_grafana_tip_version_warning": "Al importar configuraciones anteriores a la v8, puede que algunos gráficos no se admitan o no se dibujen correctamente",
    "import_grafana_url": "Enlace del dashboard de Grafana (recomendado)",
    "import_grafana_url_label": "Enlace del dashboard de Grafana",
    "continueToImport": "Continuar con la importación",
    "noSelected": "Selecciona el dashboard",
    "import_builtin": "Importar dashboards integrados",
    "import_builtin_board": "Dashboards integrados",
    "clone": {
      "name": "Nombre",
      "result": "Resultado",
      "errmsg": "Mensaje de error"
    }
  },
  "link": {
    "title": "Enlace del dashboard",
    "name": "Nombre del enlace",
    "url": "Dirección del enlace",
    "isNewBlank": "Abrir en una ventana nueva",
    "dashboardIds_placeholder": "Selecciona el dashboard"
  },
  "var": {
    "vars": "Variable",
    "btn": "Añadir variable",
    "title": {
      "list": "Lista de variables",
      "add": "Añadir variable",
      "edit": "Editar variable"
    },
    "name": "Nombre de la variable",
    "name_msg": "Solo se admiten letras, números y guiones bajos",
    "name_repeat_msg": "Este nombre de variable ya existe",
    "label": "Nombre para mostrar",
    "type": "Tipo de la variable",
    "type_map": {
      "query": "Consulta (Query)",
      "custom": "Personalizado (Custom)",
      "textbox": "Cuadro de texto (Text box)",
      "constant": "Constante (Constant)",
      "datasource": "Origen de datos (Datasource)",
      "datasourceIdentifier": "Identificador del origen de datos (Datasource identifier)",
      "hostIdent": "Identificador de la máquina (Host ident)"
    },
    "hide": "Ocultar la variable",
    "hide_map": {
      "yes": "Sí",
      "no": "No"
    },
    "definition": "Definición de la variable",
    "definition_msg1": "Introduce la definición de la variable",
    "definition_msg2": "La definición de la variable debe ser un JSON válido",
    "reg": "Expresión regular",
    "reg_tip": "Opcional: filtra las opciones mediante una expresión regular. Introduce un <a>literal de expresión regular</a>, es decir, un patrón entre barras",
    "reg_tip2": "Si quieres extraer solo una parte de una opción, <a>usa grupos de captura con nombre para separar el texto mostrado del valor</a>",
    "multi": "Selección múltiple",
    "allOption": "Incluir la opción «todos»",
    "allValue": "Valor personalizado para «todos»",
    "width": "Ancho",
    "width_tip": "Define el ancho del selector de la variable; si se deja vacío, se usa el predeterminado de 180 px",
    "textbox": {
      "defaultValue": "Valor predeterminado",
      "defaultValue_tip": "Opcional: se usa solo como valor inicial en la primera carga"
    },
    "custom": {
      "definition": "Valores personalizados separados por comas"
    },
    "constant": {
      "definition": "Valor de la constante",
      "defaultValue_tip": "Define un valor constante oculto"
    },
    "datasource": {
      "definition": "Tipo de origen de datos",
      "defaultValue": "Valor predeterminado",
      "regex": "Filtro de orígenes de datos",
      "regex_tip": "Opcional: filtra las opciones mediante una expresión regular. Introduce un <a>literal de expresión regular</a>, es decir, un patrón entre barras."
    },
    "hostIdent": {
      "invalid": "El identificador de la máquina requiere acceso autorizado; en modo anónimo el dashboard no cargará",
      "invalid2": "Este dashboard usa una variable de identificador de máquina y no admite acceso anónimo"
    },
    "help_tip": "\n      Cómo usar las variables\n      <1 />\n      ${variable_name}: valor de la variable del dashboard\n      <1 />\n      ${__field.name}: nombre de la serie en la leyenda\n      <1 />\n      ${__field.value}: valor de la serie en la leyenda\n      <1 />\n      ${__field.labels.X}: valor de la etiqueta\n      <1 />\n      ${__field.labels.__name__}: nombre de la métrica\n      <1 />\n      ${__interval}: intervalo en segundos, por ejemplo 15s; por defecto es el paso\n      <1 />\n      ${__interval_ms}: intervalo en milisegundos, por ejemplo 15000\n      <1 />\n      ${__range}: ventana de tiempo en segundos, por ejemplo 3600s\n      <1 />\n      ${__range_ms}: ventana de tiempo en milisegundos, por ejemplo 3600000\n      <1 />\n      ${__rate_interval}: intervalo en segundos, __interval * 4\n      <1 />\n      ${__from}: inicio del intervalo en milisegundos\n      <1 />\n      ${__from_date_seconds}: inicio del intervalo en segundos\n      <1 />\n      ${__from_date_iso}: inicio del intervalo en ISO 8601/RFC 3339\n      <1 />\n      La misma sintaxis sirve para ${__to}\n    ",
    "help_tip_table_ng": "\n      Cómo usar las variables\n      <br />\n      ${variable_name}: valor de la variable del dashboard\n      <br />\n      ${__row.column_name}: valor de una columna de la fila\n      <br />\n      ${__interval}: intervalo en segundos, por ejemplo 15s; por defecto es el paso\n      <br />\n      ${__interval_ms}: intervalo en milisegundos, por ejemplo 15000\n      <br />\n      ${__range}: ventana de tiempo en segundos, por ejemplo 3600s\n      <br />\n      ${__range_ms}: ventana de tiempo en milisegundos, por ejemplo 3600000\n      <br />\n      ${__rate_interval}: intervalo en segundos, __interval * 4\n      <br />\n      ${__from}: inicio del intervalo en milisegundos\n      <br />\n      ${__from_date_seconds}: inicio del intervalo en segundos\n      <br />\n      ${__from_date_iso}: inicio del intervalo en ISO 8601/RFC 3339\n      <br />\n      La misma sintaxis sirve para ${__to}\n    "
  },
  "row": {
    "edit_title": "Editar grupo",
    "delete_title": "Eliminar grupo",
    "name": "Nombre del grupo",
    "delete_confirm": "¿Confirmas la eliminación del grupo?",
    "cancel": "Cancelar",
    "ok": "Eliminar el grupo y los gráficos",
    "ok2": "Eliminar solo el grupo",
    "panels": "{{count}} gráficos",
    "panels_plural": "{{count}} gráficos"
  },
  "panel": {
    "title": {
      "add": "Añadir gráfico",
      "edit": "Editar gráfico"
    },
    "base": {
      "title": "Configuración del panel",
      "name": "Título",
      "name_tip": "Los gráficos de tipo tabla necesitan un título; sin él, la edición del panel choca con la cabecera de la tabla",
      "link": {
        "label": "Enlace",
        "label_tip": "\n          Cómo usar las variables<br />\n          ${variable_name}: valor de la variable del dashboard\n        ",
        "btn": "Añadir",
        "name": "Nombre del enlace",
        "name_msg": "Introduce el nombre del enlace",
        "url": "Dirección del enlace",
        "url_msg": "Introduce la dirección del enlace",
        "isNewBlank": "Abrir en una ventana nueva"
      },
      "description": "Observación",
      "repeatOptions": {
        "title": "Repetición del gráfico",
        "byVariable": "Variable",
        "byVariableTip": "Repite el gráfico por cada valor de la variable",
        "maxPerRow": "Máximo por fila"
      }
    },
    "options": {
      "legend": {
        "displayMode": {
          "label": "Modo de visualización",
          "table": "Tabla",
          "list": "Lista",
          "hidden": "Ocultar"
        },
        "placement": "Posición",
        "max": "Máximo",
        "min": "Mínimo",
        "avg": "Media",
        "sum": "Total",
        "last": "Valor actual",
        "variance": "Varianza",
        "stdDev": "Desviación estándar",
        "series": "Series",
        "seriesFilter": "Filtrar series",
        "columns": "Columnas mostradas",
        "none": "Ninguno",
        "behaviour": {
          "label": "Acción al hacer clic",
          "showItem": "Mostrar el elemento",
          "hideItem": "Ocultar el elemento"
        },
        "selectMode": {
          "label": "Modo de selección",
          "single": "Selección única",
          "multiple": "Selección múltiple"
        },
        "heightInPercentage": "Altura en porcentaje",
        "sortBy": "Columna de ordenación",
        "sortBy_tip": "Elige la columna estadística por la que ordenar; si no eliges ninguna, no se ordena",
        "sortDir": "Sentido de la ordenación",
        "sortDirAsc": "Ascendente",
        "sortDirDesc": "Descendente",
        "heightInPercentage_tip": "Altura máxima de la leyenda respecto al panel, entre el 20 % y el 80 %",
        "widthInPercentage": "Ancho en porcentaje",
        "widthInPercentage_tip": "Ancho máximo de la leyenda respecto al panel, entre el 20 % y el 80 %"
      },
      "thresholds": {
        "title": "Umbral",
        "btn": "Añadir umbral",
        "mode": {
          "label": "Modo del umbral",
          "tip": "En el modo porcentual el cálculo es: mínimo del eje Y + (máximo del eje Y − mínimo del eje Y) × (porcentaje / 100)",
          "absolute": "Valor absoluto",
          "percentage": "Porcentaje"
        }
      },
      "thresholdsStyle": {
        "label": "Estilo del umbral",
        "off": "Desactivado",
        "line": "Línea",
        "dashed": "Línea discontinua",
        "line+area": "Línea + área",
        "dashed+area": "Línea discontinua + área"
      },
      "tooltip": {
        "mode": "Modo",
        "sort": "Orden"
      },
      "valueMappings": {
        "title": "Asignación de valores",
        "btn": "Añadir",
        "type": "Condición",
        "type_tip": "\n          <0>Valores predeterminados del rango: from=-Infinity; to=Infinity </0>\n          <1>Sobre el valor especial Null: coincide con null, undefined o la ausencia de datos</1>\n        ",
        "type_map": {
          "special": "Valor fijo (numérico)",
          "textValue": "Valor fijo (texto)",
          "range": "Rango",
          "specialValue": "Valor especial"
        },
        "value_placeholder": "Valor de coincidencia exacta",
        "text": "Texto mostrado",
        "text_placeholder": "Opcional",
        "color": "Color",
        "operations": "Acciones"
      },
      "colors": {
        "name": "Configuración de colores",
        "scheme": "Paleta de colores",
        "reverse": "Invertir los colores"
      },
      "links": {
        "label": "Enlace",
        "add_btn": "Añadir enlace",
        "edit_btn": "Editar enlace",
        "title": "Título del enlace",
        "title_required": "El título del enlace no puede estar vacío",
        "url": "Dirección del enlace",
        "url_required": "La dirección del enlace no puede estar vacía",
        "target_blank": "Abrir en una ventana nueva"
      }
    },
    "standardOptions": {
      "title": "Ajustes avanzados",
      "unit": "Unidad",
      "unit_tip": "\n        <0>Por defecto se aplican los prefijos SI; elige none para desactivarlos</0>\n        <1>Data(SI): base 1000, unidades B, kB, MB, GB, TB, PB, EB, ZB, YB</1>\n        <2>Data(IEC): base 1024, unidades B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB</2>\n        <3>bits: b</3>\n        <4>bytes: B</4>\n      ",
      "datetime": "Formato de fecha y hora",
      "min": "Mínimo",
      "max": "Máximo",
      "decimals": "Decimales",
      "displayName": "Nombre para mostrar",
      "displayName_tip": "Nombre personalizado de la serie"
    },
    "overrides": {
      "columnWidth": "Ancho de columna",
      "matcher": {
        "id": "Tipo de coincidencia",
        "byFrameRefID": {
          "option": "Por el nombre de la consulta",
          "name": "Nombre de la consulta"
        },
        "byName": {
          "option": "Por el nombre del campo",
          "name": "Nombre del campo"
        }
      }
    },
    "custom": {
      "title": "Estilo del gráfico",
      "calc": "Cálculo del valor",
      "calc_tip": "Las series temporales necesitan un cálculo sobre todos sus puntos; los datos que no son series temporales ignoran esta opción",
      "maxValue": "Máximo",
      "baseColor": "Color base",
      "serieWidth": "Ancho del nombre",
      "sortOrder": "Orden",
      "textMode": "Contenido mostrado",
      "valueAndName": "Valor y nombre",
      "value": "Valor",
      "name": "Nombre",
      "background": "Fondo",
      "colorMode": "Modo de color",
      "valueField": "Campo de valor",
      "valueField_tip": "Value es una palabra reservada: es el nombre del campo que resulta del cálculo sobre la serie temporal",
      "valueField_tip2": "Elige un campo cuyo valor sea numérico",
      "nameField": "Campo de nombre",
      "nameField_tip": "Usa el valor del campo de nombre como nombre de la serie",
      "colSpan": "Máximo por fila",
      "colSpanTip": "Está a punto de retirarse; al elegir «Automático» se usa la orientación definida abajo",
      "colSpanAuto": "Automático",
      "textSize": {
        "title": "Tamaño de la fuente del título",
        "value": "Tamaño de la fuente del valor"
      },
      "colorRange": "Color",
      "reverseColorOrder": "Invertir los colores",
      "colorDomainAuto": "Mínimo y máximo automáticos",
      "colorDomainAuto_tip": "Por defecto, el mínimo y el máximo se toman automáticamente de las series",
      "fontBackground": "Color de fondo del texto",
      "detailName": "Nombre del enlace",
      "detailUrl": "Dirección del enlace",
      "stat": {
        "graphMode": "Modo del gráfico",
        "none": "No mostrar",
        "area": "Minigráfico",
        "orientation": "Orientación del diseño",
        "orientationTip": "Con «Automático», la orientación se elige según el ancho y el alto del gráfico",
        "orientationValueMap": {
          "auto": "Automático",
          "vertical": "Vertical",
          "horizontal": "Horizontal"
        }
      },
      "pie": {
        "countOfValueField": "Recuento del campo de valor",
        "countOfValueField_tip": "Cuando se activa, se cuentan los valores del campo de valor; si no, se muestran tal cual",
        "legengPosition": "Posición de la leyenda",
        "max": "Máximo de bloques mostrados",
        "max_tip": "Los bloques que sobran se agrupan en «Otros»",
        "donut": "Modo de anillo",
        "labelWithName": "Incluir el nombre en la etiqueta",
        "labelWithValue": "Mostrar el valor de la métrica en la etiqueta",
        "detailName": "Nombre del enlace",
        "detailUrl": "Dirección del enlace"
      },
      "table": {
        "displayMode": "Modo de visualización",
        "showHeader": "Mostrar la cabecera",
        "seriesToRows": "Cada fila muestra el valor de la serie",
        "labelsOfSeriesToRows": "Cada fila muestra el valor de las etiquetas",
        "labelValuesToRows": "Cada fila muestra el valor de la dimensión de agregación elegida",
        "columns": "Columnas mostradas",
        "aggrDimension": "Dimensiones mostradas",
        "sortColumn": "Columna de ordenación predeterminada",
        "sortOrder": "Ordenación predeterminada",
        "link": {
          "mode": "Modo de enlace",
          "cellLink": "Enlace en la celda",
          "appendLinkColumn": "Añadir una columna de enlaces"
        },
        "tableLayout": {
          "label": "Diseño de la tabla",
          "label_tip": "Con el diseño fijo, las columnas se reparten el ancho por igual y no aparece barra de desplazamiento horizontal. Con el diseño automático, cada columna mide como mucho 150 px y el contenido puede desbordarse, lo que genera desplazamiento horizontal.",
          "auto": "Automático",
          "fixed": "Fijo"
        },
        "nowrap": "No ajustar el texto en las celdas",
        "organizeFields": "Organización de los campos",
        "colorMode_tip": "El modo de color se aplica al campo de valor. En el modo valor, el color afecta al texto; en el modo fondo, al fondo de la celda.",
        "pageLimit": "Filas por página"
      },
      "tableNG": {
        "enablePagination": "Activar la paginación",
        "showHeader": "Mostrar la cabecera",
        "filterable": "Activar el filtro de columnas",
        "sortColumn": "Columna de ordenación predeterminada",
        "sortOrder": "Ordenación predeterminada",
        "enableRowDetail": "Activar los detalles de fila",
        "enableRowDetail_tip": "Cuando se activa, la primera columna muestra un icono de detalles. Al pulsarlo, un panel lateral muestra todos los campos y valores de la fila, con opción de copiar la fila entera o campos sueltos.",
        "rowDetail": {
          "triggerTip": "Ver los detalles de la fila",
          "title": "Detalles",
          "tableTab": "Tabla",
          "jsonTab": "JSON",
          "field": "Campo",
          "value": "Valor",
          "copyRow": "Copiar la fila entera",
          "copyFieldAndValue": "Copiar el campo y el valor",
          "copyFieldValue": "Copiar el valor del campo"
        },
        "cellOptions": {
          "type": {
            "label": "Tipo de celda",
            "options": {
              "none": "Predeterminado",
              "color-text": "Texto en color",
              "color-background": "Fondo en color",
              "gauge": "Indicador (Gauge)"
            }
          },
          "wrapText": "Ajuste de texto",
          "wrapText_tip": "Cuando se activa, el texto de la celda se ajusta automáticamente y la altura de la fila se adapta al número de líneas; con muchos datos, esto afecta al rendimiento",
          "color-background": {
            "mode": {
              "label": "Modo de color",
              "options": {
                "basic": "Básico",
                "gradient": "Degradado"
              }
            }
          },
          "gauge": {
            "mode": {
              "label": "Modo",
              "options": {
                "basic": "Básico",
                "gradient": "Degradado",
                "lcd": "LCD"
              }
            },
            "valueDisplayMode": {
              "label": "Visualización del valor",
              "options": {
                "color": "Color",
                "text": "Texto",
                "hidden": "Ocultar"
              }
            }
          }
        }
      },
      "text": {
        "textColor": "Color del texto",
        "textDarkColor": "Color del texto en el tema oscuro",
        "bgColor": "Color de fondo",
        "textSize": "Tamaño del texto",
        "justifyContent": {
          "name": "Alineación horizontal",
          "unset": "Sin definir",
          "flexStart": "A la izquierda",
          "center": "Centrado",
          "flexEnd": "A la derecha"
        },
        "alignItems": {
          "name": "Alineación vertical",
          "unset": "Sin definir",
          "flexStart": "Arriba",
          "center": "Centrado",
          "flexEnd": "Abajo"
        },
        "content": "Contenido",
        "content_placeholder": "Se admiten Markdown y HTML",
        "content_tip": "\n          <0>El modo simple es el predeterminado; usa las opciones de arriba para ajustar el estilo de la tarjeta</0>\n          <1>Se admiten Markdown y HTML</1>\n          <2>Si usas Markdown o HTML, te recomendamos desactivar las opciones de alineación de arriba</2>\n        "
      },
      "timeseries": {
        "drawStyle": "Modo de dibujo",
        "lineInterpolation": "Interpolación de la línea",
        "spanNulls": "Conectar los valores nulos",
        "spanNulls_0": "Cerrar",
        "spanNulls_1": "Activar",
        "lineWidth": "Grosor de la línea",
        "fillOpacity": "Opacidad",
        "gradientMode": "Degradado",
        "gradientMode_opacity": "Activar",
        "gradientMode_none": "Cerrar",
        "stack": "Apilado",
        "stack_normal": "Activar",
        "stack_off": "Desactivado",
        "yAxis": {
          "title": "Configuración del eje Y",
          "rightYAxis": {
            "label": "Mostrar el eje Y a la derecha",
            "normal": "Activado",
            "off": "Desactivado"
          }
        },
        "showPoints": "Mostrar los puntos",
        "showPoints_always": "Mostrar",
        "showPoints_none": "No mostrar",
        "pointSize": "Tamaño del punto"
      },
      "iframe": {
        "src": "Dirección del iframe"
      },
      "heatmap": {
        "xAxisField": "Eje X",
        "yAxisField": "Eje Y",
        "valueField": "Columna numérica"
      },
      "barchart": {
        "xAxisField": "Eje X",
        "yAxisField": "Eje Y",
        "colorField": "Campo de color",
        "barMaxWidth": "Ancho máximo de la barra",
        "colorField_tip": "Name es una palabra reservada: es el nombre del campo que contiene el nombre de la serie"
      },
      "barGauge": {
        "topn": "Máximo de posiciones",
        "combine_other": "Otros",
        "combine_other_tip": "Los datos que superan el límite se agrupan en un elemento «Otros»",
        "otherPosition": {
          "label": "Posición del elemento «Otros»",
          "tip": "Posición del elemento «Otros»: al principio o al final",
          "options": {
            "none": "Predeterminado",
            "top": "Al principio",
            "bottom": "Al final"
          }
        },
        "displayMode": "Modo de visualización",
        "valueMode": {
          "label": "Visualización del valor",
          "color": "Mostrar",
          "hidden": "Ocultar"
        }
      }
    },
    "inspect": {
      "title": "Diagnosticar",
      "query": "Consulta",
      "json": "Configuración del gráfico"
    }
  },
  "export": {
    "copy": "Copiar el JSON al portapapeles"
  },
  "query": {
    "title": "Condición de consulta",
    "add_query_btn": "Añadir consulta",
    "add_expression_btn": "Añadir expresión",
    "transform": "Transformación de datos",
    "datasource_placeholder": "Selecciona el origen de datos",
    "datasource_msg": "Selecciona el origen de datos",
    "time": "Selección de tiempo",
    "time_tip": "Se puede definir un intervalo propio; por defecto se usa el global del dashboard",
    "es": {
      "field_key_msg": "Hay que indicar la clave del campo"
    },
    "prometheus": {
      "query": "Consulta (PromQL)",
      "maxDataPoints": {
        "tip": "Número máximo de puntos por serie; por defecto es el ancho del panel (240 al crearlo). El paso se calcula como step = (end − start) / maxDataPoints",
        "tip_2": "Número máximo de puntos por serie; por defecto es el ancho del panel. El paso se calcula como step = (end − start) / maxDataPoints"
      },
      "minStep": {
        "label": "Paso mínimo (Min step)",
        "tip": "Paso mínimo, 15 por defecto. El cálculo es step = max(step, minStep, safeStep), con safeStep = (end − start) / 11000"
      },
      "step": {
        "tag_tip": "El cálculo es step = max((end − start) / maxDataPoints, minStep, safeStep), con safeStep = (end − start) / 11000"
      },
      "instant": {
        "label": "Consulta instantánea (Instant)",
        "tip": "Consulta los datos del instante final y devuelve un único punto"
      }
    },
    "expression_placeholder": "Aplica operaciones matemáticas a una o varias consultas. Refiérete a ellas con ${refId}, es decir, $A, $B, $C, etc. Suma de dos escalares: $A + $B > 10",
    "legend": "Leyenda (Legend)",
    "legendTip": "Sustituye o define el nombre que se muestra en la leyenda; por ejemplo, {{hostname}} se reemplaza por el valor de la etiqueta hostname",
    "legendTip2": "Sustituye o define el nombre que se muestra en la leyenda; por ejemplo, {{hostname}} se reemplaza por el valor de la etiqueta hostname. Por ahora solo se aplica a las series temporales",
    "options": "Opciones de la consulta",
    "options_max_data_points": "Número máximo de puntos",
    "options_max_data_points_tip": "Número máximo de puntos por serie; por defecto es el ancho del panel (240 al crearlo). Se usa en el cálculo step = (end − start) / maxDataPoints",
    "options_time": "Intervalo de la consulta",
    "options_time_tip": "Se puede definir un intervalo propio para la consulta; por defecto se usa el global del dashboard",
    "copy_query": "Duplicar la consulta",
    "mixed_datasource": "Mezclar orígenes de datos",
    "hide_response": "Ocultar el resultado de la consulta"
  },
  "migrate": {
    "title": "Migrar dashboards",
    "close_and_dismiss": "Cerrar y no volver a mostrar",
    "batch_migrate": "Ir a la migración masiva de dashboards",
    "migrate_current": "Migrar este dashboard",
    "desc_1": "La versión v6 deja de admitir el cambio global de clúster Prometheus; en las versiones nuevas, asocia los gráficos a una variable de origen de datos para lograr lo mismo.",
    "desc_2": "La herramienta de migración crea la variable de origen de datos y la asocia a todos los gráficos que aún no tienen una."
  },
  "detail": {
    "ai_analysis": "Análisis con IA",
    "datasource_empty": "No hay ningún origen de datos; configura uno primero",
    "invalidTimeRange": "Valores de __from y __to no válidos",
    "invalidDatasource": "Origen de datos no válido",
    "invalidPanelConfig": "Configuración de gráfico no válida",
    "deletePanel_confirm": "¿Eliminar el gráfico {{name}}?",
    "invalidPanelType": "Tipo de gráfico no válido",
    "fullscreen": {
      "notification": {
        "esc": "Pulsa ESC para salir de la pantalla completa",
        "theme": "Cambiar de tema"
      }
    },
    "saved": "Guardado correctamente",
    "expired": "Otra persona ha modificado este dashboard. Actualízalo para ver la configuración y los datos más recientes y evitar sobrescribir su trabajo",
    "prompt": {
      "title": "Hay cambios sin guardar",
      "message": "¿Quieres guardar los cambios?",
      "cancelText": "Cancelar",
      "discardText": "Descartar",
      "okText": "Guardar"
    },
    "importPanel": {
      "invalidJSON": "El JSON de configuración del gráfico no es válido",
      "placeholder": "Pega el JSON de configuración del gráfico. Para obtenerlo, usa «Copiar» en el menú de más acciones, arriba a la derecha del panel"
    }
  },
  "settings": {
    "graphTooltip": {
      "label": "Descripción emergente (Tooltip)",
      "tip": "Controla el comportamiento de las descripciones emergentes en todos los gráficos",
      "default": "Predeterminado",
      "sharedCrosshair": "Cursor compartido",
      "sharedTooltip": "Descripción emergente compartida (Tooltip)"
    },
    "graphZoom": {
      "label": "Comportamiento del zoom",
      "tip": "Controla el comportamiento del zoom en todos los gráficos",
      "default": "Predeterminado",
      "updateTimeRange": "Actualizar el intervalo de tiempo"
    },
    "save": "Guardar el dashboard"
  },
  "visualizations": {
    "timeseries": "Gráfico de series temporales",
    "barchart": "Gráfico de barras",
    "stat": "Valor de la métrica",
    "table": "Tabla",
    "tableNG": "Tabla NG (Beta)",
    "pie": "Gráfico circular",
    "hexbin": "Gráfico de panal",
    "barGauge": "Clasificación",
    "text": "Tarjeta de texto",
    "gauge": "Indicador",
    "heatmap": "Mapa de bloques",
    "iframe": "Documento incrustado (iframe)",
    "row": "Grupo",
    "importPanel": "Pegar gráfico"
  },
  "calcs": {
    "lastNotNull": "Último valor no nulo",
    "last": "Último valor",
    "firstNotNull": "Primer valor no nulo",
    "first": "Primer valor",
    "min": "Mínimo",
    "max": "Máximo",
    "avg": "Media",
    "sum": "Suma",
    "count": "Cantidad",
    "origin": "Valor bruto",
    "variance": "Varianza",
    "stdDev": "Desviación estándar"
  },
  "annotation": {
    "add": "Añadir anotación",
    "edit": "Editar anotación",
    "description": "Descripción",
    "tags": "Etiquetas",
    "updated": "Anotación actualizada",
    "deleted": "Anotación eliminada"
  },
  "transformations": {
    "organize": {
      "title": "Organize fields by name",
      "desc": "Reordena, oculta o renombra campos"
    },
    "merge": {
      "title": "Merge tables",
      "desc": "Une varias tablas en una sola"
    },
    "joinByField": {
      "title": "Join by field",
      "desc": "Une las filas de varias tablas por los campos relacionados",
      "mode": "Modo",
      "byField": "Campo"
    },
    "timeSeriesTable": {
      "title": "Time series to table",
      "desc": "Reduce los valores de todos los puntos de una serie temporal a uno solo",
      "fieldName": "Campo",
      "functions": "Método"
    },
    "groupedAggregateTable": {
      "title": "Grouped aggregate table",
      "desc": "Agrupa la tabla por uno o varios campos y agrega el resto",
      "operation_map": {
        "aggregate": "Cálculo",
        "groupby": "Grupo"
      }
    }
  },
  "add_transformation": "Añadir transformación de datos"
};

export default es_ES;

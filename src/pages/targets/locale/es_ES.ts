const es_ES = {
  "title": "Lista de máquinas",
  "default_filter": "Filtros predefinidos",
  "ungrouped_targets": "Máquinas sin grupo",
  "all_targets": "Todas las máquinas",
  "datasource": "Origen de datos",
  "search_placeholder": "Búsqueda aproximada en el contenido de la tabla (separa las palabras clave con espacios)",
  "filterDowntime": "Actualización del latido",
  "filterDowntimeNegative": "Latido actualizado",
  "filterDowntimePositive": "Latido sin actualizar",
  "filterDowntimeNegativeMin": "Actualizado en los últimos {{count}} minutos",
  "filterDowntimePositiveMin": "Sin actualizar en los últimos {{count}} minutos",
  "ident_copy_success": "{{num}} registros copiados correctamente",
  "not_grouped": "Sin grupo",
  "host_ip": "IP",
  "host_tags": "Etiquetas enviadas",
  "tags": "Etiquetas personalizadas",
  "group_obj": "Grupo de negocio",
  "target_up": "Estado",
  "mem_util": "Memoria",
  "cpu_util": "CPU",
  "cpu_num": "Núcleos",
  "offset": "Desfase de reloj",
  "offset_tip": "Se calcula restando la hora de la máquina de categraf a la de la máquina de Nightingale",
  "os": "Sistema operativo",
  "arch": "Arquitectura de CPU",
  "update_at": "Actualizado el",
  "update_at_tip": "\n    Latido en el último minuto: verde <1 />\n    Latido en los últimos 3 minutos: amarillo <1 />\n    Sin latido desde hace más de 3 minutos: rojo\n  ",
  "remote_addr": "IP de origen",
  "remote_addr_tip": "La IP de origen procede de la cabecera HTTP; si hay un proxy por medio, puede no ser la IP real",
  "agent_version": "Versión del agente",
  "note": "Observación",
  "unknown_tip": "Muestra los metadatos de la máquina; requiere una versión de categraf superior a la 0.2.35",
  "view_related_collects": "Ver las configuraciones de recolección asociadas",
  "organize_columns": {
    "title": "Columnas mostradas"
  },
  "targets": "Objetos monitorizados",
  "targets_placeholder": "Introduce las métricas del objeto monitorizado, una por línea",
  "copy": {
    "current_page": "Copiar esta página",
    "all": "Copiar todo",
    "selected": "Copiar la selección",
    "no_data": "No hay nada que copiar"
  },
  "bind_tag": {
    "title": "Vincular etiquetas",
    "placeholder": "Etiquetas con el formato key=value, separadas por Intro o espacio",
    "msg1": "Introduce al menos una etiqueta.",
    "msg2": "El formato de la etiqueta no es válido. ¡Revísalo!",
    "msg3": "Las claves de etiqueta no pueden repetirse",
    "render_tip1": "La etiqueta no puede superar los 64 caracteres",
    "render_tip2": "La etiqueta debe tener el formato key=value, y la clave debe empezar por una letra o un guion bajo y contener solo letras, números y guiones bajos."
  },
  "unbind_tag": {
    "title": "Desvincular etiquetas",
    "placeholder": "Selecciona las etiquetas que quieres desvincular",
    "msg": "Introduce al menos una etiqueta."
  },
  "update_busi": {
    "title": "Cambiar el grupo de negocio",
    "label": "Grupo de negocio",
    "mode": {
      "label": "Modo",
      "reset": "Sobrescribir",
      "add": "Añadir",
      "del": "Eliminar"
    },
    "tags": "Vincular etiquetas",
    "tags_tip": "Si se deja vacío, no se sobrescriben las etiquetas anteriores"
  },
  "remove_busi": {
    "title": "Sacar del grupo de negocio",
    "msg": "Atención: al sacar estos objetos del grupo de negocio, sus administradores dejarán de poder gestionarlos. Quizá quieras vaciar antes sus etiquetas y observaciones.",
    "btn": "Sacar"
  },
  "update_note": {
    "title": "Cambiar la observación",
    "placeholder": "Si se deja vacío, la observación se borra"
  },
  "batch_delete": {
    "title": "Eliminar en lote",
    "msg": "Atención: esta acción elimina los objetos monitorizados definitivamente del sistema. Es una operación peligrosa, procede con cuidado.",
    "btn": "Eliminar"
  },
  "meta_tip": "Ver los metadatos",
  "meta_title": "Metadatos",
  "meta_desc_key": "Nombre del metadato",
  "meta_desc_value": "Valor del metadato",
  "meta_value_click_to_copy": "Pulsa para copiar",
  "meta_expand": "Expandir",
  "meta_collapse": "Contraer",
  "meta_no_data": "No hay datos",
  "all_no_data": "¿Aún no has instalado el recolector? Sigue el <a>manual de instalación</a>",
  "categraf_doc": "Documentación de categraf",
  "hosts_select": {
    "placeholder": "Identificador o IP de la máquina",
    "modal_title": "Introduce el identificador o la IP de la máquina",
    "modal_placeholder": "Un identificador o IP por línea"
  }
};

export default es_ES;

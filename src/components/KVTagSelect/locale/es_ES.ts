const es_ES = {
  "append_tags_msg": "El formato de la etiqueta no es válido. ¡Revísalo!",
  "append_tags_msg1": "La etiqueta no puede superar los 64 caracteres",
  "append_tags_msg2": "La etiqueta debe tener el formato key=value, y la clave debe empezar por una letra o un guion bajo y contener solo letras, números y guiones bajos.",
  "append_tags_placeholder": "Etiquetas con el formato key=value, separadas por Intro o espacio",
  "tag": {
    "key": {
      "label": "Nombre de la etiqueta",
      "msg": "El nombre de la etiqueta no puede estar vacío",
      "duplicate_error": "No se permite repetir la misma clave; eso impediría que se encontraran eventos",
      "placeholder": "Escribe o selecciona la clave de etiqueta usada en la coincidencia, por ejemplo app / cluster / alertname"
    },
    "func": {
      "label": "Operador",
      "label_tip": "Se admiten varios operadores de coincidencia:\n- `==` coincide con un valor de etiqueta concreto; solo admite uno. Para varios a la vez, usa el operador `in`\n- `=~` admite una expresión regular, lo que permite coincidencias flexibles\n- `in` coincide con varios valores de etiqueta, como el `in` de SQL\n- `not in` excluye varios valores de etiqueta, como el `not in` de SQL\n- `!=` distinto de, para excluir un valor concreto\n- `!~` expresión regular negada: se excluyen todos los valores que coincidan con ella, como el `!~` de PromQL",
      "msg": "El operador no puede estar vacío"
    },
    "value": {
      "label": "Valor de la etiqueta",
      "placeholder": "Escribe o elige en la lista el valor de etiqueta usado en la coincidencia",
      "placeholder2": "Introduce una expresión regular para hacer coincidir los valores de atributo con flexibilidad",
      "msg": "El valor de la etiqueta no puede estar vacío"
    },
    "add": "Añadir etiqueta"
  },
  "attr": {
    "key": {
      "label": "Nombre del atributo",
      "msg": "El nombre del atributo no puede estar vacío",
      "duplicate_error": "El nombre del atributo no puede repetirse"
    }
  }
};

export default es_ES;

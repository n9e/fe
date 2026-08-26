const pt_BR = {
  "append_tags_msg": "Formato de rótulo inválido, verifique!",
  "append_tags_msg1": "O rótulo deve ter no máximo 64 caracteres",
  "append_tags_msg2": "O rótulo deve estar no formato key=value, e a chave deve começar com letra ou sublinhado e conter apenas letras, números e sublinhados.",
  "append_tags_placeholder": "Rótulos no formato key=value, separados por Enter ou espaço",
  "tag": {
    "key": {
      "label": "Nome do rótulo",
      "msg": "O nome do rótulo não pode ficar vazio",
      "duplicate_error": "Não é permitido repetir a mesma chave; isso impediria a correspondência de eventos",
      "placeholder": "Digite ou selecione a chave de rótulo usada na correspondência, por exemplo app / cluster / alertname"
    },
    "func": {
      "label": "Operador",
      "label_tip": "Vários operadores de correspondência são suportados:\n- `==` corresponde a um valor de rótulo específico; aceita apenas um valor. Para vários ao mesmo tempo, use o operador `in`\n- `=~` aceita uma expressão regular, permitindo correspondência flexível\n- `in` corresponde a vários valores de rótulo, como o `in` do SQL\n- `not in` exclui vários valores de rótulo, como o `not in` do SQL\n- `!=` diferente de, usado para excluir um valor específico\n- `!~` expressão regular negada: todos os valores que casarem com ela são excluídos, como o `!~` da PromQL",
      "msg": "O operador não pode ficar vazio"
    },
    "value": {
      "label": "Valor do rótulo",
      "placeholder": "Digite manualmente ou escolha na lista o valor de rótulo usado na correspondência",
      "placeholder2": "Informe uma expressão regular para corresponder aos valores de atributo de forma flexível",
      "msg": "O valor do rótulo não pode ficar vazio"
    },
    "add": "Adicionar rótulo"
  },
  "attr": {
    "key": {
      "label": "Nome do atributo",
      "msg": "O nome do atributo não pode ficar vazio",
      "duplicate_error": "O nome do atributo não pode se repetir"
    }
  }
};

export default pt_BR;

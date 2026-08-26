const pt_BR = {
  "title": "Visão de métricas",
  "name": "Nome da métrica",
  "collector": "Categoria",
  "typ": "Tipo de componente",
  "expression_type": "Tipo de expressão",
  "expression_type_metric_name": "Nome da métrica",
  "expression_type_promql": "PromQL",
  "metric_type": "Tipo de métrica",
  "metric_type_gauge": "Gauge",
  "metric_type_counter": "Counter",
  "metric_type_histogram": "Histogram",
  "extra_fields": "Campos personalizados",
  "extra_fields_name": "Nome",
  "extra_fields_value": "Valor",
  "laset_over_time": "Último envio",
  "unit": "Unidade",
  "unit_tip": "Ao desenhar o gráfico, formata os valores automaticamente conforme a unidade da métrica",
  "note": "Descrição",
  "note_preview": "Prévia da descrição",
  "expression": "PromQL",
  "add_btn": "Criar métrica",
  "clone_title": "Clonar métrica",
  "edit_title": "Editar métrica",
  "explorer": "Consulta",
  "closePanelsBelow": "Fechar o painel inferior",
  "addPanel": "Adicionar painel",
  "translation": "Sobre as métricas",
  "batch": {
    "not_select": "Selecione uma métrica primeiro",
    "export": {
      "title": "Exportar métricas"
    },
    "import": {
      "title": "Importar métricas",
      "name": "Nome da métrica",
      "result": "Resultado da importação",
      "errmsg": "Mensagem de erro"
    }
  },
  "filter": {
    "title": "Filtro",
    "title_tip": "O filtro reduz o escopo da consulta quando você clica em uma métrica à direita para ver seus dados. Com o filtro {ident=\"n9e01\"} configurado e selecionado, consultar cpu_usage_idle dispara na verdade cpu_usage_idle{ident=\"n9e01\"}, o que diminui muito o número de séries retornadas",
    "add_title": "Adicionar filtro",
    "edit_title": "Editar filtro",
    "import_title": "Importar filtros",
    "name": "Nome",
    "datasource": "Fonte de dados",
    "datasource_tip": "Fonte de dados usada para montar o filtro",
    "configs": "Filtro",
    "groups_perm": "Equipes autorizadas",
    "groups_perm_gid_msg": "Selecione as equipes autorizadas",
    "perm": {
      "0": "Somente leitura",
      "1": "Leitura e escrita"
    },
    "build_labelfilter_and_expression_error": "Falha ao montar o filtro de rótulos e a expressão",
    "filter_label_msg": "O rótulo não pode ficar vazio",
    "filter_oper_msg": "O operador não pode ficar vazio",
    "filter_value_msg": "O valor do rótulo não pode ficar vazio"
  }
};

export default pt_BR;

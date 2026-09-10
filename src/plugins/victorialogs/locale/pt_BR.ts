const pt_BR = {
  "explorer": {
    "execute": "Consulta",
    "query": "Condição de consulta",
    "query_required": "A condição de consulta não pode ficar vazia",
    "query_lanaguage_docs": "Documentação da linguagem de consulta",
    "limit": "Limite de registros",
    "hits": "Resultados correspondentes",
    "graph_settings": {
      "title": "Configuração do gráfico",
      "stacked": "Empilhamento",
      "fill": "Preenchimento"
    },
    "view": {
      "group": "Grupo",
      "table": "Tabela",
      "json": "JSON"
    },
    "total_logs_returned": "Total de logs retornados",
    "total_groups": "Total de grupos",
    "page_size": "Itens por página",
    "page_size_all": "Todos",
    "expand_all": "Expandir tudo",
    "collapse_all": "Recolher tudo",
    "group_view": {
      "ungrouped": "Sem grupo",
      "group_by_field": "Agrupado por \"{{field}}\"",
      "entries": "itens",
      "show_field_tip": "Campos exibidos",
      "hide_field_tip": "Ocultar campo",
      "group_by_field_icon_tip": "Agrupar por este campo"
    },
    "group_view_settings": {
      "title": "Configuração da visão agrupada",
      "group_by_field": "Campo de agrupamento",
      "group_by_field_help": "Escolha um campo para agrupar os logs (padrão: _stream)",
      "ungrouped": "Não agrupar",
      "display_fields": "Campos exibidos",
      "display_fields_help": "Escolha os campos a exibir (padrão: _msg)",
      "date_format": "Formato de data",
      "date_format_help01": "Defina o formato de data (por exemplo, YYYY-MM-DD HH:mm:ss). <a>Consulte esta documentação para saber mais</a>",
      "date_format_help02": "Seu formato de data atual: {{dateFormat}}"
    },
    "table_view_settings": {
      "title": "Configuração da visão em tabela",
      "customize_columns": "Colunas personalizadas",
      "search_columns": "Buscar colunas",
      "check_all": "Selecionar tudo"
    },
    "copy_json": "Copiar JSON",
    "parse_failed": "Não foi possível interpretar",
    "timeseries": {
      "value_field": "Campo de valor",
      "value_field_tip": "Campos numéricos usados no gráfico de série temporal; é possível informar vários",
      "value_field_required": "Selecione o campo de valor",
      "label_field": "Campo de rótulo",
      "label_field_tip": "Campos de rótulo que distinguem as séries; é possível informar vários",
      "unit": "Unidade"
    }
  },
  "builder": {
    "filter": "Filtrar",
    "add": "Adicionar",
    "field": "Campo",
    "operator": "Operador",
    "value": "Valor",
    "function": "Função",
    "quantile": "Percentil",
    "alias": "Apelido",
    "order_by": "Ordenação",
    "direction": "Ordenação",
    "field_placeholder": "Informe o campo",
    "value_placeholder": "Informe o valor",
    "operator_placeholder": "Selecione o operador",
    "function_placeholder": "Selecione a função",
    "alias_placeholder": "Informe o apelido",
    "select_field": "Selecione o campo",
    "select_operator": "Selecione o operador",
    "input_value": "Informe o valor",
    "select_function": "Selecione a função",
    "input_field": "Informe o campo",
    "input_quantile": "Informe o percentil",
    "select_direction": "Selecione a ordenação",
    "aggregation": "Agregação",
    "aggregation_required": "Configure pelo menos uma agregação",
    "display": "Exibição",
    "filter_relation_tip": "Todos os filtros são combinados com E.",
    "statistical_value": "Valor estatístico",
    "timeseries": "Gráfico de série temporal",
    "group_by": "Grupo",
    "limit": "Limite de registros",
    "execute": "Consulta",
    "preview_ql": "Prévia da consulta",
    "pin": "Fixo",
    "unpin": "Desafixar"
  },
  "datasource": {},
  "alert": {
    "query_warning_no_time": "Recomendamos fortemente usar _time, o campo de tempo, na consulta para delimitar o intervalo; sem isso podem ocorrer <b>carga anormal no armazenamento e tempo limite nas consultas de alerta</b>"
  }
};

export default pt_BR;

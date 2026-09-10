const pt_BR = {
  "title": "Busca de logs",
  "tab": {
    "rename": "Renomear"
  },
  "query": "Condição de consulta",
  "query_is_required": "A condição de consulta não pode ficar vazia",
  "execute": "Consulta",
  "mode": {
    "label": "Modo",
    "raw_logs": "Texto bruto do log",
    "statistical_charts": "Gráficos estatísticos"
  },
  "mode_switch": {
    "confirm_title": "Confirmar troca de modo",
    "confirm_content": "A consulta atual do modo de gráficos usa o operador de pipe (|), que não existe no modo de texto bruto. Ao trocar, a consulta será apagada. Deseja continuar?",
    "confirm_ok": "Trocar mesmo assim",
    "confirm_cancel": "Cancelar"
  },
  "before_query": "Clique em <b>Consultar</b> para exibir os dados",
  "loading": "Carregando dados…",
  "no_data": "A consulta não retornou dados",
  "histogram_hide": "Ocultar gráfico",
  "histogram_show": "Exibir gráfico",
  "share_btn": "Link de compartilhamento",
  "share_tip": "Clique para copiar o link de compartilhamento",
  "log_viewer_drawer_trigger_tip": "Clique para ver os detalhes do log",
  "log_viewer_drawer_title": "Detalhes do log",
  "copy_to_clipboard": "Copiar para a área de transferência",
  "unindexable": "As estatísticas não estão ativadas para este campo, então não é possível analisá-lo",
  "topn_no_data": "Sem dados",
  "stats": {
    "unique_count": "Valores distintos",
    "min": "Mínimo",
    "max": "Máximo",
    "sum": "Soma",
    "avg": "Média",
    "exist_ratio": "Proporção de logs que têm este campo",
    "median": "Mediana",
    "p95": "Percentil (P95)"
  },
  "field_popover_info_alert": "Clique no valor para ver o gráfico estatístico e o SQL",
  "field_search_placeholder": "Buscar campos",
  "field_list": {
    "show_fields": "Campos exibidos",
    "available_fields": "Campos disponíveis"
  },
  "field_actions": {
    "and": "Adicionar a esta busca",
    "not": "Excluir desta busca",
    "exists": "Filtrar documentos que tenham este campo"
  },
  "field_values_topn": {
    "title": "{{n}} valores mais frequentes",
    "settings": {
      "title": "Configuração dos N valores mais frequentes"
    },
    "no_data": "Este campo existe no mapping, mas não aparece nos 500 documentos exibidos",
    "quick_view_count": "Quantidade de logs",
    "quick_view_ratio": "Proporção"
  },
  "empty_value_not_supported_tip": "Ainda não é possível buscar por valores vazios",
  "unsupported_datasource_type": "Não é possível renderizar o tipo de fonte de dados {{type}}, que não é suportado",
  "no_supported_datasource_types_title": "Nenhum tipo de fonte de dados disponível",
  "no_supported_datasource_types_desc": "Configure na página de <a>gerenciamento de fontes de dados</a> ou peça ao administrador. Os tipos suportados no momento são: {{types}},",
  "field_tip": "Clique para ver as estatísticas",
  "field_value_statistic": {
    "view_statistic": "Ver os valores estatísticos",
    "view_timeseries": "Ver o gráfico de série temporal"
  },
  "field_type": "Tipo",
  "field_type_map": {
    "float": "Ponto flutuante",
    "float64": "Ponto flutuante de 64 bits",
    "scaled_float": "Ponto flutuante escalado",
    "double": "Ponto flutuante de dupla precisão",
    "integer": "Inteiro",
    "int64": "Inteiro de 64 bits",
    "long": "Inteiro longo",
    "date": "Data",
    "date_nanos": "Data em nanossegundos",
    "string": "Texto",
    "text": "Texto",
    "nested": "Objeto aninhado",
    "histogram": "Histograma",
    "boolean": "Booleano"
  },
  "logs": {
    "title": "Dados de log",
    "stream_fields_count": "{{count}}",
    "text": "Texto do log",
    "duration": "Duração",
    "count": "Quantidade",
    "filter_fields": "Campos de filtro",
    "settings": {
      "mode": {
        "origin": "Bruto",
        "table": "Tabela",
        "timeseries": "Gráfico de série temporal",
        "clustering": "Agrupar"
      },
      "breakLine": "Quebra de linha",
      "reverse": "Tempo",
      "lines": "Número da linha",
      "time": "Horário do log",
      "organizeFields": {
        "title": "Configuração das colunas",
        "allFields": "Campos disponíveis",
        "showFields": "Campos exibidos",
        "showFields_empty": "Por padrão, todos os campos do log são exibidos",
        "tip": "No momento apenas os campos {{fields}} são exibidos; use o ícone de configuração para mostrar todos"
      },
      "jsonSettings": {
        "title": "Configuração do JSON",
        "displayMode": "Formato de exibição padrão",
        "displayMode_tree": "Em árvore",
        "displayMode_string": "Como texto",
        "expandLevel": "Níveis expandidos por padrão"
      },
      "pageLoadMode": {
        "title": "Modo de navegação",
        "pagination": "Paginação",
        "infiniteScroll": "Rolagem infinita"
      },
      "topNSettings": {
        "title": "Configuração dos N valores mais frequentes"
      }
    },
    "fieldLabelTip": "As estatísticas não estão ativadas para este campo, então não é possível analisá-lo",
    "filterAnd": "Adicionar \"{{token}}\" a esta busca",
    "filterNot": "Excluir \"{{token}}\" desta busca",
    "filterAllAnd": "Adicionar tudo a esta busca",
    "filterAllNot": "Excluir tudo desta busca",
    "filterExists": "Filtrar documentos que tenham este campo",
    "add_drilldown_link": "Adicionar link de detalhamento",
    "drilldown_link_default_name": "Link de detalhamento",
    "total": "Quantidade de logs",
    "stack_group_by_tip": "Usar o valor deste campo no gráfico de tendência empilhado",
    "collapse": "Recolher",
    "expand": "Expandir",
    "copy_field_value": "Copiar o valor do campo"
  },
  "clustering": {
    "count": "Quantidade",
    "log_data": "Dados de log",
    "row_number": "Número da linha",
    "log_statistics": "Estatísticas dos logs",
    "back_to_all_logs": "Voltar a todos os logs",
    "all_log_statistics": "Estatísticas de todos os logs",
    "current_page_field": "No momento, para os campos desta página",
    "aggregate": "agrupados,",
    "cannot_aggregate": "Ainda não é possível agrupar",
    "full_aggregate_logs": "Agrupamento de todos os logs",
    "need_aggregate": "Para agrupar todos os",
    "click_to_aggregate": "logs, clique em",
    "full_aggregate": "Agrupar tudo",
    "field_label": "Campo de agrupamento",
    "scope_current_page": "Página atual",
    "scope_current_page_desc": "Agrupa apenas os campos desta página",
    "scope_full": "Agrupar tudo",
    "scope_full_desc_prefix": "Para os",
    "scope_full_desc_disable_prefix": "Ainda não é possível agrupar os",
    "scope_full_desc_suffix": "logs retornados pela consulta",
    "scope_label": "Escopo",
    "aggregate_field": "Campo de agrupamento:",
    "log_count": "Volume de logs:",
    "duration": "Duração:",
    "top5_title": "5 valores mais frequentes",
    "no_data": "Nenhum dado",
    "loading_title": "Agrupando, aguarde",
    "loading_info": "Logs agrupados:",
    "loading_field": "Campo de agrupamento:",
    "loading_tip": "Não feche esta página. Para uma nova consulta,",
    "loading_new_tab": "abra outra aba",
    "loading_tip_suffix": "e faça a busca de logs lá",
    "sampled_tip": "O volume de logs é grande demais, então este agrupamento foi gerado a partir de uma amostra"
  },
  "view_placeholder": "Visão dos logs"
};

export default pt_BR;

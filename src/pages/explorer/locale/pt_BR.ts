const pt_BR = {
  "title": "Consulta instantânea",
  "log_title": "Busca de logs",
  "add_btn": "Adicionar um painel de consulta",
  "query_btn": "Consulta",
  "query_tab": "Consulta",
  "addPanel": "Adicionar painel",
  "log": {
    "search_placeholder": "Buscar campos",
    "available": "Campos disponíveis",
    "selected": "Campos selecionados",
    "interval": "Intervalo",
    "mode": {
      "indexPatterns": "Index Patterns",
      "indices": "Indices"
    },
    "hideChart": "Ocultar gráfico",
    "showChart": "Exibir gráfico",
    "fieldValues_topn": "5 valores mais frequentes",
    "fieldValues_topnNoData": "Este campo existe no mapping, mas não aparece nos 500 documentos exibidos",
    "copyToClipboard": "Copiar para a área de transferência",
    "show_conext": "Show Context",
    "context": "Contexto do log",
    "context_result_count": "Quantidade de resultados",
    "context_lines": "{{num}} logs antes e depois",
    "limit": "Quantidade de resultados",
    "sort": {
      "NEWEST_FIRST": "Mais recentes primeiro",
      "OLDEST_FIRST": "Mais antigos primeiro"
    },
    "download": "Baixar logs",
    "export": "Histórico de downloads",
    "log_download": {
      "title": "Baixar",
      "download_title": "Baixar os dados de log",
      "range": "Intervalo de tempo",
      "filter": "Expressão de busca",
      "query_condition": "Condição de consulta",
      "format": "Formato dos dados",
      "time_sort": "Ordenação dos logs",
      "count": "Quantidade de logs",
      "time_sort_desc": "Data decrescente",
      "time_sort_asc": "Data crescente",
      "all": "Todos",
      "custom": "Personalizado",
      "custom_validated": "A quantidade não pode passar de {{maxCount}}",
      "all_quantity": "Total aproximado",
      "createSuccess": "Tarefa criada com sucesso"
    },
    "log_export": {
      "title": "Histórico de exportações (os arquivos ficam disponíveis por 3 dias)",
      "fileName": "Nome do arquivo",
      "create_time": "Criado em",
      "describe": "Descrição do arquivo",
      "status": "Status",
      "status0": "Aguardando",
      "status1": "Gerado",
      "status2": "Arquivo expirado",
      "operation": "Ações",
      "delSuccess": "Tarefa excluída",
      "del_btn_tips": "Confirma a exclusão?",
      "del_btn": "Excluir",
      "emptyText": "Nenhuma exportação ainda. Consulte os logs e clique em baixar",
      "size": "Tamanho do arquivo",
      "reload_btn_tip": "Atualizar"
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
      }
    }
  },
  "drilldown_settings": "Configuração do detalhamento",
  "historicalRecords": {
    "button": "Histórico",
    "searchPlaceholder": "Buscar no histórico"
  },
  "share_tip": "Clique para copiar o link de compartilhamento",
  "share_tip_2": "Clique para copiar o link de compartilhamento; no momento só é possível compartilhar a busca no texto bruto dos logs",
  "help": "Instruções de uso",
  "clear_tabs": "Limpar",
  "clear_tabs_tip": "Manter apenas esta aba",
  "stats": {
    "unique_count": "Valores distintos",
    "min": "Mínimo",
    "max": "Máximo",
    "sum": "Soma",
    "avg": "Média",
    "topn_no_data": "Sem dados",
    "unindexable": "As estatísticas não estão ativadas para este campo, então não é possível analisá-lo"
  },
  "field_list": {
    "show_fields": "Campos exibidos",
    "available_fields": "Campos disponíveis"
  },
  "empty_value_not_supported_tip": "Ainda não é possível buscar por valores vazios",
  "logs": {
    "title": "Dados de log",
    "count": "Quantidade de resultados",
    "filter_fields": "Campos de filtro",
    "settings": {
      "mode": {
        "origin": "Bruto",
        "table": "Tabela"
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
      }
    },
    "tagsDetail": "Detalhes do rótulo",
    "expand": "Expandir",
    "collapse": "Recolher",
    "fieldValues_topnNoData": "Sem dados",
    "stats": {
      "numberOfUniqueValues": "Valores distintos",
      "min": "Mínimo",
      "max": "Máximo",
      "sum": "Soma",
      "avg": "Média"
    },
    "fieldLabelTip": "As estatísticas não estão ativadas para este campo, então não é possível analisá-lo",
    "filterAnd": "Adicionar a esta busca",
    "filterNot": "Excluir desta busca",
    "total": "Quantidade de logs",
    "stack_group_by_tip": "Usar o valor deste campo no gráfico de tendência empilhado"
  }
};

export default pt_BR;

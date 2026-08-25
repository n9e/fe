const pt_BR = {
  "preview": "Prévia dos dados",
  "query": {
    "title": "Estatísticas da consulta",
    "execute": "Consulta",
    "query": "SQL",
    "query_required": "O SQL não pode ficar vazio",
    "query_placeholder": "Digite o SQL da consulta; use Shift+Enter para quebrar a linha",
    "query_placeholder2": "Use Shift+Enter para quebrar a linha",
    "advancedSettings": {
      "title": "Configurações auxiliares",
      "tags_placeholder": "Pressione Enter para adicionar vários",
      "valueKey": "Campo de valor",
      "valueKey_tip": "O resultado de uma consulta SQL costuma ter várias colunas; indique quais delas terão os valores plotados no gráfico",
      "valueKey_required": "O campo de valor não pode ficar vazio",
      "labelKey": "Campo de rótulo",
      "labelKey_tip": "O resultado de uma consulta SQL costuma ter várias colunas; indique quais delas servirão como rótulos das séries"
    },
    "schema": "Metadados",
    "document": "Documentação de uso",
    "dashboard": {
      "mode": {
        "label": "Modo de consulta",
        "table": "Dados que não são séries temporais",
        "timeSeries": "Séries temporais"
      }
    },
    "historicalRecords": {
      "button": "Histórico",
      "searchPlaceholder": "Buscar no histórico"
    },
    "compass_btn_tip": "Clique para ver os dados da tabela",
    "database": "Bancos de dados",
    "database_msg": "Selecione o banco de dados",
    "table": "Tabela",
    "table_msg": "Selecione a tabela",
    "time_field": "Campo de data",
    "time_field_msg": "Selecione o campo de data",
    "duration": "Duração",
    "count": "Quantidade",
    "navMode": {
      "fields": "Visão por campos",
      "schema": "Visão da estrutura da tabela"
    },
    "add_to": {
      "btn": "Adicionar a…",
      "recording_rule": "Adicionar a uma regra de gravação",
      "add_recording_rule_title": "Adicionar regra de gravação"
    },
    "sql_format": {
      "title": "Prévia do SQL",
      "tip": "Consultas SQL mais complexas, como máximo, mínimo e percentis de um campo, podem ser vistas clicando na lista de campos à esquerda.",
      "origin": "Ver o texto bruto do log",
      "origin_tip": "Pode ser copiado para a visão da estrutura da tabela, no modo tabela, para ver os dados",
      "timeseries": "Ver o gráfico de série temporal",
      "timeseries_tip": "Pode ser copiado para a visão da estrutura da tabela, no modo série temporal, para ver os dados, ou usado em um dashboard para plotar séries a partir do ClickHouse.",
      "table": "Ver os valores estatísticos",
      "table_tip": "Pode ser usado para criar regras de alerta e de gravação do ClickHouse, e métricas do NorthStar."
    },
    "warn_message_btn_1": "Executar a consulta mesmo assim",
    "warn_message_btn_2": "Voltar e editar",
    "warn_message": "A consulta não usa nenhuma macro de tempo, então o intervalo escolhido não terá efeito!",
    "warn_message_content_1": "Esta consulta pode varrer a tabela inteira. Avalie o impacto no desempenho do armazenamento e decida se prossegue ou se volta e acrescenta uma macro de tempo.",
    "warn_message_content_2": "Macros de tempo mais usadas: ",
    "warn_message_content_3": "Exemplo:",
    "warn_message_content_4": "Como usar as macros de tempo: <a>detalhes</a>",
    "default_search_by_tip": "Campos de busca padrão",
    "default_search_tip_1": "Definir como campo de busca padrão",
    "default_search_tip_2": "Remover dos campos de busca padrão",
    "stack_disabled_tip": "O gráfico empilhado exige entre 2 e 10 valores distintos",
    "stack_tip_pin": "Ativar gráfico empilhado",
    "stack_tip_unpin": "Desativar gráfico empilhado",
    "stack_group_by_tip": "Usar o valor deste campo no gráfico de tendência empilhado",
    "syntax": {
      "query": "Modo Query",
      "sql": "Modo SQL"
    },
    "sqlVizType": {
      "table": "Tabela",
      "timeseries": "Gráfico de série temporal"
    }
  },
  "builder": {
    "to_pinned_btn": "Fixo",
    "to_unpinned_btn": "Desafixar",
    "database_table": {
      "label": "Banco e tabela",
      "database": "Bancos de dados",
      "table": "Tabela"
    },
    "filters": {
      "label": "Filtrar",
      "label_tip": "Todos os filtros são combinados com E.",
      "add": "Adicionar",
      "field": "Campo",
      "field_placeholder": "Selecione o campo",
      "operator": "Operador",
      "operator_placeholder": "Selecione o operador",
      "value": "Valor",
      "value_placeholder": "Selecione o valor",
      "disabled": "Desativar",
      "tip_1": "Este campo não tem índice NGram BloomFilter, o que pode causar varredura completa da tabela. Recomendamos criar o índice ou escolher outro operador"
    },
    "aggregates": {
      "label": "Agregação",
      "add": "Adicionar",
      "func": "Função de agregação",
      "func_placeholder": "Selecione a função de agregação",
      "field": "Campo",
      "field_placeholder": "Selecione o campo",
      "percentile": "Percentil",
      "percentile_placeholder": "Informe o percentil",
      "precision": "Precisão",
      "precision_placeholder": "Informe a precisão",
      "n": "Valor de N",
      "n_placeholder": "Informe o valor de N",
      "alias": "Apelido",
      "alias_placeholder": "Informe o apelido",
      "options": {
        "COUNT": "Quantidade de logs",
        "CPS": "Contagem por segundo",
        "AVG": "Média",
        "SUM": "Soma",
        "MIN": "Mínimo",
        "MAX": "Máximo",
        "PERCENTILE": "Percentil",
        "UNIQUE_COUNT": "Valores distintos",
        "EXIST_RATIO": "Proporção de logs em que o recurso aparece",
        "TOPN": "N valores mais frequentes",
        "RATIO": "Proporção",
        "VARIANCE": "Variância",
        "STDDEV": "Desvio padrão"
      }
    },
    "display_label": "Exibição",
    "mode": {
      "table": "Valor estatístico",
      "timeseries": "Gráfico de série temporal"
    },
    "group_by": "Grupo",
    "order_by": {
      "label": "Ordenação",
      "add": "Adicionar",
      "field": "Campo",
      "field_placeholder": "Selecione o campo",
      "direction": "Sentido da ordenação",
      "direction_placeholder": "Selecione o sentido da ordenação",
      "asc": "Crescente",
      "desc": "Decrescente"
    },
    "limit": "Limite de registros",
    "excute": "Consulta",
    "preview_sql": "Prévia do SQL",
    "btn_tip": "Ao clicar, o conteúdo do campo de SQL será substituído",
    "btn_failed_tip": "Falha na conversão. Tente novamente ou ajuste o formulário",
    "preview_and_run": "Prévia do SQL e consultar",
    "builder_content_modified": "O construtor foi alterado; gere a prévia do SQL atualizado"
  },
  "trigger": {
    "title": "Condição de alerta",
    "value_msg": "Informe o valor da expressão"
  }
};

export default pt_BR;

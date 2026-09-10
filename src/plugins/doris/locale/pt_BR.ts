const pt_BR = {
  "quick_query": "Consulta rápida",
  "quick_query_tip": "A consulta rápida gera o SQL a partir de um modelo fixo: para o campo A maior que zero, basta digitar A > 0. Este botão alterna para o modo personalizado, em que o SQL pode ser visto e editado",
  "custom_query": "Consulta personalizada",
  "custom_query_tip": "A consulta personalizada permite escrever livremente a instrução em SQL",
  "current_database": "Banco de dados atual",
  "table": "Tabela",
  "database_table_required": "Selecione antes o banco de dados e a tabela",
  "enrich_queries": {
    "title": "Consulta complementar"
  },
  "query": {
    "mode": {
      "query": "Modo Query",
      "sql": "Modo SQL"
    },
    "submode": {
      "raw": "Texto bruto do log",
      "timeSeries": "Gráfico de série temporal"
    },
    "query_tip": "Exemplos de SQL:<br />\n    1. Contar os logs dos últimos 5 minutos: SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)<br />\n    2. Contar os logs do intervalo escolhido: SELECT COUNT(*) AS `cnt` FROM `database`.`table` WHERE $__timeFilter(`timestamp`)<br />\n    Mais detalhes sobre o modo SQL em <a>Modo SQL do Doris</a>",
    "query_placeholder": "SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m",
    "execute": "Consulta",
    "database": "Bancos de dados",
    "database_msg": "Selecione o banco de dados",
    "table": "Tabela",
    "table_msg": "Selecione a tabela",
    "time_field": "Campo de data",
    "time_field_msg": "Selecione o campo de data",
    "time_field_tip": "<span>Use uma macro de tempo na consulta para que este seletor tenha efeito</span><br/>Como usar as macros de tempo: <a>detalhes</a>",
    "query": "Condição de consulta",
    "query_required": "A condição de consulta não pode ficar vazia",
    "advancedSettings": {
      "title": "Configurações auxiliares",
      "tags_placeholder": "Pressione Enter para adicionar vários",
      "valueKey": "Campo de valor",
      "valueKey_tip": "O resultado de uma consulta SQL costuma ter várias colunas; indique quais delas terão os valores plotados no gráfico",
      "valueKey_required": "O campo de valor não pode ficar vazio",
      "labelKey": "Campo de rótulo",
      "labelKey_tip": "O resultado de uma consulta SQL costuma ter várias colunas; indique quais delas servirão como rótulos das séries"
    },
    "get_index_fail": "Falha ao obter os índices da tabela",
    "warn_message_btn_1": "Executar a consulta mesmo assim",
    "warn_message_btn_2": "Voltar e editar",
    "warn_message": "A consulta não usa nenhuma macro de tempo, então o intervalo escolhido não terá efeito!",
    "warn_message_content_1": "Esta consulta pode varrer a tabela inteira. Avalie o impacto no desempenho do armazenamento e decida se prossegue ou se volta e acrescenta uma macro de tempo.",
    "warn_message_content_2": "Macros de tempo mais usadas: ",
    "warn_message_content_3": "Exemplo:",
    "warn_message_content_4": "Como usar as macros de tempo: <a>detalhes</a>",
    "editMode": {
      "switch_to_builder_confirm_title": "Mudar para o modo construtor",
      "switch_to_builder_confirm_content": "O SQL atual não pode ser convertido em opções do construtor, e a mudança descartará o que você editou. Deseja continuar?",
      "no_builder_config": "Configure antes a consulta",
      "require_db_table": "Selecione antes o banco de dados e a tabela",
      "build_sql_failed": "Falha ao gerar o SQL"
    },
    "dashboard": {
      "mode": {
        "label": "Modo de consulta",
        "table": "Dados que não são séries temporais",
        "timeSeries": "Séries temporais"
      }
    },
    "stackByField": "Campo de empilhamento",
    "stack_disabled_tip": "O gráfico empilhado exige entre 2 e 10 valores distintos",
    "stack_tip_pin": "Ativar gráfico empilhado",
    "stack_tip_unpin": "Desativar gráfico empilhado",
    "stack_group_by_tip": "Usar o valor deste campo no gráfico de tendência empilhado",
    "sql_format": {
      "title": "Prévia do SQL",
      "tip": "Consultas SQL mais complexas, como máximo, mínimo e percentis de um campo, podem ser vistas clicando na lista de campos à esquerda.",
      "origin": "Ver o texto bruto do log",
      "origin_tip": "Pode ser copiado para a visão da estrutura da tabela, no modo tabela, para ver os dados",
      "timeseries": "Ver o gráfico de série temporal",
      "timeseries_tip": "Pode ser copiado para a visão da estrutura da tabela, no modo série temporal, para ver os dados, ou usado em um dashboard para plotar séries a partir do Doris.",
      "table": "Ver os valores estatísticos",
      "table_tip": "Pode ser usado para criar regras de alerta e de registro do Doris, e métricas do Northstar."
    },
    "defaultSearchField": "Campos de busca padrão",
    "default_search_tip_1": "Definir como campo de busca padrão",
    "default_search_tip_2": "Remover dos campos de busca padrão",
    "default_search_by_tip": "Campos de busca padrão",
    "datasource_disabled_tip": "Selecione antes a fonte de dados",
    "interval": "Intervalo da consulta",
    "interval_tip": "O intervalo da consulta só tem efeito quando o SQL usa a macro $__timeFilter.<br />O sistema de alertas usa essa janela para limitar os dados varridos, preservando a pontualidade dos alertas e o desempenho do banco",
    "offset": "Consulta com atraso",
    "offset_tip": "Desloca a consulta alguns segundos para trás antes de executá-la, como o offset da PromQL.<br />Costuma servir para lidar com atraso na gravação ou na rede, evitando alertas falsos por dados que ainda não chegaram",
    "sql_warning_1": "Recomendamos fortemente usar $__timeFilter(campo_de_tempo) no WHERE para delimitar o intervalo; sem isso podem ocorrer <b>carga anormal no banco e tempo limite nas consultas de alerta</b>",
    "sql_warning_2": "O SQL usa $__timeGroup, então a consulta retorna vários instantes. Nesse caso, <b>o sistema considera apenas o resultado do instante mais recente</b>",
    "duration": "Duração",
    "count": "Quantidade",
    "click_doc": "Clique para ver a documentação de <a>condições de consulta</a>",
    "navMode": {
      "fields": "Visão por campos",
      "schema": "Visão da estrutura da tabela"
    },
    "syntax": {
      "query": "Modo Query",
      "sql": "Modo SQL"
    },
    "sqlVizType": {
      "table": "Tabela",
      "timeseries": "Gráfico de série temporal"
    },
    "add_to": {
      "btn": "Adicionar a…",
      "recording_rule": "Adicionar a uma regra de registro",
      "add_recording_rule_title": "Adicionar regra de registro"
    }
  },
  "builder": {
    "to_pinned_btn": "Fixo",
    "open_builder": "Abrir o construtor",
    "config_required": "A configuração do construtor não pode ficar vazia",
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
        "TOPN": "N valores mais frequentes"
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
  }
};

export default pt_BR;

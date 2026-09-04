const pt_BR = {
  "es": {
    "ref": "Nome",
    "index": "Índice",
    "index_tip": "\n      Várias formas de configuração são suportadas\n      <1 />\n      1. Um único índice: gb busca todos os documentos do índice gb\n      <1 />\n      2. Vários índices: gb,us busca todos os documentos dos índices gb e us\n      <1 />\n      3. Prefixo de índice: g*,u* busca todos os documentos de qualquer índice iniciado por g ou u\n      <1 />\n      ",
    "index_msg": "O índice não pode ficar vazio",
    "indexPattern": "Padrão de índice",
    "indexPatterns": "Padrão de índice",
    "indexPattern_msg": "O padrão de índice não pode ficar vazio",
    "indexPatterns_manage": "Gerenciar padrões de índice",
    "filter": "Filtro",
    "index_placeholder": "Índice log-* (curingas são suportados)",
    "index_pattern_placeholder": "Selecionar padrão de índice",
    "filter_placeholder": "Filtro status:500 AND method:GET",
    "syntax": "Sintaxe",
    "time_label": "Granularidade de tempo",
    "date_field": "Campo de data",
    "date_field_msg": "O campo de data não pode ficar vazio",
    "interval": "Intervalo",
    "value": "Extração de valores",
    "func": "Função",
    "funcField": "Nome do campo",
    "histogram": {
      "interval": "Passo"
    },
    "terms": {
      "label": "Agrupar pelo campo indicado",
      "more": "Configurações avançadas",
      "size": "Quantidade de correspondências",
      "min_doc_count": "Mínimo de documentos"
    },
    "raw": {
      "limit": "Quantidade de logs",
      "date_format": "Formato de data",
      "date_format_tip": "Use os padrões de formato do Moment.js, por exemplo YYYY-MM-DD HH:mm:ss.SSS"
    },
    "alert": {
      "query": {
        "title": "Estatísticas da consulta",
        "preview": "Prévia dos dados"
      },
      "trigger": {
        "title": "Condição de alerta",
        "builder": "Modo simples",
        "code": "Modo expressão",
        "label": "Rótulo associado"
      },
      "prom_eval_interval_tip": "Consulta o armazenamento a cada {{num}} segundos",
      "prom_for_duration_tip": "Normalmente a duração é maior que a frequência de execução: dentro da duração a consulta roda várias vezes e o alerta só é gerado se todas elas dispararem. Com a duração em 0, basta uma única consulta atender à condição para gerar o alerta",
      "advancedSettings": "Configurações avançadas",
      "delay": "Execução com atraso"
    },
    "event": {
      "groupBy": "Agrupado por {{field}}, {{size}} correspondências, mínimo de {{min_doc_count}} documentos",
      "logs": {
        "title": "Detalhes do log",
        "size": "Quantidade de resultados",
        "fields": "Campos de filtro",
        "jsonParseError": "Falha ao interpretar"
      }
    },
    "syntaxOptions": "Opções de sintaxe",
    "queryFailed": "Falha na consulta. Tente novamente mais tarde",
    "offset_tip": "Consulta dados anteriores ao período indicado, como o offset da PromQL, em segundos"
  },
  "datasource": {
    "max_query_rows": "Número máximo de linhas retornadas por requisição",
    "max_idle_conns": "Máximo de conexões ociosas",
    "max_open_conns": "Máximo de conexões abertas",
    "conn_max_lifetime": "Tempo de vida máximo da conexão (em segundos)",
    "timeout": "Tempo limite (em segundos)",
    "timeout_ms": "Tempo limite (em milissegundos)"
  },
  "query": {
    "title": "Estatísticas da consulta",
    "execute": "Consulta",
    "query": "Condição de consulta",
    "query_required": "A condição de consulta não pode ficar vazia",
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
    }
  }
};

export default pt_BR;

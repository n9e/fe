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
    "compass_btn_tip": "Clique para ver os dados da tabela"
  },
  "trigger": {
    "title": "Condição de alerta",
    "value_msg": "Informe o valor da expressão"
  },
  "datasource": {
    "shards": {
      "title": "Dados básicos da fonte de dados",
      "title_tip": "A conexão com o banco depende de o DBA ter liberado o usuário. Se ela falhar por esse motivo, siga com o restante da configuração e valide depois.",
      "addr": "Endereço do banco de dados",
      "addr_tip": "O endereço do banco precisa ser único",
      "user": "Nome de usuário",
      "password": "Senha",
      "help": "Observação: a conta precisa de permissão de leitura no banco para as próximas etapas. Ao trocar de conta, prefira uma com acesso somente leitura."
    }
  }
};

export default pt_BR;

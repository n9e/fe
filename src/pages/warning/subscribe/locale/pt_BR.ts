const pt_BR = {
  "title": "Regras de assinatura",
  "search_placeholder": "Buscar por nome da assinatura, regra assinada, rótulo ou grupo destinatário",
  "rule_name": "Regras assinadas",
  "sub_rule_name": "Assinar regras de alerta",
  "sub_rule_selected": "Regras selecionadas",
  "tags": "Rótulos assinados",
  "user_groups": "Grupos destinatários",
  "notify_rule_ids": "Regra de notificação",
  "tag": {
    "key": {
      "label": "Chaves de rótulo assinadas",
      "tip": "Os rótulos aqui são os do evento de alerta, e as regras abaixo filtram os eventos por eles",
      "required": "A chave do rótulo não pode ficar vazia",
      "placeholder": "Informe a chave do rótulo"
    },
    "func": {
      "label": "Operador"
    },
    "value": {
      "label": "Valor do rótulo",
      "equal_placeholder": "Informe o valor",
      "include_placeholder": "É possível informar vários valores, separados por Enter",
      "regex_placeholder": "Informe a expressão regular de correspondência",
      "required": "O valor do rótulo não pode ficar vazio"
    }
  },
  "group": {
    "key": {
      "label": "Grupos de negócio assinados",
      "placeholder": "Grupo de negócio"
    },
    "func": {
      "label": "Operador"
    },
    "value": {
      "label": "Valor",
      "required": "O valor não pode ficar vazio"
    }
  },
  "redefine_severity": "Redefinir a severidade do alerta",
  "redefine_channels": "Redefinir o meio de notificação",
  "redefine_webhooks": "Redefinir a URL de callback",
  "user_group_ids": "Grupos destinatários da assinatura",
  "for_duration": "Assinar eventos com duração acima de (segundos)",
  "for_duration_tip": "Por exemplo, com o valor 300: na primeira vez que um evento é captado, ele não corresponde à assinatura. Nas vezes seguintes, calcula-se a diferença entre o disparo atual e o primeiro disparo captado; se ela passar de 300 segundos, a assinatura é atendida e a notificação segue. Abaixo disso, nada acontece. Isso serve como escalonamento: o responsável pela equipe pode assinar eventos com mais de uma hora (3600s) de duração e colocar a si mesmo como destinatário, garantindo que nenhum alerta fique sem acompanhamento.",
  "webhooks": "Nova URL de callback",
  "webhooks_msg": "A URL de callback não pode ficar vazia",
  "prod": "Tipo de monitoramento",
  "subscribe_btn": "Assinatura",
  "basic_configs": "Configuração básica",
  "severities": "Severidades assinadas",
  "severities_msg": "As severidades assinadas não podem ficar vazias",
  "tags_groups_require": "Informe pelo menos um rótulo ou grupo destinatário",
  "note": "Nome da assinatura",
  "filter_configs": "Configuração dos filtros",
  "notify_configs": "Configuração de notificação",
  "and": "E",
  "btn_add_rule": "Adicionar regra",
  "basic_configs_desc": "Nome e status de ativação da regra de assinatura; o nome pode ser gerado automaticamente a partir da configuração acima",
  "filter_configs_desc": "Define quais eventos esta assinatura capta. As condições abaixo são combinadas com E; deixando todas vazias, todos os eventos são captados",
  "notify_configs_desc": "Os eventos captados são notificados novamente pelas regras abaixo, o que costuma servir para escalonar ou repassar a outra equipe",
  "no_filter_warning": "Nenhum filtro configurado: esta assinatura captará todos os eventos de alerta",
  "sub_rule_select": "Selecionar regras de alerta",
  "for_duration_placeholder": "Em branco ou 0 significa sem limite",
  "note_msg": "O nome da assinatura não pode ficar vazio",
  "notify_rule_ids_msg": "Selecione pelo menos uma regra de notificação; sem isso, os eventos captados não avisam ninguém",
  "name_auto": {
    "tip": "O nome é gerado automaticamente a partir dos filtros e das notificações acima, e pode ser alterado a qualquer momento",
    "all": "Todos os alertas",
    "escalation": "Escalonar",
    "separator": ", ",
    "joiner": "-",
    "clone_suffix": "-cópia"
  },
  "section_summary": {
    "severities_all": "Todas as severidades",
    "severities_none": "Nenhuma severidade selecionada; nenhum evento será correspondido",
    "rules_count": "{{count}} regras",
    "busi_groups_count": "{{count}} condições de grupo de negócio",
    "tags_count": "{{count}} condições de rótulo",
    "for_duration": "Com duração acima de {{count}} segundos",
    "no_extra": "Sem outras restrições",
    "notify_rules_none": "Nenhuma regra de notificação selecionada",
    "user_groups_none": "Nenhum grupo destinatário selecionado",
    "unnamed": "Sem nome",
    "enabled": "Ativado",
    "disabled": "Desativado"
  },
  "empty_guide": {
    "title": "Nenhuma regra de assinatura ainda",
    "doc": "Ver a documentação de uso"
  },
  "scenario_tips": {
    "title": "As regras de assinatura servem bem a três cenários",
    "cross_team": "Assinar alertas alheios: o serviço do qual você depende é de outra equipe, mas uma falha lá afeta você, então convém receber os alertas de SLI dele",
    "escalation": "Escalonamento de garantia: alertas sem recuperação há mais de uma hora avisam também o responsável pela equipe",
    "global_callback": "Callback global: todos os eventos de alerta chamam um webhook para automação",
    "more": "Saiba mais"
  },
  "filter_disabled": {
    "0": "Ativado",
    "1": "Desativado",
    "placeholder": "Status de ativação"
  }
};

export default pt_BR;

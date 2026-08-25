const pt_BR = {
  "title": "Regra de notificação",
  "empty_guide": {
    "title": "Nenhuma regra de notificação ainda",
    "desc": "A regra de notificação define para quem o alerta vai e por qual meio. Só depois de configurá-la os eventos são realmente entregues no DingTalk, no e-mail ou em outro canal.",
    "config_channel": "Configure antes um meio de notificação"
  },
  "rule_select": {
    "label": "Regra de notificação",
    "select": "Selecionar regra de notificação",
    "create": "Nova regra de notificação",
    "view": "Ver",
    "manage": "Gerenciamento de regras de notificação",
    "total": "{{total}} no total",
    "footer_total": "{{total}} regras no total",
    "quick_create": {
      "action": "Criação rápida",
      "title": "Criação rápida de regra de notificação",
      "hint": "Cole a URL do webhook do robô de mensagens ou o endereço de integração do Flashduty (com integration_key). O tipo — DingTalk, WeCom, cartão do Feishu, cartão do Lark ou Flashduty — é identificado automaticamente e, após checar duplicidade, a regra é reaproveitada ou criada.",
      "url_label": "Webhook ou endereço de integração",
      "url_placeholder": "Por exemplo: https://oapi.dingtalk.com/robot/send?access_token=xxx\nou: https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx",
      "url_required": "Cole a URL do webhook ou o endereço de integração do Flashduty",
      "name_label": "Nome da regra de notificação",
      "name_placeholder": "Gerado automaticamente ao colar o webhook; pode ser alterado",
      "name_required": "Informe o nome da regra de notificação",
      "user_group_required": "Selecione as equipes autorizadas",
      "user_group_placeholder": "Selecione as equipes autorizadas",
      "detected": "Identificado como {{channel}} (final {{suffix}})",
      "invalid_url": "Formato de URL inválido",
      "missing_param": "A URL não tem {{key}}",
      "unrecognized": "Não foi possível identificar o tipo (são suportados DingTalk, WeCom, cartão do Feishu, cartão do Lark e Flashduty)",
      "reused_rule": "Já existe uma regra de notificação com o mesmo token, e ela foi selecionada automaticamente",
      "created": "Regra de notificação criada e selecionada",
      "create_channel_no_perm": "Falta o meio de notificação {{channel}} e você não tem permissão para criá-lo. Peça ao administrador que o crie primeiro",
      "create_channel_failed": "Falha ao criar o meio de notificação {{channel}}",
      "create_rule_failed": "Falha ao criar a regra de notificação",
      "channel_description": "Criado automaticamente pela criação rápida",
      "rule_description": "Criado pela criação rápida a partir da URL do webhook",
      "submit": "Criar"
    }
  },
  "basic_configuration": "Configuração básica",
  "basic_configuration_desc": "Nome, equipes autorizadas e observações da regra de notificação",
  "name_auto_tip": "O nome é gerado automaticamente após escolher o meio e as equipes destinatárias, e pode ser alterado a qualquer momento",
  "name_auto_separator": "、",
  "add_note_btn": "Adicionar observação",
  "user_group_ids": "Equipes autorizadas",
  "user_group_ids_tip": "Os membros das equipes informadas aqui poderão gerenciar ou ver esta regra de notificação",
  "enabled_tip": "Define se esta regra de notificação está ativa",
  "note_tip": "Use este campo para detalhar a regra de notificação e facilitar a manutenção futura",
  "notification_configuration": {
    "title": "Configuração de notificação",
    "section_desc": "Define para quem o alerta vai e por qual meio: escolha o meio de notificação, o modelo de mensagem e os destinatários. É possível adicionar vários conjuntos",
    "item_title": "Configuração de notificação",
    "add_btn": "Adicionar configuração de notificação",
    "filters": {
      "title": "Filtros",
      "tip": "Restringe esta configuração aos eventos que atendam aos critérios: severidade, horário, rótulos e atributos. Sem configuração, não há restrição",
      "severities_all": "Todas as severidades",
      "severities_none": "Nenhuma severidade marcada; nenhum evento será correspondido",
      "time_ranges_count": "{{count}} períodos",
      "label_keys_count": "{{count}} condições de rótulo",
      "attributes_count": "{{count}} condições de atributo",
      "no_extra": "Sem restrição de horário, rótulo ou atributo"
    },
    "test_mode": {
      "history": "Selecionar evento do histórico",
      "mock": "Usar evento simulado"
    },
    "mock_test": {
      "empty_alert": "Este ambiente ainda não tem eventos de alerta; use um evento simulado para testar o canal de notificação",
      "switch_btn": "Usar um evento simulado",
      "desc": "Um evento de alerta simulado será enviado ao meio e aos destinatários desta configuração, para verificar se o canal funciona. O teste simulado não avalia os filtros",
      "preview_title": "Prévia do evento simulado",
      "preview_rule_name": "Nome da regra",
      "preview_severity": "Severidade do alerta",
      "preview_tags": "Rótulos",
      "rule_name": "Evento simulado para teste de notificação"
    },
    "channel": "Meios de notificação",
    "channel_tip": "Escolha por qual meio a notificação será enviada. Se os meios existentes não atenderem, peça ao administrador que crie outro",
    "channel_msg": "Selecione o meio de notificação",
    "template": "Modelos de mensagem",
    "template_tip": "Modelo do conteúdo da notificação; é possível usar modelos diferentes conforme o cenário",
    "template_msg": "Selecione o modelo de mensagem",
    "severities": "Severidades aplicáveis",
    "severities_tip": "Escolha quais severidades geram notificação; apenas as marcadas são avisadas. Sem nenhuma marcada, este meio não corresponde a evento algum, o que equivale a desativá-lo",
    "time_ranges": "Períodos aplicáveis",
    "time_ranges_tip": "A regra de notificação pode valer apenas em determinados períodos; sem configuração, não há restrição",
    "effective_time_start": "Início",
    "effective_time_end": "Fim",
    "effective_time_week_msg": "Selecione os dias da semana",
    "effective_time_start_msg": "Selecione o horário inicial",
    "effective_time_end_msg": "Selecione o horário final",
    "fetch_integration_key_failed_remove": "Falha ao obter estas chaves do PagerDuty: {list}. Tente selecioná-las novamente",
    "label_keys": "Rótulos aplicáveis",
    "label_keys_tip": "A regra de notificação pode valer apenas para os eventos que atendam a filtros de rótulo; sem configuração, não há restrição",
    "attributes": "Atributos aplicáveis",
    "attributes_value": "Valor do atributo",
    "attributes_tip": "A regra de notificação pode valer apenas para os eventos que atendam a determinados atributos; sem configuração, não há restrição",
    "attributes_options": {
      "group_name": "Grupo de negócio",
      "cluster": "Fonte de dados",
      "is_recovered": "É um evento de recuperação?",
      "rule_id": "Regra de alerta",
      "severity": "Severidade do alerta",
      "target_group": "Grupo de negócio da máquina"
    },
    "run_test_btn": "Teste de notificação",
    "run_test_btn_tip": "Escolha alguns eventos já gerados para testar esta configuração; se ela estiver correta, a notificação deve chegar",
    "run_test_request_result": "A notificação de teste foi enviada e o destino respondeu:",
    "user_info": {
      "user_ids": "Destinatários",
      "user_group_ids": "Equipes destinatárias",
      "error": "Os destinatários e as equipes destinatárias não podem ficar ambos vazios"
    },
    "flashduty": {
      "ids": "Espaço de colaboração"
    },
    "pagerduty": {
      "services": "Serviço/integração"
    }
  },
  "user_group_id_invalid_tip": "A equipe autorizada não existe",
  "channel_invalid_tip": "O meio de notificação não existe",
  "disabled": "Desativar",
  "pipeline_configuration": {
    "title": "Fluxo de processamento de eventos",
    "section_desc": "Antes do envio, o evento passa por um fluxo de processamento que pode marcá-lo, enriquecê-lo ou reduzir o ruído",
    "manage_btn": "Gerenciar fluxos de processamento de eventos",
    "name_placeholder": "Selecione o fluxo de processamento de eventos",
    "name_required": "O fluxo de processamento de eventos não pode ficar vazio",
    "add_btn": "Adicionar fluxo de processamento de eventos",
    "disable": "Desativar",
    "enable": "Ativar"
  },
  "escalations": {
    "title": "Configuração de escalonamento",
    "section_desc": "Quando um alerta fica muito tempo sem se recuperar ou sem ser assumido, a notificação é escalonada para outro canal, evitando que ninguém o acompanhe",
    "title_tip": "Passado o tempo definido sem recuperação, o sistema escalona a notificação para o canal indicado conforme as condições abaixo, evitando que o alerta fique sem acompanhamento. Detalhes na <a>documentação de uso</a>",
    "item_title": "Escalonamento da notificação",
    "item_add_btn": "Adicionar escalonamento",
    "interval": "Período de verificação",
    "interval_required": "O período de verificação não pode ficar vazio",
    "duration_required": "A duração não pode ficar vazia",
    "duration_1": "Quando o evento anômalo passar de",
    "duration_2": "e ainda estiver",
    "duration_3": ", esta configuração envia a notificação.",
    "repeating_notification": "Configuração de notificações repetidas",
    "repeating_notification_tip": "Com esta opção desligada, o escalonamento de um mesmo evento notifica apenas uma vez",
    "repeating_notification_1": "A cada",
    "repeating_notification_2": "minutos, notificar uma vez, no máximo",
    "repeating_notification_3": "vezes",
    "notification_interval_required": "O intervalo entre notificações não pode ficar vazio",
    "notification_max_times_required": "O número máximo de notificações repetidas não pode ficar vazio",
    "event_status_options": {
      "0": "Sem recuperação",
      "1": "Sem recuperação e sem responsável"
    },
    "time_ranges": {
      "label_tip": "O escalonamento pode ficar restrito aos dias e horários marcados; sem configuração, não há restrição"
    },
    "labels_filter": {
      "label_tip": "Escalona apenas os eventos que atendam a estas condições de rótulo, o que limita o alcance da regra; sem configuração, não há restrição. É possível escolher chaves existentes na lista (recomendado) ou digitá-las"
    },
    "attributes_filter": {
      "label_tip": "Escalona apenas os alertas que atendam a todos estes atributos; sem configuração, não há restrição. As condições são combinadas com E"
    }
  },
  "notify_aggr_configs": {
    "title": "Configuração de agregação",
    "section_desc": "Agrupa alertas semelhantes por rótulo ou atributo em uma única notificação, reduzindo interrupções",
    "enable": "Ativar agregação",
    "group_enable": "Agregação refinada",
    "group_title": "Agregação refinada",
    "group_add_btn": "Adicionar agregação refinada",
    "group_tip1": "Atendidas as condições abaixo",
    "group_tip2": "agrupe por estas dimensões e envie uma única notificação",
    "group_label_keys": "Rótulos",
    "group_label_keys_required": "O rótulo não pode ficar vazio",
    "group_attribute_keys": "Atributo",
    "group_attribute_keys_required": "O atributo não pode ficar vazio",
    "group_keys_at_least_one_required": "Informe pelo menos um rótulo ou atributo",
    "group_duration_1": "Após receber o alerta, os alertas do mesmo grupo recebidos em",
    "group_duration_2": "segundos são agregados e enviados juntos",
    "group_duration_required": "A duração da agregação não pode ficar vazia",
    "default_title": "Dimensões padrão",
    "default_tip": "Quando os filtros acima não forem atendidos, <b>agrupe por estas dimensões e envie uma única notificação</b>",
    "default_duration_tip": "Atenção: um intervalo de agregação muito grande atrasa o envio dos alertas",
    "default_duration_tip2": "O intervalo máximo de agregação não pode passar de 3600 segundos",
    "attribute_keys_map": {
      "cluster": "Fonte de dados",
      "cate": "Tipo de fonte de dados",
      "group_name": "Grupo de negócio",
      "rule_id": "Regra de alerta",
      "rule_prod": "Tipo de monitoramento",
      "severity": "Severidade do alerta",
      "is_recovered": "Recuperado"
    },
    "enable_tip": "Quando ativado, os alertas que atendem à regra são combinados por dimensão em uma única notificação <a>Documentação de uso</a>",
    "labels_filter": {
      "label_tip": "Agrega apenas os eventos que atendam a estas condições de rótulo, o que limita o alcance da regra; sem configuração, não há restrição. É possível escolher chaves existentes na lista (recomendado) ou digitá-las"
    },
    "attributes_filter": {
      "label_tip": "Apenas os alertas que atendem a estes filtros de rótulo participam da agregação; os demais não são afetados por esta regra<br />As condições são combinadas com E, inclusive com os filtros de atributo abaixo"
    },
    "label_keys": {
      "tip": "Configurando ident, os eventos com o mesmo ident são reunidos em um grupo e geram uma única notificação, o que costuma reduzir o ruído em SMS e mensageiros",
      "placeholder": "Por exemplo, ident ou app. É possível escolher chaves existentes na lista (recomendado) ou digitá-las"
    },
    "attribute_keys": {
      "tip": "Configurando o grupo de negócio, os eventos do mesmo grupo são reunidos e geram uma única notificação",
      "placeholder": "Por exemplo: grupo de negócio"
    }
  },
  "statistics": {
    "total_notify_events": "Notificações enviadas nos últimos {{days}} dias",
    "total_notify_events_tip": "Conta apenas as notificações efetivamente enviadas; eventos <b>agregados, suprimidos ou silenciados</b> não entram na conta",
    "escalation_events": "Eventos escalonados nos últimos {{days}} dias",
    "escalation_events_tip": "Número de eventos que atenderam à regra de escalonamento e tiveram a prioridade elevada. Um número alto costuma indicar tempo de atendimento longo, o que pede revisar o <b>SLA de resposta, os limiares de escalonamento ou a estratégia de redução de alertas</b>",
    "noise_reduction_ratio": "Taxa de redução de ruído nos últimos {{days}} dias",
    "noise_reduction_ratio_tip": "Taxa de redução de ruído = <b>(1 − notificações enviadas ÷ eventos de alerta originais) × 100%</b>. Quanto mais perto de <b>100%</b>, melhor a <b>redução de ruído</b>"
  },
  "tabs": {
    "events": "Lista de eventos",
    "rules": "Regra de alerta",
    "sub_rules": "Regras de assinatura"
  }
};

export default pt_BR;

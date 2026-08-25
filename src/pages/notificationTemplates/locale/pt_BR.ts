const pt_BR = {
  "title": "Modelos de mensagem",
  "add_title": "Adicionar modelo de mensagem",
  "edit_title": "Editar modelo de mensagem",
  "clone_title": "Clonar modelo de mensagem",
  "user_group_ids": "Equipes autorizadas",
  "private": {
    "0": "Público",
    "1": "Privado",
    "title": "Modo de exibição"
  },
  "notify_channel_ident": "Tipo de meio",
  "content": {
    "add_title": "Adicionar campo do modelo",
    "edit_title": "Editar campo do modelo",
    "preview": "Visualizar o conteúdo do modelo",
    "contentKey": "Identificador do campo",
    "tip": "Campo utilizável no meio de notificação; referencie seu conteúdo por $tpl.{{contentKey}}",
    "prompt": "O conteúdo foi alterado. Deseja descartar as mudanças?",
    "value_msg": "Informe o conteúdo do campo",
    "ai_generate": "Gerar com IA"
  },
  "preview": {
    "mode": {
      "history": "Eventos históricos",
      "mock": "Evento simulado"
    },
    "empty_alert": "Este ambiente ainda não tem eventos de alerta no histórico",
    "switch_btn": "Visualizar com um evento simulado",
    "select_events": "Selecionar evento de alerta",
    "result": "Prévia do resultado"
  },
  "starter": {
    "rule_name": "Regra",
    "severity": "Severidade",
    "status": "Status",
    "firing": "Disparo",
    "recovered": "Recuperado",
    "tags": "Rótulos",
    "trigger_value": "Valor no disparo",
    "time": "Tempo",
    "detail": "Detalhes"
  },
  "empty_guide": {
    "title": "Criar o primeiro modelo de mensagem",
    "desc": "O modelo de mensagem define o formato do conteúdo da notificação. Ao criar um, geramos automaticamente uma versão pronta para uso conforme o meio escolhido, que você pode ajustar."
  },
  "fields_panel": {
    "desc": "Variáveis do evento de alerta que podem ser usadas no modelo. Clique em qualquer uma para copiá-la e cole no editor à esquerda.",
    "fields": {
      "event": "O objeto completo do evento de alerta, útil para inspecionar todos os campos",
      "labels": "Mapa de rótulos do evento, equivalente a $event.TagsMap",
      "value": "Valor no disparo, equivalente a $event.TriggerValue",
      "domain": "Endereço do site, usado para montar o link de detalhes do evento",
      "timestamp": "Horário atual, normalmente usado como horário de envio da mensagem",
      "timeformat": "Formata um timestamp em data legível; funciona com qualquer campo de tempo",
      "Id": "ID do evento de alerta",
      "Cate": "Categoria do alerta, por exemplo 'prometheus'",
      "Cluster": "Nome da fonte de dados",
      "DatasourceId": "ID da fonte de dados",
      "GroupId": "ID do grupo de negócio",
      "GroupName": "Nome do grupo de negócio",
      "Hash": "Hash do evento de alerta",
      "RuleId": "ID da regra",
      "RuleName": "Nome da regra",
      "RuleNote": "Observação da regra",
      "RuleHash": "Hash da regra",
      "Severity": "Severidade do alerta (1-3)",
      "Status": "Situação do alerta",
      "PromQl": "Consulta do alerta",
      "PromForDuration": "Duração (segundos)",
      "PromEvalInterval": "Intervalo de avaliação (segundos)",
      "SubRuleId": "ID da regra de assinatura",
      "TriggerTime": "Timestamp do disparo",
      "TriggerValue": "Valor no disparo",
      "TriggerValues": "Valor no disparo (formato bruto)",
      "FirstTriggerTime": "Primeiro disparo",
      "IsRecovered": "Já recuperado",
      "NotifyCurNumber": "Notificações já enviadas",
      "LastEvalTime": "Última avaliação",
      "LastSentTime": "Último envio",
      "TagsJSON": "Lista de rótulos",
      "TagsMap": "Mapa de rótulos em pares chave-valor",
      "TagsMap_instance": "Obtém um rótulo específico; troque instance pelo nome do seu rótulo",
      "AnnotationsJSON": "Mapa de anotações em pares chave-valor",
      "AnnotationsJSON_summary": "Obtém uma anotação específica; troque summary pelo nome da sua anotação",
      "TargetIdent": "Identificador do objeto",
      "TargetNote": "Observação do objeto",
      "NotifyRecovered": "Notificar na recuperação",
      "NotifyChannelsJSON": "Lista de canais de notificação",
      "NotifyGroupsJSON": "Lista de grupos destinatários",
      "NotifyRuleIds": "Lista de IDs das regras de notificação",
      "CallbacksJSON": "Lista de URLs de callback",
      "ExtraConfig": "Configurações adicionais",
      "ExtraInfo": "Lista de informações adicionais",
      "ExtraInfoMap": "Mapa de informações adicionais"
    },
    "search_placeholder": "Buscar campos",
    "no_match": "Nenhum campo correspondente",
    "copy_tip": "Clique para copiar",
    "groups": {
      "common": "Mais usados",
      "basic": "Dados básicos",
      "trigger": "Relacionados ao disparo",
      "tags": "Rótulos e anotações",
      "target": "Relacionados à máquina",
      "notify": "Relacionados à notificação",
      "extra": "Callbacks e extensões"
    }
  }
};

export default pt_BR;

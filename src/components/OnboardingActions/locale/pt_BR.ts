const pt_BR = {
  "close": "Fechar",
  "card": {
    "title": "Próximos passos",
    "later": "Você também pode continuar depois, na lista de máquinas",
    "optional": "Opcional",
    "dismiss": "Não mostrar novamente",
    "rows": {
      "collect": {
        "title": "Configurar coleta",
        "desc": "As métricas básicas do sistema operacional já são coletadas automaticamente; bancos de dados e middlewares são configurados conforme a necessidade",
        "action": "Configurar"
      },
      "pack": {
        "title": "Aplicar o dashboard de hosts e ativar os alertas de host",
        "desc": "Importe dashboards e regras de alerta internos com um clique",
        "action": "Ativar com um clique"
      },
      "notify": {
        "title": "Vincular notificações",
        "desc": "Basta colar o webhook do robô do DingTalk, Feishu ou WeCom",
        "action": "Criação rápida"
      },
      "test": {
        "title": "Enviar alerta de teste",
        "desc": "Confirme que o alerta realmente chega até você",
        "action": "Enviar"
      }
    }
  },
  "pack": {
    "title": "Ativar o pacote básico de monitoramento de hosts",
    "intro": "Serão importados e ativados:",
    "boards": "Dashboards",
    "rules": "Regras de alerta",
    "boards_count": "Dashboards × {{count}}",
    "rules_count": "Regras de alerta × {{count}}, ativadas logo após a importação",
    "preview": "Visualizar e selecionar",
    "existing": "(já existe)",
    "existing_skipped": "O grupo de negócio de destino já possui um dashboard com este nome; ele será ignorado",
    "rule_existing_skipped": "O grupo de negócio de destino já possui uma regra de alerta com este nome; ela será ignorada e a configuração existente não será sobrescrita",
    "already_imported": "Todos os dashboards selecionados já existem neste grupo de negócio; apenas as regras de alerta serão adicionadas",
    "boards_incomplete": "Nenhum modelo interno de dashboard de hosts foi encontrado; abra \"Visualizar e selecionar\" e escolha manualmente",
    "notify_rules": "Regra de notificação",
    "notify_rules_tip": "Sem uma regra de notificação vinculada, o alerta gera eventos, mas não é enviado a ninguém",
    "notify_rules_placeholder": "Escolha uma regra de notificação existente ou clique em \"Criação rápida\" acima para criar uma",
    "quick_create": "Criação rápida",
    "submit": "Ativar com um clique",
    "view_board": "Ver dashboard de hosts",
    "next_test": "Enviar alerta de teste",
    "no_notify_warning": "Estas regras de alerta ainda não têm uma regra de notificação vinculada e não avisarão ninguém quando dispararem",
    "go_bind_notify": "Ir para a lista de regras e vincular em lote",
    "component_missing": "A integração Linux interna não foi encontrada; não é possível ativar com um clique",
    "load_failed": "Falha ao ler os modelos internos",
    "go_components": "Importar manualmente na Central de integrações",
    "bad_template": "Falha ao interpretar os modelos internos",
    "unknown_error": "Erro desconhecido"
  },
  "notify": {
    "bind_hint": "A regra de notificação foi criada, mas os alertas de host já ativados ainda não estão vinculados a ela, então alertas reais continuam não avisando ninguém"
  },
  "test": {
    "title": "Enviar alerta de teste",
    "rule_label": "Qual regra de notificação usar no envio",
    "send": "Enviar alerta de teste",
    "result_title": "Resultado do envio",
    "sent": "O meio de notificação foi acionado e retornou o seguinte",
    "sent_hint": "Verifique no grupo ou no e-mail se a mensagem de teste chegou — só assim o caminho de notificação está realmente funcionando",
    "no_rule": "Nenhuma regra de notificação configurada",
    "go_create_rule": "Criar regra de notificação",
    "rule_without_config": "Esta regra de notificação ainda não tem um meio de notificação configurado; não é possível enviar",
    "no_channel": "Nenhum meio de notificação selecionado",
    "channel_fallback": "Meio de notificação {{index}}",
    "go_check_channel": "Verificar meios de notificação",
    "channel_doc": "Ver documentação de configuração",
    "unknown_error": "Falha no envio: erro desconhecido"
  }
};

export default pt_BR;

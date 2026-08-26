const pt_BR = {
  "title": "Meios de notificação",
  "basic_configuration": "Configuração básica",
  "default_values": {
    "access_key_id": "Substitua pelo access_key_id real",
    "access_key_secret": "Substitua pelo access_key_secret real",
    "show_number": "Substitua pelo show_number real; em branco, nada é exibido",
    "voice_code": "Substitua pelo voice_code real",
    "sign_name": "Substitua pela assinatura real",
    "template_id": "Substitua pelo id de modelo real",
    "secret_id": "Substitua pelo secret_id real",
    "secret_key": "Substitua pelo secret_key real",
    "region": "Substitua pela region real",
    "app_id": "Substitua pelo appid real",
    "ali_voice_tts_param": "Incidente {{$tpl.incident}}. Para assumi-lo, pressione 1",
    "ali_sms_template_param": "Incidente {{$tpl.incident}}. Providencie o atendimento"
  },
  "ident": "Tipo de meio",
  "ident_tip": "Categoria do meio de notificação. Vários meios do DingTalk, por exemplo, podem ter o tipo dingtalk. O tipo pode ser digitado livremente, sem se limitar às opções da lista; é por ele que os meios de notificação e os modelos de mensagem se relacionam",
  "note_tip": "Use este campo para descrever o meio de notificação ou seus casos de uso, o que ajuda na manutenção e no trabalho em equipe",
  "enable_tip": "Define se esta configuração está ativa. Desativada, ela deixa de valer e nenhuma notificação é enviada por ela",
  "advanced_settings": "Configurações avançadas",
  "variable_configuration": {
    "title": "Configuração de variáveis",
    "contact_key": "Contato",
    "contact_key_tip": "Corresponde aos contatos em \"Pessoas e organização - Gerenciamento de usuários\" e define por onde a notificação sai. \"Phone\", por exemplo, repassa o telefone do usuário à requisição ou ao script de callback. Novos tipos de contato podem ser criados na página \"Pessoas e organização - Contatos\"",
    "params": {
      "title": "Configuração de parâmetros",
      "title_tip": "Define os parâmetros personalizados exigidos por este meio, como o token do robô do DingTalk ou uma API Key. Ao escolher o meio em uma regra de notificação, os valores desses parâmetros também podem ser informados",
      "key": "Identificador do parâmetro",
      "key_required": "O identificador do parâmetro não pode ficar vazio",
      "cname": "Nome do parâmetro",
      "cname_required": "O nome do parâmetro não pode ficar vazio"
    }
  },
  "request_configuration": {
    "http": "Configuração HTTP",
    "smtp": "Configuração SMTP",
    "script": "Configuração do script",
    "flashduty": "Configuração do FlashDuty",
    "pagerduty": "Configuração do PagerDuty",
    "dingtalkapp": "Configuração do aplicativo DingTalk",
    "wecomapp": "Configuração do aplicativo WeCom",
    "feishuapp": "Configuração do aplicativo Feishu"
  },
  "request_type": "Tipo de envio",
  "http_request_config": {
    "title": "HTTP",
    "url": "URL",
    "url_tip": "Endereço de destino que recebe as requisições de notificação",
    "method": "Método da requisição",
    "header": "Cabeçalhos da requisição",
    "header_tip": "Cabeçalhos HTTP personalizados enviados na requisição, como as credenciais do BasicAuth. A URL, os cabeçalhos, os valores dos parâmetros e o corpo aceitam {{.nome_da_variavel}} para referenciar variáveis de \"Configurações do sistema - Configuração de variáveis\", de modo que tokens e outras credenciais não precisam ficar em texto puro aqui",
    "header_key": "Nome do parâmetro",
    "header_value": "Valor do parâmetro",
    "timeout": "Tempo limite (milissegundos)",
    "concurrency": "Concorrência",
    "concurrency_tip": "Número máximo de requisições simultâneas. Aumentá-lo acelera o envio, mas respeite a capacidade do serviço de destino",
    "retry_times": "Tentativas",
    "retry_interval": "Intervalo entre tentativas (milissegundos)",
    "insecure_skip_verify": "Ignorar a verificação do certificado",
    "proxy": "Proxy",
    "proxy_tip": "Endereço do proxy HTTP, para os casos em que ele é necessário",
    "params": "Parâmetros da requisição",
    "params_key": "Nome do parâmetro",
    "params_value": "Valor do parâmetro",
    "body": "Corpo da requisição"
  },
  "smtp_request_config": {
    "title": "SMTP",
    "host": "Servidor",
    "host_tip": "Endereço do servidor SMTP usado no envio, por exemplo smtp.example.com",
    "port": "Porta",
    "port_tip": "Porta do servidor SMTP. As mais comuns são 25, 465 (SSL) e 587 (STARTTLS); confirme a correta com seu provedor",
    "username": "Nome de usuário",
    "username_tip": "Usuário para autenticar no servidor SMTP, normalmente o endereço de e-mail",
    "password": "Senha",
    "password_tip": "Senha ou senha de aplicativo do usuário SMTP; recomendamos a senha de aplicativo por ser mais segura",
    "from": "Remetente",
    "from_tip": "Nome ou apelido exibido como remetente, que ajuda o destinatário a reconhecer a origem da mensagem. Exemplo de formato: Flashcat <no-reply@notice.flashcat.cloud>",
    "insecure_skip_verify": "Ignorar a verificação do certificado",
    "insecure_skip_verify_tip": "Quando ativado, o certificado do servidor SMTP não é verificado, o que costuma servir para testes ou certificados autoassinados",
    "batch": "Envio em lote",
    "batch_tip": "Quantos e-mails enviar em uma única conexão SMTP"
  },
  "script_request_config": {
    "title": "Script",
    "script": {
      "option": "Usar script",
      "label": "Conteúdo do script"
    },
    "path": {
      "option": "Usar caminho",
      "label": "Caminho do arquivo"
    },
    "timeout": "Tempo limite (milissegundos)"
  },
  "flashduty_request_config": {
    "title": "FlashDuty",
    "integration_url": "URL",
    "integration_url_tip": "Informe aqui o endereço de integração criado na central do Flashduty; ele pode ser gerado em https://console.flashcat.cloud/settings/source/alert/add/n9e",
    "proxy": "Proxy",
    "proxy_tip": "Endereço do proxy HTTP, para os casos em que ele é necessário",
    "timeout": "Tempo limite (milissegundos)",
    "retry_times": "Tentativas"
  },
  "pagerduty_request_config": {
    "title": "PagerDuty",
    "api_key": "API Key",
    "api_key_tip": "Informe aqui a API Key de integração do PagerDuty; veja como obtê-la em https://developer.pagerduty.com/docs/authentication",
    "proxy": "Proxy",
    "proxy_tip": "Endereço do proxy HTTP, para os casos em que ele é necessário",
    "timeout": "Tempo limite (milissegundos)",
    "retry_times": "Tentativas"
  },
  "dingtalkapp_request_config": {
    "app_key": "Identificador único do aplicativo",
    "app_secret": "Chave secreta do aplicativo",
    "alert_shot_tip": "Para enviar imagens nos alertas, crie um aplicativo do DingTalk conforme a documentação e preencha os dados aqui"
  },
  "wecomapp_request_config": {
    "corp_id": "ID da empresa",
    "corp_secret": "Chave secreta da empresa",
    "agentid": "Agent ID"
  },
  "feishuapp_request_config": {
    "app_id": "ID do aplicativo",
    "app_secret": "Chave secreta do aplicativo",
    "receive_id_type": "Tipo de ID do destinatário",
    "alert_shot_tip": "Para enviar imagens nos alertas, crie um aplicativo do Feishu conforme a documentação e preencha os dados aqui",
    "lark_alert_shot_tip": "Para enviar imagens nos alertas, crie um aplicativo do Lark conforme a documentação e preencha os dados aqui"
  },
  "types_search_placeholder": "Tipo de busca",
  "name_search_placeholder": "Buscar por nome",
  "disabled": "Desativar",
  "status_select": {
    "placeholder": "Status",
    "enable": "Ativar",
    "disable": "Desativar"
  },
  "types_select_placeholder": "Tipo",
  "types": {
    "flashduty": "FlashDuty",
    "callback": "Callback",
    "email": "E-mail",
    "dingtalk": "DingTalk",
    "dingtalkapp": "Aplicativo DingTalk",
    "wecom": "WeCom",
    "wecomapp": "Aplicativo WeCom",
    "feishucard": "Cartão do Feishu",
    "feishu": "Feishu",
    "feishuapp": "Aplicativo Feishu",
    "larkcard": "Cartão do Lark",
    "lark": "Lark",
    "telegram": "Telegram",
    "ali-voice": "Voz da Alibaba Cloud",
    "ali-sms": "SMS da Alibaba Cloud",
    "tx-voice": "Voz da Tencent Cloud",
    "tx-sms": "SMS da Tencent Cloud",
    "slackbot": "Slack Bot",
    "slackwebhook": "Slack Webhook",
    "mattermostbot": "Mattermost Bot",
    "mattermostwebhook": "Mattermost Webhook",
    "discord": "Discord",
    "jsm_alert": "JSM Alert",
    "jira": "JIRA",
    "pagerduty": "PagerDuty",
    "script": "Script"
  },
  "test": {
    "btn": "Testar",
    "run": "Enviar teste",
    "back": "Voltar e editar",
    "desc": "Envia de fato uma mensagem com a configuração atual do formulário, sem precisar salvar antes. Serve para verificar o endereço, as credenciais e a rede.",
    "script_blocked": "Meios do tipo script precisam ser salvos antes do teste",
    "params_title": "Parâmetros do meio",
    "receivers_title": "Destinatários",
    "pagerduty_keys_title": "Integration Key",
    "pagerduty_keys_tip": "O PagerDuty entrega por Integration Key. Depois de salvar, será possível escolher por \"Serviço/Integração\" nas regras de notificação; aqui informe as chaves manualmente, quantas forem necessárias.",
    "pagerduty_keys_placeholder": "Digite a Integration Key e pressione Enter",
    "user_ids": "Selecionar usuários",
    "user_group_ids": "Selecionar equipes",
    "mode": {
      "history": "Eventos históricos",
      "mock": "Evento simulado"
    },
    "empty_alert": "Este ambiente ainda não tem eventos de alerta no histórico",
    "switch_btn": "Testar com um evento simulado",
    "result_success": "Enviado com sucesso",
    "result_success_desc": "Verifique no grupo ou no e-mail correspondente se a mensagem chegou",
    "result_failed": "Falha no envio"
  }
};

export default pt_BR;

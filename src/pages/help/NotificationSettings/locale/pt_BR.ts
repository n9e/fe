const pt_BR = {
  "title": "Configurações de notificação",
  "disabled": "Desativar",
  "webhooks": {
    "help_content": "Os callbacks integram o Nightingale a outros sistemas. Quando um evento de alerta é gerado, ele é enviado a cada URL de callback configurada; você pode desenvolver sua própria API HTTP, apontá-la aqui e implementar a lógica automatizada que quiser. O Nightingale chama esses endereços por POST, com o conteúdo do evento em JSON no corpo da requisição; a estrutura dos dados está descrita [aqui](https://github.com/ccfos/nightingale/blob/main/models/alert_cur_event.go#L19). Para testar, use uma máquina que enxergue o Nightingale pela rede (digamos, 10.1.2.3) e abra uma porta com o nc, por exemplo `nc -k -l 4321`, que faz o nc escutar na porta 4321. Configure `http://10.1.2.3:4321` como URL de callback, crie uma regra de alerta e, ao dispará-la, o Nightingale chamará esse endereço e você verá na saída do nc o formato exato dos dados enviados.",
    "title": "URL de callback",
    "enable": "Ativar",
    "note": "Observação",
    "url": "URL",
    "timeout": "Tempo limite (s)",
    "basic_auth_user": "Usuário (Basic Auth)",
    "basic_auth_password": "Senha (Basic Auth)",
    "skip_verify": "Ignorar verificação SSL",
    "add": "Adicionar",
    "help": "\n      Para encaminhar todos os eventos de alerta do Nightingale a outra plataforma, use a URL de callback global abaixo.\n      <br />\n      <br />\n      Em geral, um sistema de monitoramento cuida da coleta, do armazenamento, da análise e da geração dos eventos, enquanto a distribuição, a redução de ruído, o aceite, o escalonamento, a escala de plantão e a colaboração ficam a cargo de um produto à parte, do tipo OnCall — amplamente adotado por empresas que praticam SRE.\n      <br />\n      <br />\n      Produtos de OnCall costumam integrar-se a diversos sistemas de monitoramento, como Prometheus, Nightingale, Zabbix, ElastAlert, BlueKing e os monitoramentos das nuvens públicas. Cada um deles envia os eventos ao centro de OnCall por webhook, e é lá que a distribuição, a redução de ruído e o tratamento acontecem.\n      <br />\n      <br />\n      Entre os produtos de OnCall, destacamos o <a1>PagerDuty</a1> no exterior e o <a2>FlashDuty</a2> na China; ambos oferecem cadastro gratuito para teste.\n    "
  },
  "script": {
    "title": "Script de notificação",
    "enable": "Ativar",
    "timeout": "Tempo limite (s)",
    "type": [
      "Usar script",
      "Usar caminho"
    ],
    "path": "Caminho do arquivo",
    "content": "Conteúdo do script"
  },
  "channels": {
    "title": "Meios de notificação",
    "name": "Nome",
    "ident": "Identificador",
    "ident_msg1": "O identificador só pode conter letras, números, sublinhados e hifens",
    "ident_msg2": "Este identificador já existe",
    "hide": "Ocultar",
    "add": "Adicionar",
    "add_title": "Adicionar meio de notificação",
    "edit_title": "Editar meio de notificação",
    "enabled": "Ativar"
  },
  "contacts": {
    "title": "Contato",
    "add_title": "Adicionar contato",
    "edit_title": "Editar contato"
  },
  "smtp": {
    "title": "Configuração SMTP",
    "testMessage": "E-mail de teste enviado; verifique sua caixa de entrada"
  },
  "ibex": {
    "title": "Configuração de autorrecuperação"
  }
};

export default pt_BR;

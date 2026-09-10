const pt_BR = {
  "title": "Fluxos de trabalho",
  "title_add": "Adicionar fluxo de trabalho",
  "title_edit": "Editar fluxo de trabalho",
  "title_clone": "Clonar fluxo de trabalho",
  "teams": "Equipes autorizadas",
  "teams_tip": "Define quais equipes podem ver e alterar esta configuração; é possível associar várias<br />Por exemplo, ao autorizar a equipe infra-team, apenas seus membros poderão acessar ou ajustar esta configuração.",
  "basic_configuration": "Configuração básica",
  "filter_enable": "Filtro",
  "label_filters": "Rótulos aplicáveis",
  "label_filters_tip": "Define o filtro de rótulos do processamento: só entram eventos cujos rótulos correspondam ao configurado aqui.<br />Por exemplo, com service=mon, apenas os eventos que tenham o rótulo service=mon seguem por este fluxo.",
  "attribute_filters": "Atributos aplicáveis",
  "attribute_filters_tip": "Define o filtro de atributos do processamento: só entram eventos cujos atributos correspondam ao configurado aqui.<br />Por exemplo, com grupo de negócio == DefaultBusiGroup, apenas os eventos cujo atributo de grupo de negócio seja DefaultBusiGroup seguem por este fluxo.",
  "attribute_filters_value": "Valor do atributo",
  "attribute_filters_options": {
    "group_name": "Grupo de negócio",
    "cluster": "Fonte de dados",
    "is_recovered": "É um evento de recuperação?",
    "severity": "Níveis de alerta"
  },
  "use_case": {
    "label": "Finalidade",
    "firemap": "Firemap",
    "event_pipeline": "Processamento de eventos"
  },
  "processors_col": "Processador",
  "clone_suffix": "-cópia",
  "unsaved_confirm": "Há alterações não salvas. Deseja fechar?",
  "search_placeholder": "Buscar por nome, observação ou tipo de processador",
  "empty_guide": {
    "title": "Nenhum fluxo de trabalho ainda",
    "doc": "Ver a documentação de uso",
    "mount_hint": "Criar um fluxo de trabalho não o coloca em uso: ele só roda quando referenciado por uma regra de alerta ou de notificação"
  },
  "scenario_tips": {
    "title": "Os fluxos de trabalho servem bem a três cenários",
    "denoise": "Redução de ruído: descartar ou suprimir alertas de baixa severidade ou repetidos antes de notificar",
    "enrich": "Enriquecimento: acrescentar ao alerta rótulos de negócio, um resumo gerado por IA ou o contexto obtido em uma consulta",
    "dispatch": "Integração externa: encaminhar o alerta a sistemas de chamados ou automação, ou disparar um script de autorrecuperação",
    "more": "Saiba mais"
  },
  "trigger_mode": {
    "label": "Modo de acionamento",
    "event": "Por evento",
    "api": "Por API"
  },
  "disabled": {
    "filter_placeholder": "Status de ativação",
    "form_label": "Ativar",
    "label": "Ativar",
    "false": "Ativar",
    "true": "Desativar"
  },
  "inputs": {
    "label": "Variáveis de entrada",
    "help": "As variáveis de entrada podem ser referenciadas nos processadores abaixo por {{$inputs.nome_da_variavel}}. Por exemplo, defina uma variável ident e use {{$inputs.ident}} em um processador para indicar em qual máquina o script será executado.",
    "add_btn": "Adicionar variável",
    "key": "Nome da variável",
    "key_required": "O nome da variável não pode ficar vazio",
    "value": "Valor padrão da variável",
    "description": "Descrição da variável"
  },
  "executions": {
    "title": "Registros de execução",
    "search_placeholder": "Informe a palavra-chave de busca",
    "status": {
      "label": "Status",
      "running": "Em execução",
      "success": "Sucesso",
      "failed": "Falhou",
      "terminated": "Interrompido",
      "skipped": "Ignorado",
      "streaming": "Transmitindo saída"
    },
    "id": "ID da execução",
    "pipeline_name": "Nome do fluxo de trabalho",
    "mode": "Modo de acionamento",
    "created_at": "Início",
    "finished_at": "Fim",
    "duration_ms": "Duração da execução",
    "trigger_by": "Acionado por",
    "detail_title": "Detalhes da execução",
    "detail_basic_info": "Dados básicos",
    "error_message": "Mensagem de erro",
    "message": "Mensagem da execução",
    "error_node": "Nó com erro",
    "inputs_snapshot": "Instantâneo das variáveis de entrada",
    "node_results_parsed_title": "Resultado por nó",
    "event_id": "ID do evento",
    "view_all": "Ver tudo",
    "filtered_by": "Fluxo de trabalho: {{name}}",
    "trigger_by_alert_rule": "Regra de alerta #{{id}}",
    "trigger_by_notify_rule": "Regra de notificação #{{id}}",
    "empty_guide": {
      "title": "Nenhum registro de execução neste período",
      "desc": "Cada execução do fluxo de trabalho acionada por uma regra de alerta ou de notificação aparece aqui. Amplie o intervalo de tempo acima ou afrouxe os filtros para ver mais."
    }
  },
  "test_modal": {
    "title": {
      "settings": "Selecionar evento de teste",
      "result": "Resultado da execução de teste"
    },
    "result_success": "Executado com sucesso",
    "result_failed": "Falha na execução",
    "dropped": "O evento foi descartado ou suprimido nesta etapa; os processadores seguintes não rodam e nenhuma notificação é gerada",
    "steps_title": "Resultado nó a nó",
    "event_preview_title": "Evento após o processamento",
    "back_btn": "Escolher outro evento",
    "back_btn_mock": "Reconfigurar o evento de exemplo",
    "fidelity_note": "A execução de teste usa o caminho de acionamento por API e pula parte do fluxo real, como a avaliação dos filtros, então o resultado pode diferir de um alerta real. Considere os eventos reais como referência.",
    "fidelity_note_mock": "A execução de teste usa o caminho de acionamento por API e pula parte do fluxo real, como a avaliação dos filtros. Este teste usou um evento de exemplo, não um alerta real; valide novamente com um evento real antes de colocar em produção.",
    "mode": {
      "history": "Eventos históricos",
      "mock": "Evento de exemplo"
    },
    "mock": {
      "desc": "O evento de exemplo é sintetizado pelo sistema e não é gravado no banco, o que permite validar os processadores mesmo em ambientes novos sem histórico de alertas. A severidade e o estado de recuperação são ajustáveis, cobrindo processadores que se ramificam por esses critérios.",
      "preview_title": "Evento de exemplo",
      "severity": "Severidade do alerta",
      "is_recovered": "Evento de recuperação",
      "tags": "Rótulos do evento",
      "empty_alert": "Nenhum evento de alerta histórico neste período",
      "switch_btn": "Testar com um evento de exemplo"
    }
  },
  "batch": {
    "not_select": "Selecione primeiro os fluxos de trabalho",
    "export": {
      "title": "Exportar em lote"
    },
    "delete": "Excluir em lote",
    "enable": "Ativar em lote",
    "disable": "Desativar em lote",
    "already_enabled": "Todos os fluxos selecionados já estão ativos",
    "already_disabled": "Todos os fluxos selecionados já estão desativados",
    "enable_confirm": "Confirma a ativação dos {{count}} fluxos selecionados?",
    "disable_confirm": "Confirma a desativação dos {{count}} fluxos selecionados?",
    "delete_enabled_confirm": "{{count}} deles ainda estão ativos e serão desativados antes da exclusão. Deseja continuar?",
    "delete_confirm": "Confirma a exclusão dos {{count}} fluxos selecionados? As regras de alerta e de notificação que os utilizam deixarão de funcionar."
  },
  "relabel_fields": {
    "action": "Ação",
    "target_label": "Rótulo de destino",
    "replacement": "Valor do rótulo",
    "source_labels": "Rótulo de origem",
    "separator": "Separador",
    "regex": "Expressão regular",
    "replace_hint": "replace: extrai o valor do rótulo de origem com a expressão regular e o grava no rótulo de destino. Preenchendo apenas o rótulo de destino e o valor, o evento recebe um rótulo fixo. Com o rótulo de destino vazio, este processador não faz nada."
  },
  "processor_message": {
    "drop_hit": "A condição de descarte foi atendida e o evento foi descartado",
    "drop_miss": "A condição de descarte não foi atendida e o evento segue adiante",
    "no_change": "Sem alterações"
  },
  "processor": {
    "title": "Processador",
    "add_btn": "Adicionar processador",
    "typ": "Tipo",
    "typ_required": "Escolha o tipo do processador; sem um tipo definido, ele falha em todos os eventos",
    "help_btn": "Instruções de uso",
    "options": {
      "relabel": "Reescrita de rótulos do evento",
      "label_enrich": "Enriquecimento de rótulos do evento",
      "inhibit": "Supressão de eventos",
      "event_drop": "Descarte de eventos",
      "event_update": "Atualização de eventos",
      "inhibit_qd": "Supressão de eventos (por consulta)",
      "annotation_qd": "Enriquecimento com informações adicionais (por consulta)",
      "callback": "Callback por webhook",
      "ai_summary": "Resumo gerado por IA",
      "script": "Execução de script",
      "event_recover": "Autorrecuperação",
      "alert_shot": "Captura de tela do alerta"
    },
    "category": {
      "rewrite": "Transformar o evento",
      "denoise": "Reduzir ruído",
      "enrich": "Enriquecer",
      "dispatch": "Integrar e executar",
      "other": "Outros"
    },
    "options_desc": {
      "relabel": "Altera, adiciona ou remove rótulos do evento",
      "event_drop": "Descarta o evento conforme uma condição, interrompendo o processamento",
      "event_update": "Chama uma API HTTP e atualiza o evento com a resposta",
      "callback": "Encaminha o evento a um sistema externo, como chamados ou automação",
      "ai_summary": "Usa um modelo de linguagem para gerar um resumo do evento",
      "label_enrich": "Acrescenta rótulos ao evento a partir do glossário interno",
      "script": "Executa um script para tratar o evento",
      "inhibit": "Suprime esta notificação quando há um alerta ativo de severidade maior",
      "inhibit_qd": "Suprime o evento conforme o resultado de uma consulta",
      "annotation_qd": "Acrescenta informações ao evento conforme o resultado de uma consulta",
      "event_recover": "Dispara uma tarefa de autorrecuperação",
      "alert_shot": "Captura a tela de um dashboard ou página e a anexa ao alerta"
    },
    "delete_confirm": "Confirma a exclusão deste processador?",
    "switch_type_confirm": "Trocar o tipo apaga a configuração atual deste processador. Confirma?",
    "drag_tip": "Arraste para reordenar",
    "move_up": "Mover para cima",
    "move_down": "Mover para baixo",
    "copy_tip": "Duplicar este processador"
  },
  "form_section": {
    "filter": {
      "title": "Escopo de processamento",
      "desc": "Define quais eventos entram neste fluxo. As condições são combinadas com E; deixando todas vazias, todos os eventos entram"
    },
    "processor": {
      "title": "Processador",
      "desc": "Os eventos passam pelos processadores de cima para baixo"
    },
    "basic": {
      "title": "Dados básicos",
      "desc": "Nome, equipes autorizadas e status de ativação do fluxo de trabalho"
    }
  },
  "no_filter_warning": "Nenhum filtro configurado: este fluxo processará todos os eventos de alerta",
  "section_summary": {
    "label_count": "{{count}} condições de rótulo",
    "attr_count": "{{count}} condições de atributo",
    "no_filter": "Todos os eventos",
    "processor_count": "{{count}} processadores",
    "unnamed": "Sem nome",
    "enabled": "Ativado",
    "disabled": "Desativado"
  },
  "name_auto": {
    "tip": "O nome é gerado automaticamente a partir do escopo e dos processadores acima, e pode ser alterado a qualquer momento",
    "all": "Todos os alertas",
    "arrow": "→",
    "joiner": "-"
  },
  "saved_guide": {
    "title": "Fluxo de trabalho salvo",
    "hint": "Ele ainda não está em uso: os eventos só passarão por ele quando uma regra de notificação o referenciar.",
    "to_notify_rule": "Vincular em uma regra de notificação",
    "done": "Concluir"
  },
  "label_enrich": {
    "label_source_type": {
      "label": "Origem dos rótulos",
      "options": {
        "built_in_mapping": "Glossário interno de rótulos"
      }
    },
    "label_mapping_id": "Nome do glossário",
    "help": "Consulta o glossário usando os rótulos de origem indicados e acrescenta ao evento os campos encontrados, conforme a configuração de novos rótulos",
    "source_keys": {
      "label": "Rótulo de origem",
      "text": "O campo <strong>{{field}}</strong> do glossário corresponde a este rótulo do evento",
      "target_key_placeholder": "Chave do rótulo",
      "target_key_required": "A chave do rótulo não pode ficar vazia"
    },
    "append_keys": {
      "label": "Adicionar rótulo",
      "source_key_placeholder": "Campo do glossário",
      "rename_key": "Renomear a chave do rótulo",
      "target_key_placeholder": "Chave do rótulo"
    }
  },
  "callback": {
    "url": "URL",
    "advanced_settings": "Configurações avançadas",
    "basic_auth_user": "Usuário de autenticação",
    "basic_auth_user_placeholder": "Informe o usuário de autenticação",
    "basic_auth_pass": "Senha de autenticação",
    "basic_auth_pass_placeholder": "Informe a senha de autenticação"
  },
  "event_drop": {
    "hint": "O evento é descartado quando o modelo produz true; qualquer outra saída o deixa passar. Variáveis disponíveis: $event.Severity (1/2/3), $event.IsRecovered, $event.RuleName e $event.TagsMap.nome_do_rotulo",
    "snippets_label": "Inserir exemplo",
    "snippets": {
      "severity": "Descartar alertas informativos S3",
      "recovered": "Descartar notificações de recuperação",
      "tag": "Descartar por rótulo",
      "rule_name": "Descartar por nome da regra"
    },
    "replace_confirm": "A lógica atual será substituída pelo exemplo. Deseja continuar?",
    "content": "Lógica de decisão",
    "content_placeholder": "Use a sintaxe do Go template; se o resultado final for true, o evento é descartado nesta etapa"
  },
  "ai_summary": {
    "llm_config": "Reutilizar uma configuração de LLM",
    "llm_config_placeholder": "Escolha um LLM já configurado (em branco, preencha os parâmetros abaixo manualmente)",
    "llm_config_tip": "Escolha uma configuração existente em \"Configuração de IA - Configuração de LLM\" para reaproveitar seu modelo, chave e endereço. Em branco, valem os parâmetros preenchidos abaixo.",
    "url_placeholder": "Informe o endereço da API",
    "url_required": "Informe a URL",
    "api_key_placeholder": "Chave da API",
    "api_key_required": "Informe a API Key",
    "model_name": "Nome do modelo",
    "model_name_placeholder": "Por exemplo, deepseek-chat",
    "model_name_required": "Informe o nome do modelo",
    "prompt_template": "Modelo de prompt",
    "prompt_template_required": "Informe o modelo de prompt",
    "advanced_config": "Configurações avançadas",
    "custom_params": "Parâmetros do modelo de IA",
    "custom_params_key_label": "Nome do parâmetro (por exemplo, temperature)",
    "custom_params_value_label": "Valor do parâmetro (por exemplo, 0.7)",
    "proxy_placeholder": "Por exemplo: http://proxy.example.com:8080",
    "timeout_placeholder": "Tempo limite (segundos)",
    "timeout_required": "Informe o tempo limite",
    "url_tip": "- **Descrição**: endereço da API do serviço de IA\n- **Exemplo**: `https://api.deepseek.com/v1/chat/completions`",
    "api_key_tip": "- **Descrição**: chave de API do provedor do serviço de IA\n- **Como obter**:\n  - OpenAI: solicite no site oficial da OpenAI\n  - DeepSeek: cadastre-se no site oficial da DeepSeek",
    "model_name_tip": "- **Descrição**: nome do modelo de IA a ser usado\n- **Modelos comuns**:\n  - `gpt-3.5-turbo` (OpenAI)\n  - `gpt-4` (OpenAI)\n  - `deepseek-chat` (DeepSeek)",
    "prompt_template_tip": "O modelo de prompt é o coração da análise por IA. Use {{$event}} para referenciar os campos do evento; a estrutura completa está descrita na [tabela de histórico de alertas](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/events/alert-history/). No começo, o modelo padrão já basta",
    "prompt_template_placeholder": "Analise as informações do evento de alerta abaixo e escreva um resumo claro e objetivo em português:\nRegra de alerta: {{$event.RuleName}}\nSeveridade: {{$event.Severity}}\nSituação: {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       \nHorário do disparo: {{$event.TriggerTime}}\nValor no disparo: {{$event.TriggerValue}}\nObservação da regra: {{$event.RuleNote}}\nRótulos: {{$event.Tags}}\nAnotações: {{$event.Annotations}}\n\nEscreva um resumo de até 100 palavras destacando:\n1. Qual sistema ou serviço apresentou qual problema\n2. A gravidade do problema\n3. Os impactos possíveis\n4. Uma sugestão simples de tratamento\nO resumo deve ser breve e direto, para que a equipe de operações entenda o alerta rapidamente.",
    "custom_params_tip": "Para ajustar o comportamento do modelo de IA em detalhe:\n\n| Parâmetro | Descrição | Valor recomendado | Exemplo |\n|--------|------|--------|------|\n| temperature | Controla a aleatoriedade da resposta | 0.3-0.7 | 0.7 |\n| max_tokens | Máximo de tokens na saída | 200-500 | 300 |\n| top_p | Limiar de probabilidade da amostragem | 0.8-1.0 | 0.9 |\n\n**Como configurar**:\n1. Clique no botão + ao lado de \"Custom Params\"\n2. No campo do nome, informe o parâmetro (por exemplo, temperature)\n3. No campo do valor, informe o valor correspondente (por exemplo, 0.7)"
  },
  "script": {
    "timeout": "Tempo limite (milissegundos)",
    "timeout_tooltip": "Tempo máximo de execução do script; passado esse limite, ele é encerrado",
    "timeout_placeholder": "Informe o tempo limite",
    "content": "Conteúdo do script",
    "content_tooltip": "Escreva o script que trata o evento. O evento de alerta chega pelo stdin e o script deve devolver o evento como um objeto JSON no stdout",
    "content_placeholder": "Informe o conteúdo do script"
  },
  "inhibit": {
    "help": "O processador de supressão evita que um alerta gere notificação quando outro já foi enviado, reduzindo o ruído. Um caso comum: enquanto houver um incidente P1 ativo na mesma regra, ignorar as notificações P2 e P3. Saiba mais na <a>documentação de uso</a>",
    "tip1": "Quando o <b>novo alerta</b> atender às condições abaixo",
    "tip2": "E",
    "tip3": "segundos houver um <b>alerta ativo</b> que atenda às condições abaixo",
    "tip4": "e o <b>novo alerta</b> coincidir com o <b>alerta ativo</b> nos itens abaixo",
    "tip5": "Atendidas todas as condições acima, o alerta atual é suprimido e não gera notificação",
    "duration_required": "A duração da supressão não pode ficar vazia",
    "duration_max": "A duração da supressão não pode passar de 600 segundos",
    "match_label_keys": "Rótulos",
    "match_label_keys_required": "O rótulo não pode ficar vazio",
    "match_attribute_keys": "Atributo",
    "match_attribute_keys_required": "O atributo não pode ficar vazio",
    "keys_at_least_one_required": "É preciso ao menos um rótulo ou atributo",
    "labels_conflict": "O rótulo {{label}} tem valores diferentes; não é possível suprimir",
    "attributes_conflict": "O atributo {{attribute}} tem valores diferentes; não é possível suprimir",
    "preview": "Prévia da regra: quando houver um <b>novo alerta: {{newAlertLabelsAttrs}}</b> e, nos últimos <b>{{duration}} segundos</b>, existir um <b>alerta ativo: {{activeAlertLabelsAttrs}}</b>, e ambos coincidirem em <b>{{matchLabelsAttrs}}</b>, a notificação do novo alerta é suprimida.",
    "labels_filter": {
      "label": "Rótulos",
      "label_tip": "Suprime apenas os eventos que atendam a estas condições de rótulo, o que limita o alcance da regra; sem configuração, não há restrição. É possível escolher chaves existentes na lista (recomendado) ou digitá-las",
      "label_placeholder": "Digite ou selecione a chave de rótulo usada na correspondência, por exemplo app / cluster / alertname"
    },
    "labels_filter_value_placeholder": "Digite ou selecione o valor de rótulo usado na correspondência",
    "attributes_filter": {
      "label": "Atributo",
      "label_tip": "Limita a supressão pelos atributos do evento: só são suprimidos os alertas que atendam a todos eles. Em branco, vale para todos os alertas"
    },
    "active_event_labels_filter": {
      "label": "Rótulos",
      "label_tip": "**Limita o conjunto de alertas ativos considerados**\n- Sem configuração: nenhum filtro por rótulo é aplicado\n- Com configuração: escolha chaves existentes na lista (recomendado) ou digite-as; apenas os alertas ativos que atendam a todas essas condições entram no conjunto.\n\nExemplo: com service=mon, apenas os eventos que tenham o rótulo service=mon participam da lógica de supressão."
    },
    "active_event_attributes_filter": {
      "label": "Atributo",
      "label_tip": "**Limita o conjunto de alertas ativos considerados**\n- Sem configuração: nenhum filtro por atributo é aplicado\n- Com configuração: apenas os alertas ativos que atendam a todas essas condições entram no conjunto.\n\nExemplo: com grupo de negócio == DefaultBusiGroup, apenas os eventos ativos cujo atributo de grupo de negócio seja DefaultBusiGroup são considerados na supressão"
    }
  },
  "inhibit_qd": {
    "help": "Supressão por resultado de consulta: no disparo do alerta, a consulta abaixo é executada. Se ela retornar ao menos um registro, o alerta é suprimido e não notifica; sem dados, a notificação segue normalmente. Saiba mais na <a>documentação de uso</a>",
    "t_1": "e a consulta retornar os <b>dados</b> abaixo"
  },
  "annotation_qd": {
    "help": "O processador de consulta complementar enriquece o alerta: no disparo, ele busca informações relacionadas na fonte de dados, como logs, e as anexa ao alerta. Detalhes na <a>documentação de uso</a>",
    "query_configs": "Consulta de dados",
    "use_event_datasource": "Usar a fonte de dados do evento",
    "use_event_datasource_help": "Quando ativado, só é possível escolher eventos de exemplo compatíveis com o tipo da fonte de dados",
    "datasource_cate_required": "O tipo da fonte de dados não pode ficar vazio",
    "datasource_ids_required": "A fonte de dados não pode ficar vazia",
    "select_alert_event_btn": "Selecionar evento de alerta de exemplo",
    "select_alert_event_tip": "Escolha um evento de exemplo para resolver as variáveis da consulta e visualizar os dados",
    "select_alert_event_label": "Evento de exemplo selecionado",
    "query_required": "A condição de consulta não pode ficar vazia",
    "sql_limit_valid": "A consulta SQL precisa conter a cláusula LIMIT",
    "oracle_sql_limit_valid": "A consulta SQL precisa conter a cláusula ROWNUM",
    "annotation_configs": "Dados anexados",
    "annotation_configs_tip": "Configure pares chave/valor para anexar o resultado da consulta ao alerta",
    "annotation_key_tip": "Defina a chave do novo campo; recomendamos usar apenas letras latinas",
    "annotation_val_tip": "Modelo do valor do novo campo; consulte a documentação de uso para a sintaxe",
    "annotation_key_placeholder": "Nome do campo anexado",
    "annotation_val_placeholder": "Conteúdo do campo anexado; aceita sintaxe de template para preencher o resultado da consulta como variável",
    "annotation_key_required": "O nome do campo anexado não pode ficar vazio",
    "annotation_val_required": "O conteúdo do campo anexado não pode ficar vazio",
    "data_preview": "Prévia dos dados",
    "data_preview_query": "Consulta",
    "data_preview_no_eventid": "Selecione um evento de alerta primeiro",
    "query_limit": "Limite de registros retornados"
  },
  "event_recover": {
    "help": "O processador de autorrecuperação executa um script shell na máquina quando o alerta dispara, seja para coletar informações, seja para rodar uma rotina de recuperação. <a>Documentação de uso</a>",
    "title": "Autorrecuperação de alertas",
    "create_btn": "Criar modelo de autorrecuperação",
    "tpl_id": "Modelo de autorrecuperação",
    "tpl_id_required": "O modelo de autorrecuperação não pode ficar vazio",
    "host": "Máquina de execução",
    "host_placeholder": "Pode ficar vazio; nesse caso, a máquina é obtida do rótulo ident do evento",
    "args": "Parâmetros",
    "args_tip": "Argumentos passados ao script; separe vários deles com vírgulas duplas, por exemplo arg1,,arg2,,arg3",
    "save_result": "Salvar o resultado da execução",
    "save_result_tip": "Grava o resultado do script no evento de alerta",
    "timeout": "Tempo de espera pela execução",
    "timeout_tip": "Se o script não terminar dentro desse tempo, o resultado não é aguardado",
    "timeout_max_warning": "O tempo de espera não pode passar de 60 segundos",
    "select_host": "Filtrar máquinas"
  },
  "alert_shot": {
    "help": "<a>Documentação de uso</a>",
    "title": "Captura de tela do alerta",
    "shot_type": {
      "label": "Tipo de objeto",
      "options": {
        "board": "Dashboard",
        "url": "Endereço URL"
      }
    },
    "advanced_settings": "Configurações avançadas",
    "board_shot_opts": {
      "busi_group": "Grupo de negócio",
      "board_id": "Dashboard",
      "board_url": "URL do dashboard",
      "timeout": "Tempo limite (milissegundos)",
      "width": "Largura da imagem"
    },
    "url_shot_opts": {
      "url": "Endereço URL",
      "headers": "Cabeçalhos da requisição",
      "proxy": "Configuração de proxy",
      "insecure_skip_verify": "Ignorar a verificação do certificado",
      "timeout": "Tempo limite (milissegundos)",
      "width": "Largura da imagem"
    }
  }
};

export default pt_BR;

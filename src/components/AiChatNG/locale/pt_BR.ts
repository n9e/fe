const pt_BR = {
  "toolbar": {
    "current_chat": "Sessão atual",
    "new_chat": "Nova sessão",
    "history": "Histórico de sessões",
    "share": "Compartilhar",
    "share_copied": "Link de compartilhamento copiado",
    "switch_to_drawer": "Alternar para modo gaveta",
    "switch_to_floating": "Alternar para modo flutuante"
  },
  "history": {
    "untitled": "Nova sessão",
    "today": "Hoje",
    "yesterday": "Ontem",
    "earlier": "Mais antigo",
    "unknown_time": "--:--",
    "delete_confirm": "Excluir esta sessão?",
    "empty": "Nenhuma sessão no histórico",
    "search_placeholder": "Buscar sessões",
    "share": "Compartilhar sessão",
    "rename": "Renomear",
    "more_actions": "Mais ações da sessão"
  },
  "nightingale": {
    "title": "Nightingale AI",
    "new_chat": "Nova sessão",
    "sessions": "Sessão",
    "llm_configs": "Gerenciamento de LLM",
    "skills": "Gerenciamento de Skills",
    "mcp_servers": "Gerenciamento de MCP",
    "ai_task": "Canal de tarefas",
    "collapse_sidebar": "Recolher painel de IA",
    "expand_sidebar": "Expandir painel de IA",
    "welcome_cards": {
      "overview": {
        "title": "Conheça o Nightingale rapidamente",
        "description": "Entenda em um minuto o que o produto e o assistente de IA podem fazer",
        "prompt": "Apresente em um minuto os recursos principais do Nightingale e o que você pode fazer por mim"
      },
      "alerts": {
        "title": "Revisar meus alertas",
        "description": "Quais regras disparam demais e quais nunca dispararam",
        "prompt": "Faça um balanço das minhas regras de alerta: quais dispararam com mais frequência nos últimos 7 dias e quais nunca dispararam"
      },
      "create_alert": {
        "title": "Crie um alerta com uma frase",
        "description": "Descreva o cenário e eu gero a PromQL e o limiar",
        "prompt": "Crie uma regra de alerta: disparar quando o uso de CPU do host ficar acima de 80% por 5 minutos"
      }
    }
  },
  "input": {
    "placeholder": "Digite sua pergunta. Enter envia, Shift + Enter quebra a linha",
    "share_readonly_placeholder": "Modo de compartilhamento somente leitura"
  },
  "query": {
    "title": "Consulta",
    "copied": "Consulta copiada",
    "copy": "Copiar",
    "execute": "Executar consulta",
    "execute_disabled": "Nenhum callback de execução foi fornecido; apenas a cópia estará disponível"
  },
  "action": {
    "query_generator": "Gerar consulta"
  },
  "message": {
    "generating": "Pensando...",
    "processing": "Ainda processando",
    "hint": "Aviso",
    "no_llm_title": "Não há nenhum modelo de linguagem configurado neste ambiente",
    "no_llm_content": "Acesse a página <a>Gerenciamento de LLM</a> para adicionar uma configuração de modelo",
    "stopped": "Geração interrompida",
    "request_failed": "Falha na requisição",
    "cancelled": "Esta resposta foi cancelada.",
    "retry_later": "Tente novamente mais tarde.",
    "empty_response": "Nenhuma resposta disponível",
    "thinking": "Raciocínio",
    "unsupported_type": "Tipo de conteúdo não suportado: {{type}}"
  },
  "form_select": {
    "title": "Informe os dados abaixo para continuar:",
    "approval_title": "Confirme se deseja executar a ação acima:",
    "busi_group": "Grupo de negócio",
    "datasource": "Fonte de dados",
    "team": "Equipe",
    "skill_scope": "Visibilidade",
    "placeholder_select": "Selecione",
    "confirm": "Confirmar"
  },
  "alert_rule": {
    "title": "Regra de alerta",
    "copy": "Copiar",
    "copied": "ID da regra copiado",
    "duration_seconds": "Por {{seconds}} segundos",
    "field": {
      "id": "ID da regra",
      "name": "Nome da regra",
      "group": "Grupo de negócio",
      "datasource": "Fonte de dados",
      "cate": "Tipo de fonte de dados",
      "severity": "Severidade do alerta",
      "metric": "Métrica monitorada",
      "condition": "Condição de disparo",
      "note": "Conteúdo do alerta"
    },
    "severity": {
      "critical": "Critical",
      "warning": "Warning",
      "info": "Info"
    }
  },
  "dashboard": {
    "title": "Dashboard",
    "copied": "ID do dashboard copiado",
    "field": {
      "id": "ID do dashboard",
      "name": "Nome",
      "group": "Grupo de negócio",
      "datasource": "Fonte de dados padrão",
      "panels_count": "Painéis",
      "variables_count": "Variáveis",
      "tags": "Rótulos"
    }
  },
  "empty": {
    "greeting_prefix": "Olá, eu sou"
  },
  panel: {
    open: 'Gerar consulta com IA',
    untitled: 'Gerado por IA',
    based_on: 'com base em {{name}}',
    running: 'Gerando',
    adopted: 'Adotado',
    failed: 'Sem resultado',
    close: 'Fechar',
    step: {
      command: '{{count}} comando(s) executado(s)',
      read_file: '{{count}} arquivo(s) lido(s)',
      edit_file: '{{count}} arquivo(s) escrito(s)',
      separator: ' · ',
    },
    written_back: 'Escrito no campo acima e executado',
    undo: 'Desfazer',
    regenerate: 'Gerar de novo',
    another_way: 'Outra forma',
    another_way_prompt: 'Escreva de outra forma — uma expressão equivalente, redigida diferente',
    ask_first: 'Pergunte algo primeiro',
    send: 'Enviar',
    follow_up_placeholder: 'Continue, ex.: "agrupar por pod"',
    answer_below: 'Responda abaixo para continuar',
    needs_answer: 'Aguarda resposta',
    nothing_delivered: 'Nenhuma expressão utilizável',
    timeout: 'Tempo esgotado, tente de novo',
  },
};

export default pt_BR;

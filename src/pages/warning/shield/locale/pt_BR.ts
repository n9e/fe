const pt_BR = {
  "title": "Regras de silenciamento",
  "edit_missing_params": "Faltam parâmetros obrigatórios e a edição não é possível. Fale com o administrador",
  "search_placeholder": "Buscar por título da regra, rótulo ou motivo do silenciamento",
  "datasource_type": "Tipo de fonte de dados",
  "datasource_id": "Fonte de dados",
  "cause": "Motivo do silenciamento",
  "cause_tip": "Registre o contexto deste silenciamento para que a equipe entenda por que ele existe e quando pode ser removido",
  "cause_placeholder": "Por exemplo: implantação do serviço de pedidos, prevista para 1 hora",
  "time": "Período do silenciamento",
  "note": "Título da regra",
  "btime": "Início do silenciamento",
  "btime_msg": "O início do silenciamento não pode ficar vazio",
  "duration": "Duração do silenciamento",
  "duration_quick": "Durações rápidas",
  "duration_quick_tip": "O fim é calculado a partir do início do silenciamento; também é possível editar as datas abaixo diretamente",
  "etime": "Fim do silenciamento",
  "etime_msg": "O fim do silenciamento não pode ficar vazio",
  "etime_before_btime_msg": "O fim do silenciamento precisa ser posterior ao início",
  "expired_tip": "Esta regra expirou e não silencia mais nenhum alerta. Para reativá-la, escolha uma duração rápida ou altere a data de fim",
  "long_duration_tip": "O silenciamento passa de {{days}} dias, e os alertas ficarão invisíveis por todo esse tempo. Confirme se é isso mesmo que você quer",
  "prod": "Tipo de monitoramento",
  "severities": "Severidade do evento",
  "severities_tip": "Apenas as severidades marcadas são silenciadas; as demais continuam alertando normalmente",
  "severities_msg": "A severidade do evento não pode ficar vazia",
  "scope_unlimited_tip": "Sem fonte de dados nem rótulos configurados, esta regra silenciará todos os eventos do grupo de negócio selecionado. Confirme se é isso mesmo que você quer",
  "mute_type": {
    "0": "Período fixo",
    "1": "Período recorrente",
    "label": "Tipo de período",
    "days_of_week": "Período do silenciamento",
    "days_preset": {
      "everyday": "Todos os dias",
      "workday": "Dias úteis",
      "weekend": "Fins de semana"
    },
    "start": "Início",
    "start_msg": "O início não pode ficar vazio",
    "end": "Fim",
    "end_msg": "O fim não pode ficar vazio",
    "periodic_tip": "O silenciamento recorrente não expira: toda semana, os alertas que caírem nos períodos acima são silenciados. Início e fim iguais significam o dia inteiro"
  },
  "mute_method": {
    "0": "Silenciar evento e notificação",
    "1": "Silenciar apenas a notificação",
    "hint_title": "Como escolher entre os dois modos",
    "hint_notify_only": "Silenciar apenas a notificação: o evento continua sendo gerado e registrado, apenas não avisa ninguém — adequado a reinicializações e janelas de manutenção, pois depois ainda é possível revisar o que aconteceu.",
    "hint_all": "Silenciar evento e notificação: nem o evento é gerado — adequado a ruídos que você já sabe que não precisa acompanhar.",
    "hint_dismiss": "Não mostrar novamente",
    "label": "Modo de silenciamento",
    "0_desc": "(não gera evento nem notificação)",
    "1_desc": "(registra o evento normalmente, apenas não notifica)",
    "tip": "Com \"Silenciar apenas a notificação\", os alertas correspondentes continuam gerando e registrando eventos durante o período, apenas sem avisar ninguém. Assim é possível perceber anomalias ocorridas durante a mudança e remover o silenciamento depois de tudo resolvido."
  },
  "tag": {
    "key": {
      "label": "Rótulos do evento",
      "tip": "Os rótulos aqui são os do evento de alerta, e as regras abaixo filtram os eventos por eles. Vários operadores são suportados:\n\n- `==` corresponde a um valor específico; aceita apenas um. Para vários ao mesmo tempo, use `in`\n- `=~` aceita uma expressão regular, permitindo correspondência flexível\n- `in` corresponde a vários valores, como o `in` do SQL\n- `not in` exclui vários valores, como o `not in` do SQL\n- `!=` diferente de, para excluir um valor específico\n- `!~` expressão regular negada: todos os valores que casarem com ela são excluídos, como o `!~` da PromQL"
    }
  },
  "name_auto_tip": "O título é gerado automaticamente a partir dos filtros acima e pode ser alterado a qualquer momento",
  "name_auto_template": "Silenciar {{scope}}",
  "name_auto_separator": "、",
  "name_auto_all_alerts": "Todos os alertas",
  "summary": {
    "severities_all": "Todas as severidades",
    "tags_none": "Sem restrição de rótulo",
    "tags_count": "{{count}} condições de rótulo",
    "periodic_count": "{{count}} períodos"
  },
  "basic_configs": "Dados básicos",
  "basic_configs_desc": "Título da regra e motivo do silenciamento, o que facilita o trabalho em equipe e as buscas futuras",
  "filter_configs": "Filtros",
  "filter_configs_desc": "Define quais eventos são silenciados: grupo de negócio, fonte de dados, severidade e rótulos. As condições são combinadas com E; em branco, não há restrição",
  "mute_configs": "Configuração do silenciamento",
  "mute_configs_desc": "Define quando e em que medida silenciar: um período fixo ou uma janela semanal recorrente",
  "alert_content": "Para evitar que uma configuração equivocada silencie todos os alertas da empresa, esta regra vale apenas para os eventos de um grupo de negócio específico",
  "preview_muted_title": "Visualizar eventos relacionados",
  "preview_muted_desc": "Abaixo estão os eventos de alerta já existentes que atendem a estes filtros. Depois de salvar, novos eventos do mesmo tipo serão silenciados, mas os que já existem não desaparecem sozinhos; se quiser, exclua-os aqui.",
  "preview_muted_save_only": "Apenas salvar",
  "preview_muted_save_and_delete": "Salvar e excluir os eventos relacionados",
  "expired": "Expirado",
  "empty_guide": {
    "title": "Nenhuma regra de silenciamento ainda",
    "desc": "Durante implantações, manutenções e simulados, use uma regra de silenciamento para segurar temporariamente os alertas já conhecidos e não incomodar quem está de plantão. Ela expira sozinha, sem precisar de intervenção manual.",
    "select_busi_group": "Escolha um grupo de negócio à esquerda para poder criar uma regra de silenciamento"
  },
  "delete_mutes": {
    "title": "Limpeza de regras de silenciamento",
    "alert_message": "Uma vez excluídos, os dados não podem ser recuperados. Prossiga com cuidado!",
    "timestamp": "Filtro por data",
    "timestamp_options": {
      "1": "Há mais de 1 mês",
      "3": "Há mais de 3 meses",
      "6": "Há mais de 6 meses",
      "12": "Há mais de 1 ano"
    }
  },
  "filter_disabled": {
    "0": "Ativar",
    "1": "Desativar",
    "placeholder": "Situação"
  }
};

export default pt_BR;

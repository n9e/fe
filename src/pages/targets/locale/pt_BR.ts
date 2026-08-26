const pt_BR = {
  "title": "Lista de máquinas",
  "default_filter": "Filtros predefinidos",
  "ungrouped_targets": "Máquinas sem grupo",
  "all_targets": "Todas as máquinas",
  "datasource": "Fonte de dados",
  "search_placeholder": "Busca aproximada no conteúdo da tabela (separe as palavras-chave por espaço)",
  "filterDowntime": "Atualização do heartbeat",
  "filterDowntimeNegative": "Heartbeat atualizado",
  "filterDowntimePositive": "Heartbeat sem atualização",
  "filterDowntimeNegativeMin": "Atualizado nos últimos {{count}} minutos",
  "filterDowntimePositiveMin": "Sem atualização nos últimos {{count}} minutos",
  "ident_copy_success": "{{num}} registros copiados com sucesso",
  "not_grouped": "Sem grupo",
  "host_ip": "IP",
  "host_tags": "Rótulos reportados",
  "tags": "Rótulos personalizados",
  "group_obj": "Grupo de negócio",
  "target_up": "Status",
  "mem_util": "Memória",
  "cpu_util": "CPU",
  "cpu_num": "Núcleos",
  "offset": "Desvio de relógio",
  "offset_tip": "Calculado como o horário da máquina do Nightingale menos o horário da máquina do categraf",
  "os": "Sistema operacional",
  "arch": "Arquitetura de CPU",
  "update_at": "Atualizado em",
  "update_at_tip": "\n    Heartbeat no último minuto: verde <1 />\n    Heartbeat nos últimos 3 minutos: amarelo <1 />\n    Sem heartbeat há mais de 3 minutos: vermelho\n  ",
  "remote_addr": "IP de origem",
  "remote_addr_tip": "O IP de origem vem do cabeçalho HTTP; havendo um proxy no caminho, ele pode não ser o IP real",
  "agent_version": "Versão do agente",
  "note": "Observação",
  "unknown_tip": "Exibe os metadados da máquina; requer categraf acima da versão 0.2.35",
  "view_related_collects": "Ver as configurações de coleta associadas",
  "organize_columns": {
    "title": "Colunas exibidas"
  },
  "targets": "Objetos monitorados",
  "targets_placeholder": "Informe as métricas do objeto monitorado, uma por linha",
  "copy": {
    "current_page": "Copiar esta página",
    "all": "Copiar tudo",
    "selected": "Copiar a seleção",
    "no_data": "Nada a copiar"
  },
  "bind_tag": {
    "title": "Vincular rótulos",
    "placeholder": "Rótulos no formato key=value, separados por Enter ou espaço",
    "msg1": "Informe pelo menos um rótulo!",
    "msg2": "Formato de rótulo inválido, verifique!",
    "msg3": "As chaves de rótulo não podem se repetir",
    "render_tip1": "O rótulo deve ter no máximo 64 caracteres",
    "render_tip2": "O rótulo deve estar no formato key=value, e a chave deve começar com letra ou sublinhado e conter apenas letras, números e sublinhados."
  },
  "unbind_tag": {
    "title": "Desvincular rótulos",
    "placeholder": "Selecione os rótulos a desvincular",
    "msg": "Informe pelo menos um rótulo!"
  },
  "update_busi": {
    "title": "Alterar grupo de negócio",
    "label": "Grupo de negócio",
    "mode": {
      "label": "Modo",
      "reset": "Sobrescrever",
      "add": "Adicionar",
      "del": "Excluir"
    },
    "tags": "Vincular rótulos",
    "tags_tip": "Em branco, os rótulos anteriores não são sobrescritos"
  },
  "remove_busi": {
    "title": "Remover do grupo de negócio",
    "msg": "Atenção: ao remover estes objetos do grupo de negócio, os administradores desse grupo perdem a permissão de gerenciá-los. Talvez você queira limpar antes os rótulos e as observações deles.",
    "btn": "Remover"
  },
  "update_note": {
    "title": "Alterar observação",
    "placeholder": "Se ficar vazio, a observação é apagada"
  },
  "batch_delete": {
    "title": "Excluir em lote",
    "msg": "Atenção: esta ação remove os objetos monitorados definitivamente do sistema. É uma operação perigosa, prossiga com cuidado!",
    "btn": "Excluir"
  },
  "meta_tip": "Ver metadados",
  "meta_title": "Metadados",
  "meta_desc_key": "Nome do metadado",
  "meta_desc_value": "Valor do metadado",
  "meta_value_click_to_copy": "Clique para copiar",
  "meta_expand": "Expandir",
  "meta_collapse": "Recolher",
  "meta_no_data": "Nenhum dado",
  "all_no_data": "Ainda não instalou o coletor? Siga o <a>manual de instalação</a>",
  "categraf_doc": "Documentação do categraf",
  "hosts_select": {
    "placeholder": "Identificador ou IP da máquina",
    "modal_title": "Informe o identificador ou o IP da máquina",
    "modal_placeholder": "Um identificador ou IP por linha"
  }
};

export default pt_BR;

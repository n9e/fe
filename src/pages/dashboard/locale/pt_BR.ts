const pt_BR = {
  "title": "Dashboards de monitoramento",
  "list": "Lista de dashboards",
  "back_icon_tip": "Volta à página anterior ou, se não houver, à lista de dashboards",
  "back_icon_tip_is_built_in": "Volta à página anterior ou, se não houver, à central de modelos",
  "name": "Nome do dashboard",
  "tags": "Rótulos de categoria",
  "ident": "Identificador em inglês",
  "ident_msg": "Use apenas letras, números e hifens",
  "search_placeholder": "Nome do dashboard, rótulos de categoria",
  "empty_guide": {
    "title": "Nenhum dashboard ainda",
    "desc": "Crie um dashboard ou importe os modelos internos com um clique.",
    "from_template": "Importar de um modelo"
  },
  "refresh_tip": "Um intervalo de atualização menor que o passo ({{num}}s) não trará dados novos",
  "refresh_btn": "Atualizar",
  "share_btn": "Compartilhar",
  "export_btn": "Exportar (CSV)",
  "clear_cache_btn": "Limpar cache",
  "clear_cache_btn_tip": "Limpa o cache da largura das colunas; a mudança vale após atualizar a página",
  "inspect_btn": "Diagnosticar",
  "table_upgrade": {
    "switch_title": "Atualizar para o TableNG",
    "switch_content": "Migrar automaticamente a configuração da tabela antiga?",
    "auto_upgrade": "Migrar automaticamente",
    "switch_only": "Apenas trocar o tipo"
  },
  "public": {
    "name": "Público",
    "unpublic": "Não público",
    "public_cate": "Tipo",
    "cate": {
      "0": "Acesso anônimo",
      "1": "Acesso autenticado",
      "2": "Acesso autorizado"
    },
    "bgids": "Grupos de negócio autorizados",
    "theme_link": {
      "dark": "Link com tema escuro",
      "light": "Link com tema claro"
    }
  },
  "sharing_link": {
    "title": "Gerar link de compartilhamento",
    "title_anonymous": "Gerar link de compartilhamento (acesso anônimo)",
    "allow_anonymous": "Permitir acesso anônimo sem login",
    "expire_at": "Validade",
    "theme": "Tema",
    "theme_default": "Seguir o sistema",
    "theme_dark": "Escuro",
    "theme_light": "Claro",
    "note": "Observação",
    "note_placeholder": "Observação (obrigatória), por exemplo: para o cliente visualizar",
    "generate": "Gerar link",
    "link": "Link de compartilhamento",
    "expire_time": "Expira em",
    "expired": "Expirado",
    "create_by": "Criado por",
    "revoke": "Revogar",
    "revoke_confirm": "Revogar invalida o link imediatamente. Confirma?",
    "revoked": "Revogado",
    "anonymous_tip": "Durante a validade, o link anônimo permite ver este dashboard sem login e consultar os dados das fontes referenciadas. Compartilhe com cuidado",
    "recommend_tip": "O acesso anônimo se dá pelo link abaixo, que durante a validade dispensa login. Para deixá-lo público por muito tempo, escolha a validade em anos",
    "unit_hour": "Horas",
    "unit_day": "Dias",
    "unit_month": "Meses",
    "unit_year": "Anos",
    "fetch_failed": "Falha ao carregar a lista de links de compartilhamento",
    "generate_failed": "Falha ao gerar o link de compartilhamento",
    "expire_out_of_range": "A validade excede o intervalo exibível (equivale a nunca expirar); revogue e gere novamente",
    "set_public_confirm_title": "Também definir este painel como \"Público - Acesso anônimo\"?",
    "set_public_confirm_content":
      "Um link de compartilhamento abre este painel sem login assim que é gerado e continua válido independentemente da configuração de publicação. Se essa configuração não for atualizada, a coluna \"Público\" da lista não mostrará acesso anônimo e os administradores não saberão que o painel está exposto. Ao confirmar, a configuração é salva primeiro como \"Público - Acesso anônimo\" e então o link é gerado.",
    "set_public_confirm_ok": "Definir acesso anônimo e gerar",
    "set_public_failed": "Falha ao salvar a configuração de publicação; nenhum link foi gerado",
    "revoke_failed": "Falha ao revogar o link de compartilhamento",
    "config_load_failed": "Falha ao ler a configuração do dashboard; não é possível definir o acesso anônimo agora. Feche e tente novamente",
    "revoke_all_confirm_title": "Revogar todos os links anônimos de compartilhamento?",
    "revoke_all_confirm_content": "Este dashboard ainda tem {{num}} links anônimos válidos. A validade dos links independe da configuração de visibilidade: mesmo após a mudança, eles continuariam abrindo o dashboard sem login. Ao confirmar, todos os links deste dashboard serão revogados e a configuração será salva. A revogação não pode ser desfeita.",
    "revoke_all_ok": "Revogar e salvar",
    "revoke_all_check_failed": "Não foi possível verificar se restam links anônimos; a configuração de visibilidade foi salva. Abra a janela de links de compartilhamento para conferir manualmente"
  },
  "default_filter": {
    "title": "Filtros predefinidos",
    "public": "Dashboards públicos",
    "all": "Dashboards dos meus grupos de negócio",
    "all_tip": "Esta opção exibe todos os dashboards dos grupos de negócio a que você pertence"
  },
  "create_title": "Criar dashboard",
  "edit_title": "Editar dashboard",
  "add_panel": "Adicionar gráfico",
  "cluster": "Cluster",
  "full_screen": "Tela cheia",
  "exit_full_screen": "Sair da tela cheia",
  "copyPanelTip": "Configuração do gráfico copiada. Use \"Adicionar gráfico\" > \"Colar gráfico\" para criar um gráfico a partir do JSON",
  "batch": {
    "import": "Importar JSON de dashboard do Nightingale",
    "label": "JSON do dashboard",
    "import_grafana": "Importar dashboard do Grafana (não recomendado)",
    "import_grafana_tip": "Apenas dashboards com fontes de dados Prometheus e com os tipos de gráfico e recursos suportados pelo Nightingale podem ser importados <a>Relatar um problema</a>",
    "import_grafana_tip_version_error": "Não é possível importar configurações de dashboard anteriores à v7",
    "import_grafana_tip_version_warning": "Ao importar configurações anteriores à v8, alguns gráficos podem não ser suportados ou não renderizar corretamente",
    "import_grafana_url": "Link do dashboard do Grafana (recomendado)",
    "import_grafana_url_label": "Link do dashboard do Grafana",
    "continueToImport": "Continuar a importação",
    "noSelected": "Selecione o dashboard",
    "import_builtin": "Importar dashboards internos",
    "import_builtin_board": "Dashboards internos",
    "clone": {
      "name": "Nome",
      "result": "Resultado",
      "errmsg": "Mensagem de erro"
    }
  },
  "link": {
    "title": "Link do dashboard",
    "name": "Nome do link",
    "url": "Endereço do link",
    "isNewBlank": "Abrir em uma nova janela",
    "dashboardIds_placeholder": "Selecione o dashboard"
  },
  "var": {
    "vars": "Variável",
    "btn": "Adicionar variável",
    "title": {
      "list": "Lista de variáveis",
      "add": "Adicionar variável",
      "edit": "Editar variável"
    },
    "name": "Nome da variável",
    "name_msg": "Apenas letras, números e sublinhados são aceitos",
    "name_repeat_msg": "Este nome de variável já existe",
    "label": "Nome de exibição",
    "type": "Tipo da variável",
    "type_map": {
      "query": "Consulta (Query)",
      "custom": "Personalizado (Custom)",
      "textbox": "Caixa de texto (Text box)",
      "constant": "Constante (Constant)",
      "datasource": "Fonte de dados (Datasource)",
      "datasourceIdentifier": "Identificador da fonte de dados (Datasource identifier)",
      "hostIdent": "Identificador da máquina (Host ident)"
    },
    "hide": "Ocultar variável",
    "hide_map": {
      "yes": "Sim",
      "no": "Não"
    },
    "definition": "Definição da variável",
    "definition_msg1": "Informe a definição da variável",
    "definition_msg2": "A definição da variável precisa ser um JSON válido",
    "reg": "Expressão regular",
    "reg_tip": "Opcional: filtra as opções por expressão regular. Informe um <a>literal de expressão regular</a>, ou seja, um padrão entre barras",
    "reg_tip2": "Para extrair apenas parte de uma opção, <a>use grupos de captura nomeados para separar o texto exibido do valor</a>",
    "multi": "Seleção múltipla",
    "allOption": "Incluir a opção \"todos\"",
    "allValue": "Valor personalizado para \"todos\"",
    "width": "Largura",
    "width_tip": "Define a largura do seletor da variável; em branco, usa o padrão de 180px",
    "textbox": {
      "defaultValue": "Valor padrão",
      "defaultValue_tip": "Opcional: usado apenas como valor inicial no primeiro carregamento"
    },
    "custom": {
      "definition": "Valores personalizados separados por vírgula"
    },
    "constant": {
      "definition": "Valor da constante",
      "defaultValue_tip": "Define um valor constante oculto"
    },
    "datasource": {
      "definition": "Tipo de fonte de dados",
      "defaultValue": "Valor padrão",
      "regex": "Filtro de fontes de dados",
      "regex_tip": "Opcional: filtra as opções por expressão regular. Informe um <a>literal de expressão regular</a>, ou seja, um padrão entre barras."
    },
    "hostIdent": {
      "invalid": "O identificador da máquina exige acesso autorizado; em modo anônimo o dashboard falhará ao carregar",
      "invalid2": "Este dashboard usa uma variável de identificador de máquina e não pode ser acessado anonimamente"
    },
    "help_tip": "\n      Como usar as variáveis\n      <1 />\n      ${variable_name}: valor da variável do dashboard\n      <1 />\n      ${__field.name}: nome da série na legenda\n      <1 />\n      ${__field.value}: valor da série na legenda\n      <1 />\n      ${__field.labels.X}: valor do rótulo\n      <1 />\n      ${__field.labels.__name__}: nome da métrica\n      <1 />\n      ${__interval}: intervalo em segundos, por exemplo 15s; o padrão é o passo\n      <1 />\n      ${__interval_ms}: intervalo em milissegundos, por exemplo 15000\n      <1 />\n      ${__range}: janela de tempo em segundos, por exemplo 3600s\n      <1 />\n      ${__range_ms}: janela de tempo em milissegundos, por exemplo 3600000\n      <1 />\n      ${__rate_interval}: intervalo em segundos, __interval * 4\n      <1 />\n      ${__from}: início do intervalo em milissegundos\n      <1 />\n      ${__from_date_seconds}: início do intervalo em segundos\n      <1 />\n      ${__from_date_iso}: início do intervalo em ISO 8601/RFC 3339\n      <1 />\n      A mesma sintaxe vale para ${__to}\n    ",
    "help_tip_table_ng": "\n      Como usar as variáveis\n      <br />\n      ${variable_name}: valor da variável do dashboard\n      <br />\n      ${__row.column_name}: valor de uma coluna da linha\n      <br />\n      ${__interval}: intervalo em segundos, por exemplo 15s; o padrão é o passo\n      <br />\n      ${__interval_ms}: intervalo em milissegundos, por exemplo 15000\n      <br />\n      ${__range}: janela de tempo em segundos, por exemplo 3600s\n      <br />\n      ${__range_ms}: janela de tempo em milissegundos, por exemplo 3600000\n      <br />\n      ${__rate_interval}: intervalo em segundos, __interval * 4\n      <br />\n      ${__from}: início do intervalo em milissegundos\n      <br />\n      ${__from_date_seconds}: início do intervalo em segundos\n      <br />\n      ${__from_date_iso}: início do intervalo em ISO 8601/RFC 3339\n      <br />\n      A mesma sintaxe vale para ${__to}\n    "
  },
  "row": {
    "edit_title": "Editar grupo",
    "delete_title": "Excluir grupo",
    "name": "Nome do grupo",
    "delete_confirm": "Confirma a exclusão do grupo?",
    "cancel": "Cancelar",
    "ok": "Excluir o grupo e os gráficos",
    "ok2": "Excluir apenas o grupo",
    "panels": "{{count}} gráficos",
    "panels_plural": "{{count}} gráficos"
  },
  "panel": {
    "title": {
      "add": "Adicionar gráfico",
      "edit": "Editar gráfico"
    },
    "base": {
      "title": "Configuração do painel",
      "name": "Título",
      "name_tip": "Gráficos do tipo tabela precisam de um título; sem ele a edição do painel conflita com o cabeçalho da tabela",
      "link": {
        "label": "Link",
        "label_tip": "\n          Como usar as variáveis<br />\n          ${variable_name}: valor da variável do dashboard\n        ",
        "btn": "Adicionar",
        "name": "Nome do link",
        "name_msg": "Informe o nome do link",
        "url": "Endereço do link",
        "url_msg": "Informe o endereço do link",
        "isNewBlank": "Abrir em uma nova janela"
      },
      "description": "Observação",
      "repeatOptions": {
        "title": "Repetição de gráfico",
        "byVariable": "Variável",
        "byVariableTip": "Repete o gráfico para cada valor da variável",
        "maxPerRow": "Máximo por linha"
      }
    },
    "options": {
      "legend": {
        "displayMode": {
          "label": "Modo de exibição",
          "table": "Tabela",
          "list": "Lista",
          "hidden": "Oculto"
        },
        "placement": "Posição",
        "max": "Máximo",
        "min": "Mínimo",
        "avg": "Média",
        "sum": "Total",
        "last": "Valor atual",
        "variance": "Variância",
        "stdDev": "Desvio padrão",
        "series": "Séries",
        "seriesFilter": "Filtrar séries",
        "columns": "Colunas exibidas",
        "none": "Nenhum",
        "behaviour": {
          "label": "Ação ao clicar",
          "showItem": "Mostrar item",
          "hideItem": "Ocultar item"
        },
        "selectMode": {
          "label": "Modo de seleção",
          "single": "Seleção única",
          "multiple": "Seleção múltipla"
        },
        "heightInPercentage": "Altura em porcentagem",
        "sortBy": "Coluna de ordenação",
        "sortBy_tip": "Escolha a coluna estatística usada na ordenação; sem escolha, nada é ordenado",
        "sortDir": "Sentido da ordenação",
        "sortDirAsc": "Crescente",
        "sortDirDesc": "Decrescente",
        "heightInPercentage_tip": "Altura máxima da legenda em relação ao painel, entre 20% e 80%",
        "widthInPercentage": "Largura em porcentagem",
        "widthInPercentage_tip": "Largura máxima da legenda em relação ao painel, entre 20% e 80%"
      },
      "thresholds": {
        "title": "Limiar",
        "btn": "Adicionar limiar",
        "mode": {
          "label": "Modo do limiar",
          "tip": "No modo percentual o cálculo é: mínimo do eixo Y + (máximo do eixo Y − mínimo do eixo Y) × (percentual / 100)",
          "absolute": "Valor absoluto",
          "percentage": "Percentual"
        }
      },
      "thresholdsStyle": {
        "label": "Estilo do limiar",
        "off": "Desativado",
        "line": "Linha",
        "dashed": "Linha tracejada",
        "line+area": "Linha + área",
        "dashed+area": "Linha tracejada + área"
      },
      "tooltip": {
        "mode": "Modo",
        "sort": "Ordenação"
      },
      "valueMappings": {
        "title": "Mapeamento de valores",
        "btn": "Adicionar",
        "type": "Condição",
        "type_tip": "\n          <0>Padrão do intervalo: from=-Infinity; to=Infinity </0>\n          <1>Sobre o valor especial Null: corresponde a null, undefined ou ausência de dados</1>\n        ",
        "type_map": {
          "special": "Valor fixo (numérico)",
          "textValue": "Valor fixo (texto)",
          "range": "Intervalo",
          "specialValue": "Valor especial"
        },
        "value_placeholder": "Valor de correspondência exata",
        "text": "Texto exibido",
        "text_placeholder": "Opcional",
        "color": "Cor",
        "operations": "Ações"
      },
      "colors": {
        "name": "Configuração de cores",
        "scheme": "Paleta de cores",
        "reverse": "Inverter cores"
      },
      "links": {
        "label": "Link",
        "add_btn": "Adicionar link",
        "edit_btn": "Editar link",
        "title": "Título do link",
        "title_required": "O título do link não pode ficar vazio",
        "url": "Endereço do link",
        "url_required": "O endereço do link não pode ficar vazio",
        "target_blank": "Abrir em nova janela"
      }
    },
    "standardOptions": {
      "title": "Configurações avançadas",
      "unit": "Unidade",
      "unit_tip": "\n        <0>Por padrão os prefixos SI são aplicados; escolha none para desativá-los</0>\n        <1>Data(SI): base 1000, unidades B, kB, MB, GB, TB, PB, EB, ZB, YB</1>\n        <2>Data(IEC): base 1024, unidades B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB</2>\n        <3>bits: b</3>\n        <4>bytes: B</4>\n      ",
      "datetime": "Formato de data/hora",
      "min": "Mínimo",
      "max": "Máximo",
      "decimals": "Casas decimais",
      "displayName": "Nome de exibição",
      "displayName_tip": "Nome personalizado da série"
    },
    "overrides": {
      "columnWidth": "Largura da coluna",
      "matcher": {
        "id": "Tipo de correspondência",
        "byFrameRefID": {
          "option": "Pelo nome da consulta",
          "name": "Nome da consulta"
        },
        "byName": {
          "option": "Pelo nome do campo",
          "name": "Nome do campo"
        }
      }
    },
    "custom": {
      "title": "Estilo do gráfico",
      "calc": "Cálculo do valor",
      "calc_tip": "Séries temporais precisam de um cálculo sobre todos os pontos; dados que não são séries temporais ignoram esta opção",
      "maxValue": "Máximo",
      "baseColor": "Cor base",
      "serieWidth": "Largura do nome",
      "sortOrder": "Ordenação",
      "textMode": "Conteúdo exibido",
      "valueAndName": "Valor e nome",
      "value": "Valor",
      "name": "Nome",
      "background": "Plano de fundo",
      "colorMode": "Modo de cor",
      "valueField": "Campo de valor",
      "valueField_tip": "Value é uma palavra reservada: é o nome do campo resultante do cálculo sobre a série temporal",
      "valueField_tip2": "Escolha um campo cujo valor seja numérico",
      "nameField": "Campo de nome",
      "nameField_tip": "Usa o valor do campo de nome como nome da série",
      "colSpan": "Máximo por linha",
      "colSpanTip": "Prestes a ser descontinuado; ao escolher \"Automático\", a orientação definida abaixo é usada",
      "colSpanAuto": "Automático",
      "textSize": {
        "title": "Tamanho da fonte do título",
        "value": "Tamanho da fonte do valor"
      },
      "colorRange": "Cor",
      "reverseColorOrder": "Inverter cores",
      "colorDomainAuto": "Mínimo/máximo automáticos",
      "colorDomainAuto_tip": "Por padrão, o mínimo e o máximo são obtidos automaticamente das séries",
      "fontBackground": "Cor de fundo do texto",
      "detailName": "Nome do link",
      "detailUrl": "Endereço do link",
      "stat": {
        "graphMode": "Modo do gráfico",
        "none": "Não exibir",
        "area": "Minigráfico",
        "orientation": "Orientação do layout",
        "orientationTip": "Com \"Automático\", a orientação é escolhida conforme a largura e a altura do gráfico",
        "orientationValueMap": {
          "auto": "Automático",
          "vertical": "Vertical",
          "horizontal": "Horizontal"
        }
      },
      "pie": {
        "countOfValueField": "Contagem do campo de valor",
        "countOfValueField_tip": "Quando ativado, os valores do campo de valor são contados; caso contrário, eles são exibidos como estão",
        "legengPosition": "Posição da legenda",
        "max": "Máximo de blocos exibidos",
        "max_tip": "Os blocos excedentes são agrupados em \"Outros\"",
        "donut": "Modo rosca",
        "labelWithName": "Incluir o nome no rótulo",
        "labelWithValue": "Exibir o valor da métrica no rótulo",
        "detailName": "Nome do link",
        "detailUrl": "Endereço do link"
      },
      "table": {
        "displayMode": "Modo de exibição",
        "showHeader": "Exibir cabeçalho",
        "seriesToRows": "Cada linha mostra o valor da série",
        "labelsOfSeriesToRows": "Cada linha mostra o valor dos rótulos",
        "labelValuesToRows": "Cada linha mostra o valor da dimensão de agregação escolhida",
        "columns": "Colunas exibidas",
        "aggrDimension": "Dimensões exibidas",
        "sortColumn": "Coluna de ordenação padrão",
        "sortOrder": "Ordenação padrão",
        "link": {
          "mode": "Modo de link",
          "cellLink": "Link na célula",
          "appendLinkColumn": "Adicionar coluna de links"
        },
        "tableLayout": {
          "label": "Layout da tabela",
          "label_tip": "No layout fixo as colunas dividem a largura igualmente e não há rolagem horizontal. No layout automático cada coluna tem no máximo 150px, e o conteúdo pode transbordar, gerando rolagem horizontal.",
          "auto": "Automático",
          "fixed": "Fixo"
        },
        "nowrap": "Não quebrar linha nas células",
        "organizeFields": "Organização dos campos",
        "colorMode_tip": "O modo de cor se aplica ao campo de valor. No modo valor a cor pinta o texto; no modo plano de fundo, a cor pinta a célula.",
        "pageLimit": "Linhas por página"
      },
      "tableNG": {
        "enablePagination": "Ativar paginação",
        "showHeader": "Exibir cabeçalho",
        "filterable": "Ativar filtro de colunas",
        "sortColumn": "Coluna de ordenação padrão",
        "sortOrder": "Ordenação padrão",
        "enableRowDetail": "Ativar detalhes da linha",
        "enableRowDetail_tip": "Quando ativado, a primeira coluna exibe um ícone de detalhes. Ao clicar nele, um painel lateral mostra todos os campos e valores da linha, com opção de copiar a linha inteira ou campos isolados.",
        "rowDetail": {
          "triggerTip": "Ver detalhes da linha",
          "title": "Detalhes",
          "tableTab": "Tabela",
          "jsonTab": "JSON",
          "field": "Campo",
          "value": "Valor",
          "copyRow": "Copiar a linha inteira",
          "copyFieldAndValue": "Copiar campo e valor",
          "copyFieldValue": "Copiar o valor do campo"
        },
        "cellOptions": {
          "type": {
            "label": "Tipo de célula",
            "options": {
              "none": "Padrão",
              "color-text": "Texto colorido",
              "color-background": "Fundo colorido",
              "gauge": "Medidor (Gauge)"
            }
          },
          "wrapText": "Quebra de texto",
          "wrapText_tip": "Quando ativado, o texto da célula quebra automaticamente e a altura da linha se ajusta ao número de linhas de texto; com muitos dados isso afeta o desempenho",
          "color-background": {
            "mode": {
              "label": "Modo de cor",
              "options": {
                "basic": "Básico",
                "gradient": "Gradiente"
              }
            }
          },
          "gauge": {
            "mode": {
              "label": "Modo",
              "options": {
                "basic": "Básico",
                "gradient": "Gradiente",
                "lcd": "LCD"
              }
            },
            "valueDisplayMode": {
              "label": "Exibição do valor",
              "options": {
                "color": "Cor",
                "text": "Texto",
                "hidden": "Oculto"
              }
            }
          }
        }
      },
      "text": {
        "textColor": "Cor do texto",
        "textDarkColor": "Cor do texto no tema escuro",
        "bgColor": "Cor de fundo",
        "textSize": "Tamanho do texto",
        "justifyContent": {
          "name": "Alinhamento horizontal",
          "unset": "Não definir",
          "flexStart": "À esquerda",
          "center": "Centralizado",
          "flexEnd": "À direita"
        },
        "alignItems": {
          "name": "Alinhamento vertical",
          "unset": "Não definir",
          "flexStart": "Ao topo",
          "center": "Centralizado",
          "flexEnd": "À base"
        },
        "content": "Conteúdo",
        "content_placeholder": "Markdown e HTML são suportados",
        "content_tip": "\n          <0>O modo simples é o padrão; use as opções acima para ajustar o estilo do cartão</0>\n          <1>Markdown e HTML são suportados</1>\n          <2>Ao usar Markdown ou HTML, recomendamos desativar as opções de alinhamento acima</2>\n        "
      },
      "timeseries": {
        "drawStyle": "Modo de desenho",
        "lineInterpolation": "Interpolação da linha",
        "spanNulls": "Conectar valores nulos",
        "spanNulls_0": "Desativado",
        "spanNulls_1": "Ativado",
        "lineWidth": "Espessura da linha",
        "fillOpacity": "Opacidade",
        "gradientMode": "Gradiente",
        "gradientMode_opacity": "Ativado",
        "gradientMode_none": "Desativado",
        "stack": "Empilhamento",
        "stack_normal": "Ativado",
        "stack_off": "Desativado",
        "yAxis": {
          "title": "Configuração do eixo Y",
          "rightYAxis": {
            "label": "Exibir eixo Y à direita",
            "normal": "Ativado",
            "off": "Desativado"
          }
        },
        "showPoints": "Exibir pontos",
        "showPoints_always": "Exibir",
        "showPoints_none": "Não exibir",
        "pointSize": "Tamanho do ponto"
      },
      "iframe": {
        "src": "Endereço do iframe"
      },
      "heatmap": {
        "xAxisField": "Eixo X",
        "yAxisField": "Eixo Y",
        "valueField": "Coluna numérica"
      },
      "barchart": {
        "xAxisField": "Eixo X",
        "yAxisField": "Eixo Y",
        "colorField": "Campo de cor",
        "barMaxWidth": "Largura máxima da barra",
        "colorField_tip": "Name é uma palavra reservada: é o nome do campo que contém o nome da série"
      },
      "barGauge": {
        "topn": "Máximo de posições",
        "combine_other": "Outros",
        "combine_other_tip": "Os dados além do limite são agrupados em um item \"Outros\"",
        "otherPosition": {
          "label": "Posição do item \"Outros\"",
          "tip": "Posição do item \"Outros\": no início ou no fim",
          "options": {
            "none": "Padrão",
            "top": "No início",
            "bottom": "No fim"
          }
        },
        "displayMode": "Modo de exibição",
        "valueMode": {
          "label": "Exibição do valor",
          "color": "Exibir",
          "hidden": "Ocultar"
        }
      }
    },
    "inspect": {
      "title": "Diagnosticar",
      "query": "Consulta",
      "json": "Configuração do gráfico"
    }
  },
  "export": {
    "copy": "Copiar o JSON para a área de transferência"
  },
  "query": {
    "title": "Condição de consulta",
    "add_query_btn": "Adicionar consulta",
    "add_expression_btn": "Adicionar expressão",
    "transform": "Transformação de dados",
    "datasource_placeholder": "Selecione a fonte de dados",
    "datasource_msg": "Selecione a fonte de dados",
    "time": "Seleção de tempo",
    "time_tip": "É possível definir um intervalo próprio; por padrão vale o intervalo global do dashboard",
    "es": {
      "field_key_msg": "É obrigatório informar a chave do campo"
    },
    "prometheus": {
      "query": "Consulta (PromQL)",
      "maxDataPoints": {
        "tip": "Número máximo de pontos por série; o padrão é a largura do painel (240 ao criar). O passo é calculado como step = (end − start) / maxDataPoints",
        "tip_2": "Número máximo de pontos por série; o padrão é a largura do painel. O passo é calculado como step = (end − start) / maxDataPoints"
      },
      "minStep": {
        "label": "Passo mínimo (Min step)",
        "tip": "Passo mínimo, 15 por padrão. O cálculo é step = max(step, minStep, safeStep), com safeStep = (end − start) / 11000"
      },
      "step": {
        "tag_tip": "O cálculo é step = max((end − start) / maxDataPoints, minStep, safeStep), com safeStep = (end − start) / 11000"
      },
      "instant": {
        "label": "Consulta instantânea (Instant)",
        "tip": "Consulta os dados no instante final, retornando um único ponto"
      }
    },
    "expression_placeholder": "Aplica operações matemáticas a uma ou mais consultas. Referencie-as por ${refId}, ou seja, $A, $B, $C etc. Soma de dois escalares: $A + $B > 10",
    "legend": "Legenda (Legend)",
    "legendTip": "Substitui ou define o nome exibido na legenda; por exemplo, {{hostname}} é trocado pelo valor do rótulo hostname",
    "legendTip2": "Substitui ou define o nome exibido na legenda; por exemplo, {{hostname}} é trocado pelo valor do rótulo hostname. No momento vale apenas para séries temporais",
    "options": "Opções da consulta",
    "options_max_data_points": "Máximo de pontos de dados",
    "options_max_data_points_tip": "Número máximo de pontos por série; o padrão é a largura do painel (240 ao criar). Usado no cálculo step = (end − start) / maxDataPoints",
    "options_time": "Intervalo da consulta",
    "options_time_tip": "É possível definir um intervalo próprio para a consulta; por padrão vale o intervalo global do dashboard",
    "copy_query": "Duplicar consulta",
    "mixed_datasource": "Misturar fontes de dados",
    "hide_response": "Ocultar o resultado da consulta"
  },
  "migrate": {
    "title": "Migrar dashboards",
    "close_and_dismiss": "Fechar e não mostrar novamente",
    "batch_migrate": "Ir para a migração em lote de dashboards",
    "migrate_current": "Migrar este dashboard",
    "desc_1": "A versão v6 deixa de suportar a troca global de cluster Prometheus; nas versões novas, associe os gráficos a uma variável de fonte de dados para obter o mesmo efeito.",
    "desc_2": "A ferramenta de migração cria a variável de fonte de dados e a associa a todos os gráficos que ainda não têm uma."
  },
  "detail": {
    "ai_analysis": "Análise por IA",
    "datasource_empty": "Nenhuma fonte de dados encontrada; configure uma primeiro",
    "invalidTimeRange": "Valores de __from e __to inválidos",
    "invalidDatasource": "Fonte de dados inválida",
    "invalidPanelConfig": "Configuração de gráfico inválida",
    "deletePanel_confirm": "Excluir o gráfico {{name}}?",
    "invalidPanelType": "Tipo de gráfico inválido",
    "fullscreen": {
      "notification": {
        "esc": "Pressione ESC para sair da tela cheia",
        "theme": "Alternar tema"
      }
    },
    "saved": "Salvo com sucesso",
    "expired": "Este dashboard foi alterado por outra pessoa. Atualize-o para ver a configuração e os dados mais recentes e evitar sobrescrever o trabalho alheio",
    "prompt": {
      "title": "Há alterações não salvas",
      "message": "Deseja salvar as alterações?",
      "cancelText": "Cancelar",
      "discardText": "Descartar",
      "okText": "Salvar"
    },
    "importPanel": {
      "invalidJSON": "O JSON de configuração do gráfico é inválido",
      "placeholder": "Cole o JSON de configuração do gráfico. Para obtê-lo, use \"Copiar\" no menu de mais ações, no canto superior direito do painel"
    }
  },
  "settings": {
    "graphTooltip": {
      "label": "Dica (Tooltip)",
      "tip": "Controla o comportamento das dicas (tooltip) em todos os gráficos",
      "default": "Padrão",
      "sharedCrosshair": "Cursor compartilhado",
      "sharedTooltip": "Dica compartilhada (Tooltip)"
    },
    "graphZoom": {
      "label": "Comportamento do zoom",
      "tip": "Controla o comportamento do zoom em todos os gráficos",
      "default": "Padrão",
      "updateTimeRange": "Atualizar o intervalo de tempo"
    },
    "save": "Salvar dashboard"
  },
  "visualizations": {
    "timeseries": "Gráfico de série temporal",
    "barchart": "Gráfico de barras",
    "stat": "Valor da métrica",
    "table": "Tabela",
    "tableNG": "Tabela NG (Beta)",
    "pie": "Gráfico de pizza",
    "hexbin": "Gráfico de favo de mel",
    "barGauge": "Ranking",
    "text": "Cartão de texto",
    "gauge": "Medidor",
    "heatmap": "Mapa de blocos",
    "iframe": "Documento incorporado (iframe)",
    "row": "Grupo",
    "importPanel": "Colar gráfico"
  },
  "calcs": {
    "lastNotNull": "Último valor não nulo",
    "last": "Último valor",
    "firstNotNull": "Primeiro valor não nulo",
    "first": "Primeiro valor",
    "min": "Mínimo",
    "max": "Máximo",
    "avg": "Média",
    "sum": "Soma",
    "count": "Quantidade",
    "origin": "Valor bruto",
    "variance": "Variância",
    "stdDev": "Desvio padrão"
  },
  "annotation": {
    "add": "Adicionar anotação",
    "edit": "Editar anotação",
    "description": "Descrição",
    "tags": "Rótulos",
    "updated": "Anotação atualizada",
    "deleted": "Anotação excluída"
  },
  "transformations": {
    "organize": {
      "title": "Organize fields by name",
      "desc": "Reordena, oculta ou renomeia campos"
    },
    "merge": {
      "title": "Merge tables",
      "desc": "Une várias tabelas em uma só"
    },
    "joinByField": {
      "title": "Join by field",
      "desc": "Une as linhas de várias tabelas pelos campos relacionados",
      "mode": "Modo",
      "byField": "Campo"
    },
    "timeSeriesTable": {
      "title": "Time series to table",
      "desc": "Reduz os valores de todos os pontos de uma série temporal a um único valor",
      "fieldName": "Campo",
      "functions": "Método"
    },
    "groupedAggregateTable": {
      "title": "Grouped aggregate table",
      "desc": "Agrupa a tabela por um ou mais campos e agrega os demais",
      "operation_map": {
        "aggregate": "Cálculo",
        "groupby": "Grupo"
      }
    }
  },
  "add_transformation": "Adicionar transformação de dados"
};

export default pt_BR;

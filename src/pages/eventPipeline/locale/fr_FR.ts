const fr_FR = {
  "title": "Workflows",
  "title_add": "Ajouter un workflow",
  "title_edit": "Modifier le workflow",
  "title_clone": "Dupliquer le workflow",
  "teams": "Équipes autorisées",
  "teams_tip": "Détermine quels membres d'équipe peuvent consulter et modifier cette configuration ; plusieurs équipes peuvent être associées<br />Par exemple, si la configuration est confiée à infra-team, seuls les membres de cette équipe pourront y accéder ou l'ajuster.",
  "basic_configuration": "Configuration de base",
  "filter_enable": "Filtre",
  "label_filters": "Étiquettes concernées",
  "label_filters_tip": "Définit le filtre d'étiquettes du traitement : seuls les événements portant des étiquettes correspondantes sont traités.<br />Exemple : avec service=mon, seuls les événements étiquetés service=mon entrent dans ce traitement.",
  "attribute_filters": "Attributs concernés",
  "attribute_filters_tip": "Définit le filtre d'attributs du traitement : seuls les événements dont les attributs correspondent sont traités.<br />Exemple : avec groupe métier == DefaultBusiGroup, seuls les événements dont l'attribut groupe métier vaut DefaultBusiGroup entrent dans ce traitement.",
  "attribute_filters_value": "Valeur de l'attribut",
  "attribute_filters_options": {
    "group_name": "Groupe métier",
    "cluster": "Source de données",
    "is_recovered": "Est-ce un événement de résolution ?",
    "severity": "Gravité de l'alerte"
  },
  "use_case": {
    "label": "Usage",
    "firemap": "Tableau d'intervention",
    "event_pipeline": "Traitement de l'événement"
  },
  "processors_col": "Processeur",
  "clone_suffix": "-copie",
  "unsaved_confirm": "Des modifications ne sont pas enregistrées. Fermer quand même ?",
  "search_placeholder": "Rechercher par nom, remarque ou type de processeur",
  "empty_guide": {
    "title": "Aucun workflow",
    "doc": "Consulter la documentation",
    "mount_hint": "Un workflow ne s'exécute pas du seul fait d'exister : il faut le référencer dans une règle d'alerte ou de notification"
  },
  "scenario_tips": {
    "title": "Les workflows conviennent à trois usages",
    "denoise": "Réduction du bruit : rejeter ou inhiber les alertes de faible gravité ou répétitives avant notification",
    "enrich": "Enrichissement : compléter l'alerte par des étiquettes métier, un résumé produit par l'IA ou du contexte issu d'une requête",
    "dispatch": "Appels sortants : transmettre l'alerte à un système de tickets ou d'automatisation, ou déclencher un script d'autoréparation",
    "more": "En savoir plus"
  },
  "trigger_mode": {
    "label": "Mode de déclenchement",
    "event": "Par événement",
    "api": "Par API"
  },
  "disabled": {
    "filter_placeholder": "État d'activation",
    "form_label": "Activer",
    "label": "Activer",
    "false": "Activer",
    "true": "Désactiver"
  },
  "inputs": {
    "label": "Variables d'entrée",
    "help": "Les variables d'entrée se référencent dans les processeurs ci-dessous via {{$inputs.nom_de_variable}}. Définissez par exemple une variable ident et référencez-la par {{$inputs.ident}} dans un processeur pour désigner la machine où exécuter le script.",
    "add_btn": "Ajouter une variable",
    "key": "Nom de la variable",
    "key_required": "Le nom de la variable est obligatoire",
    "value": "Valeur par défaut de la variable",
    "description": "Description de la variable"
  },
  "executions": {
    "title": "Journal des exécutions",
    "search_placeholder": "Saisissez un mot-clé",
    "status": {
      "label": "État",
      "running": "En cours",
      "success": "Réussi",
      "failed": "Échec",
      "terminated": "Interrompu",
      "skipped": "Ignoré",
      "streaming": "Diffusion en cours"
    },
    "id": "ID d'exécution",
    "pipeline_name": "Nom du workflow",
    "mode": "Mode de déclenchement",
    "created_at": "Début",
    "finished_at": "Fin",
    "duration_ms": "Durée d'exécution",
    "trigger_by": "Déclenché par",
    "detail_title": "Détail de l'exécution",
    "detail_basic_info": "Informations générales",
    "error_message": "Message d'erreur",
    "message": "Message d'exécution",
    "error_node": "Nœud en erreur",
    "inputs_snapshot": "Instantané des variables d'entrée",
    "node_results_parsed_title": "Résultat par nœud",
    "event_id": "ID de l'événement",
    "view_all": "Tout voir",
    "filtered_by": "Workflow : {{name}}",
    "trigger_by_alert_rule": "Règle d'alerte n° {{id}}",
    "trigger_by_notify_rule": "Règle de notification n° {{id}}",
    "empty_guide": {
      "title": "Aucune exécution sur cette période",
      "desc": "Chaque exécution déclenchée par une règle d'alerte ou de notification est consignée ici. Élargissez la plage horaire ci-dessus ou assouplissez les filtres."
    }
  },
  "test_modal": {
    "title": {
      "settings": "Choisir un événement de test",
      "result": "Résultat de l'essai"
    },
    "result_success": "Exécution réussie",
    "result_failed": "Échec de l'exécution",
    "dropped": "L'événement a été rejeté ou inhibé à cette étape : les processeurs suivants ne s'exécutent pas et aucune notification n'est produite",
    "steps_title": "Résultat nœud par nœud",
    "event_preview_title": "Événement après traitement",
    "back_btn": "Choisir un autre événement",
    "back_btn_mock": "Reconfigurer l'événement d'exemple",
    "fidelity_note": "L'essai emprunte le chemin de déclenchement par API et saute une partie du parcours de production, comme l'évaluation des filtres. Le résultat peut donc différer d'une vraie alerte : fiez-vous aux événements réels.",
    "fidelity_note_mock": "L'essai emprunte le chemin de déclenchement par API et saute une partie du parcours de production, comme l'évaluation des filtres. Il repose ici sur un événement d'exemple et non sur une vraie alerte : validez une dernière fois avec un événement réel avant la mise en production.",
    "mode": {
      "history": "Événements passés",
      "mock": "Événement d'exemple"
    },
    "mock": {
      "desc": "L'événement d'exemple est composé par le système et n'est pas enregistré en base, ce qui permet de vérifier la configuration des processeurs même sur un environnement neuf sans historique d'alertes. Sa gravité et son état de résolution sont modifiables afin de couvrir les processeurs qui s'appuient sur l'un ou l'autre.",
      "preview_title": "Événement d'exemple",
      "severity": "Niveau d'alerte",
      "is_recovered": "Événement de résolution",
      "tags": "Étiquettes de l'événement",
      "empty_alert": "Aucun événement d'alerte sur cette période",
      "switch_btn": "Essayer avec un événement d'exemple"
    }
  },
  "batch": {
    "not_select": "Choisissez d'abord les workflows concernés",
    "export": {
      "title": "Exporter en masse"
    },
    "delete": "Supprimer en masse",
    "enable": "Activer en masse",
    "disable": "Désactiver en masse",
    "already_enabled": "Tous les workflows sélectionnés sont déjà actifs",
    "already_disabled": "Tous les workflows sélectionnés sont déjà désactivés",
    "enable_confirm": "Activer les {{count}} workflows sélectionnés ?",
    "disable_confirm": "Désactiver les {{count}} workflows sélectionnés ?",
    "delete_enabled_confirm": "{{count}} d'entre eux sont encore actifs : ils seront désactivés avant d'être supprimés. Continuer ?",
    "delete_confirm": "Supprimer les {{count}} workflows sélectionnés ? Les règles d'alerte et de notification qui les référencent cesseront de fonctionner."
  },
  "relabel_fields": {
    "action": "Action",
    "target_label": "Étiquette cible",
    "replacement": "Valeur de l'étiquette",
    "source_labels": "Étiquettes sources",
    "separator": "Séparateur",
    "regex": "Expression régulière",
    "replace_hint": "replace extrait la valeur des étiquettes sources selon l'expression régulière et l'écrit dans l'étiquette cible. Si vous ne renseignez que l'étiquette cible et sa valeur, l'événement reçoit simplement une étiquette fixe. Sans étiquette cible, ce processeur n'a aucun effet."
  },
  "processor_message": {
    "drop_hit": "La condition de rejet est remplie : l'événement a été rejeté",
    "drop_miss": "La condition de rejet n'est pas remplie : l'événement poursuit son parcours",
    "no_change": "Aucun changement"
  },
  "processor": {
    "title": "Processeur",
    "add_btn": "Ajouter un processeur",
    "typ": "Type",
    "typ_required": "Choisissez un type de processeur ; sans type, le processeur échoue sur chaque événement",
    "help_btn": "Mode d'emploi",
    "options": {
      "relabel": "Réécriture des étiquettes",
      "label_enrich": "Enrichissement des étiquettes",
      "inhibit": "Inhibition d'événements",
      "event_drop": "Rejet d'événements",
      "event_update": "Mise à jour d'événements",
      "inhibit_qd": "Inhibition d'événements par requête",
      "annotation_qd": "Enrichissement des informations complémentaires par requête",
      "callback": "Rappel webhook",
      "ai_summary": "Résumé par IA",
      "script": "Exécution de script",
      "event_recover": "Autoréparation",
      "alert_shot": "Capture d'écran"
    },
    "category": {
      "rewrite": "Transformer l'événement",
      "denoise": "Réduire le bruit",
      "enrich": "Enrichir",
      "dispatch": "Appels sortants et exécution",
      "other": "Autres"
    },
    "options_desc": {
      "relabel": "Modifier, ajouter ou supprimer des étiquettes",
      "event_drop": "Rejeter l'événement selon une condition et arrêter son traitement",
      "event_update": "Appeler une API HTTP et mettre à jour l'événement avec la réponse",
      "callback": "Transmettre l'événement à un système externe, tickets ou automatisation",
      "ai_summary": "Produire un résumé de l'événement avec un grand modèle de langage",
      "label_enrich": "Compléter les étiquettes de l'événement à partir d'un dictionnaire intégré",
      "script": "Exécuter un script pour traiter l'événement",
      "inhibit": "Inhiber cette notification lorsqu'une alerte active de gravité supérieure existe",
      "inhibit_qd": "Inhiber l'événement selon le résultat d'une requête",
      "annotation_qd": "Attacher à l'événement le résultat d'une requête",
      "event_recover": "Déclencher une tâche d'autoréparation",
      "alert_shot": "Capturer un tableau de bord ou une page web et joindre l'image à l'alerte"
    },
    "delete_confirm": "Supprimer ce processeur ?",
    "switch_type_confirm": "Changer de type efface la configuration de ce processeur. Continuer ?",
    "drag_tip": "Faites glisser pour réordonner",
    "move_up": "Monter",
    "move_down": "Descendre",
    "copy_tip": "Dupliquer ce processeur"
  },
  "form_section": {
    "filter": {
      "title": "Périmètre de traitement",
      "desc": "Détermine quels événements d'alerte entrent dans ce workflow. Les conditions se combinent par ET ; toutes laissées vides, l'ensemble des événements est concerné"
    },
    "processor": {
      "title": "Processeur",
      "desc": "L'événement traverse les processeurs de haut en bas"
    },
    "basic": {
      "title": "Informations générales",
      "desc": "Nom du workflow, équipes autorisées et état d'activation"
    }
  },
  "no_filter_warning": "Aucun filtre n'est configuré : ce workflow traite tous les événements d'alerte",
  "section_summary": {
    "label_count": "{{count}} conditions d'étiquette",
    "attr_count": "{{count}} conditions d'attribut",
    "no_filter": "Tous les événements",
    "processor_count": "{{count}} processeurs",
    "unnamed": "Sans nom",
    "enabled": "Actif",
    "disabled": "Désactivé"
  },
  "name_auto": {
    "tip": "Le nom est généré à partir du périmètre et des processeurs ci-dessus, et reste modifiable à tout moment",
    "all": "Toutes les alertes",
    "arrow": "→",
    "joiner": "-"
  },
  "saved_guide": {
    "title": "Workflow enregistré",
    "hint": "Il ne fonctionne pas encore : les événements ne le traverseront qu'une fois référencé dans une règle de notification.",
    "to_notify_rule": "L'associer à une règle de notification",
    "done": "Terminer"
  },
  "label_enrich": {
    "label_source_type": {
      "label": "Source des étiquettes",
      "options": {
        "built_in_mapping": "Dictionnaire d'étiquettes intégré"
      }
    },
    "label_mapping_id": "Nom du dictionnaire",
    "help": "Le dictionnaire est interrogé à partir des étiquettes sources indiquées, puis les champs trouvés sont ajoutés à l'événement selon la configuration Ajouter une étiquette",
    "source_keys": {
      "label": "Étiquettes sources",
      "text": "Le champ <strong>{{field}}</strong> du dictionnaire correspond à une étiquette de l'événement",
      "target_key_placeholder": "Clé de l'étiquette",
      "target_key_required": "La clé de l'étiquette est obligatoire"
    },
    "append_keys": {
      "label": "Ajouter une étiquette",
      "source_key_placeholder": "Champ du dictionnaire",
      "rename_key": "Renommer la clé de l'étiquette",
      "target_key_placeholder": "Clé de l'étiquette"
    }
  },
  "callback": {
    "url": "URL",
    "advanced_settings": "Réglages avancés",
    "basic_auth_user": "Identifiant d'authentification",
    "basic_auth_user_placeholder": "Saisissez l'identifiant d'authentification",
    "basic_auth_pass": "Mot de passe d'authentification",
    "basic_auth_pass_placeholder": "Saisissez le mot de passe d'authentification"
  },
  "event_drop": {
    "hint": "L'événement est rejeté si le modèle produit true ; toute autre sortie le laisse passer. Variables disponibles : $event.Severity (1/2/3), $event.IsRecovered, $event.RuleName et $event.TagsMap.nom_etiquette",
    "snippets_label": "Insérer un exemple",
    "snippets": {
      "severity": "Rejeter les alertes de niveau info S3",
      "recovered": "Rejeter les notifications de résolution",
      "tag": "Rejeter selon une étiquette",
      "rule_name": "Rejeter selon le nom de la règle"
    },
    "replace_confirm": "La logique actuelle sera remplacée par l'exemple. Continuer ?",
    "content": "Logique d'évaluation",
    "content_placeholder": "Utilise la syntaxe go template : si le résultat final est true, l'événement est rejeté à cette étape"
  },
  "ai_summary": {
    "llm_config": "Réutiliser une configuration LLM",
    "llm_config_placeholder": "Choisissez un LLM déjà configuré, ou laissez vide pour renseigner vous-même les paramètres ci-dessous",
    "llm_config_tip": "Choisissez une configuration existante dans Configuration IA - Configuration LLM pour en reprendre le modèle, la clé et l'adresse. Laissée vide, ce sont les paramètres saisis ci-dessous qui s'appliquent.",
    "url_placeholder": "Saisissez l'URL du service d'API",
    "url_required": "Saisissez une URL",
    "api_key_placeholder": "Clé d'API",
    "api_key_required": "Saisissez la clé d'API",
    "model_name": "Nom du modèle",
    "model_name_placeholder": "Par exemple deepseek-chat",
    "model_name_required": "Saisissez le nom du modèle",
    "prompt_template": "Modèle de prompt",
    "prompt_template_required": "Saisissez le modèle de prompt",
    "advanced_config": "Configuration avancée",
    "custom_params": "Paramètres du modèle d'IA",
    "custom_params_key_label": "Nom du paramètre (par exemple temperature)",
    "custom_params_value_label": "Valeur du paramètre (par exemple 0.7)",
    "proxy_placeholder": "Par exemple http://proxy.example.com:8080",
    "timeout_placeholder": "Délai maximal (secondes)",
    "timeout_required": "Saisissez le délai maximal",
    "url_tip": "- **Description** : URL de l'API du service d'IA\n- **Exemple** : `https://api.deepseek.com/v1/chat/completions`",
    "api_key_tip": "- **Description** : clé d'API du fournisseur du service d'IA\n- **Où l'obtenir** :\n  - OpenAI : à demander sur le site officiel d'OpenAI\n  - DeepSeek : à obtenir en créant un compte sur le site officiel de DeepSeek",
    "model_name_tip": "- **Description** : nom du modèle d'IA à utiliser\n- **Modèles courants** :\n  - `gpt-3.5-turbo` (OpenAI)\n  - `gpt-4` (OpenAI)\n  - `deepseek-chat` (DeepSeek)",
    "prompt_template_tip": "Le modèle de prompt est au cœur de l'analyse par l'IA. Utilisez {{$event}} pour référencer les champs de l'événement ; leur structure complète est décrite dans la [table d'historique des alertes](https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/events/alert-history/). Pour débuter, le modèle par défaut suffit",
    "prompt_template_placeholder": "Analyse les informations de l'événement d'alerte ci-dessous et rédige un résumé clair et concis en français :\nRègle d'alerte : {{$event.RuleName}}\nGravité : {{$event.Severity}}\nÉtat de l'alerte : {{if $event.IsRecovered}}Recovered{{else}}{{$event.Severity}} Triggered{{end}}       \nHeure de déclenchement : {{$event.TriggerTime}}\nValeur au déclenchement : {{$event.TriggerValue}}\nDescription de la règle : {{$event.RuleNote}}\nÉtiquettes : {{$event.Tags}}\nAnnotations : {{$event.Annotations}}\n\nRédige un résumé en français de 100 mots maximum qui précise :\n1. quel système ou service rencontre quel problème\n2. la gravité du problème\n3. les conséquences possibles\n4. une piste de traitement simple\nLe résumé doit rester clair et concis afin que les équipes d'exploitation saisissent la situation d'un coup d'œil.",
    "custom_params_tip": "Pour affiner le comportement du modèle d'IA :\n\n| Paramètre | Description | Valeur conseillée | Exemple |\n|--------|------|--------|------|\n| temperature | Règle l'aléa des réponses | 0.3-0.7 | 0.7 |\n| max_tokens | Nombre maximal de jetons en sortie | 200-500 | 300 |\n| top_p | Seuil de probabilité d'échantillonnage | 0.8-1.0 | 0.9 |\n\n**Marche à suivre** :\n1. Cliquez sur le bouton + à côté de « Custom Params »\n2. Saisissez le nom du paramètre dans la colonne Nom du paramètre, par exemple temperature\n3. Saisissez sa valeur dans la colonne Valeur du paramètre, par exemple 0.7"
  },
  "script": {
    "timeout": "Délai maximal (millisecondes)",
    "timeout_tooltip": "Durée maximale d'exécution du script ; au-delà, il est interrompu",
    "timeout_placeholder": "Saisissez le délai maximal",
    "content": "Contenu du script",
    "content_tooltip": "Rédigez le script de traitement. L'événement d'alerte est transmis sur l'entrée standard et le script doit le réécrire sous forme d'objet JSON sur la sortie standard",
    "content_placeholder": "Saisissez le contenu du script"
  },
  "inhibit": {
    "help": "Le processeur d'inhibition empêche de notifier un événement pendant qu'une autre alerte est envoyée, ce qui réduit le nombre de messages. Cas courant : tant qu'un incident actif de niveau P1 existe sur la même règle, les notifications P2 et P3 sont ignorées. Voir la <a>documentation</a>",
    "tip1": "Lorsqu'une <b>nouvelle alerte</b> remplit les conditions suivantes",
    "tip2": "et",
    "tip3": "secondes il existe une <b>alerte active</b> remplissant les conditions suivantes",
    "tip4": "et que la <b>nouvelle alerte</b> et l'<b>alerte active</b> coïncident sur les éléments suivants",
    "tip5": "Si toutes ces conditions sont réunies, l'alerte est inhibée et n'est pas notifiée",
    "duration_required": "La durée d'inhibition est obligatoire",
    "duration_max": "La durée d'inhibition ne peut pas dépasser 600 secondes",
    "match_label_keys": "Étiquettes",
    "match_label_keys_required": "L'étiquette est obligatoire",
    "match_attribute_keys": "Attribut",
    "match_attribute_keys_required": "L'attribut est obligatoire",
    "keys_at_least_one_required": "Au moins une étiquette ou un attribut est nécessaire",
    "labels_conflict": "Les valeurs de l'étiquette {{label}} diffèrent : l'inhibition est impossible",
    "attributes_conflict": "Les valeurs de l'attribut {{attribute}} diffèrent : l'inhibition est impossible",
    "preview": "Aperçu de la règle : lorsqu'une «&nbsp;<b>nouvelle alerte : {{newAlertLabelsAttrs}}</b>&nbsp;» survient alors qu'une «&nbsp;<b>alerte active : {{activeAlertLabelsAttrs}}</b>&nbsp;» existe depuis moins de «&nbsp;<b>{{duration}} secondes</b>&nbsp;» et que les deux coïncident sur «&nbsp;<b>{{matchLabelsAttrs}}</b>&nbsp;», la notification de la nouvelle alerte est inhibée.",
    "labels_filter": {
      "label": "Étiquettes",
      "label_tip": "Seuls les événements correspondant à ces conditions d'étiquette sont inhibés, ce qui restreint la portée ; sans configuration, aucune restriction ne s'applique. Choisissez de préférence une clé existante dans la liste, ou saisissez-la",
      "label_placeholder": "Saisissez ou choisissez la clé d'étiquette à comparer, par exemple app, cluster ou alertname"
    },
    "labels_filter_value_placeholder": "Saisissez ou choisissez la valeur d'étiquette à comparer",
    "attributes_filter": {
      "label": "Attribut",
      "label_tip": "Restreint la portée de l'inhibition par attribut : seules les alertes qui satisfont tous ces attributs sont inhibées ; laissé vide, cela vaut pour toutes"
    },
    "active_event_labels_filter": {
      "label": "Étiquettes",
      "label_tip": "**Restreint le périmètre des alertes actives**\n- Sans configuration : les étiquettes ne servent pas de filtre\n- Avec configuration : choisissez de préférence une clé existante dans la liste ou saisissez-la ; seules les alertes actives satisfaisant toutes ces conditions entrent dans le périmètre.\n\nExemple : avec service=mon, seuls les événements portant l'étiquette service=mon participent à la logique d'inhibition."
    },
    "active_event_attributes_filter": {
      "label": "Attribut",
      "label_tip": "**Restreint le périmètre des alertes actives**\n- Sans configuration : les attributs ne servent pas de filtre\n- Avec configuration : seules les alertes actives satisfaisant tous ces attributs sont retenues.\n\nExemple : avec groupe métier == DefaultBusiGroup, seuls les événements actifs dont l'attribut groupe métier vaut DefaultBusiGroup sont retenus pour la suite de l'inhibition"
    }
  },
  "inhibit_qd": {
    "help": "Inhibition d'après une requête : au déclenchement de l'alerte, la requête ci-dessous est exécutée. Si elle renvoie au moins une ligne, l'alerte est inhibée et n'est pas notifiée ; sans résultat, la notification suit son cours. Voir la <a>documentation</a>",
    "t_1": "et que la requête renvoie les <b>données</b> suivantes"
  },
  "annotation_qd": {
    "help": "Le processeur de requête complémentaire enrichit les alertes : au déclenchement, il interroge la source de données pour récupérer des informations utiles, par exemple des journaux, et les joint à l'alerte. Voir la <a>documentation</a>",
    "query_configs": "Exploration des données",
    "use_event_datasource": "Utiliser la source de données de l'événement",
    "use_event_datasource_help": "Une fois activé, seuls les événements d'exemple dont le type de source correspond peuvent être choisis",
    "datasource_cate_required": "Le type de source de données est obligatoire",
    "datasource_ids_required": "La source de données est obligatoire",
    "select_alert_event_btn": "Choisir un événement d'alerte d'exemple",
    "select_alert_event_tip": "Choisissez un événement d'exemple pour résoudre les variables de la requête et prévisualiser les données",
    "select_alert_event_label": "Événement d'exemple sélectionné",
    "query_required": "La condition de requête est obligatoire",
    "sql_limit_valid": "La requête SQL doit comporter une clause LIMIT",
    "oracle_sql_limit_valid": "La requête SQL doit comporter une clause ROWNUM",
    "annotation_configs": "Ajout de données",
    "annotation_configs_tip": "Définissez des paires clé/valeur pour ajouter le résultat de la requête aux informations de l'alerte",
    "annotation_key_tip": "Définissez la clé du nouveau champ ; préférez des caractères latins",
    "annotation_val_tip": "Modèle de valeur du nouveau champ ; la documentation en donne la syntaxe",
    "annotation_key_placeholder": "Nom du champ complémentaire",
    "annotation_val_placeholder": "Contenu du champ complémentaire ; la syntaxe de modèle permet d'y injecter le résultat de la requête",
    "annotation_key_required": "Le nom du champ complémentaire est obligatoire",
    "annotation_val_required": "Le contenu du champ complémentaire est obligatoire",
    "data_preview": "Aperçu des données",
    "data_preview_query": "Requête",
    "data_preview_no_eventid": "Choisissez d'abord un événement d'alerte",
    "query_limit": "Limite du nombre de lignes"
  },
  "event_recover": {
    "help": "Le processeur d'autoréparation exécute un script shell sur la machine au déclenchement de l'alerte, pour collecter des informations ou lancer une remise en état. <a>Documentation</a>",
    "title": "Autoréparation",
    "create_btn": "Créer un modèle d'autoréparation",
    "tpl_id": "Modèle d'autoréparation",
    "tpl_id_required": "Le modèle d'autoréparation est obligatoire",
    "host": "Machine d'exécution",
    "host_placeholder": "Peut rester vide : la machine est alors déduite de l'étiquette ident de l'événement",
    "args": "Paramètres",
    "args_tip": "Arguments passés au script ; séparez-les par deux virgules, par exemple arg1,,arg2,,arg3",
    "save_result": "Enregistrer le résultat",
    "save_result_tip": "Enregistre le résultat de l'exécution du script dans l'événement d'alerte",
    "timeout": "Temps d'attente",
    "timeout_tip": "Si le script ne se termine pas dans ce délai, son résultat n'est pas attendu",
    "timeout_max_warning": "Le temps d'attente ne peut pas dépasser 60 secondes",
    "select_host": "Filtrer les machines"
  },
  "alert_shot": {
    "help": "<a>Documentation</a>",
    "title": "Capture d'écran",
    "shot_type": {
      "label": "Type d'objet",
      "options": {
        "board": "Tableau de bord",
        "url": "URL"
      }
    },
    "advanced_settings": "Réglages avancés",
    "board_shot_opts": {
      "busi_group": "Groupe métier",
      "board_id": "Tableau de bord",
      "board_url": "URL du tableau de bord",
      "timeout": "Délai maximal (millisecondes)",
      "width": "Largeur de l'image"
    },
    "url_shot_opts": {
      "url": "URL",
      "headers": "En-têtes de requête",
      "proxy": "Réglages du proxy",
      "insecure_skip_verify": "Ignorer la vérification du certificat",
      "timeout": "Délai maximal (millisecondes)",
      "width": "Largeur de l'image"
    }
  }
};

export default fr_FR;

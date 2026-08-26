const fr_FR = {
  "title": "Règle de notification",
  "empty_guide": {
    "title": "Aucune règle de notification",
    "desc": "Une règle de notification détermine à qui les alertes sont envoyées et par quel média. Sans elle, les événements ne parviennent réellement ni sur DingTalk ni par e-mail.",
    "config_channel": "Configurer d'abord un média de notification"
  },
  "rule_select": {
    "label": "Règle de notification",
    "select": "Choisir une règle de notification",
    "create": "Nouvelle règle de notification",
    "view": "Consulter",
    "manage": "Gestion des règles de notification",
    "total": "{{total}} au total",
    "footer_total": "{{total}} règles au total",
    "quick_create": {
      "action": "Création rapide",
      "title": "Créer rapidement une règle de notification",
      "hint": "Collez l'URL du webhook d'un bot de messagerie ou l'URL d'intégration Flashduty contenant integration_key : le type est reconnu automatiquement, qu'il s'agisse de DingTalk, WeCom, d'une carte Feishu, d'une carte Lark ou de Flashduty, puis la règle existante est réutilisée ou une nouvelle est créée.",
      "url_label": "URL de webhook ou d'intégration",
      "url_placeholder": "Par exemple : https://oapi.dingtalk.com/robot/send?access_token=xxx\nou : https://api.flashcat.cloud/event/push/alert/n9e?integration_key=xxx",
      "url_required": "Collez une URL de webhook ou une URL d'intégration Flashduty",
      "name_label": "Nom de la règle de notification",
      "name_placeholder": "Généré automatiquement après le collage du webhook, et modifiable",
      "name_required": "Saisissez le nom de la règle de notification",
      "user_group_required": "Choisissez les équipes autorisées",
      "user_group_placeholder": "Choisissez les équipes autorisées",
      "detected": "Reconnu comme {{channel}} (terminant par {{suffix}})",
      "invalid_url": "Le format de l'URL est incorrect",
      "missing_param": "Il manque {{key}} dans l'URL",
      "unrecognized": "Type non reconnu ; les types acceptés sont DingTalk, WeCom, carte Feishu, carte Lark et Flashduty",
      "reused_rule": "Une règle de notification utilisant le même jeton existe déjà ; elle a été sélectionnée automatiquement",
      "created": "Règle de notification créée et sélectionnée",
      "create_channel_no_perm": "Le média de notification {{channel}} est absent et vous n'avez pas le droit d'en créer ; demandez à un administrateur de le faire",
      "create_channel_failed": "Impossible de créer le média de notification : {{channel}}",
      "create_rule_failed": "Impossible de créer la règle de notification",
      "channel_description": "Créé automatiquement par la création rapide",
      "rule_description": "Créé par la création rapide à partir de l'URL du webhook",
      "submit": "Créer"
    }
  },
  "basic_configuration": "Configuration de base",
  "basic_configuration_desc": "Nom de la règle de notification, équipes autorisées et remarque",
  "name_auto_tip": "Le nom est généré dès que le média et l'équipe destinataire sont choisis, et reste modifiable",
  "name_auto_separator": ", ",
  "add_note_btn": "Ajouter une remarque",
  "user_group_ids": "Équipes autorisées",
  "user_group_ids_tip": "Les membres des équipes indiquées ici pourront gérer ou consulter cette règle de notification",
  "enabled_tip": "Détermine si cette règle de notification est active",
  "note_tip": "Ajoutez ici des précisions sur cette règle pour en faciliter la maintenance",
  "notification_configuration": {
    "title": "Configuration des notifications",
    "section_desc": "Détermine à qui et par quel média les alertes partent : choisissez le média, le modèle de message et les destinataires ; plusieurs entrées sont possibles",
    "item_title": "Configuration des notifications",
    "add_btn": "Ajouter une configuration de notification",
    "filters": {
      "title": "Filtres",
      "tip": "Restreint cette configuration aux événements qui remplissent les conditions retenues : gravité, plage horaire, étiquettes et attributs. Sans configuration, aucune restriction ne s'applique",
      "severities_all": "Toutes les gravités",
      "severities_none": "Aucun niveau coché : aucun événement ne correspondra",
      "time_ranges_count": "{{count}} plages horaires",
      "label_keys_count": "{{count}} conditions d'étiquette",
      "attributes_count": "{{count}} conditions d'attribut",
      "no_extra": "Plage horaire, étiquettes et attributs sans restriction"
    },
    "test_mode": {
      "history": "Choisir un événement passé",
      "mock": "Utiliser un événement simulé"
    },
    "mock_test": {
      "empty_alert": "Cet environnement ne compte encore aucun événement d'alerte ; un événement simulé permet de tester directement le canal de notification",
      "switch_btn": "Utiliser un événement simulé",
      "desc": "Un événement d'alerte simulé sera envoyé au média et aux destinataires de cette configuration afin de vérifier que le canal fonctionne ; le test simulé ne tient pas compte des filtres",
      "preview_title": "Aperçu de l'événement simulé",
      "preview_rule_name": "Nom de la règle",
      "preview_severity": "Gravité de l'alerte",
      "preview_tags": "Étiquettes",
      "rule_name": "Événement simulé pour le test de notification"
    },
    "channel": "Médias de notification",
    "channel_tip": "Choisissez le média par lequel notifier les événements d'alerte. Si les médias existants ne conviennent pas, demandez à un administrateur d'en créer un",
    "channel_msg": "Choisissez un média de notification",
    "template": "Modèles de message",
    "template_tip": "Modèle du contenu de la notification ; différents modèles peuvent servir selon les cas",
    "template_msg": "Choisissez un modèle de message",
    "severities": "Gravités concernées",
    "severities_tip": "Choisissez les niveaux de gravité à notifier ; seuls les niveaux cochés le sont. Si aucun des trois n'est coché, le média ne correspondra à aucun événement, ce qui revient à le désactiver",
    "time_ranges": "Plages horaires concernées",
    "time_ranges_tip": "Une règle de notification peut n'être active que sur certaines plages horaires ; sans configuration, aucune restriction ne s'applique",
    "effective_time_start": "Début",
    "effective_time_end": "Fin",
    "effective_time_week_msg": "Choisissez les jours concernés",
    "effective_time_start_msg": "Choisissez l'heure de début",
    "effective_time_end_msg": "Choisissez l'heure de fin",
    "fetch_integration_key_failed_remove": "Impossible de récupérer les clés PagerDuty suivantes : {list}. Essayez de les sélectionner à nouveau",
    "label_keys": "Étiquettes concernées",
    "label_keys_tip": "Une règle de notification peut ne concerner que les événements retenus par un filtre sur les étiquettes ; sans configuration, aucune restriction ne s'applique",
    "attributes": "Attributs concernés",
    "attributes_value": "Valeur de l'attribut",
    "attributes_tip": "Une règle de notification peut ne concerner que les événements présentant certains attributs ; sans configuration, aucune restriction ne s'applique",
    "attributes_options": {
      "group_name": "Groupe métier",
      "cluster": "Source de données",
      "is_recovered": "Est-ce un événement de résolution ?",
      "rule_id": "Règle d'alerte",
      "severity": "Gravité de l'alerte",
      "target_group": "Groupe métier de la machine"
    },
    "run_test_btn": "Test de notification",
    "run_test_btn_tip": "Choisissez quelques événements déjà survenus pour vérifier cette configuration : si elle est correcte, les messages correspondants vous parviendront",
    "run_test_request_result": "La notification de test a été envoyée ; voici la réponse du destinataire :",
    "user_info": {
      "user_ids": "Destinataires",
      "user_group_ids": "Équipes destinataires",
      "error": "Les destinataires et les équipes destinataires ne peuvent pas être vides tous les deux"
    },
    "flashduty": {
      "ids": "Espace de collaboration"
    },
    "pagerduty": {
      "services": "Service / intégration"
    }
  },
  "user_group_id_invalid_tip": "L'équipe autorisée n'existe pas",
  "channel_invalid_tip": "Le média de notification n'existe pas",
  "disabled": "Désactiver",
  "pipeline_configuration": {
    "title": "Workflow de traitement des événements",
    "section_desc": "Avant l'envoi, un workflow retravaille l'événement : étiquetage, enrichissement, réduction du bruit",
    "manage_btn": "Gérer les workflows de traitement",
    "name_placeholder": "Choisissez un workflow de traitement",
    "name_required": "Le workflow de traitement est obligatoire",
    "add_btn": "Ajouter un workflow de traitement",
    "disable": "Désactiver",
    "enable": "Activer"
  },
  "escalations": {
    "title": "Configuration de l'escalade",
    "section_desc": "Lorsqu'une alerte reste longtemps non résolue ou non prise en charge, la notification est remontée vers un canal désigné afin que personne ne la laisse de côté",
    "title_tip": "Passé le délai fixé sans résolution, le système remonte la notification vers le canal désigné selon les conditions ci-dessous, pour éviter qu'elle reste longtemps sans suite. Voir la <a>documentation</a>",
    "item_title": "Escalade des notifications",
    "item_add_btn": "Ajouter une escalade",
    "interval": "Période de contrôle",
    "interval_required": "La période de contrôle est obligatoire",
    "duration_required": "La durée est obligatoire",
    "duration_1": "L'événement anormal dure depuis plus de",
    "duration_2": "et se trouve toujours à l'état",
    "duration_3": "; la notification part alors avec cette configuration.",
    "repeating_notification": "Réglages des rappels",
    "repeating_notification_tip": "Désactivée, l'escalade d'un même événement n'est notifiée qu'une seule fois",
    "repeating_notification_1": "Toutes les",
    "repeating_notification_2": "minutes, avec au maximum",
    "repeating_notification_3": "rappels",
    "notification_interval_required": "L'intervalle de notification est obligatoire",
    "notification_max_times_required": "Le nombre maximal de rappels est obligatoire",
    "event_status_options": {
      "0": "Non résolu",
      "1": "Non résolu et non pris en charge"
    },
    "time_ranges": {
      "label_tip": "L'escalade peut n'avoir lieu que les jours et aux heures cochés ; sans configuration, aucune restriction ne s'applique"
    },
    "labels_filter": {
      "label_tip": "Seuls les événements remplissant ces conditions d'étiquette sont remontés, ce qui restreint la portée ; sans configuration, aucune restriction ne s'applique. Choisissez de préférence une clé existante dans la liste, ou saisissez-la"
    },
    "attributes_filter": {
      "label_tip": "L'escalade ne s'applique qu'aux alertes satisfaisant tous ces attributs ; sans configuration, aucune restriction. Les conditions se combinent par ET"
    }
  },
  "notify_aggr_configs": {
    "title": "Configuration de l'agrégation",
    "section_desc": "Regroupe les alertes semblables en une seule notification selon des dimensions d'étiquette ou d'attribut, pour limiter les interruptions",
    "enable": "Activer l'agrégation",
    "group_enable": "Agrégation fine",
    "group_title": "Agrégation fine",
    "group_add_btn": "Ajouter une agrégation fine",
    "group_tip1": "Si les conditions suivantes sont remplies",
    "group_tip2": "regrouper selon les dimensions suivantes en une seule notification",
    "group_label_keys": "Étiquettes",
    "group_label_keys_required": "L'étiquette est obligatoire",
    "group_attribute_keys": "Attribut",
    "group_attribute_keys_required": "L'attribut est obligatoire",
    "group_keys_at_least_one_required": "Au moins une étiquette ou un attribut doit être renseigné",
    "group_duration_1": "Après réception d'une alerte, celles du même groupe reçues dans les",
    "group_duration_2": "secondes suivantes sont regroupées et envoyées ensemble",
    "group_duration_required": "La durée d'agrégation est obligatoire",
    "default_title": "Dimensions par défaut",
    "default_tip": "Si les filtres ci-dessus ne sont pas remplis, <b>regrouper selon les dimensions suivantes en une seule notification</b>",
    "default_duration_tip": "Attention : un intervalle d'agrégation trop long retarde l'envoi des alertes",
    "default_duration_tip2": "L'intervalle d'agrégation ne peut pas dépasser 3600 secondes",
    "attribute_keys_map": {
      "cluster": "Source de données",
      "cate": "Type de source de données",
      "group_name": "Groupe métier",
      "rule_id": "Règle d'alerte",
      "rule_prod": "Type de supervision",
      "severity": "Gravité de l'alerte",
      "is_recovered": "Résolu"
    },
    "enable_tip": "Une fois activé, les alertes concernées sont regroupées par dimension en une seule notification <a>Documentation</a>",
    "labels_filter": {
      "label_tip": "Seuls les événements remplissant ces conditions d'étiquette sont regroupés, ce qui restreint la portée ; sans configuration, aucune restriction ne s'applique. Choisissez de préférence une clé existante dans la liste, ou saisissez-la"
    },
    "attributes_filter": {
      "label_tip": "Seules les alertes correspondant à ce filtre d'étiquettes entrent dans l'agrégation ; les autres ne sont pas touchées par cette règle<br />Les conditions se combinent par ET, y compris avec le filtre d'attributs ci-dessous"
    },
    "label_keys": {
      "tip": "En choisissant ident, les événements partageant le même ident sont regroupés et envoyés en un seul message, ce qui réduit souvent le bruit sur les SMS et la messagerie instantanée",
      "placeholder": "Par exemple ident ou app. Choisissez de préférence une clé existante dans la liste, ou saisissez-la"
    },
    "attribute_keys": {
      "tip": "En choisissant le groupe métier, les événements du même groupe sont regroupés et envoyés en un seul message",
      "placeholder": "Par exemple : groupe métier"
    }
  },
  "statistics": {
    "total_notify_events": "Notifications envoyées ces {{days}} derniers jours",
    "total_notify_events_tip": "Ne compte que les notifications réellement parties ; les événements <b>regroupés, inhibés ou mis en sourdine</b> sont exclus",
    "escalation_events": "Événements remontés ces {{days}} derniers jours",
    "escalation_events_tip": "Nombre d'événements dont la priorité a été relevée par une règle d'escalade. Un chiffre élevé traduit en général des délais de traitement longs et invite à revoir <b>le SLA de réponse, les seuils d'escalade ou la stratégie de réduction des alertes</b>",
    "noise_reduction_ratio": "Taux de réduction du bruit sur {{days}} jours",
    "noise_reduction_ratio_tip": "Taux de réduction du bruit = <b>(1 − notifications réellement envoyées ÷ événements d'alerte d'origine) × 100 %</b>. Plus il approche de <b>100 %</b>, meilleure est la <b>réduction du bruit</b>"
  },
  "tabs": {
    "events": "Liste des événements",
    "rules": "Règle d'alerte",
    "sub_rules": "Règles d'abonnement"
  }
};

export default fr_FR;

const fr_FR = {
  "title": "Règles de mise en sourdine",
  "edit_missing_params": "Des paramètres indispensables manquent ; la modification est impossible. Contactez un administrateur",
  "search_placeholder": "Rechercher par titre de règle, étiquette ou motif de mise en sourdine",
  "datasource_type": "Type de source de données",
  "datasource_id": "Source de données",
  "cause": "Motif de la mise en sourdine",
  "cause_tip": "Consignez le contexte de cette mise en sourdine pour que l'équipe sache pourquoi elle a lieu et quand la lever",
  "cause_placeholder": "Par exemple : déploiement du service de commandes, terminé sous une heure",
  "time": "Période de mise en sourdine",
  "note": "Titre de la règle",
  "btime": "Début de la mise en sourdine",
  "btime_msg": "Le début de la mise en sourdine est obligatoire",
  "duration": "Durée de la mise en sourdine",
  "duration_quick": "Durées prédéfinies",
  "duration_quick_tip": "La fin est calculée à partir du début de la mise en sourdine ; les dates ci-dessous restent modifiables directement",
  "etime": "Fin de la mise en sourdine",
  "etime_msg": "La fin de la mise en sourdine est obligatoire",
  "etime_before_btime_msg": "La fin de la mise en sourdine doit être postérieure à son début",
  "expired_tip": "Cette règle a expiré et ne met plus aucune alerte en sourdine. Pour la réactiver, choisissez une durée prédéfinie ou modifiez la date de fin",
  "long_duration_tip": "La mise en sourdine dépasse {{days}} jours : les alertes resteront longtemps invisibles. Vérifiez que c'est bien voulu",
  "prod": "Type de supervision",
  "severities": "Gravité de l'événement",
  "severities_tip": "Seuls les niveaux cochés sont mis en sourdine ; les autres continuent de déclencher normalement",
  "severities_msg": "La gravité de l'événement est obligatoire",
  "scope_unlimited_tip": "Aucune source de données ni étiquette n'est configurée : cette règle mettra en sourdine tous les événements du groupe métier choisi. Vérifiez que c'est bien voulu",
  "mute_type": {
    "0": "Période fixe",
    "1": "Période récurrente",
    "label": "Type de période",
    "days_of_week": "Période de mise en sourdine",
    "days_preset": {
      "everyday": "Tous les jours",
      "workday": "Jours ouvrés",
      "weekend": "Week-end"
    },
    "start": "Début",
    "start_msg": "L'heure de début est obligatoire",
    "end": "Fin",
    "end_msg": "L'heure de fin est obligatoire",
    "periodic_tip": "Une mise en sourdine récurrente reste valable indéfiniment : chaque semaine, les alertes tombant dans la plage indiquée sont mises en sourdine. Un début et une fin identiques signifient toute la journée"
  },
  "mute_method": {
    "0": "Mettre en sourdine l'événement et la notification",
    "1": "Mettre en sourdine la notification seule",
    "hint_title": "Comment choisir entre les deux modes",
    "hint_notify_only": "Notification seule : l'événement est bien créé et consigné, seule la notification est retenue. Cela convient aux redémarrages et aux opérations de maintenance, car on peut ensuite revenir sur d'éventuelles anomalies survenues pendant cette période.",
    "hint_all": "Événement et notification : l'événement lui-même n'est pas créé. Cela convient au bruit dont on a établi qu'il ne mérite aucune attention.",
    "hint_dismiss": "Ne plus afficher",
    "label": "Mode de mise en sourdine",
    "0_desc": "(aucun événement créé, aucune notification envoyée)",
    "1_desc": "(l'événement est consigné normalement, seule la notification est retenue)",
    "tip": "Avec le mode Notification seule, les alertes concernées continuent de produire des événements consignés pendant la période, seule la notification étant retenue. Vous voyez ainsi si une anomalie survient pendant l'intervention, et vous levez la mise en sourdine une fois tout rentré dans l'ordre."
  },
  "tag": {
    "key": {
      "label": "Étiquettes de l'événement",
      "tip": "Il s'agit ici des étiquettes des événements d'alerte, sur lesquelles portent les règles de correspondance ci-dessous. Plusieurs opérateurs sont disponibles :\n\n- `==` compare à une valeur d'étiquette précise ; une seule valeur est admise, utilisez `in` pour en viser plusieurs\n- `=~` accepte une expression régulière pour comparer les valeurs avec souplesse\n- `in` compare à plusieurs valeurs, comme le `in` de SQL\n- `not in` exclut plusieurs valeurs, comme le `not in` de SQL\n- `!=` signifie différent de, pour exclure une valeur précise\n- `!~` signifie ne correspond pas à l'expression régulière : toutes les valeurs qui y correspondent sont exclues, comme le `!~` de PromQL"
    }
  },
  "name_auto_tip": "Le titre est généré à partir des filtres ci-dessus et reste modifiable à tout moment",
  "name_auto_template": "Mettre en sourdine {{scope}}",
  "name_auto_separator": "、",
  "name_auto_all_alerts": "Toutes les alertes",
  "summary": {
    "severities_all": "Tous les niveaux",
    "tags_none": "Étiquettes sans restriction",
    "tags_count": "{{count}} conditions d'étiquette",
    "periodic_count": "{{count}} plages horaires"
  },
  "basic_configs": "Informations générales",
  "basic_configs_desc": "Titre de la règle et motif de la mise en sourdine, utiles au travail d'équipe et aux recherches ultérieures",
  "filter_configs": "Filtres",
  "filter_configs_desc": "Détermine quels événements sont mis en sourdine : groupe métier, source de données, gravité et étiquettes. Les conditions se combinent par ET, et celles laissées vides n'imposent aucune restriction",
  "mute_configs": "Réglages de la mise en sourdine",
  "mute_configs_desc": "Détermine quand et jusqu'où mettre en sourdine : sur une période fixe ou sur une plage qui revient chaque semaine",
  "alert_content": "Pour éviter qu'une règle mal configurée ne fasse taire toutes les alertes de l'entreprise, celle-ci ne s'applique qu'aux événements d'un groupe métier donné",
  "preview_muted_title": "Aperçu des événements concernés",
  "preview_muted_desc": "Voici les événements d'alerte déjà présents qui correspondent aux filtres de cette règle. Une fois enregistrée, elle mettra en sourdine les nouveaux événements du même type ; ceux qui existent déjà ne disparaîtront pas d'eux-mêmes, mais vous pouvez les supprimer ici.",
  "preview_muted_save_only": "Enregistrer seulement",
  "preview_muted_save_and_delete": "Enregistrer et supprimer les événements concernés",
  "expired": "Expiré",
  "empty_guide": {
    "title": "Aucune règle de mise en sourdine",
    "desc": "Pendant un déploiement, une maintenance ou un exercice, une règle de mise en sourdine écarte temporairement les alertes attendues et épargne l'équipe d'astreinte. Elle expire d'elle-même, sans intervention.",
    "select_busi_group": "Choisissez d'abord un groupe métier à gauche pour créer une règle de mise en sourdine"
  },
  "delete_mutes": {
    "title": "Purge des règles de mise en sourdine",
    "alert_message": "La suppression est définitive ; procédez avec prudence.",
    "timestamp": "Filtre par date",
    "timestamp_options": {
      "1": "Il y a plus d'un mois",
      "3": "Il y a plus de trois mois",
      "6": "Il y a plus de six mois",
      "12": "Il y a plus d'un an"
    }
  },
  "filter_disabled": {
    "0": "Activer",
    "1": "Désactiver",
    "placeholder": "État d'activation"
  }
};

export default fr_FR;

const fr_FR = {
  "title": "Modèles de message",
  "add_title": "Ajouter un modèle de message",
  "edit_title": "Modifier le modèle de message",
  "clone_title": "Dupliquer le modèle de message",
  "user_group_ids": "Équipes autorisées",
  "private": {
    "0": "Commun",
    "1": "Privé",
    "title": "Mode d'affichage"
  },
  "notify_channel_ident": "Type de média",
  "content": {
    "add_title": "Ajouter un champ de modèle",
    "edit_title": "Modifier le champ de modèle",
    "preview": "Aperçu du modèle",
    "contentKey": "Identifiant du champ",
    "tip": "Champ utilisable dans les médias de notification ; son contenu se référence par $tpl.{{contentKey}}",
    "prompt": "Le contenu a été modifié. Abandonner ces modifications ?",
    "value_msg": "Saisissez le contenu du champ",
    "ai_generate": "Générer avec l'IA"
  },
  "preview": {
    "mode": {
      "history": "Événements passés",
      "mock": "Événement simulé"
    },
    "empty_alert": "Cet environnement ne compte encore aucun événement d'alerte passé",
    "switch_btn": "Prévisualiser avec un événement simulé",
    "select_events": "Choisir un événement d'alerte",
    "result": "Aperçu du résultat"
  },
  "starter": {
    "rule_name": "Règle",
    "severity": "Gravité",
    "status": "État",
    "firing": "Déclenché",
    "recovered": "Résolu",
    "tags": "Étiquettes",
    "trigger_value": "Valeur au déclenchement",
    "time": "Heure",
    "detail": "Détail"
  },
  "empty_guide": {
    "title": "Créer votre premier modèle de message",
    "desc": "Le modèle de message détermine la mise en forme des notifications. À la création, un modèle prêt à l'emploi est généré selon le média choisi, et vous l'ajustez ensuite à votre guise."
  },
  "fields_panel": {
    "desc": "Variables d'événement utilisables dans le modèle. Cliquez sur l'une d'elles pour la copier, puis collez-la dans l'éditeur à gauche.",
    "fields": {
      "event": "L'objet événement complet, pratique pour en inspecter tous les champs",
      "labels": "Table des étiquettes de l'événement, équivalente à $event.TagsMap",
      "value": "Valeur au déclenchement, équivalente à $event.TriggerValue",
      "domain": "Adresse du site, servant à composer le lien vers le détail de l'événement",
      "timestamp": "Heure courante, généralement utilisée comme heure d'envoi du message",
      "timeformat": "Met un horodatage en forme lisible ; remplaçable par n'importe quel champ temporel",
      "Id": "ID de l'événement d'alerte",
      "Cate": "Catégorie de l'alerte, par exemple « prometheus »",
      "Cluster": "Nom de la source de données",
      "DatasourceId": "ID de la source de données",
      "GroupId": "ID du groupe métier",
      "GroupName": "Nom du groupe métier",
      "Hash": "Empreinte de l'événement",
      "RuleId": "ID de la règle",
      "RuleName": "Nom de la règle",
      "RuleNote": "Remarque sur la règle",
      "RuleHash": "Empreinte de la règle",
      "Severity": "Gravité de l'alerte (1-3)",
      "Status": "État de l'alerte",
      "PromQl": "Requête de l'alerte",
      "PromForDuration": "Durée (secondes)",
      "PromEvalInterval": "Intervalle d'évaluation (secondes)",
      "SubRuleId": "ID de la règle d'abonnement",
      "TriggerTime": "Horodatage du déclenchement",
      "TriggerValue": "Valeur au déclenchement",
      "TriggerValues": "Valeur au déclenchement (format brut)",
      "FirstTriggerTime": "Premier déclenchement",
      "IsRecovered": "Résolu",
      "NotifyCurNumber": "Nombre de notifications déjà envoyées",
      "LastEvalTime": "Dernière évaluation",
      "LastSentTime": "Dernier envoi",
      "TagsJSON": "Tableau des étiquettes",
      "TagsMap": "Table clé-valeur des étiquettes",
      "TagsMap_instance": "Récupère une étiquette précise ; remplacez instance par le nom de la vôtre",
      "AnnotationsJSON": "Table clé-valeur des annotations",
      "AnnotationsJSON_summary": "Récupère une annotation précise ; remplacez summary par le nom de la vôtre",
      "TargetIdent": "Identifiant de la cible",
      "TargetNote": "Remarque sur la cible",
      "NotifyRecovered": "Notifier la résolution",
      "NotifyChannelsJSON": "Liste des canaux de notification",
      "NotifyGroupsJSON": "Liste des groupes de notification",
      "NotifyRuleIds": "Liste des ID de règles de notification",
      "CallbacksJSON": "Liste des URL de rappel",
      "ExtraConfig": "Informations de configuration supplémentaires",
      "ExtraInfo": "Liste des informations supplémentaires",
      "ExtraInfoMap": "Table des informations supplémentaires"
    },
    "search_placeholder": "Rechercher un champ",
    "no_match": "Aucun champ correspondant",
    "copy_tip": "Cliquez pour copier",
    "groups": {
      "common": "Courants",
      "basic": "Informations générales",
      "trigger": "Déclenchement",
      "tags": "Étiquettes et annotations",
      "target": "Machine",
      "notify": "Notification",
      "extra": "Rappels et extensions"
    }
  }
};

export default fr_FR;

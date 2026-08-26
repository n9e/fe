const fr_FR = {
  "title": "Règles d'abonnement",
  "search_placeholder": "Rechercher par nom d'abonnement, règle abonnée, étiquette ou groupe destinataire",
  "rule_name": "Règles abonnées",
  "sub_rule_name": "Règles d'alerte abonnées",
  "sub_rule_selected": "Règles sélectionnées",
  "tags": "Étiquettes de l'abonnement",
  "user_groups": "Groupe destinataire",
  "notify_rule_ids": "Règle de notification",
  "tag": {
    "key": {
      "label": "Clés d'étiquette de l'abonnement",
      "tip": "Il s'agit ici des étiquettes des événements d'alerte, sur lesquelles portent les règles de correspondance ci-dessous",
      "required": "La clé d'étiquette est obligatoire",
      "placeholder": "Saisissez une clé d'étiquette"
    },
    "func": {
      "label": "Opérateur"
    },
    "value": {
      "label": "Valeur de l'étiquette",
      "equal_placeholder": "Saisissez une valeur",
      "include_placeholder": "Plusieurs valeurs sont possibles ; séparez-les par Entrée",
      "regex_placeholder": "Saisissez l'expression régulière à comparer",
      "required": "La valeur de l'étiquette est obligatoire"
    }
  },
  "group": {
    "key": {
      "label": "Groupes métier abonnés",
      "placeholder": "Groupe métier"
    },
    "func": {
      "label": "Opérateur"
    },
    "value": {
      "label": "Valeur",
      "required": "La valeur est obligatoire"
    }
  },
  "redefine_severity": "Redéfinir la gravité",
  "redefine_channels": "Redéfinir le média de notification",
  "redefine_webhooks": "Redéfinir l'URL de rappel",
  "user_group_ids": "Groupes destinataires de l'abonnement",
  "for_duration": "S'abonner quand l'événement dure plus de (secondes)",
  "for_duration_tip": "Exemple : avec la valeur 300, un même événement d'alerte ne satisfait pas l'abonnement la première fois qu'il est capté. Lors des passages suivants, l'écart entre son heure de déclenchement courante et celle du premier passage est calculé : au-delà de 300 secondes, la condition est remplie et la notification part ; en deçà, l'abonnement ne s'applique pas. On peut ainsi organiser une escalade : le responsable d'équipe crée un abonnement portant sur une durée de plus d'une heure (3600 secondes) et s'y désigne comme destinataire, en dernier recours, pour garantir qu'aucune alerte ne reste sans suite.",
  "webhooks": "Nouvelle URL de rappel",
  "webhooks_msg": "L'URL de rappel est obligatoire",
  "prod": "Type de supervision",
  "subscribe_btn": "Abonnement",
  "basic_configs": "Configuration de base",
  "severities": "Gravités abonnées",
  "severities_msg": "La gravité de l'abonnement est obligatoire",
  "tags_groups_require": "Au moins une étiquette ou un groupe destinataire doit être renseigné",
  "note": "Nom de l'abonnement",
  "filter_configs": "Configuration des filtres",
  "notify_configs": "Configuration des notifications",
  "and": "et",
  "btn_add_rule": "Ajouter une règle",
  "basic_configs_desc": "Nom et état d'activation de la règle d'abonnement ; le nom peut être généré à partir des réglages ci-dessus",
  "filter_configs_desc": "Détermine quels événements cet abonnement capte. Les conditions ci-dessous se combinent par ET ; toutes laissées vides, l'ensemble des événements est capté",
  "notify_configs_desc": "Les événements captés sont notifiés une seconde fois selon les règles ci-dessous, ce qui sert souvent à escalader une alerte ou à la confier à une autre équipe",
  "no_filter_warning": "Aucun filtre n'est configuré : cet abonnement captera tous les événements d'alerte",
  "sub_rule_select": "Choisir des règles d'alerte",
  "for_duration_placeholder": "Laissé vide ou à 0, aucune limite ne s'applique",
  "note_msg": "Le nom de l'abonnement est obligatoire",
  "notify_rule_ids_msg": "Choisissez au moins une règle de notification, sans quoi les événements captés ne seront pas notifiés",
  "name_auto": {
    "tip": "Le nom est généré à partir des filtres et de la configuration de notification ci-dessus, et reste modifiable à tout moment",
    "all": "Toutes les alertes",
    "escalation": "Escalade",
    "separator": "、",
    "joiner": "-",
    "clone_suffix": "-copie"
  },
  "section_summary": {
    "severities_all": "Tous les niveaux",
    "severities_none": "Aucun niveau choisi : aucun événement ne correspondra",
    "rules_count": "{{count}} règles",
    "busi_groups_count": "{{count}} conditions de groupe métier",
    "tags_count": "{{count}} conditions d'étiquette",
    "for_duration": "Dure plus de {{count}} secondes",
    "no_extra": "Aucune autre condition",
    "notify_rules_none": "Aucune règle de notification choisie",
    "user_groups_none": "Aucun groupe destinataire choisi",
    "unnamed": "Sans nom",
    "enabled": "Actif",
    "disabled": "Désactivé"
  },
  "empty_guide": {
    "title": "Aucune règle d'abonnement",
    "doc": "Consulter la documentation"
  },
  "scenario_tips": {
    "title": "Les règles d'abonnement conviennent à trois usages",
    "cross_team": "S'abonner aux alertes d'autrui : un service dont vous dépendez est géré par une autre équipe, mais ses pannes vous touchent et vous voulez recevoir ses alertes SLI",
    "escalation": "Filet de sécurité pour l'escalade : notifier une seconde fois le responsable d'équipe pour toute alerte non résolue depuis une heure",
    "global_callback": "Rappel global : envoyer tous les événements d'alerte vers un webhook à des fins d'automatisation",
    "more": "En savoir plus"
  },
  "filter_disabled": {
    "0": "Activer",
    "1": "Désactiver",
    "placeholder": "État d'activation"
  }
};

export default fr_FR;

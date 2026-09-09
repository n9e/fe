const fr_FR = {
  "title": "Recherche dans les journaux",
  "tab": {
    "rename": "Renommer"
  },
  "query": "Condition de requête",
  "query_is_required": "La condition de requête est obligatoire",
  "execute": "Requête",
  "mode": {
    "label": "Mode",
    "raw_logs": "Journaux bruts",
    "statistical_charts": "Graphique statistique"
  },
  "mode_switch": {
    "confirm_title": "Confirmation du changement de mode",
    "confirm_content": "La requête du mode graphique statistique contient une barre verticale (|), syntaxe indisponible en mode journaux bruts. Changer de mode videra la requête. Continuer ?",
    "confirm_ok": "Changer quand même",
    "confirm_cancel": "Annuler"
  },
  "before_query": "Cliquez sur <b>Requête</b> pour afficher les données",
  "loading": "Chargement des données…",
  "no_data": "La requête ne renvoie aucune donnée",
  "histogram_hide": "Masquer le graphique",
  "histogram_show": "Afficher le graphique",
  "share_btn": "Lien de partage",
  "share_tip": "Cliquez pour copier le lien de partage",
  "log_viewer_drawer_trigger_tip": "Cliquez pour voir le détail du journal",
  "log_viewer_drawer_title": "Détail du journal",
  "copy_to_clipboard": "Copier dans le presse-papiers",
  "unindexable": "Les statistiques ne sont pas activées sur ce champ : aucune analyse statistique n'est possible",
  "topn_no_data": "Aucune donnée",
  "stats": {
    "unique_count": "Nombre de valeurs distinctes",
    "min": "Minimum",
    "max": "Maximum",
    "sum": "Somme",
    "avg": "Moyenne",
    "exist_ratio": "Part des journaux contenant ce champ",
    "median": "Médiane",
    "p95": "Centile (P95)"
  },
  "field_popover_info_alert": "Cliquez sur une valeur pour voir le graphique statistique et le SQL",
  "field_search_placeholder": "Rechercher un champ",
  "field_list": {
    "show_fields": "Champs affichés",
    "available_fields": "Champs disponibles"
  },
  "field_actions": {
    "and": "Ajouter à cette recherche",
    "not": "Exclure de cette recherche",
    "exists": "Ne garder que les documents contenant ce champ"
  },
  "field_values_topn": {
    "title": "{{n}} valeurs les plus fréquentes",
    "settings": {
      "title": "Réglage des N valeurs les plus fréquentes"
    },
    "no_data": "Ce champ figure dans le mapping mais dans aucun des 500 documents affichés",
    "quick_view_count": "Nombre de journaux",
    "quick_view_ratio": "Part"
  },
  "empty_value_not_supported_tip": "La recherche sur les valeurs vides n'est pas encore prise en charge",
  "unsupported_datasource_type": "Type de source de données non pris en charge, affichage impossible : {{type}}",
  "no_supported_datasource_types_title": "Aucun type de source de données disponible",
  "no_supported_datasource_types_desc": "Configurez-la depuis la page <a>Gestion des sources de données</a> ou demandez-le à un administrateur. Types actuellement pris en charge : {{types}},",
  "field_tip": "Cliquez pour voir les statistiques",
  "field_value_statistic": {
    "view_statistic": "Voir les statistiques",
    "view_timeseries": "Voir la courbe temporelle"
  },
  "field_type": "Type",
  "field_type_map": {
    "float": "Nombre à virgule flottante",
    "float64": "Flottant 64 bits",
    "scaled_float": "Flottant mis à l'échelle",
    "double": "Flottant double précision",
    "integer": "Entier",
    "int64": "Entier 64 bits",
    "long": "Entier long",
    "date": "Date",
    "date_nanos": "Date en nanosecondes",
    "string": "Chaîne de caractères",
    "text": "Chaîne de caractères",
    "nested": "Objet imbriqué",
    "histogram": "Histogramme",
    "boolean": "Booléen"
  },
  "logs": {
    "title": "Données de journal",
    "stream_fields_count": "{{count}}",
    "text": "Texte du journal",
    "duration": "Durée",
    "count": "Nombre",
    "filter_fields": "Champs de filtre",
    "settings": {
      "mode": {
        "origin": "Brut",
        "table": "Tableau",
        "timeseries": "Courbe temporelle",
        "clustering": "Regroupement"
      },
      "breakLine": "Renvoi à la ligne",
      "reverse": "Heure",
      "lines": "Numéro de ligne",
      "time": "Horodatage",
      "organizeFields": {
        "title": "Réglage des colonnes",
        "allFields": "Champs disponibles",
        "showFields": "Champs affichés",
        "showFields_empty": "Tous les champs sont affichés par défaut",
        "tip": "Seuls les champs {{fields}} sont affichés ; cliquez sur l'icône de réglages pour tous les afficher"
      },
      "jsonSettings": {
        "title": "Réglages JSON",
        "displayMode": "Affichage par défaut",
        "displayMode_tree": "Arborescence",
        "displayMode_string": "Chaîne de caractères",
        "expandLevel": "Niveau déplié par défaut"
      },
      "pageLoadMode": {
        "title": "Mode de pagination",
        "pagination": "Pagination",
        "infiniteScroll": "Chargement au défilement"
      },
      "topNSettings": {
        "title": "Réglage des N valeurs les plus fréquentes"
      }
    },
    "fieldLabelTip": "Les statistiques ne sont pas activées sur ce champ : aucune analyse statistique n'est possible",
    "filterAnd": "Ajouter « {{token}} » à cette recherche",
    "filterNot": "Exclure « {{token}} » de cette recherche",
    "filterAllAnd": "Tout ajouter à cette recherche",
    "filterAllNot": "Tout exclure de cette recherche",
    "filterExists": "Ne garder que les documents contenant ce champ",
    "add_drilldown_link": "Ajouter un lien d'exploration",
    "drilldown_link_default_name": "Liens d'exploration",
    "total": "Nombre de journaux",
    "stack_group_by_tip": "Affiche une courbe de tendance empilée d'après les valeurs de ce champ",
    "collapse": "Replier",
    "expand": "Déplier",
    "copy_field_value": "Copier la valeur du champ"
  },
  "clustering": {
    "count": "Nombre",
    "log_data": "Données de journal",
    "row_number": "Numéro de ligne",
    "log_statistics": "Statistiques des journaux",
    "back_to_all_logs": "Revenir à tous les journaux",
    "all_log_statistics": "Statistiques de tous les journaux",
    "current_page_field": "Pour l'instant, les champs de cette page",
    "aggregate": "sont regroupés,",
    "cannot_aggregate": "impossible pour l'instant de regrouper",
    "full_aggregate_logs": "Regroupement de tous les journaux",
    "need_aggregate": "Pour regrouper la totalité des",
    "click_to_aggregate": "journaux, cliquez sur",
    "full_aggregate": "Tout regrouper",
    "field_label": "Champ de regroupement",
    "scope_current_page": "Page actuelle",
    "scope_current_page_desc": "Seuls les champs de la page actuelle sont regroupés",
    "scope_full": "Tout regrouper",
    "scope_full_desc_prefix": "Sur les",
    "scope_full_desc_disable_prefix": "Impossible pour l'instant de regrouper les",
    "scope_full_desc_suffix": "journaux renvoyés",
    "scope_label": "Portée",
    "aggregate_field": "Champ de regroupement :",
    "log_count": "Volume de journaux :",
    "duration": "Durée :",
    "top5_title": "5 valeurs les plus fréquentes",
    "no_data": "Aucune donnée",
    "loading_title": "Analyse de regroupement en cours, veuillez patienter",
    "loading_info": "Journaux regroupés :",
    "loading_field": "Champ de regroupement :",
    "loading_tip": "Ne fermez pas cette page. Pour une nouvelle recherche,",
    "loading_new_tab": "ouvrez un nouvel onglet",
    "loading_tip_suffix": "et lancez-y votre recherche",
    "sampled_tip": "Les journaux sont trop nombreux : ce regroupement repose sur un échantillon"
  },
  "view_placeholder": "Vue des journaux"
};

export default fr_FR;

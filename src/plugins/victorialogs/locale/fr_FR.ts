const fr_FR = {
  "explorer": {
    "execute": "Requête",
    "query": "Condition de requête",
    "query_required": "La condition de requête est obligatoire",
    "query_lanaguage_docs": "Documentation du langage de requête",
    "limit": "Limite du nombre",
    "hits": "Résultats correspondants",
    "graph_settings": {
      "title": "Réglages du graphique",
      "stacked": "Empiler",
      "fill": "Remplissage"
    },
    "view": {
      "group": "Groupe",
      "table": "Tableau",
      "json": "JSON"
    },
    "total_logs_returned": "Nombre total de journaux renvoyés",
    "total_groups": "Nombre total de groupes",
    "page_size": "Éléments par page",
    "page_size_all": "Toutes",
    "expand_all": "Tout déplier",
    "collapse_all": "Tout replier",
    "group_view": {
      "ungrouped": "Sans regroupement",
      "group_by_field": "Regroupé par « {{field}} »",
      "entries": "entrées",
      "show_field_tip": "Champs affichés",
      "hide_field_tip": "Masquer le champ",
      "group_by_field_icon_tip": "Regrouper par ce champ"
    },
    "group_view_settings": {
      "title": "Réglages de la vue par groupes",
      "group_by_field": "Champ de regroupement",
      "group_by_field_help": "Choisissez le champ servant à regrouper les journaux (par défaut _stream)",
      "ungrouped": "Aucun regroupement",
      "display_fields": "Champs affichés",
      "display_fields_help": "Choisissez les champs à afficher (par défaut _msg)",
      "date_format": "Format de date",
      "date_format_help01": "Définissez le format de date, par exemple YYYY-MM-DD HH:mm:ss. <a>Consultez cette documentation pour en savoir plus</a>",
      "date_format_help02": "Votre format de date actuel : {{dateFormat}}"
    },
    "table_view_settings": {
      "title": "Réglages de la vue tableau",
      "customize_columns": "Colonnes personnalisées",
      "search_columns": "Rechercher une colonne",
      "check_all": "Tout sélectionner"
    },
    "copy_json": "Copier le JSON",
    "parse_failed": "Analyse impossible",
    "timeseries": {
      "value_field": "Champ de valeur",
      "value_field_tip": "Champs numériques servant à tracer la courbe ; plusieurs sont acceptés",
      "value_field_required": "Choisissez un champ de valeur",
      "label_field": "Champ d'étiquette",
      "label_field_tip": "Champs d'étiquette distinguant les séries ; plusieurs sont acceptés",
      "unit": "Unité"
    }
  },
  "builder": {
    "filter": "Filtrer",
    "add": "Ajouter",
    "field": "Champ",
    "operator": "Opérateur",
    "value": "Valeur",
    "function": "Fonction",
    "quantile": "Centile",
    "alias": "Alias",
    "order_by": "Tri",
    "direction": "Tri",
    "field_placeholder": "Saisissez un champ",
    "value_placeholder": "Saisissez une valeur",
    "operator_placeholder": "Choisissez un opérateur",
    "function_placeholder": "Choisissez une fonction",
    "alias_placeholder": "Saisissez un alias",
    "select_field": "Choisissez un champ",
    "select_operator": "Choisissez un opérateur",
    "input_value": "Saisissez une valeur",
    "select_function": "Choisissez une fonction",
    "input_field": "Saisissez un champ",
    "input_quantile": "Saisissez le centile",
    "select_direction": "Choisissez un tri",
    "aggregation": "Agrégation",
    "aggregation_required": "Configurez au moins une agrégation",
    "display": "Affichage",
    "filter_relation_tip": "Tous les filtres se combinent par ET.",
    "statistical_value": "Valeur statistique",
    "timeseries": "Courbe temporelle",
    "group_by": "Groupe",
    "limit": "Limite du nombre",
    "execute": "Requête",
    "preview_ql": "Aperçu de la requête",
    "pin": "Fixe",
    "unpin": "Détacher"
  },
  "datasource": {},
  "alert": {
    "query_warning_no_time": "Il est vivement conseillé de borner explicitement la période avec _time, le champ temporel, dans la requête, faute de quoi la <b>charge du stockage peut s'emballer et les requêtes d'alerte expirer</b>"
  }
};

export default fr_FR;

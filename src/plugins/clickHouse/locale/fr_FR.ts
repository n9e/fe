const fr_FR = {
  "preview": "Aperçu des données",
  "query": {
    "title": "Statistiques de requête",
    "execute": "Requête",
    "query": "SQL",
    "query_required": "Le SQL est obligatoire",
    "query_placeholder": "Saisissez le SQL à exécuter ; Maj+Entrée pour aller à la ligne",
    "query_placeholder2": "Maj+Entrée pour aller à la ligne",
    "advancedSettings": {
      "title": "Réglages complémentaires",
      "tags_placeholder": "Entrée pour en saisir plusieurs",
      "valueKey": "Champ de valeur",
      "valueKey_tip": "Le résultat d'une requête SQL comporte souvent plusieurs colonnes ; indiquez celles dont les valeurs seront tracées",
      "valueKey_required": "Le champ de valeur est obligatoire",
      "labelKey": "Champ d'étiquette",
      "labelKey_tip": "Le résultat d'une requête SQL comporte souvent plusieurs colonnes ; indiquez celles qui serviront d'étiquettes aux séries"
    },
    "schema": "Métadonnées",
    "document": "Documentation",
    "dashboard": {
      "mode": {
        "label": "Mode de requête",
        "table": "Données non temporelles",
        "timeSeries": "Données temporelles"
      }
    },
    "historicalRecords": {
      "button": "Historique",
      "searchPlaceholder": "Historique des recherches"
    },
    "compass_btn_tip": "Cliquez pour voir les données de la table",
    "database": "Bases de données",
    "database_msg": "Choisissez une base de données",
    "table": "Table",
    "table_msg": "Choisissez une table",
    "time_field": "Champ de date",
    "time_field_msg": "Choisissez un champ de date",
    "duration": "Durée",
    "count": "Nombre",
    "navMode": {
      "fields": "Vue par champs",
      "schema": "Vue par structure de table"
    },
    "add_to": {
      "btn": "Ajouter à…",
      "recording_rule": "Ajouter aux règles d'enregistrement",
      "add_recording_rule_title": "Ajouter une règle d'enregistrement"
    },
    "sql_format": {
      "title": "Aperçu du SQL",
      "tip": "Les requêtes plus complexes, comme le maximum, le minimum ou les centiles d'un champ, s'obtiennent en cliquant sur le champ dans la liste de gauche.",
      "origin": "Voir le journal brut",
      "origin_tip": "À copier dans Vue par structure de table, mode Tableau, pour consulter les données",
      "timeseries": "Voir la courbe temporelle",
      "timeseries_tip": "À copier dans Vue par structure de table, mode Courbe temporelle, pour consulter les données, ou à réutiliser dans un tableau de bord pour tracer des courbes à partir de données ClickHouse.",
      "table": "Voir les statistiques",
      "table_tip": "Utilisable pour créer des règles d'alerte et d'enregistrement ClickHouse ainsi que des métriques Northstar."
    },
    "warn_message_btn_1": "Lancer la requête quand même",
    "warn_message_btn_2": "Revenir et modifier",
    "warn_message": "La requête ne contient aucune macro temporelle : la plage horaire choisie restera sans effet.",
    "warn_message_content_1": "Cette requête risque de parcourir la table entière. Mesurez son incidence sur les performances du stockage, puis décidez de la lancer ou de revenir y ajouter une macro temporelle.",
    "warn_message_content_2": "Macros temporelles courantes : ",
    "warn_message_content_3": "Exemple :",
    "warn_message_content_4": "Utilisation des macros temporelles : <a>en savoir plus</a>",
    "default_search_by_tip": "Champs de recherche par défaut",
    "default_search_tip_1": "Définir comme champ de recherche par défaut",
    "default_search_tip_2": "Retirer des champs de recherche par défaut",
    "stack_disabled_tip": "Le graphique empilé n'est pas disponible lorsque le champ compte une seule valeur distincte ou plus de dix",
    "stack_tip_pin": "Activer le graphique empilé",
    "stack_tip_unpin": "Désactiver le graphique empilé",
    "stack_group_by_tip": "Affiche une courbe de tendance empilée d'après les valeurs de ce champ",
    "syntax": {
      "query": "Mode Query",
      "sql": "Mode SQL"
    },
    "sqlVizType": {
      "table": "Tableau",
      "timeseries": "Courbe temporelle"
    }
  },
  "builder": {
    "to_pinned_btn": "Fixe",
    "to_unpinned_btn": "Détacher",
    "database_table": {
      "label": "Base et table",
      "database": "Bases de données",
      "table": "Table"
    },
    "filters": {
      "label": "Filtrer",
      "label_tip": "Tous les filtres se combinent par ET.",
      "add": "Ajouter",
      "field": "Champ",
      "field_placeholder": "Choisissez un champ",
      "operator": "Opérateur",
      "operator_placeholder": "Choisissez un opérateur",
      "value": "Valeur",
      "value_placeholder": "Choisissez une valeur",
      "disabled": "Désactiver",
      "tip_1": "Ce champ n'a pas d'index NGram BloomFilter et la requête risque de parcourir toute la table. Ajoutez un index ou choisissez un autre opérateur"
    },
    "aggregates": {
      "label": "Agrégation",
      "add": "Ajouter",
      "func": "Fonction d'agrégation",
      "func_placeholder": "Choisissez une fonction d'agrégation",
      "field": "Champ",
      "field_placeholder": "Choisissez un champ",
      "percentile": "Centile",
      "percentile_placeholder": "Saisissez le centile",
      "precision": "Précision",
      "precision_placeholder": "Saisissez la précision",
      "n": "Valeur de N",
      "n_placeholder": "Saisissez la valeur de N",
      "alias": "Alias",
      "alias_placeholder": "Saisissez un alias",
      "options": {
        "COUNT": "Nombre de journaux",
        "CPS": "Comptage par seconde",
        "AVG": "Moyenne",
        "SUM": "Somme",
        "MIN": "Minimum",
        "MAX": "Maximum",
        "PERCENTILE": "Centile",
        "UNIQUE_COUNT": "Nombre de valeurs distinctes",
        "EXIST_RATIO": "Part des journaux contenant cette ressource",
        "TOPN": "N valeurs les plus fréquentes",
        "RATIO": "Part",
        "VARIANCE": "Variance",
        "STDDEV": "Écart type"
      }
    },
    "display_label": "Affichage",
    "mode": {
      "table": "Valeur statistique",
      "timeseries": "Courbe temporelle"
    },
    "group_by": "Groupe",
    "order_by": {
      "label": "Tri",
      "add": "Ajouter",
      "field": "Champ",
      "field_placeholder": "Choisissez un champ",
      "direction": "Sens du tri",
      "direction_placeholder": "Choisissez le sens du tri",
      "asc": "Croissant",
      "desc": "Décroissant"
    },
    "limit": "Limite du nombre",
    "excute": "Requête",
    "preview_sql": "Aperçu du SQL",
    "btn_tip": "Un clic écrase le contenu de la zone de saisie SQL",
    "btn_failed_tip": "La conversion a échoué ; réessayez ou modifiez le formulaire",
    "preview_and_run": "Aperçu du SQL puis exécution",
    "builder_content_modified": "Le contenu du constructeur a changé ; générez un nouvel aperçu du SQL"
  },
  "trigger": {
    "title": "Condition d'alerte",
    "value_msg": "Saisissez la valeur de l'expression"
  }
};

export default fr_FR;

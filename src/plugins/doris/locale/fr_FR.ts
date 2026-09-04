const fr_FR = {
  "quick_query": "Requête rapide",
  "quick_query_tip": "La requête rapide compose une requête à partir d'un modèle SQL figé : pour un champ A supérieur à 0, il suffit de saisir A > 0. Ce bouton fait aussi passer en mode personnalisé, où le SQL se consulte et se modifie",
  "custom_query": "Requête personnalisée",
  "custom_query_tip": "La requête personnalisée vous laisse écrire librement vos instructions en SQL",
  "current_database": "Base de données courante",
  "table": "Table",
  "database_table_required": "Choisissez d'abord une base de données et une table",
  "enrich_queries": {
    "title": "Requête complémentaire"
  },
  "query": {
    "mode": {
      "query": "Mode Query",
      "sql": "Mode SQL"
    },
    "submode": {
      "raw": "Journaux bruts",
      "timeSeries": "Courbe temporelle"
    },
    "query_tip": "Exemples SQL :<br />\n    1. Nombre de lignes de journal des 5 dernières minutes : SELECT count() as cnt from database.table WHERE date >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)<br />\n    2. Nombre de lignes sur la plage horaire choisie : SELECT COUNT(*) AS `cnt` FROM `database`.`table` WHERE $__timeFilter(`timestamp`)<br />\n    Pour en savoir plus sur les modes SQL, voir <a>le guide des modes SQL Doris</a>",
    "query_placeholder": "SELECT count(*) as count FROM db_name.table_name WHERE ts >= now() - 5m",
    "execute": "Requête",
    "database": "Bases de données",
    "database_msg": "Choisissez une base de données",
    "table": "Table",
    "table_msg": "Choisissez une table",
    "time_field": "Champ de date",
    "time_field_msg": "Choisissez un champ de date",
    "time_field_tip": "<span>Ce sélecteur de période n'agit que si la requête utilise une macro temporelle</span><br/>Utilisation des macros temporelles : <a>en savoir plus</a>",
    "query": "Condition de requête",
    "query_required": "La condition de requête est obligatoire",
    "advancedSettings": {
      "title": "Réglages complémentaires",
      "tags_placeholder": "Entrée pour en saisir plusieurs",
      "valueKey": "Champ de valeur",
      "valueKey_tip": "Le résultat d'une requête SQL comporte souvent plusieurs colonnes ; indiquez celles dont les valeurs seront tracées",
      "valueKey_required": "Le champ de valeur est obligatoire",
      "labelKey": "Champ d'étiquette",
      "labelKey_tip": "Le résultat d'une requête SQL comporte souvent plusieurs colonnes ; indiquez celles qui serviront d'étiquettes aux séries"
    },
    "get_index_fail": "Impossible de récupérer les index de la table",
    "warn_message_btn_1": "Lancer la requête quand même",
    "warn_message_btn_2": "Revenir et modifier",
    "warn_message": "La requête ne contient aucune macro temporelle : la plage horaire choisie restera sans effet.",
    "warn_message_content_1": "Cette requête risque de parcourir la table entière. Mesurez son incidence sur les performances du stockage, puis décidez de la lancer ou de revenir y ajouter une macro temporelle.",
    "warn_message_content_2": "Macros temporelles courantes : ",
    "warn_message_content_3": "Exemple :",
    "warn_message_content_4": "Utilisation des macros temporelles : <a>en savoir plus</a>",
    "editMode": {
      "switch_to_builder_confirm_title": "Passer en mode constructeur",
      "switch_to_builder_confirm_content": "Le SQL actuel ne peut pas être traduit en réglages du constructeur : le passage effacerait vos modifications. Continuer ?",
      "no_builder_config": "Configurez d'abord la requête",
      "require_db_table": "Choisissez d'abord une base de données et une table",
      "build_sql_failed": "Impossible de générer le SQL"
    },
    "dashboard": {
      "mode": {
        "label": "Mode de requête",
        "table": "Données non temporelles",
        "timeSeries": "Données temporelles"
      }
    },
    "stackByField": "Champ d'empilement",
    "stack_disabled_tip": "Le graphique empilé n'est pas disponible lorsque le champ compte une seule valeur distincte ou plus de dix",
    "stack_tip_pin": "Activer le graphique empilé",
    "stack_tip_unpin": "Désactiver le graphique empilé",
    "stack_group_by_tip": "Affiche une courbe de tendance empilée d'après les valeurs de ce champ",
    "sql_format": {
      "title": "Aperçu du SQL",
      "tip": "Les requêtes plus complexes, comme le maximum, le minimum ou les centiles d'un champ, s'obtiennent en cliquant sur le champ dans la liste de gauche.",
      "origin": "Voir le journal brut",
      "origin_tip": "À copier dans Vue par structure de table, mode Tableau, pour consulter les données",
      "timeseries": "Voir la courbe temporelle",
      "timeseries_tip": "À copier dans Vue par structure de table, mode Courbe temporelle, pour consulter les données, ou à réutiliser dans un tableau de bord pour tracer des courbes à partir de données Doris.",
      "table": "Voir les statistiques",
      "table_tip": "Utilisable pour créer des règles d'alerte et d'enregistrement Doris ainsi que des métriques Northstar."
    },
    "defaultSearchField": "Champs de recherche par défaut",
    "default_search_tip_1": "Définir comme champ de recherche par défaut",
    "default_search_tip_2": "Retirer des champs de recherche par défaut",
    "default_search_by_tip": "Champs de recherche par défaut",
    "datasource_disabled_tip": "Choisissez d'abord une source de données",
    "interval": "Plage de la requête",
    "interval_tip": "Le réglage de la plage n'agit que si le SQL utilise la macro temporelle $__timeFilter.<br />Le système d'alerte s'appuie sur cette fenêtre pour borner les données parcourues, préservant ainsi la réactivité des alertes et les performances de la base",
    "offset": "Requête différée",
    "offset_tip": "Décale la requête d'un certain nombre de secondes vers le passé avant de l'exécuter, à la manière de l'offset de PromQL.<br />C'est utile lorsque l'écriture ou l'acheminement des données prend du retard, afin d'éviter les fausses alertes dues à des données arrivées trop tard",
    "sql_warning_1": "Il est vivement conseillé de borner explicitement la période avec $__timeFilter(champ temporel) dans la clause WHERE, faute de quoi la <b>charge de la base peut s'emballer et les requêtes d'alerte expirer</b>",
    "sql_warning_2": "Le SQL utilise $__timeGroup : la requête renvoie donc des données pour plusieurs instants. Dans ce cas, <b>le système ne retient que le résultat le plus récent</b>",
    "duration": "Durée",
    "count": "Nombre",
    "click_doc": "Cliquez pour ouvrir la documentation sur les <a>conditions de requête</a>",
    "navMode": {
      "fields": "Vue par champs",
      "schema": "Vue par structure de table"
    },
    "syntax": {
      "query": "Mode Query",
      "sql": "Mode SQL"
    },
    "sqlVizType": {
      "table": "Tableau",
      "timeseries": "Courbe temporelle"
    },
    "add_to": {
      "btn": "Ajouter à…",
      "recording_rule": "Ajouter aux règles d'enregistrement",
      "add_recording_rule_title": "Ajouter une règle d'enregistrement"
    }
  },
  "builder": {
    "to_pinned_btn": "Fixe",
    "open_builder": "Ouvrir le constructeur",
    "config_required": "La configuration du constructeur est obligatoire",
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
        "TOPN": "N valeurs les plus fréquentes"
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
  }
};

export default fr_FR;

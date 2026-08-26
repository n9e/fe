const fr_FR = {
  "title": "Vue des métriques",
  "name": "Nom de la métrique",
  "collector": "Catégorie",
  "typ": "Type de composant",
  "expression_type": "Type d'expression",
  "expression_type_metric_name": "Nom de la métrique",
  "expression_type_promql": "PromQL",
  "metric_type": "Type de métrique",
  "metric_type_gauge": "Gauge",
  "metric_type_counter": "Counter",
  "metric_type_histogram": "Histogram",
  "extra_fields": "Champs personnalisés",
  "extra_fields_name": "Nom",
  "extra_fields_value": "Valeur",
  "laset_over_time": "Dernière remontée",
  "unit": "Unité",
  "unit_tip": "Au tracé, les valeurs sont mises en forme automatiquement selon l'unité de la métrique",
  "note": "Description",
  "note_preview": "Aperçu de la description",
  "expression": "PromQL",
  "add_btn": "Créer une métrique",
  "clone_title": "Dupliquer la métrique",
  "edit_title": "Modifier la métrique",
  "explorer": "Requête",
  "closePanelsBelow": "Fermer le panneau du bas",
  "addPanel": "Ajouter un panneau",
  "translation": "Description des métriques",
  "batch": {
    "not_select": "Choisissez d'abord une métrique",
    "export": {
      "title": "Exporter les métriques"
    },
    "import": {
      "title": "Importer des métriques",
      "name": "Nom de la métrique",
      "result": "Résultat de l'import",
      "errmsg": "Message d'erreur"
    }
  },
  "filter": {
    "title": "Filtre",
    "title_tip": "Le filtre restreint la portée des données lorsque vous cliquez sur une métrique à droite pour la consulter. Avec le filtre {ident=\"n9e01\"} défini et sélectionné, interroger cpu_usage_idle revient en réalité à interroger cpu_usage_idle{ident=\"n9e01\"}, ce qui réduit fortement le nombre de séries",
    "add_title": "Ajouter un filtre",
    "edit_title": "Modifier le filtre",
    "import_title": "Importer des filtres",
    "name": "Nom",
    "datasource": "Source de données",
    "datasource_tip": "Source de données auxiliaire pour les requêtes de filtre",
    "configs": "Filtre",
    "groups_perm": "Équipes autorisées",
    "groups_perm_gid_msg": "Choisissez les équipes autorisées",
    "perm": {
      "0": "Lecture seule",
      "1": "Lecture et écriture"
    },
    "build_labelfilter_and_expression_error": "Impossible de construire le filtre d'étiquettes et l'expression",
    "filter_label_msg": "L'étiquette est obligatoire",
    "filter_oper_msg": "L'opérateur est obligatoire",
    "filter_value_msg": "La valeur de l'étiquette est obligatoire"
  }
};

export default fr_FR;

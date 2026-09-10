const fr_FR = {
  "preview": "Aperçu des données",
  "query": {
    "title": "Statistiques de requête",
    "execute": "Requête",
    "project": "Projet",
    "project_msg": "Choisissez un projet",
    "project_tip": "\n      <1>Le projet est l'unité de gestion des ressources du service de journaux et la principale frontière de cloisonnement entre utilisateurs et de contrôle d'accès. Pour en savoir plus, voir<1>\n      <2>Projet</2>\n    ",
    "logstore": "Logstore",
    "logstore_msg": "Choisissez un logstore",
    "logstore_tip": "\n      <1>Le logstore est l'unité de collecte, de stockage et d'interrogation des journaux au sein du service. Pour en savoir plus, voir<1>\n      <2>Logstore</2>\n    ",
    "range": "Plage de la requête",
    "power_sql": "SQL enrichi",
    "query": "SQL",
    "query_msg": "Saisissez du SQL",
    "query_tip1": "La syntaxe de requête TDengine est décrite dans",
    "query_tip2": "la documentation officielle",
    "sqlTemplates": "Modèles de requête",
    "sqlTemplates_tip": "Ces requêtes SQL ne sont que des exemples : remplacez chaque $variable par la valeur réelle avant de les utiliser",
    "mode": {
      "timeSeries": "Valeur temporelle",
      "raw": "Journaux bruts"
    },
    "advancedSettings": {
      "title": "Réglages complémentaires",
      "metricKey_label": "Champ de valeur",
      "metricKey_tip": "Le résultat d'une requête SQL comporte souvent plusieurs colonnes ; indiquez celles dont les valeurs seront tracées",
      "tags_placeholder": "Entrée pour en saisir plusieurs",
      "labelKey_label": "Champ d'étiquette",
      "labelKey_tip": "Le résultat d'une requête SQL comporte souvent plusieurs colonnes ; indiquez celles qui serviront d'étiquettes aux séries",
      "timeKey_tip": "Indiquez le champ temporel qui servira d'axe des abscisses au graphique",
      "timeFormat_tip": "Format de la date, qui sert à la convertir en horodatage"
    },
    "schema": "Métadonnées",
    "table": "Table ordinaire",
    "stable": "Super-table"
  },
  "trigger": {
    "title": "Condition d'alerte",
    "value_msg": "Saisissez la valeur de l'expression"
  }
};

export default fr_FR;

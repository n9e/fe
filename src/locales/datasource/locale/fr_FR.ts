const fr_FR = {
  "es": {
    "ref": "Nom",
    "index": "Index",
    "index_tip": "\n      Plusieurs écritures sont possibles\n      <1 />\n      1. Un seul index : gb cherche tous les documents de l'index gb\n      <1 />\n      2. Plusieurs index : gb,us cherche tous les documents des index gb et us\n      <1 />\n      3. Un préfixe d'index : g*,u* cherche tous les documents des index commençant par g ou u\n      <1 />\n      ",
    "index_msg": "L'index est obligatoire",
    "indexPattern": "Index pattern",
    "indexPatterns": "Index pattern",
    "indexPattern_msg": "L'index pattern est obligatoire",
    "indexPatterns_manage": "Gérer les index patterns",
    "filter": "Filtre",
    "index_placeholder": "Index log-* (jokers acceptés)",
    "index_pattern_placeholder": "Choisir un index pattern",
    "filter_placeholder": "Filtre status:500 AND method:GET",
    "syntax": "Syntaxe",
    "time_label": "Granularité temporelle",
    "date_field": "Champ de date",
    "date_field_msg": "Le champ de date est obligatoire",
    "interval": "Intervalle",
    "value": "Extraction de valeur",
    "func": "Fonction",
    "funcField": "Nom du champ",
    "histogram": {
      "interval": "Pas"
    },
    "terms": {
      "label": "Regrouper par le champ indiqué",
      "more": "Réglages avancés",
      "size": "Nombre de correspondances",
      "min_doc_count": "Minimum de documents"
    },
    "raw": {
      "limit": "Nombre de journaux",
      "date_format": "Format de date",
      "date_format_tip": "Utilisez un motif au format Moment.js, par exemple YYYY-MM-DD HH:mm:ss.SSS"
    },
    "alert": {
      "query": {
        "title": "Statistiques de requête",
        "preview": "Aperçu des données"
      },
      "trigger": {
        "title": "Condition d'alerte",
        "builder": "Mode simple",
        "code": "Mode expression",
        "label": "Label associé"
      },
      "prom_eval_interval_tip": "Interroge le stockage toutes les {{num}} secondes",
      "prom_for_duration_tip": "La durée est en général supérieure à la fréquence d'exécution : sur cette durée la requête est lancée plusieurs fois et l'alerte n'apparaît que si toutes déclenchent. Avec une durée de 0, une seule requête satisfaisant la condition suffit",
      "advancedSettings": "Réglages avancés",
      "delay": "Exécution différée"
    },
    "event": {
      "groupBy": "Regroupé par {{field}}, {{size}} correspondances, minimum de {{min_doc_count}} documents",
      "logs": {
        "title": "Détail du journal",
        "size": "Nombre de résultats",
        "fields": "Champs de filtre",
        "jsonParseError": "Échec de l'analyse"
      }
    },
    "syntaxOptions": "Options de syntaxe",
    "queryFailed": "La requête a échoué ; réessayez plus tard",
    "offset_tip": "Interroge les données antérieures à la période indiquée, comme l'offset de PromQL ; en secondes"
  },
  "datasource": {
    "max_query_rows": "Nombre maximal de lignes renvoyées par requête",
    "max_idle_conns": "Connexions inactives maximales",
    "max_open_conns": "Connexions ouvertes maximales",
    "conn_max_lifetime": "Durée de vie maximale d'une connexion (secondes)",
    "timeout": "Délai maximal (secondes)",
    "timeout_ms": "Délai maximal (millisecondes)"
  },
  "query": {
    "title": "Statistiques de requête",
    "execute": "Requête",
    "query": "Condition de requête",
    "query_required": "La condition de requête est obligatoire",
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
    }
  }
};

export default fr_FR;

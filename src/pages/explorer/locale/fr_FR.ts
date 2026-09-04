const fr_FR = {
  "title": "Requête instantanée",
  "log_title": "Recherche dans les journaux",
  "add_btn": "Ajouter un panneau de requête",
  "query_btn": "Requête",
  "query_tab": "Requête",
  "addPanel": "Ajouter un panneau",
  "log": {
    "search_placeholder": "Rechercher un champ",
    "available": "Champs disponibles",
    "selected": "Champs sélectionnés",
    "interval": "Intervalle",
    "mode": {
      "indexPatterns": "Index Patterns",
      "indices": "Indices"
    },
    "hideChart": "Masquer le graphique",
    "showChart": "Afficher le graphique",
    "fieldValues_topn": "5 valeurs les plus fréquentes",
    "fieldValues_topnNoData": "Ce champ figure dans le mapping mais dans aucun des 500 documents affichés",
    "copyToClipboard": "Copier dans le presse-papiers",
    "show_conext": "Show Context",
    "context": "Contexte du journal",
    "context_result_count": "Nombre de résultats",
    "context_lines": "{{num}} lignes avant et après",
    "limit": "Nombre de résultats",
    "sort": {
      "NEWEST_FIRST": "Plus récent d'abord",
      "OLDEST_FIRST": "Plus ancien d'abord"
    },
    "download": "Télécharger les journaux",
    "export": "Historique des téléchargements",
    "log_download": {
      "title": "Télécharger",
      "download_title": "Télécharger les données de journal",
      "range": "Plage horaire",
      "filter": "Requête de recherche",
      "query_condition": "Condition de requête",
      "format": "Format des données",
      "time_sort": "Tri des journaux",
      "count": "Nombre de lignes",
      "time_sort_desc": "Du plus récent au plus ancien",
      "time_sort_asc": "Du plus ancien au plus récent",
      "all": "Toutes",
      "custom": "Personnalisé",
      "custom_validated": "Le nombre ne peut pas dépasser {{maxCount}}",
      "all_quantity": "Total approximatif",
      "createSuccess": "Tâche créée"
    },
    "log_export": {
      "title": "Historique des exports (les fichiers exportés en ligne sont conservés 3 jours)",
      "fileName": "Nom du fichier",
      "create_time": "Créé le",
      "describe": "Description du fichier",
      "status": "État",
      "status0": "En attente",
      "status1": "Généré",
      "status2": "Fichier expiré",
      "operation": "Actions",
      "delSuccess": "Tâche supprimée",
      "del_btn_tips": "Confirmer la suppression ?",
      "del_btn": "Supprimer",
      "emptyText": "Aucun export enregistré ; lancez une recherche puis cliquez sur Télécharger",
      "size": "Taille du fichier",
      "reload_btn_tip": "Actualiser"
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
      }
    }
  },
  "drilldown_settings": "Réglages d'exploration",
  "historicalRecords": {
    "button": "Historique",
    "searchPlaceholder": "Historique des recherches"
  },
  "share_tip": "Cliquez pour copier le lien de partage",
  "share_tip_2": "Cliquez pour copier le lien de partage ; seules les recherches sur les journaux bruts sont partageables aujourd'hui",
  "help": "Mode d'emploi",
  "clear_tabs": "Vider",
  "clear_tabs_tip": "Ne garder que cet onglet",
  "stats": {
    "unique_count": "Nombre de valeurs distinctes",
    "min": "Minimum",
    "max": "Maximum",
    "sum": "Somme",
    "avg": "Moyenne",
    "topn_no_data": "Aucune donnée",
    "unindexable": "Les statistiques ne sont pas activées sur ce champ : aucune analyse statistique n'est possible"
  },
  "field_list": {
    "show_fields": "Champs affichés",
    "available_fields": "Champs disponibles"
  },
  "empty_value_not_supported_tip": "La recherche sur les valeurs vides n'est pas encore prise en charge",
  "logs": {
    "title": "Données de journal",
    "count": "Nombre de résultats",
    "filter_fields": "Champs de filtre",
    "settings": {
      "mode": {
        "origin": "Brut",
        "table": "Tableau"
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
      }
    },
    "tagsDetail": "Détail de l'étiquette",
    "expand": "Déplier",
    "collapse": "Replier",
    "fieldValues_topnNoData": "Aucune donnée",
    "stats": {
      "numberOfUniqueValues": "Nombre de valeurs distinctes",
      "min": "Minimum",
      "max": "Maximum",
      "sum": "Somme",
      "avg": "Moyenne"
    },
    "fieldLabelTip": "Les statistiques ne sont pas activées sur ce champ : aucune analyse statistique n'est possible",
    "filterAnd": "Ajouter à cette recherche",
    "filterNot": "Exclure de cette recherche",
    "total": "Nombre de journaux",
    "stack_group_by_tip": "Affiche une courbe de tendance empilée d'après les valeurs de ce champ"
  }
};

export default fr_FR;

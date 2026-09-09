const fr_FR = {
  "精确": "Exact",
  "正则": "Expression régulière",
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
    "compass_btn_tip": "Cliquez pour voir les données de la table"
  },
  "trigger": {
    "title": "Condition d'alerte",
    "value_msg": "Saisissez la valeur de l'expression"
  },
  "datasource": {
    "shards": {
      "title": "Informations sur la source de données",
      "title_tip": "L'accès à la base dépend des droits accordés par le DBA à l'utilisateur concerné. Si la connexion échoue pour cette raison, poursuivez la configuration et vérifiez plus tard.",
      "addr": "Adresse de la base de données",
      "addr_tip": "L'adresse de la base de données doit être unique",
      "user": "Nom d'utilisateur",
      "password": "Mot de passe",
      "help": "Remarque : le compte doit disposer d'un droit de lecture sur la base pour poursuivre. Si vous en changez, privilégiez un compte en lecture seule."
    },
    "max_query_rows": "Nombre maximal de lignes renvoyées par requête",
    "max_idle_conns": "Connexions inactives maximales",
    "max_open_conns": "Connexions ouvertes maximales",
    "conn_max_lifetime": "Durée de vie maximale d'une connexion (secondes)",
    "timeout": "Délai maximal (secondes)"
  }
};

export default fr_FR;

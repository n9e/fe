const fr_FR = {
  "modal": {
    "title": "Réglages de migration",
    "success": "Migration effectuée",
    "datasource_variable": "Réglages de la variable de source de données",
    "variable_name": "Nom de la variable",
    "variable_name_required": "Saisissez le nom de la variable",
    "datasource_type": "Type de source de données",
    "datasource_default": "Source de données par défaut"
  },
  "title": "Migration des tableaux de bord",
  "migrate": "Migrer",
  "help": "\n  La version 6 ne prend plus en charge le changement global de cluster Prometheus ; la nouvelle version obtient le même résultat en reliant les graphiques à une variable de source de données.\n  <br />\n  L'outil de migration crée une variable de source de données et l'associe à tous les graphiques qui n'en ont pas.\n  <br />\n  Voici la liste des tableaux de bord à migrer ; cliquez sur Migrer pour commencer.\n  "
};

export default fr_FR;

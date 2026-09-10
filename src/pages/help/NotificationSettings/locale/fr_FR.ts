const fr_FR = {
  "title": "Paramètres de notification",
  "disabled": "Désactiver",
  "webhooks": {
    "help_content": "Les rappels relient Nightingale à d'autres systèmes. Chaque événement d'alerte produit est envoyé à toutes les URL de rappel : vous pouvez donc développer votre propre API HTTP, la déclarer ici, recevoir les événements et y greffer votre logique automatisée ou sur mesure. Nightingale appelle en HTTP POST et place le contenu de l'événement au format JSON dans le corps de la requête ; la structure des données est décrite [ici](https://github.com/ccfos/nightingale/blob/main/models/alert_cur_event.go#L19). Pour l'essayer, prenez une machine joignable depuis Nightingale, par exemple d'adresse 10.1.2.3, et ouvrez-y un port avec nc, comme `nc -k -l 4321` qui écoute sur le port 4321. Déclarez ensuite `http://10.1.2.3:4321` comme URL de rappel, créez une règle d'alerte, et dès qu'elle se déclenche Nightingale appelle cette adresse : la sortie de nc vous montre alors le format exact des données.",
    "title": "URL de rappel",
    "enable": "Activer",
    "note": "Remarque",
    "url": "URL",
    "timeout": "Délai maximal (s)",
    "basic_auth_user": "Identifiant (Basic Auth)",
    "basic_auth_password": "Mot de passe (Basic Auth)",
    "skip_verify": "Ignorer la vérification SSL",
    "add": "Ajouter",
    "help": "\n      Pour transférer l'ensemble des événements d'alerte de Nightingale vers une autre plateforme, l'URL de rappel globale ci-dessous est la solution.\n      <br />\n      <br />\n      Un système de supervision se concentre en général sur la collecte, le stockage et l'analyse des données ainsi que sur la création des événements d'alerte. La distribution, la réduction du bruit, la prise en charge, l'escalade, les tours d'astreinte et la collaboration relèvent d'un produit distinct, dit produit OnCall, largement adopté par les entreprises qui pratiquent le SRE.\n      <br />\n      <br />\n      Ces produits se connectent à la plupart des systèmes de supervision, comme Prometheus, Nightingale, Zabbix, ElastAlert, BlueKing ou les offres de supervision des clouds. Chaque système pousse ses événements vers le centre OnCall par webhook, où l'utilisateur assure ensuite la distribution, le filtrage et le traitement.\n      <br />\n      <br />\n      À l'international, <a1>PagerDuty</a1> fait référence ; en Chine, c'est <a2>FlashDuty</a2>. L'un comme l'autre s'essaient gratuitement après inscription.\n    "
  },
  "script": {
    "title": "Script de notification",
    "enable": "Activer",
    "timeout": "Délai maximal (s)",
    "type": [
      "Utiliser un script",
      "Utiliser un chemin"
    ],
    "path": "Chemin du fichier",
    "content": "Contenu du script"
  },
  "channels": {
    "title": "Médias de notification",
    "name": "Nom",
    "ident": "Identifiant",
    "ident_msg1": "L'identifiant ne peut contenir que des lettres, des chiffres, des tirets bas et des tirets",
    "ident_msg2": "Cet identifiant existe déjà",
    "hide": "Masquer",
    "add": "Ajouter",
    "add_title": "Ajouter un média de notification",
    "edit_title": "Modifier le média de notification",
    "enabled": "Activer"
  },
  "contacts": {
    "title": "Moyen de contact",
    "add_title": "Ajouter un moyen de contact",
    "edit_title": "Modifier le moyen de contact"
  },
  "smtp": {
    "title": "Réglages SMTP",
    "testMessage": "L'e-mail de test a été envoyé ; vérifiez votre boîte de réception"
  },
  "ibex": {
    "title": "Configuration de l'autoréparation"
  }
};

export default fr_FR;

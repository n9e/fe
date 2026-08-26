const fr_FR = {
  "close": "Fermer",
  "card": {
    "title": "Et ensuite",
    "later": "Vous pourrez aussi reprendre plus tard depuis la liste des machines",
    "optional": "Facultatif",
    "dismiss": "Ne plus afficher",
    "rows": {
      "collect": {
        "title": "Configurer la collecte",
        "desc": "Les métriques système de base sont collectées automatiquement ; configurez les bases de données et les middlewares selon vos besoins",
        "action": "Configurer"
      },
      "pack": {
        "title": "Appliquer le tableau de bord hôtes et activer les alertes hôtes",
        "desc": "Importer en un clic les tableaux de bord et règles d'alerte intégrés",
        "action": "Activer en un clic"
      },
      "notify": {
        "title": "Associer une notification",
        "desc": "Il suffit de coller le webhook d'un bot DingTalk, Feishu ou WeCom",
        "action": "Création rapide"
      },
      "test": {
        "title": "Envoyer une alerte de test",
        "desc": "Vérifier que les alertes vous parviennent réellement",
        "action": "Envoyer"
      }
    }
  },
  "pack": {
    "title": "Activer le pack de supervision des hôtes",
    "intro": "Les éléments suivants seront importés et activés :",
    "boards": "Tableau de bord",
    "rules": "Règle d'alerte",
    "boards_count": "{{count}} tableaux de bord",
    "rules_count": "{{count}} règles d'alerte, activées dès l'import",
    "preview": "Prévisualiser et choisir",
    "existing": "(existe déjà)",
    "existing_skipped": "Le groupe métier cible possède déjà un tableau de bord du même nom ; il est ignoré",
    "rule_existing_skipped": "Le groupe métier cible possède déjà une règle d'alerte du même nom ; elle est ignorée et la configuration existante n'est pas écrasée",
    "already_imported": "Tous les tableaux de bord sélectionnés existent déjà dans ce groupe métier ; seules les règles d'alerte seront ajoutées",
    "boards_incomplete": "Aucun modèle de tableau de bord hôte intégré ne correspond ; ouvrez « Prévisualiser et choisir » pour sélectionner vous-même",
    "notify_rules": "Règle de notification",
    "notify_rules_tip": "Sans règle de notification associée, les alertes créent bien des événements mais ne sont envoyées à personne",
    "notify_rules_placeholder": "Choisissez une règle de notification existante ou créez-en une avec « Création rapide » ci-dessus",
    "quick_create": "Création rapide",
    "submit": "Activer en un clic",
    "view_board": "Voir le tableau de bord hôtes",
    "next_test": "Envoyer une alerte de test",
    "no_notify_warning": "Ces règles d'alerte n'ont aucune règle de notification associée : personne ne sera prévenu lorsqu'elles se déclencheront",
    "go_bind_notify": "Associer en masse depuis la liste des règles d'alerte",
    "component_missing": "L'intégration Linux intégrée est introuvable ; l'activation en un clic est impossible",
    "load_failed": "Impossible de lire les modèles intégrés",
    "go_components": "Importer manuellement depuis le centre d'intégrations",
    "bad_template": "Impossible d'analyser les modèles intégrés",
    "unknown_error": "Erreur inconnue"
  },
  "notify": {
    "bind_hint": "La règle de notification a été créée, mais les alertes hôtes actives ne lui sont pas encore associées : les vraies alertes ne préviendront toujours personne"
  },
  "test": {
    "title": "Envoyer une alerte de test",
    "rule_label": "Règle de notification à utiliser",
    "send": "Envoyer une alerte de test",
    "result_title": "Résultat de l'envoi",
    "sent": "Le média de notification a été appelé ; voici sa réponse",
    "sent_hint": "Vérifiez dans le salon ou la boîte mail que ce message de test est bien arrivé : c'est la seule preuve que la chaîne de notification fonctionne",
    "no_rule": "Aucune règle de notification configurée",
    "go_create_rule": "Créer une règle de notification",
    "rule_without_config": "Cette règle de notification n'a aucun média associé ; l'envoi est impossible",
    "no_channel": "Aucun média de notification sélectionné",
    "channel_fallback": "Média de notification {{index}}",
    "go_check_channel": "Vérifier les médias de notification",
    "channel_doc": "Consulter la documentation de configuration",
    "unknown_error": "Échec de l'envoi : erreur inconnue"
  }
};

export default fr_FR;

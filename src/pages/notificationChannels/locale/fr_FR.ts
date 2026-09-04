const fr_FR = {
  "title": "Médias de notification",
  "basic_configuration": "Configuration de base",
  "default_values": {
    "access_key_id": "À remplacer par le véritable access_key_id",
    "access_key_secret": "À remplacer par le véritable access_key_secret",
    "show_number": "À remplacer par le véritable show_number ; laissé vide, il n'est pas affiché",
    "voice_code": "À remplacer par le véritable voice_code",
    "sign_name": "À remplacer par la véritable signature",
    "template_id": "À remplacer par le véritable identifiant de modèle",
    "secret_id": "À remplacer par le véritable secret_id",
    "secret_key": "À remplacer par la véritable secret_key",
    "region": "À remplacer par la véritable région",
    "app_id": "À remplacer par le véritable appid",
    "ali_voice_tts_param": "Incident {{$tpl.incident}}. Tapez 1 pour le prendre en charge",
    "ali_sms_template_param": "Incident {{$tpl.incident}}. Merci d'intervenir rapidement"
  },
  "ident": "Type de média",
  "ident_tip": "Catégorie du média de notification : plusieurs médias DingTalk peuvent ainsi partager le type dingtalk. Le type se saisit librement et ne se limite pas aux entrées de la liste ; c'est par ce champ que médias et modèles de message sont reliés",
  "note_tip": "Notez ici des précisions sur ce média ou ses cas d'usage, utiles pour la maintenance et le travail en équipe",
  "enable_tip": "Détermine si cette configuration de média est active. Désactivée, elle cesse temporairement d'agir et plus aucune notification n'est envoyée",
  "advanced_settings": "Réglages avancés",
  "variable_configuration": {
    "title": "Configuration des variables",
    "contact_key": "Moyen de contact",
    "contact_key_tip": "Correspond aux moyens de contact définis dans Personnes et organisation - Gestion des utilisateurs et sert à choisir par quel biais notifier : « Phone » transmet par exemple le numéro de téléphone de l'utilisateur à la requête ou au script de rappel. De nouveaux types se créent depuis la page Personnes et organisation - Moyens de contact",
    "params": {
      "title": "Configuration des paramètres",
      "title_tip": "Définissez les paramètres propres à ce média, par exemple le jeton d'un bot DingTalk ou une clé d'API. Leurs valeurs se renseignent au moment de choisir le média dans une règle de notification",
      "key": "Identifiant du paramètre",
      "key_required": "L'identifiant du paramètre est obligatoire",
      "cname": "Nom du paramètre",
      "cname_required": "Le nom du paramètre est obligatoire"
    }
  },
  "request_configuration": {
    "http": "Configuration HTTP",
    "smtp": "Configuration SMTP",
    "script": "Configuration du script",
    "flashduty": "Configuration FlashDuty",
    "pagerduty": "Configuration PagerDuty",
    "dingtalkapp": "Configuration de l'application DingTalk",
    "wecomapp": "Configuration de l'application WeCom",
    "feishuapp": "Configuration de l'application Feishu"
  },
  "request_type": "Mode d'envoi",
  "http_request_config": {
    "title": "HTTP",
    "url": "URL",
    "url_tip": "Adresse recevant les requêtes de notification",
    "method": "Méthode de requête",
    "header": "En-têtes de requête",
    "header_tip": "En-têtes HTTP à joindre à la requête, comme des identifiants BasicAuth. L'URL, les en-têtes, les valeurs de paramètres et le corps peuvent tous référencer les variables de Configuration système - Configuration des variables via {{.nom_de_variable}}, ce qui évite d'inscrire ici en clair des jetons ou autres secrets",
    "header_key": "Nom du paramètre",
    "header_value": "Valeur du paramètre",
    "timeout": "Délai maximal (millisecondes)",
    "concurrency": "Requêtes simultanées",
    "concurrency_tip": "Nombre maximal de requêtes lancées en parallèle. L'augmenter accélère l'envoi, à condition que le service destinataire suive",
    "retry_times": "Nombre de tentatives",
    "retry_interval": "Délai entre deux tentatives (millisecondes)",
    "insecure_skip_verify": "Ignorer la vérification du certificat",
    "proxy": "Proxy",
    "proxy_tip": "Adresse du proxy HTTP, lorsque le passage par un proxy est nécessaire",
    "params": "Paramètres de requête",
    "params_key": "Nom du paramètre",
    "params_value": "Valeur du paramètre",
    "body": "Corps de la requête"
  },
  "smtp_request_config": {
    "title": "SMTP",
    "host": "Serveur",
    "host_tip": "Adresse du serveur SMTP utilisé pour envoyer les messages, par exemple smtp.example.com",
    "port": "Port",
    "port_tip": "Port du serveur SMTP. Les plus courants sont 25, 465 (SSL) et 587 (STARTTLS) ; confirmez le bon port auprès de votre fournisseur",
    "username": "Nom d'utilisateur",
    "username_tip": "Identifiant de connexion au serveur SMTP, en général une adresse e-mail",
    "password": "Mot de passe",
    "password_tip": "Mot de passe ou code d'application associé à cet identifiant SMTP ; le code d'application est préférable pour la sécurité",
    "from": "Expéditeur",
    "from_tip": "Nom d'expéditeur ou alias affiché dans le message, qui aide le destinataire à en reconnaître l'origine. Exemple de format : Flashcat <no-reply@notice.flashcat.cloud>",
    "insecure_skip_verify": "Ignorer la vérification du certificat",
    "insecure_skip_verify_tip": "Une fois activé, le certificat du serveur SMTP n'est plus vérifié ; utile pour les tests ou les certificats auto-signés",
    "batch": "Envoi groupé",
    "batch_tip": "Nombre de messages envoyés par connexion SMTP"
  },
  "script_request_config": {
    "title": "Script",
    "script": {
      "option": "Utiliser un script",
      "label": "Contenu du script"
    },
    "path": {
      "option": "Utiliser un chemin",
      "label": "Chemin du fichier"
    },
    "timeout": "Délai maximal (millisecondes)"
  },
  "flashduty_request_config": {
    "title": "FlashDuty",
    "integration_url": "URL",
    "integration_url_tip": "Indiquez ici l'URL d'intégration créée dans le centre d'intégrations Flashduty, sur https://console.flashcat.cloud/settings/source/alert/add/n9e",
    "proxy": "Proxy",
    "proxy_tip": "Adresse du proxy HTTP, lorsque le passage par un proxy est nécessaire",
    "timeout": "Délai maximal (millisecondes)",
    "retry_times": "Nombre de tentatives"
  },
  "pagerduty_request_config": {
    "title": "PagerDuty",
    "api_key": "API Key",
    "api_key_tip": "Indiquez ici la clé d'API d'intégration PagerDuty ; la documentation https://developer.pagerduty.com/docs/authentication explique comment l'obtenir",
    "proxy": "Proxy",
    "proxy_tip": "Adresse du proxy HTTP, lorsque le passage par un proxy est nécessaire",
    "timeout": "Délai maximal (millisecondes)",
    "retry_times": "Nombre de tentatives"
  },
  "dingtalkapp_request_config": {
    "app_key": "Identifiant unique de l'application",
    "app_secret": "Clé secrète de l'application",
    "alert_shot_tip": "Pour joindre des images aux alertes, créez une application DingTalk en suivant la documentation, puis renseignez ses informations ici"
  },
  "wecomapp_request_config": {
    "corp_id": "ID de l'entreprise",
    "corp_secret": "Clé secrète de l'entreprise",
    "agentid": "Agent ID"
  },
  "feishuapp_request_config": {
    "app_id": "ID de l'application",
    "app_secret": "Clé secrète de l'application",
    "receive_id_type": "Type d'identifiant du destinataire",
    "alert_shot_tip": "Pour joindre des images aux alertes, créez une application Feishu en suivant la documentation, puis renseignez ses informations ici",
    "lark_alert_shot_tip": "Pour joindre des images aux alertes, créez une application Lark en suivant la documentation, puis renseignez ses informations ici"
  },
  "types_search_placeholder": "Rechercher par type",
  "name_search_placeholder": "Rechercher par nom",
  "disabled": "Désactiver",
  "status_select": {
    "placeholder": "État",
    "enable": "Activer",
    "disable": "Désactiver"
  },
  "types_select_placeholder": "Type",
  "types": {
    "flashduty": "FlashDuty",
    "callback": "Rappel",
    "email": "E-mail",
    "dingtalk": "DingTalk",
    "dingtalkapp": "Application DingTalk",
    "wecom": "WeCom",
    "wecomapp": "Application WeCom",
    "feishucard": "Carte Feishu",
    "feishu": "Feishu",
    "feishuapp": "Application Feishu",
    "larkcard": "Carte Lark",
    "lark": "Lark",
    "telegram": "Telegram",
    "ali-voice": "Appel vocal Alibaba Cloud",
    "ali-sms": "SMS Alibaba Cloud",
    "tx-voice": "Appel vocal Tencent Cloud",
    "tx-sms": "SMS Tencent Cloud",
    "slackbot": "Slack Bot",
    "slackwebhook": "Slack Webhook",
    "mattermostbot": "Mattermost Bot",
    "mattermostwebhook": "Mattermost Webhook",
    "discord": "Discord",
    "jsm_alert": "JSM Alert",
    "jira": "JIRA",
    "pagerduty": "PagerDuty",
    "script": "Script"
  },
  "test": {
    "btn": "Tester",
    "run": "Envoyer un test",
    "back": "Revenir et modifier",
    "desc": "Un message est réellement envoyé avec la configuration du formulaire, sans qu'il soit nécessaire de l'enregistrer d'abord. Cela permet de vérifier l'adresse, les clés et la connectivité.",
    "script_blocked": "Les médias reposant sur un script doivent être enregistrés avant d'être testés",
    "params_title": "Paramètres du média",
    "receivers_title": "Destinataires",
    "pagerduty_keys_title": "Integration Key",
    "pagerduty_keys_tip": "PagerDuty distribue par integration key. Une fois la configuration enregistrée, vous pourrez les choisir via Service/intégration dans les règles de notification ; saisissez-les ici en attendant, plusieurs étant admises.",
    "pagerduty_keys_placeholder": "Saisissez une integration key puis appuyez sur Entrée",
    "user_ids": "Choisir des utilisateurs",
    "user_group_ids": "Choisir des équipes",
    "mode": {
      "history": "Événements passés",
      "mock": "Événement simulé"
    },
    "empty_alert": "Cet environnement ne compte encore aucun événement d'alerte passé",
    "switch_btn": "Tester avec un événement simulé",
    "result_success": "Envoyé",
    "result_success_desc": "Vérifiez dans le salon ou la boîte mail concernée que le message est bien arrivé",
    "result_failed": "Échec de l'envoi"
  }
};

export default fr_FR;

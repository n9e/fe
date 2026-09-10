const fr_FR = {
  "title": "Gestion de l'authentification unique",
  "LDAP": "LDAP",
  "CAS": "CAS",
  "OIDC": "OIDC",
  "OAuth2": "OAuth2",
  "dingtalk": "DingTalk",
  "feishu": "Feishu",
  "callback_url": "URL de rappel",
  "feishu_setting": {
    "app_id_tip": "Identifiant unique de l'application sur la plateforme ouverte Feishu, généré automatiquement à sa création et non modifiable. L'app_id se consulte sur la page Identifiants et informations générales de la <1>console développeur</1>",
    "app_secret_tip": "Clé secrète de l'application, générée automatiquement à sa création",
    "cover_attributes_tip": "À chaque connexion, si les informations de l'utilisateur ont changé, celles de Feishu remplacent celles de Nightingale, à savoir le numéro de téléphone et l'adresse e-mail"
  },
  "dingtalk_setting": {
    "enable": "Activer",
    "display_name": "Nom affiché",
    "corpId": "ID de l'organisation",
    "corpId_tip": "Identifiant de l'organisation ; le CorpId figure sur la page d'accueil de la plateforme ouverte DingTalk",
    "client_id": "Client ID",
    "client_secret": "Client secret",
    "cover_attributes": "Mettre à jour les informations utilisateur",
    "cover_attributes_tip": "À chaque connexion, si les informations de l'utilisateur ont changé, celles de DingTalk remplacent celles de Nightingale, à savoir le numéro de téléphone et l'adresse e-mail",
    "username_field": "Champ du nom d'utilisateur",
    "default_team": "Équipe par défaut",
    "username_field_map": {
      "phone": "Numéro de téléphone",
      "name": "Nom",
      "email": "Adresse e-mail",
      "userid": "ID utilisateur"
    },
    "default_roles": "Rôle par défaut",
    "auth_url": "URL d'authentification",
    "proxy": "Adresse du proxy",
    "use_member_info": "Détail de l'utilisateur",
    "use_member_info_tip": "À activer lorsqu'il faut récupérer l'adresse e-mail et le numéro de téléphone des collaborateurs depuis l'annuaire. Cette fonction exige le droit d'accès au détail des utilisateurs de l'annuaire, à ajouter sur la plateforme ouverte DingTalk",
    "dingtalk_api": "API DingTalk",
    "dingtalk_api_tip": "Définit l'API interrogée pour obtenir les informations des collaborateurs de l'annuaire"
  }
};

export default fr_FR;

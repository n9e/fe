const fr_FR = {
  "pageTitle": "Bienvenue dans Nightingale",
  "onboarding": {
    "dismiss": "Ne plus afficher",
    "title": "Guide de démarrage",
    "subtitle": "Suivez ces quelques étapes et votre supervision tourne en quelques minutes",
    "progress": "Terminé : {{done}}/{{total}}",
    "hostTrack": "Parcours supervision des hôtes",
    "dataTrack": "Parcours mise en place des données",
    "aiTrack": "Intelligence",
    "optional": "Facultatif",
    "steps": {
      "machine": {
        "title": "Installer un collecteur et raccorder les hôtes",
        "desc": "Installez Categraf sur un hôte et la machine apparaît d'elle-même dans la liste des équipements"
      },
      "collectVerified": {
        "title": "Configurer la collecte et vérifier les données",
        "desc": "Générez la configuration Categraf par composant et vérifiez que les métriques remontent"
      },
      "hostDashboard": {
        "title": "Appliquer le tableau de bord des hôtes",
        "desc": "Importez en un clic le tableau de bord des hôtes intégré et voyez aussitôt les données de vos machines"
      },
      "hostAlert": {
        "title": "Activer les alertes hôtes",
        "desc": "Importez en un clic les règles d'alerte hôtes intégrées et activez-les"
      },
      "testDelivered": {
        "title": "Envoyer une alerte de test",
        "desc": "Vérifiez avec un événement simulé que les notifications vous parviennent réellement"
      },
      "datasource": {
        "title": "Configurer une source de données",
        "desc": "Raccordez une source de données comme Prometheus ou VictoriaMetrics"
      },
      "dashboard": {
        "title": "Créer un tableau de bord",
        "desc": "Transformez les métriques qui vous importent en tableau de bord"
      },
      "alert": {
        "title": "Configurer une règle d'alerte",
        "desc": "Créez votre première règle d'alerte sur une métrique clé"
      },
      "notification": {
        "title": "Configurer les notifications",
        "desc": "Faites réellement partir les alertes par DingTalk, e-mail ou tout autre média"
      },
      "llm": {
        "title": "Raccorder un grand modèle de langage",
        "desc": "Configurez un LLM pour débloquer l'assistant IA et les analyses intelligentes"
      }
    }
  },
  "hero": {
    "badge": "Open source · plateforme unifiée de supervision et d'alerte",
    "highlight": "Une supervision plus simple et plus intelligente",
    "description": "Collecte et analyse unifiées des métriques et des journaux, avec gouvernance des alertes, tableaux de bord et assistant intelligent prêts à l'emploi, dans un esprit cloud natif.",
    "primaryAction": "Voir la documentation",
    "secondaryAction": "Demander à l'IA"
  },
  "matrix": {
    "headerKicker": "Panorama des fonctions",
    "headerSubtitle": "De la collecte et de l'intégration des données à l'observation unifiée et aux notifications d'alerte, une plateforme d'observabilité de bout en bout",
    "scenarioTag": "Usages · alertes unifiées",
    "observabilityTag": "Plateforme · observation unifiée",
    "notificationTag": "Diffusion · médias de notification",
    "collectionTag": "Données · collecte unifiée",
    "integrationTag": "Données · intégration unifiée",
    "integrationBrowseAll": "Parcourir plus de 70 intégrations",
    "infrastructureTag": "Infrastructure de services d'entreprise",
    "dataIngestArrow": "Données · raccordement unifié",
    "alertEventArrow": "Événements d'alerte",
    "scenario": {
      "businessGroups": {
        "title": "Groupe métier",
        "description": "Multilocation et cloisonnement des ressources"
      },
      "alertGovernance": {
        "title": "Gouvernance des alertes",
        "description": "Règles · mises en sourdine · abonnements"
      },
      "eventHistory": {
        "title": "Événements passés",
        "description": "Analyse rétrospective de tous les événements"
      },
      "aiAssistant": {
        "title": "Intelligence artificielle",
        "description": "Des fonctions intelligentes portées par les grands modèles de langage"
      }
    },
    "observability": {
      "dashboard": "Tableau de bord",
      "metricExplorer": "Analyse des métriques",
      "logExplorer": "Analyse des journaux",
      "alertRules": "Règle d'alerte",
      "alertMutes": "Mise en sourdine des alertes",
      "alertSubscribes": "Abonnement aux alertes",
      "objectExplorer": "Objets supervisés",
      "recordingRules": "Règles d'enregistrement"
    },
    "collection": {
      "description": "Collecteur open source tout-en-un",
      "footer": "Collecte unifiée des métriques et des journaux"
    },
    "infrastructure": {
      "components": "Composants de base",
      "microservice": "Microservices",
      "apiFunctions": "API et fonctions",
      "endpoints": "Clients",
      "publicCloud": "Cloud public",
      "privateCloud": "Cloud privé",
      "containers": "Conteneurs et machines virtuelles",
      "devices": "Équipements",
      "network": "Réseau"
    },
    "notification": {
      "rules": {
        "title": "Règle de notification",
        "description": "Routage d'attribution fin"
      },
      "templates": {
        "title": "Modèles de notification",
        "description": "Mise en forme homogène des messages"
      },
      "channels": {
        "title": "Médias de notification",
        "description": "Diffusion multicanale"
      },
      "users": {
        "title": "Utilisateurs et équipes",
        "description": "Gestion de l'organisation des destinataires"
      }
    },
    "footnotes": {
      "scenario": [
        "Multilocation et cloisonnement par groupe métier",
        "Règles d'alerte · mises en sourdine · abonnements",
        "Analyse assistée par les grands modèles de langage"
      ],
      "observability": "Les capacités d'une plateforme d'observabilité intégrée",
      "integration": "Sources de données open source les plus répandues",
      "notification": [
        "Centre de notifications",
        "Notifications et abonnements"
      ]
    }
  },
  "quickStart": {
    "title": "Prise en main",
    "viewAll": "Voir toute la documentation",
    "askAi": "L'IA vous répond",
    "ingest": {
      "title": "Raccordement unifié",
      "description": "Installez et raccordez vos données rapidement",
      "links": [
        "Comment installer le collecteur Categraf ?",
        "Comment configurer une source de données ?"
      ]
    },
    "observe": {
      "title": "Observation unifiée",
      "description": "Analyse conjointe des métriques et des journaux",
      "links": [
        "Comment visualiser des métriques métier dans un tableau de bord ?",
        "Comment écrire une requête PromQL dans l'analyse des métriques ?"
      ]
    },
    "alert": {
      "title": "Gouvernance des alertes",
      "description": "Configuration des règles d'alerte et diffusion des notifications",
      "links": [
        "Comment créer ma première règle d'alerte ?",
        "Comment raccorder la messagerie d'entreprise pour recevoir les alertes ?"
      ]
    },
    "ai": {
      "title": "Intelligence artificielle",
      "description": "Grands modèles et agents",
      "links": [
        "Quels skills Nightingale propose-t-il ?",
        "Comment faire analyser les alertes automatiquement par un agent ?"
      ]
    }
  },
  "aiAssistant": {
    "title": "Assistant intelligent Nightingale AI",
    "description": "Porté par les grands modèles de langage, il permet de piloter la plateforme, d'interroger les données et d'analyser la cause racine des alertes en langage naturel.",
    "capabilities": [
      "Requête en langage naturel",
      "Analyse de la cause racine des alertes",
      "Génération de PromQL / LogQL",
      "Questions-réponses sur la documentation"
    ],
    "action": "Essayer l'assistant IA"
  }
};

export default fr_FR;

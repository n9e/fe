const fr_FR = {
  "toolbar": {
    "current_chat": "Conversation en cours",
    "new_chat": "Nouvelle conversation",
    "history": "Historique des conversations",
    "share": "Partager",
    "share_copied": "Lien de partage copié",
    "switch_to_drawer": "Passer en mode tiroir",
    "switch_to_floating": "Passer en mode fenêtre flottante"
  },
  "history": {
    "untitled": "Nouvelle conversation",
    "today": "Aujourd'hui",
    "yesterday": "Hier",
    "earlier": "Plus ancien",
    "unknown_time": "--:--",
    "delete_confirm": "Supprimer cette conversation ?",
    "empty": "Aucune conversation dans l'historique",
    "search_placeholder": "Rechercher une conversation",
    "share": "Partager la conversation",
    "rename": "Renommer",
    "more_actions": "Autres actions sur la conversation"
  },
  "nightingale": {
    "title": "Nightingale AI",
    "new_chat": "Nouvelle conversation",
    "sessions": "Conversation",
    "llm_configs": "Gestion des LLM",
    "skills": "Gestion des skills",
    "mcp_servers": "Gestion MCP",
    "ai_task": "Canal de tâches",
    "collapse_sidebar": "Replier le panneau IA",
    "expand_sidebar": "Déplier le panneau IA",
    "welcome_cards": {
      "overview": {
        "title": "Découvrir Nightingale rapidement",
        "description": "Comprendre en une minute ce que le produit et l'assistant IA savent faire",
        "prompt": "Présente-moi en une minute les fonctions essentielles de Nightingale et ce que tu peux faire pour moi"
      },
      "alerts": {
        "title": "Faire le point sur mes alertes",
        "description": "Quelles règles sont les plus bruyantes et lesquelles ne se sont jamais déclenchées",
        "prompt": "Fais le point sur mes règles d'alerte : lesquelles se sont déclenchées le plus souvent ces 7 derniers jours et lesquelles ne se sont jamais déclenchées"
      },
      "create_alert": {
        "title": "Créer une alerte en une phrase",
        "description": "Décrivez la situation et je génère la PromQL et le seuil",
        "prompt": "Crée une règle d'alerte : déclencher lorsque l'utilisation CPU d'un hôte dépasse 80 % pendant 5 minutes"
      }
    }
  },
  "input": {
    "placeholder": "Saisissez votre question ; Entrée pour envoyer, Maj + Entrée pour aller à la ligne",
    "share_readonly_placeholder": "Mode partage en lecture seule"
  },
  "query": {
    "title": "Requête",
    "copied": "Requête copiée",
    "copy": "Copier",
    "execute": "Exécuter la requête",
    "execute_disabled": "Aucun callback d'exécution n'a été fourni : seule la copie est possible"
  },
  "action": {
    "query_generator": "Générer la requête"
  },
  "message": {
    "generating": "Réflexion en cours…",
    "processing": "Traitement toujours en cours",
    "hint": "Information",
    "no_llm_title": "Aucune configuration LLM sur cet environnement",
    "no_llm_content": "Ajoutez une configuration LLM depuis la page <a>Gestion des LLM</a>",
    "stopped": "Génération interrompue",
    "request_failed": "La requête a échoué",
    "cancelled": "Cette réponse a été annulée.",
    "retry_later": "Réessayez plus tard.",
    "empty_response": "Aucune réponse",
    "thinking": "Raisonnement",
    "unsupported_type": "Type de contenu non pris en charge : {{type}}"
  },
  "form_select": {
    "title": "Complétez les informations suivantes pour continuer :",
    "approval_title": "Confirmez l'exécution des actions ci-dessus :",
    "busi_group": "Groupe métier",
    "datasource": "Source de données",
    "team": "Équipe",
    "skill_scope": "Visibilité",
    "placeholder_select": "Sélectionnez",
    "confirm": "Valider"
  },
  "alert_rule": {
    "title": "Règle d'alerte",
    "copy": "Copier",
    "copied": "ID de la règle copié",
    "duration_seconds": "Pendant {{seconds}} secondes",
    "field": {
      "id": "ID de la règle",
      "name": "Nom de la règle",
      "group": "Groupe métier",
      "datasource": "Source de données",
      "cate": "Type de source de données",
      "severity": "Niveau d'alerte",
      "metric": "Métrique surveillée",
      "condition": "Condition de déclenchement",
      "note": "Contenu de l'alerte"
    },
    "severity": {
      "critical": "Critical",
      "warning": "Warning",
      "info": "Info"
    }
  },
  "dashboard": {
    "title": "Tableau de bord",
    "copied": "ID du tableau de bord copié",
    "field": {
      "id": "ID du tableau de bord",
      "name": "Nom",
      "group": "Groupe métier",
      "datasource": "Source de données par défaut",
      "panels_count": "Nombre de panneaux",
      "variables_count": "Nombre de variables",
      "tags": "Étiquettes"
    }
  },
  "empty": {
    "greeting_prefix": "Bonjour, je suis"
  }
};

export default fr_FR;

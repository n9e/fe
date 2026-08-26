const fr_FR = {
  "title": "Tableaux de bord de supervision",
  "list": "Liste des tableaux de bord",
  "back_icon_tip": "Revient à la page précédente, ou à la liste des tableaux de bord s'il n'y en a pas",
  "back_icon_tip_is_built_in": "Revient à la page précédente, ou au centre de modèles s'il n'y en a pas",
  "name": "Nom du tableau de bord",
  "tags": "Étiquettes de catégorie",
  "ident": "Identifiant en caractères latins",
  "ident_msg": "Utilisez des lettres, des chiffres et des tirets",
  "search_placeholder": "Nom du tableau de bord ou étiquette de catégorie",
  "empty_guide": {
    "title": "Aucun tableau de bord",
    "desc": "Créez un tableau de bord ou importez en un clic les modèles intégrés.",
    "from_template": "Importer depuis un modèle"
  },
  "refresh_tip": "Un intervalle de rafraîchissement inférieur au pas ({{num}} s) ne met pas les données à jour",
  "refresh_btn": "Actualiser",
  "share_btn": "Partager",
  "export_btn": "Exporter (CSV)",
  "clear_cache_btn": "Vider le cache",
  "clear_cache_btn_tip": "Vide le cache des largeurs de colonnes ; effectif après actualisation de la page",
  "inspect_btn": "Diagnostiquer",
  "table_upgrade": {
    "switch_title": "Passer à TableNG",
    "switch_content": "Migrer automatiquement la configuration de l'ancien tableau ?",
    "auto_upgrade": "Migrer automatiquement",
    "switch_only": "Changer seulement le type"
  },
  "public": {
    "name": "Public",
    "unpublic": "Non public",
    "public_cate": "Type",
    "cate": {
      "0": "Accès anonyme",
      "1": "Connexion requise",
      "2": "Accès sur autorisation"
    },
    "bgids": "Groupes métier autorisés",
    "theme_link": {
      "dark": "Lien thème sombre",
      "light": "Lien thème clair"
    }
  },
  "sharing_link": {
    "title": "Créer un lien de partage",
    "title_anonymous": "Créer un lien de partage (accès anonyme)",
    "allow_anonymous": "Autoriser l'accès anonyme sans connexion",
    "expire_at": "Durée de validité",
    "theme": "Thème",
    "theme_default": "Suivre le système",
    "theme_dark": "Sombre",
    "theme_light": "Clair",
    "note": "Remarque",
    "note_placeholder": "Remarque (obligatoire), par exemple : à destination du client",
    "generate": "Créer le lien",
    "link": "Lien de partage",
    "expire_time": "Expire le",
    "expired": "Expiré",
    "create_by": "Créé par",
    "revoke": "Révoquer",
    "revoke_confirm": "Le lien cesse immédiatement de fonctionner une fois révoqué. Continuer ?",
    "revoked": "Révoqué",
    "anonymous_tip": "Pendant sa durée de validité, un lien anonyme permet de consulter ce tableau de bord sans connexion et d'interroger les données des sources qu'il référence : partagez-le avec précaution",
    "recommend_tip": "L'accès anonyme passe par le lien ci-dessous : pendant sa durée de validité, le tableau de bord s'ouvre sans connexion. Pour une publication durable, choisissez une validité en années",
    "unit_hour": "heures",
    "unit_day": "jours",
    "unit_month": "mois",
    "unit_year": "ans",
    "fetch_failed": "Impossible de récupérer la liste des liens de partage",
    "generate_failed": "Impossible de créer le lien de partage",
    "revoke_failed": "Impossible de révoquer le lien de partage",
    "config_load_failed": "La configuration du tableau de bord n'a pas pu être lue ; l'accès anonyme ne peut pas être défini. Fermez et réessayez",
    "revoke_all_confirm_title": "Révoquer tous les liens de partage anonymes ?",
    "revoke_all_confirm_content": "Ce tableau de bord compte encore {{num}} liens de partage anonymes valides. La validité des liens ne dépend pas du réglage de visibilité : même après ce changement de type, ils continueraient d'ouvrir le tableau de bord sans connexion. En confirmant, tous les liens de partage de ce tableau de bord seront révoqués et les réglages enregistrés ; la révocation est définitive.",
    "revoke_all_ok": "Révoquer et enregistrer",
    "revoke_all_check_failed": "Impossible de vérifier s'il reste des liens de partage anonymes sur ce tableau de bord. Le réglage de visibilité a été enregistré ; ouvrez la fenêtre des liens de partage pour le vérifier vous-même"
  },
  "default_filter": {
    "title": "Filtres prédéfinis",
    "public": "Tableaux de bord publics",
    "all": "Tableaux de bord de mes groupes métier",
    "all_tip": "Cette option affiche tous les tableaux de bord rattachés à vos groupes métier"
  },
  "create_title": "Créer un tableau de bord",
  "edit_title": "Modifier le tableau de bord",
  "add_panel": "Ajouter un graphique",
  "cluster": "Cluster",
  "full_screen": "Plein écran",
  "exit_full_screen": "Quitter le plein écran",
  "copyPanelTip": "Configuration du graphique copiée. Cliquez sur « Ajouter un graphique » puis « Coller un graphique » pour créer le graphique à partir de ce JSON",
  "batch": {
    "import": "Importer un JSON de tableau de bord Nightingale",
    "label": "JSON du tableau de bord",
    "import_grafana": "Importer un tableau de bord Grafana (déconseillé)",
    "import_grafana_tip": "Seuls les tableaux de bord reposant sur une source Prometheus sont importables, et uniquement dans la limite des types de graphiques et fonctions pris en charge par Nightingale <a>Signaler un problème</a>",
    "import_grafana_tip_version_error": "Les configurations de tableau de bord antérieures à la v7 ne peuvent pas être importées",
    "import_grafana_tip_version_warning": "À l'import d'une configuration antérieure à la v8, certains graphiques peuvent ne pas être pris en charge ou s'afficher incorrectement",
    "import_grafana_url": "Lien du tableau de bord Grafana (recommandé)",
    "import_grafana_url_label": "Lien du tableau de bord Grafana",
    "continueToImport": "Poursuivre l'import",
    "noSelected": "Sélectionnez un tableau de bord",
    "import_builtin": "Importer un tableau de bord intégré",
    "import_builtin_board": "Tableaux de bord intégrés",
    "clone": {
      "name": "Nom",
      "result": "Résultat",
      "errmsg": "Message d'erreur"
    }
  },
  "link": {
    "title": "Lien vers le tableau de bord",
    "name": "Nom du lien",
    "url": "URL du lien",
    "isNewBlank": "Ouvrir dans une nouvelle fenêtre",
    "dashboardIds_placeholder": "Sélectionnez un tableau de bord"
  },
  "var": {
    "vars": "Variables",
    "btn": "Ajouter une variable",
    "title": {
      "list": "Liste des variables",
      "add": "Ajouter une variable",
      "edit": "Modifier la variable"
    },
    "name": "Nom de la variable",
    "name_msg": "Seuls les lettres, les chiffres et les tirets bas sont acceptés",
    "name_repeat_msg": "Ce nom de variable existe déjà",
    "label": "Nom affiché",
    "type": "Type de variable",
    "type_map": {
      "query": "Requête (Query)",
      "custom": "Personnalisé (Custom)",
      "textbox": "Zone de texte (Text box)",
      "constant": "Constante (Constant)",
      "datasource": "Source de données (Datasource)",
      "datasourceIdentifier": "Identifiant de source de données (Datasource identifier)",
      "hostIdent": "Identifiant de machine (Host ident)"
    },
    "hide": "Masquer la variable",
    "hide_map": {
      "yes": "Oui",
      "no": "Non"
    },
    "definition": "Définition de la variable",
    "definition_msg1": "Saisissez la définition de la variable",
    "definition_msg2": "La définition de la variable doit être un JSON valide",
    "reg": "Expression régulière",
    "reg_tip": "Facultatif : une expression régulière filtre les valeurs proposées. Saisissez un <a>littéral d'expression régulière</a>, c'est-à-dire un motif encadré par des barres obliques",
    "reg_tip2": "Pour n'extraire qu'une partie d'une valeur, <a>les groupes de capture nommés séparent le texte affiché de la valeur</a>",
    "multi": "Sélection multiple",
    "allOption": "Inclure l'option Tout",
    "allValue": "Valeur personnalisée pour Tout",
    "width": "Largeur",
    "width_tip": "Largeur du sélecteur de variable ; laissez vide pour conserver la valeur par défaut de 180 px",
    "textbox": {
      "defaultValue": "Valeur par défaut",
      "defaultValue_tip": "Facultatif : sert uniquement de valeur par défaut au premier chargement"
    },
    "custom": {
      "definition": "Valeurs personnalisées séparées par des virgules"
    },
    "constant": {
      "definition": "Valeur de la constante",
      "defaultValue_tip": "Définit une valeur constante masquée"
    },
    "datasource": {
      "definition": "Type de source de données",
      "defaultValue": "Valeur par défaut",
      "regex": "Filtre sur les sources de données",
      "regex_tip": "Facultatif : une expression régulière filtre les valeurs proposées. Saisissez un <a>littéral d'expression régulière</a>, c'est-à-dire un motif encadré par des barres obliques."
    },
    "hostIdent": {
      "invalid": "L'identifiant de machine exige un accès authentifié : en mode anonyme, le tableau de bord ne s'ouvrira pas",
      "invalid2": "Ce tableau de bord utilise une variable d'identifiant de machine et ne peut donc pas être consulté anonymement"
    },
    "help_tip": "\n      Utilisation des variables\n      <1 />\n      ${variable_name} : valeur d'une variable du tableau de bord\n      <1 />\n      ${__field.name} : nom de la légende\n      <1 />\n      ${__field.value} : valeur de la légende\n      <1 />\n      ${__field.labels.X} : valeur d'étiquette\n      <1 />\n      ${__field.labels.__name__} : nom de la métrique\n      <1 />\n      ${__interval} : intervalle en secondes, par exemple 15s, égal au pas par défaut\n      <1 />\n      ${__interval_ms} : intervalle en millisecondes, par exemple 15000\n      <1 />\n      ${__range} : plage en secondes, par exemple 3600s\n      <1 />\n      ${__range_ms} : plage en millisecondes, par exemple 3600000\n      <1 />\n      ${__rate_interval} : intervalle en secondes, __interval * 4\n      <1 />\n      ${__from} : date de début en millisecondes\n      <1 />\n      ${__from_date_seconds} : date de début en secondes\n      <1 />\n      ${__from_date_iso} : date de début, ISO 8601/RFC 3339\n      <1 />\n      La même syntaxe vaut pour ${__to}\n    ",
    "help_tip_table_ng": "\n      Utilisation des variables\n      <br />\n      ${variable_name} : valeur d'une variable du tableau de bord\n      <br />\n      ${__row.column_name} : valeur d'une colonne de la ligne\n      <br />\n      ${__interval} : intervalle en secondes, par exemple 15s, égal au pas par défaut\n      <br />\n      ${__interval_ms} : intervalle en millisecondes, par exemple 15000\n      <br />\n      ${__range} : plage en secondes, par exemple 3600s\n      <br />\n      ${__range_ms} : plage en millisecondes, par exemple 3600000\n      <br />\n      ${__rate_interval} : intervalle en secondes, __interval * 4\n      <br />\n      ${__from} : date de début en millisecondes\n      <br />\n      ${__from_date_seconds} : date de début en secondes\n      <br />\n      ${__from_date_iso} : date de début, ISO 8601/RFC 3339\n      <br />\n      La même syntaxe vaut pour ${__to}\n    "
  },
  "row": {
    "edit_title": "Modifier le groupe",
    "delete_title": "Supprimer le groupe",
    "name": "Nom du groupe",
    "delete_confirm": "Supprimer ce groupe ?",
    "cancel": "Annuler",
    "ok": "Supprimer le groupe et ses graphiques",
    "ok2": "Supprimer le groupe seul",
    "panels": "{{count}} graphiques",
    "panels_plural": "{{count}} graphiques"
  },
  "panel": {
    "title": {
      "add": "Ajouter un graphique",
      "edit": "Modifier le graphique"
    },
    "base": {
      "title": "Configuration du panneau",
      "name": "Titre",
      "name_tip": "Un graphique de type tableau doit avoir un titre, faute de quoi l'édition du panneau entre en conflit avec l'en-tête du tableau",
      "link": {
        "label": "Lien",
        "label_tip": "\n          Utilisation des variables<br />\n          ${variable_name} : valeur d'une variable du tableau de bord\n        ",
        "btn": "Ajouter",
        "name": "Nom du lien",
        "name_msg": "Saisissez le nom du lien",
        "url": "URL du lien",
        "url_msg": "Saisissez l'URL du lien",
        "isNewBlank": "Ouvrir dans une nouvelle fenêtre"
      },
      "description": "Remarque",
      "repeatOptions": {
        "title": "Répétition du graphique",
        "byVariable": "Variables",
        "byVariableTip": "Répète le graphique pour chaque valeur de la variable",
        "maxPerRow": "Nombre maximal par ligne"
      }
    },
    "options": {
      "legend": {
        "displayMode": {
          "label": "Mode d'affichage",
          "table": "Tableau",
          "list": "Liste",
          "hidden": "Masquer"
        },
        "placement": "Position",
        "max": "Maximum",
        "min": "Minimum",
        "avg": "Moyenne",
        "sum": "Total",
        "last": "Valeur actuelle",
        "variance": "Variance",
        "stdDev": "Écart type",
        "series": "Séries",
        "seriesFilter": "Filtrer les séries",
        "columns": "Colonnes affichées",
        "none": "Aucun",
        "behaviour": {
          "label": "Action au clic",
          "showItem": "Afficher les éléments",
          "hideItem": "Masquer les éléments"
        },
        "selectMode": {
          "label": "Mode de sélection",
          "single": "Sélection unique",
          "multiple": "Sélection multiple"
        },
        "heightInPercentage": "Hauteur en pourcentage",
        "sortBy": "Colonne de tri",
        "sortBy_tip": "Choisissez la colonne statistique servant au tri ; sans sélection, aucun tri n'est appliqué",
        "sortDir": "Sens du tri",
        "sortDirAsc": "Croissant",
        "sortDirDesc": "Décroissant",
        "heightInPercentage_tip": "Part maximale de la hauteur du panneau occupée par la légende, entre 20 % et 80 %",
        "widthInPercentage": "Largeur en pourcentage",
        "widthInPercentage_tip": "Part maximale de la largeur du panneau occupée par la légende, entre 20 % et 80 %"
      },
      "thresholds": {
        "title": "Seuil",
        "btn": "Ajouter un seuil",
        "mode": {
          "label": "Mode de seuil",
          "tip": "Formule du mode pourcentage : minimum de l'axe Y + (maximum de l'axe Y − minimum de l'axe Y) × (pourcentage / 100)",
          "absolute": "Valeur absolue",
          "percentage": "Pourcentage"
        }
      },
      "thresholdsStyle": {
        "label": "Style du seuil",
        "off": "Désactivé",
        "line": "Ligne",
        "dashed": "Ligne pointillée",
        "line+area": "Ligne et zone",
        "dashed+area": "Ligne pointillée et zone"
      },
      "tooltip": {
        "mode": "Mode",
        "sort": "Tri"
      },
      "valueMappings": {
        "title": "Correspondances de valeurs",
        "btn": "Ajouter",
        "type": "Condition",
        "type_tip": "\n          <0>Valeurs par défaut de la plage : from=-Infinity ; to=Infinity </0>\n          <1>À propos de la valeur spéciale Null : elle correspond à null, undefined ou à l'absence de données</1>\n        ",
        "type_map": {
          "special": "Valeur fixe (numérique)",
          "textValue": "Valeur fixe (texte)",
          "range": "Plage de valeurs",
          "specialValue": "Valeur spéciale"
        },
        "value_placeholder": "Valeur exacte",
        "text": "Texte affiché",
        "text_placeholder": "Facultatif",
        "color": "Couleur",
        "operations": "Actions"
      },
      "colors": {
        "name": "Réglages de couleur",
        "scheme": "Palette",
        "reverse": "Inverser les couleurs"
      },
      "links": {
        "label": "Lien",
        "add_btn": "Ajouter un lien",
        "edit_btn": "Modifier le lien",
        "title": "Titre du lien",
        "title_required": "Le titre du lien est obligatoire",
        "url": "URL du lien",
        "url_required": "L'URL du lien est obligatoire",
        "target_blank": "Ouvrir dans une nouvelle fenêtre"
      }
    },
    "standardOptions": {
      "title": "Réglages avancés",
      "unit": "Unité",
      "unit_tip": "\n        <0>Les préfixes SI sont appliqués par défaut ; choisissez none pour les désactiver</0>\n        <1>Data(SI) : base 1000, avec les unités B, kB, MB, GB, TB, PB, EB, ZB, YB</1>\n        <2>Data(IEC) : base 1024, avec les unités B, KiB, MiB, GiB, TiB, PiB, EiB, ZiB, YiB</2>\n        <3>bits : b</3>\n        <4>octets : B</4>\n      ",
      "datetime": "Format de date",
      "min": "Minimum",
      "max": "Maximum",
      "decimals": "Décimales",
      "displayName": "Nom affiché",
      "displayName_tip": "Nom de série personnalisé"
    },
    "overrides": {
      "columnWidth": "Largeur de colonne",
      "matcher": {
        "id": "Type de correspondance",
        "byFrameRefID": {
          "option": "Par nom de requête",
          "name": "Nom de la requête"
        },
        "byName": {
          "option": "Par nom de champ",
          "name": "Nom du champ"
        }
      }
    },
    "custom": {
      "title": "Style du graphique",
      "calc": "Calcul de la valeur",
      "calc_tip": "Les données temporelles doivent être réduites à une valeur unique sur l'ensemble des points ; ce réglage est ignoré pour les autres données",
      "maxValue": "Maximum",
      "baseColor": "Couleur de base",
      "serieWidth": "Largeur du nom",
      "sortOrder": "Tri",
      "textMode": "Contenu affiché",
      "valueAndName": "Valeur et nom",
      "value": "Valeur",
      "name": "Nom",
      "background": "Fond",
      "colorMode": "Mode de couleur",
      "valueField": "Champ de valeur",
      "valueField_tip": "Value est un mot réservé : c'est le nom du champ issu du calcul sur les données temporelles",
      "valueField_tip2": "Choisissez un champ dont les valeurs sont numériques",
      "nameField": "Champ de nom",
      "nameField_tip": "Utilise la valeur du champ de nom comme nom de série",
      "colSpan": "Nombre maximal par ligne",
      "colSpanTip": "Bientôt supprimé ; choisir « Automatique » applique le réglage d'orientation ci-dessous",
      "colSpanAuto": "Automatique",
      "textSize": {
        "title": "Taille du titre",
        "value": "Taille des valeurs"
      },
      "colorRange": "Couleur",
      "reverseColorOrder": "Inverser les couleurs",
      "colorDomainAuto": "Min/max automatiques",
      "colorDomainAuto_tip": "Le minimum et le maximum sont déduits automatiquement des séries",
      "fontBackground": "Fond du texte",
      "detailName": "Nom du lien",
      "detailUrl": "URL du lien",
      "stat": {
        "graphMode": "Mode graphique",
        "none": "Ne pas afficher",
        "area": "Sparkline",
        "orientation": "Orientation",
        "orientationTip": "Avec « Automatique », l'orientation est déduite de la largeur et de la hauteur du graphique",
        "orientationValueMap": {
          "auto": "Automatique",
          "vertical": "Verticale",
          "horizontal": "Horizontale"
        }
      },
      "pie": {
        "countOfValueField": "Compter les valeurs",
        "countOfValueField_tip": "Une fois activé, les valeurs du champ de valeur sont comptées ; sinon elles sont affichées telles quelles",
        "legengPosition": "Position de la légende",
        "max": "Nombre maximal de blocs",
        "max_tip": "Les blocs excédentaires sont regroupés sous Autres",
        "donut": "Mode anneau",
        "labelWithName": "Inclure le nom dans l'étiquette",
        "labelWithValue": "Afficher la valeur dans l'étiquette",
        "detailName": "Nom du lien",
        "detailUrl": "URL du lien"
      },
      "table": {
        "displayMode": "Mode d'affichage",
        "showHeader": "Afficher l'en-tête",
        "seriesToRows": "Chaque ligne affiche la valeur d'une série",
        "labelsOfSeriesToRows": "Chaque ligne affiche la valeur des étiquettes",
        "labelValuesToRows": "Chaque ligne affiche la valeur de la dimension d'agrégation choisie",
        "columns": "Colonnes affichées",
        "aggrDimension": "Dimensions affichées",
        "sortColumn": "Colonne de tri par défaut",
        "sortOrder": "Tri par défaut",
        "link": {
          "mode": "Mode de lien",
          "cellLink": "Lien dans la cellule",
          "appendLinkColumn": "Ajouter une colonne de liens"
        },
        "tableLayout": {
          "label": "Disposition du tableau",
          "label_tip": "En disposition fixe, la largeur des colonnes est répartie également selon leur nombre et aucune barre de défilement horizontale n'apparaît. En disposition automatique, la largeur maximale d'une colonne est de 150 px, si bien que le contenu peut déborder et faire apparaître une barre de défilement.",
          "auto": "Automatique",
          "fixed": "Fixe"
        },
        "nowrap": "Ne pas renvoyer à la ligne dans les cellules",
        "organizeFields": "Organisation des champs",
        "colorMode_tip": "Le mode de couleur s'applique au champ de valeur. En mode valeur, la couleur touche le texte ; en mode fond, elle touche l'arrière-plan de la cellule.",
        "pageLimit": "Lignes par page"
      },
      "tableNG": {
        "enablePagination": "Activer la pagination",
        "showHeader": "Afficher l'en-tête",
        "filterable": "Activer les filtres de colonne",
        "sortColumn": "Colonne de tri par défaut",
        "sortOrder": "Tri par défaut",
        "enableRowDetail": "Activer le détail des lignes",
        "enableRowDetail_tip": "Une fois activé, une icône de détail apparaît dans la première colonne. Un clic ouvre à droite un tiroir présentant tous les champs et valeurs de la ligne, avec la possibilité de copier la ligne entière ou un champ.",
        "rowDetail": {
          "triggerTip": "Voir le détail de la ligne",
          "title": "Détail",
          "tableTab": "Tableau",
          "jsonTab": "JSON",
          "field": "Champ",
          "value": "Valeur",
          "copyRow": "Copier la ligne entière",
          "copyFieldAndValue": "Copier le champ et sa valeur",
          "copyFieldValue": "Copier la valeur du champ"
        },
        "cellOptions": {
          "type": {
            "label": "Type de cellule",
            "options": {
              "none": "Par défaut",
              "color-text": "Texte coloré",
              "color-background": "Fond coloré",
              "gauge": "Jauge (Gauge)"
            }
          },
          "wrapText": "Renvoi à la ligne",
          "wrapText_tip": "Une fois activé, le texte des cellules revient à la ligne et la hauteur s'adapte au nombre de lignes ; sur de gros volumes, cela peut peser sur les performances",
          "color-background": {
            "mode": {
              "label": "Mode de couleur",
              "options": {
                "basic": "Simple",
                "gradient": "Dégradé"
              }
            }
          },
          "gauge": {
            "mode": {
              "label": "Mode",
              "options": {
                "basic": "Simple",
                "gradient": "Dégradé",
                "lcd": "LCD"
              }
            },
            "valueDisplayMode": {
              "label": "Affichage des valeurs",
              "options": {
                "color": "Couleur",
                "text": "Texte",
                "hidden": "Masquer"
              }
            }
          }
        }
      },
      "text": {
        "textColor": "Couleur du texte",
        "textDarkColor": "Couleur du texte en thème sombre",
        "bgColor": "Couleur de fond",
        "textSize": "Taille du texte",
        "justifyContent": {
          "name": "Alignement horizontal",
          "unset": "Non défini",
          "flexStart": "À gauche",
          "center": "Centré",
          "flexEnd": "À droite"
        },
        "alignItems": {
          "name": "Alignement vertical",
          "unset": "Non défini",
          "flexStart": "En haut",
          "center": "Centré",
          "flexEnd": "En bas"
        },
        "content": "Contenu",
        "content_placeholder": "Markdown et HTML acceptés",
        "content_tip": "\n          <0>Le mode simple est appliqué par défaut ; les réglages ci-dessus suffisent à styliser la carte</0>\n          <1>Markdown et HTML acceptés</1>\n          <2>Si vous saisissez du Markdown ou du HTML, désactivez plutôt les réglages d'alignement ci-dessus</2>\n        "
      },
      "timeseries": {
        "drawStyle": "Mode de tracé",
        "lineInterpolation": "Interpolation",
        "spanNulls": "Relier les valeurs manquantes",
        "spanNulls_0": "Fermer",
        "spanNulls_1": "Activer",
        "lineWidth": "Épaisseur du trait",
        "fillOpacity": "Opacité",
        "gradientMode": "Dégradé",
        "gradientMode_opacity": "Activer",
        "gradientMode_none": "Fermer",
        "stack": "Empiler",
        "stack_normal": "Activer",
        "stack_off": "Désactivé",
        "yAxis": {
          "title": "Réglages de l'axe Y",
          "rightYAxis": {
            "label": "Afficher l'axe Y de droite",
            "normal": "Activé",
            "off": "Désactivé"
          }
        },
        "showPoints": "Afficher les points",
        "showPoints_always": "Afficher",
        "showPoints_none": "Ne pas afficher",
        "pointSize": "Taille des points"
      },
      "iframe": {
        "src": "URL de l'iframe"
      },
      "heatmap": {
        "xAxisField": "Axe X",
        "yAxisField": "Axe Y",
        "valueField": "Colonne de valeurs"
      },
      "barchart": {
        "xAxisField": "Axe X",
        "yAxisField": "Axe Y",
        "colorField": "Champ de couleur",
        "barMaxWidth": "Largeur maximale des barres",
        "colorField_tip": "Name est un mot réservé : c'est le nom du champ contenant le nom des séries"
      },
      "barGauge": {
        "topn": "Nombre maximal de rangs",
        "combine_other": "Autres",
        "combine_other_tip": "Les données au-delà du classement sont regroupées dans un élément Autres",
        "otherPosition": {
          "label": "Position de l'élément Autres",
          "tip": "Position de l'élément Autres : au début ou à la fin",
          "options": {
            "none": "Par défaut",
            "top": "Au début",
            "bottom": "À la fin"
          }
        },
        "displayMode": "Mode d'affichage",
        "valueMode": {
          "label": "Affichage des valeurs",
          "color": "Afficher",
          "hidden": "Masquer"
        }
      }
    },
    "inspect": {
      "title": "Diagnostiquer",
      "query": "Requête",
      "json": "Configuration du graphique"
    }
  },
  "export": {
    "copy": "Copier le JSON dans le presse-papiers"
  },
  "query": {
    "title": "Condition de requête",
    "add_query_btn": "Ajouter une requête",
    "add_expression_btn": "Ajouter une expression",
    "transform": "Transformation des données",
    "datasource_placeholder": "Sélectionnez une source de données",
    "datasource_msg": "Sélectionnez une source de données",
    "time": "Choix de la période",
    "time_tip": "Une plage horaire peut être précisée ; par défaut celle du tableau de bord s'applique",
    "es": {
      "field_key_msg": "La clé du champ est obligatoire"
    },
    "prometheus": {
      "query": "Requête (PromQL)",
      "maxDataPoints": {
        "tip": "Nombre maximal de points par série, égal par défaut à la largeur du panneau (240 pour un nouveau panneau). Le pas vaut (end − start) / maxDataPoints",
        "tip_2": "Nombre maximal de points par série, égal par défaut à la largeur du panneau. Le pas vaut (end − start) / maxDataPoints"
      },
      "minStep": {
        "label": "Pas minimal (Min step)",
        "tip": "Pas minimal, 15 par défaut. Le pas vaut max(step, minStep, safeStep), avec safeStep = (end − start) / 11000"
      },
      "step": {
        "tag_tip": "Le pas vaut max((end − start) / maxDataPoints, minStep, safeStep), avec safeStep = (end − start) / 11000"
      },
      "instant": {
        "label": "Requête instantanée (Instant)",
        "tip": "N'interroge que l'instant de fin : le résultat ne comporte qu'une valeur"
      }
    },
    "expression_placeholder": "Applique des opérations mathématiques à une ou plusieurs requêtes. Référencez-les par ${refId}, c'est-à-dire $A, $B, $C, etc. Somme de deux scalaires : $A + $B > 10",
    "legend": "Légende (Legend)",
    "legendTip": "Remplace le nom de la légende ou sert de modèle ; ainsi {{hostname}} est substitué par la valeur de l'étiquette hostname",
    "legendTip2": "Remplace le nom de la légende ou sert de modèle ; ainsi {{hostname}} est substitué par la valeur de l'étiquette hostname. Cela ne vaut aujourd'hui que pour les données temporelles",
    "options": "Options de requête",
    "options_max_data_points": "Nombre maximal de points",
    "options_max_data_points_tip": "Nombre maximal de points par série, égal par défaut à la largeur du panneau (240 pour un nouveau panneau). Il sert à calculer le pas : (end − start) / maxDataPoints",
    "options_time": "Plage horaire de la requête",
    "options_time_tip": "Une plage horaire de requête peut être précisée ; par défaut celle du tableau de bord s'applique",
    "copy_query": "Dupliquer la requête",
    "mixed_datasource": "Mélanger les sources de données",
    "hide_response": "Masquer le résultat"
  },
  "migrate": {
    "title": "Migrer les tableaux de bord",
    "close_and_dismiss": "Fermer et ne plus afficher",
    "batch_migrate": "Aller à la migration groupée des tableaux de bord",
    "migrate_current": "Migrer ce tableau de bord",
    "desc_1": "La version 6 ne prend plus en charge le changement global de cluster Prometheus ; la nouvelle version obtient le même résultat en reliant les graphiques à une variable de source de données.",
    "desc_2": "L'outil de migration crée une variable de source de données et l'associe à tous les graphiques qui n'en ont pas."
  },
  "detail": {
    "ai_analysis": "Analyse IA",
    "datasource_empty": "Aucune information de source de données ; configurez-en une d'abord",
    "invalidTimeRange": "Valeurs __from et __to invalides",
    "invalidDatasource": "Source de données invalide",
    "invalidPanelConfig": "Configuration de graphique invalide",
    "deletePanel_confirm": "Supprimer le graphique {{name}} ?",
    "invalidPanelType": "Type de graphique invalide",
    "fullscreen": {
      "notification": {
        "esc": "Appuyez sur Échap pour quitter le plein écran",
        "theme": "Changer de thème"
      }
    },
    "saved": "Enregistré",
    "expired": "Ce tableau de bord a été modifié par quelqu'un d'autre. Actualisez-le pour voir la configuration et les données à jour et éviter d'écraser ces changements",
    "prompt": {
      "title": "Modifications non enregistrées",
      "message": "Enregistrer les modifications ?",
      "cancelText": "Annuler",
      "discardText": "Abandonner",
      "okText": "Enregistrer"
    },
    "importPanel": {
      "invalidJSON": "Le JSON de configuration du graphique est mal formé",
      "placeholder": "Collez le JSON de configuration du graphique. Vous l'obtenez via « Copier » dans le menu Autres actions, en haut à droite du panneau"
    }
  },
  "settings": {
    "graphTooltip": {
      "label": "Infobulle (Tooltip)",
      "tip": "Règle le comportement des infobulles sur tous les graphiques",
      "default": "Par défaut",
      "sharedCrosshair": "Partager le réticule",
      "sharedTooltip": "Partager l'infobulle"
    },
    "graphZoom": {
      "label": "Comportement du zoom",
      "tip": "Règle le comportement du zoom sur tous les graphiques",
      "default": "Par défaut",
      "updateTimeRange": "Mettre à jour la plage horaire"
    },
    "save": "Enregistrer le tableau de bord"
  },
  "visualizations": {
    "timeseries": "Courbe temporelle",
    "barchart": "Diagramme en barres",
    "stat": "Valeur de métrique",
    "table": "Tableau",
    "tableNG": "Tableau NG (Beta)",
    "pie": "Diagramme circulaire",
    "hexbin": "Nid d'abeilles",
    "barGauge": "Classement",
    "text": "Carte de texte",
    "gauge": "Jauge",
    "heatmap": "Carte de couleurs",
    "iframe": "Document intégré (iframe)",
    "row": "Groupe",
    "importPanel": "Coller un graphique"
  },
  "calcs": {
    "lastNotNull": "Dernière valeur non vide",
    "last": "Dernière valeur",
    "firstNotNull": "Première valeur non vide",
    "first": "Première valeur",
    "min": "Minimum",
    "max": "Maximum",
    "avg": "Moyenne",
    "sum": "Somme",
    "count": "Nombre",
    "origin": "Valeur brute",
    "variance": "Variance",
    "stdDev": "Écart type"
  },
  "annotation": {
    "add": "Ajouter une annotation",
    "edit": "Modifier l'annotation",
    "description": "Description",
    "tags": "Étiquettes",
    "updated": "Annotation mise à jour",
    "deleted": "Annotation supprimée"
  },
  "transformations": {
    "organize": {
      "title": "Organize fields by name",
      "desc": "Réordonner, masquer ou renommer des champs"
    },
    "merge": {
      "title": "Merge tables",
      "desc": "Fusionner plusieurs tableaux en un seul"
    },
    "joinByField": {
      "title": "Join by field",
      "desc": "Fusionner les lignes de plusieurs tableaux d'après des champs communs",
      "mode": "Mode",
      "byField": "Champ"
    },
    "timeSeriesTable": {
      "title": "Time series to table",
      "desc": "Réduire les valeurs de tous les instants d'une série à une valeur unique",
      "fieldName": "Champ",
      "functions": "Méthode"
    },
    "groupedAggregateTable": {
      "title": "Grouped aggregate table",
      "desc": "Regrouper le tableau sur un ou plusieurs champs et agréger les autres",
      "operation_map": {
        "aggregate": "Calcul",
        "groupby": "Groupe"
      }
    }
  },
  "add_transformation": "Ajouter une transformation"
};

export default fr_FR;

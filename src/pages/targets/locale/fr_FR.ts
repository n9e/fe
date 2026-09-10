const fr_FR = {
  "title": "Liste des machines",
  "default_filter": "Filtres prédéfinis",
  "ungrouped_targets": "Machines sans groupe",
  "all_targets": "Toutes les machines",
  "datasource": "Source de données",
  "search_placeholder": "Recherche approchée dans le tableau (séparez les mots-clés par des espaces)",
  "filterDowntime": "Mise à jour du battement",
  "filterDowntimeNegative": "Battement mis à jour",
  "filterDowntimePositive": "Battement non mis à jour",
  "filterDowntimeNegativeMin": "Mis à jour dans les {{count}} dernières minutes",
  "filterDowntimePositiveMin": "Non mis à jour depuis {{count}} minutes",
  "ident_copy_success": "{{num}} enregistrements copiés",
  "not_grouped": "Sans groupe",
  "host_ip": "IP",
  "host_tags": "Étiquettes remontées",
  "tags": "Étiquettes personnalisées",
  "group_obj": "Groupe métier",
  "target_up": "État",
  "mem_util": "Mémoire",
  "cpu_util": "CPU",
  "cpu_num": "Nombre de cœurs",
  "offset": "Décalage horaire",
  "offset_tip": "Calculé en soustrayant l'heure de la machine categraf à celle de la machine où Nightingale est installé",
  "os": "Système d'exploitation",
  "arch": "Architecture du processeur",
  "update_at": "Modifié le",
  "update_at_tip": "\n    Battement dans la dernière minute : vert <1 />\n    Battement dans les trois dernières minutes : jaune <1 />\n    Aucun battement depuis trois minutes : rouge\n  ",
  "remote_addr": "IP source",
  "remote_addr_tip": "L'IP source provient des en-têtes HTTP : derrière un proxy, ce n'est pas forcément l'adresse réelle",
  "agent_version": "Version de l'agent",
  "note": "Remarque",
  "unknown_tip": "L'affichage des métadonnées des machines exige categraf dans une version supérieure à 0.2.35",
  "view_related_collects": "Voir la configuration de collecte associée",
  "organize_columns": {
    "title": "Colonnes affichées"
  },
  "targets": "Objets supervisés",
  "targets_placeholder": "Saisissez les métriques de l'objet supervisé, une par ligne",
  "copy": {
    "current_page": "Copier la page",
    "all": "Tout copier",
    "selected": "Copier la sélection",
    "no_data": "Aucune donnée à copier"
  },
  "bind_tag": {
    "title": "Associer des étiquettes",
    "placeholder": "Le format est clé=valeur ; séparez les entrées par Entrée ou par un espace",
    "msg1": "Saisissez au moins une étiquette.",
    "msg2": "Le format de l'étiquette est incorrect ; vérifiez-le.",
    "msg3": "Une clé d'étiquette ne peut pas être répétée",
    "render_tip1": "Une étiquette ne doit pas dépasser 64 caractères",
    "render_tip2": "Le format attendu est clé=valeur, la clé commençant par une lettre ou un tiret bas et ne contenant que des lettres, des chiffres et des tirets bas."
  },
  "unbind_tag": {
    "title": "Dissocier des étiquettes",
    "placeholder": "Choisissez les étiquettes à dissocier",
    "msg": "Saisissez au moins une étiquette."
  },
  "update_busi": {
    "title": "Modifier le groupe métier",
    "label": "Groupe métier de rattachement",
    "mode": {
      "label": "Mode",
      "reset": "Écraser",
      "add": "Ajouter",
      "del": "Supprimer"
    },
    "tags": "Associer des étiquettes",
    "tags_tip": "Laissé vide, les étiquettes existantes ne sont pas écrasées"
  },
  "remove_busi": {
    "title": "Retirer du groupe métier",
    "msg": "Attention : une fois retirés du groupe métier, ces objets échappent aux administrateurs de ce groupe. Songez à effacer au préalable leurs étiquettes et leurs remarques.",
    "btn": "Retirer"
  },
  "update_note": {
    "title": "Modifier la remarque",
    "placeholder": "Un contenu vide efface la remarque"
  },
  "batch_delete": {
    "title": "Supprimer en masse",
    "msg": "Attention : cette action supprime définitivement l'objet du système. C'est très risqué, procédez avec prudence.",
    "btn": "Supprimer"
  },
  "meta_tip": "Voir les métadonnées",
  "meta_title": "Métadonnées",
  "meta_desc_key": "Nom de la métadonnée",
  "meta_desc_value": "Valeur de la métadonnée",
  "meta_value_click_to_copy": "Cliquez pour copier",
  "meta_expand": "Déplier",
  "meta_collapse": "Replier",
  "meta_no_data": "Aucune donnée",
  "all_no_data": "Pas encore de collecteur ? Suivez le <a>guide d'installation</a>",
  "categraf_doc": "Documentation categraf",
  "hosts_select": {
    "placeholder": "Identifiant de machine ou IP",
    "modal_title": "Saisissez un identifiant de machine ou une IP",
    "modal_placeholder": "Un identifiant de machine ou une IP par ligne"
  }
};

export default fr_FR;

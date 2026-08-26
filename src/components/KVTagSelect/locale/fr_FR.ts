const fr_FR = {
  "append_tags_msg": "Le format de l'étiquette est incorrect ; vérifiez-le.",
  "append_tags_msg1": "Une étiquette ne doit pas dépasser 64 caractères",
  "append_tags_msg2": "Le format attendu est clé=valeur, la clé commençant par une lettre ou un tiret bas et ne contenant que des lettres, des chiffres et des tirets bas.",
  "append_tags_placeholder": "Le format est clé=valeur ; séparez les entrées par Entrée ou par un espace",
  "tag": {
    "key": {
      "label": "Nom de l'étiquette",
      "msg": "Le nom de l'étiquette est obligatoire",
      "duplicate_error": "Une même clé ne peut pas être répétée : plus aucun événement ne correspondrait",
      "placeholder": "Saisissez ou choisissez la clé d'étiquette à comparer, par exemple app, cluster ou alertname"
    },
    "func": {
      "label": "Opérateur",
      "label_tip": "Plusieurs opérateurs de comparaison sont disponibles :\n- `==` compare à une valeur d'étiquette précise ; une seule valeur est admise, utilisez `in` pour en viser plusieurs\n- `=~` accepte une expression régulière pour comparer les valeurs avec souplesse\n- `in` compare à plusieurs valeurs, comme le `in` de SQL\n- `not in` exclut plusieurs valeurs, comme le `not in` de SQL\n- `!=` signifie différent de, pour exclure une valeur précise\n- `!~` signifie ne correspond pas à l'expression régulière : toutes les valeurs qui y correspondent sont exclues, comme le `!~` de PromQL",
      "msg": "L'opérateur est obligatoire"
    },
    "value": {
      "label": "Valeur de l'étiquette",
      "placeholder": "Saisissez la valeur à comparer ou choisissez-la dans la liste",
      "placeholder2": "Saisissez une expression régulière pour comparer les valeurs d'attribut avec souplesse",
      "msg": "La valeur de l'étiquette est obligatoire"
    },
    "add": "Ajouter une étiquette"
  },
  "attr": {
    "key": {
      "label": "Nom de l'attribut",
      "msg": "Le nom de l'attribut est obligatoire",
      "duplicate_error": "Un nom d'attribut ne peut pas être répété"
    }
  }
};

export default fr_FR;

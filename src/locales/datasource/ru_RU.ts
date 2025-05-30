const ru_RU = {
  es: {
    ref: 'Имя',
    index: 'Индекс',
    index_tip:
      '\n      Поддерживаются различные способы конфигурации\n      <1 />\n      1. Укажите один индекс gb для поиска всех документов в индексе gb\n      <1 />\n      2. Укажите несколько индексов gb,us для поиска всех документов в индексах gb и us\n      <1 />\n      3. Укажите префикс индекса g*,u* для поиска всех документов в индексах, начинающихся с g или u\n      <1 />\n      ',
    index_msg: 'Индекс не может быть пустым',
    indexPatterns: 'Шаблоны индексов',
    indexPattern_msg: 'Шаблон индекса не может быть пустым',
    indexPatterns_manage: 'Управление шаблонами индексов',
    filter: 'Фильтр',
    time_label: 'Гранулярность времени',
    date_field: 'Поле даты',
    date_field_msg: 'Поле даты не может быть пустым',
    interval: 'Интервал времени',
    value: 'Извлечение значения',
    func: 'Функция',
    funcField: 'Имя поля',
    terms: {
      label: 'Группировка по указанному полю',
      more: 'Расширенные настройки',
      size: 'Количество совпадений',
      min_value: 'Минимальное значение',
    },
    raw: {
      limit: 'Количество записей',
      date_format: 'Формат даты',
      date_format_tip: 'Используйте формат даты Moment.js, например, YYYY-MM-DD HH:mm:ss.SSS',
    },
    alert: {
      query: {
        title: 'Статистика запроса',
        preview: 'Предварительный просмотр данных',
      },
      trigger: {
        title: 'Условия срабатывания',
        builder: 'Простой режим',
        code: 'Режим выражений',
        label: 'Связанная метка',
      },
      prom_eval_interval_tip: 'Каждые {{num}} секунд, запрос к базе данных',
      prom_for_duration_tip:
        'Обычно продолжительность больше частоты выполнения, в течение продолжительности запрос выполняется несколько раз, каждый раз срабатывает, чтобы создать предупреждение; если продолжительность установлена в 0, это означает, что как только данные, удовлетворяющие условиям предупреждения, появляются, создается предупреждение',
      advancedSettings: 'Расширенные настройки',
      delay: 'Задержка выполнения',
    },
    event: {
      groupBy: 'Группировка по {{field}}, {{size}} совпадений, минимальное значение {{min_value}}',
      logs: {
        title: 'Детальная информация',
        size: 'Количество результатов',
        fields: 'Поля фильтрации',
        jsonParseError: 'Ошибка разбора JSON',
      },
    },
    syntaxOptions: 'Опции синтаксиса',
    queryFailed: 'Ошибка запроса, пожалуйста, попробуйте позже',
    offset_tip: 'Используется для запроса данных перед указанным временным диапазоном, аналогично offset в PromQL, единица измерения - секунды',
  },
};

export default ru_RU;

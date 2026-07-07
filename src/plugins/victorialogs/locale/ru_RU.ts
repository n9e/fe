const ru_RU = {
  explorer: {
    execute: 'Выполнить',
    query: 'Условия запроса',
    query_required: 'Условия запроса не могут быть пустыми',
    query_lanaguage_docs: 'Документация по языку запросов',
    limit: 'Лимит',
    hits: 'Совпадения',
    graph_settings: {
      title: 'Настройки графика',
      stacked: 'С накоплением',
      fill: 'Заливка',
    },
    view: {
      group: 'Группа',
      table: 'Таблица',
      json: 'JSON',
    },
    total_logs_returned: 'Общее количество возвращенных журналов',
    total_groups: 'Общее количество групп',
    page_size: 'Записей на странице',
    page_size_all: 'Все',
    expand_all: 'Развернуть все',
    collapse_all: 'Свернуть все',
    group_view: {
      ungrouped: 'Без группировки',
      group_by_field: 'Группировать по "{{field}}"',
      entries: 'записей',
      show_field_tip: 'Показать поле',
      hide_field_tip: 'Скрыть поле',
      group_by_field_icon_tip: 'Группировать по этому полю',
    },
    group_view_settings: {
      title: 'Настройки группового просмотра',
      group_by_field: 'Поле группировки',
      group_by_field_help: 'Выберите поле для группировки журналов (по умолчанию: _stream)',
      ungrouped: 'Без группировки',
      display_fields: 'Отображаемые поля',
      display_fields_help: 'Выберите поля для отображения (по умолчанию: _msg)',
      date_format: 'Формат даты',
      date_format_help01: 'Установите формат даты (например, YYYY-MM-DD HH:mm:ss). <a>Подробнее см. в этой документации</a>',
      date_format_help02: 'Ваш текущий формат даты: {{dateFormat}}',
    },
    table_view_settings: {
      title: 'Настройки табличного просмотра',
      customize_columns: 'Настроить столбцы',
      search_columns: 'Поиск столбцов',
      check_all: 'Выбрать все',
    },
    copy_json: 'Копировать JSON',
    parse_failed: 'Не удалось разобрать',
  },
  datasource: {},
  alert: {
    query_warning_no_time:
      'Настоятельно рекомендуется использовать _time (поле времени) в условиях запроса для явного ограничения временного диапазона, в противном случае это может привести к таким проблемам, как: <b>аномальная нагрузка на хранилище, тайм-аут запроса оповещения</b>',
  },
};
export default ru_RU;

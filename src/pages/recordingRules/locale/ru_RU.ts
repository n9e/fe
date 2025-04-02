const ru_RU = {
  title: 'Правила записи',
  search_placeholder: 'Поиск по названию или тегам',
  name: 'Название метрики',
  name_msg: 'Неверное название метрики',
  name_tip: 'promql периодически генерирует новый показатель, здесь введите название нового показателя',
  note: 'Примечание',
  disabled: 'Включить',
  append_tags: 'Теги',
  append_tags_msg: 'Неверный формат тегов, пожалуйста, проверьте!',
  append_tags_msg1: 'Длина тега должна быть не более 64 символов',
  append_tags_msg2: 'Формат тега должен быть key=value. key должен начинаться с буквы или подчеркивания и состоять из букв, цифр и подчеркиваний.',
  append_tags_placeholder: 'Формат тега key=value, используйте Enter или пробел для разделения',
  batch: {
    must_select_one: 'Не выбрано ни одно правило',
    import: {
      title: 'Импорт правил записи',
      name: 'Правило записи',
    },
    export: {
      title: 'Экспорт правил записи',
      copy: 'Копировать JSON в буфер обмена',
    },
    delete: 'Удалить правило записи',
    update: {
      title: 'Обновить правило записи',
      field: 'Поле',
      changeto: 'Изменить на',
      options: {
        datasource_ids: 'Источники данных',
        disabled: 'Включить',
        append_tags: 'Теги',
        cron_pattern: 'Частота выполнения (cron)',
      },
    },
  },
};

export default ru_RU;

const ru_RU = {
  toolbar: {
    current_chat: 'Текущий чат',
    new_chat: 'Новый чат',
    history: 'История чатов',
    switch_to_drawer: 'Переключить в режим Drawer',
    switch_to_floating: 'Переключить в плавающую панель',
  },
  history: {
    untitled: 'Новый чат',
    today: 'Сегодня',
    yesterday: 'Вчера',
    earlier: 'Ранее',
    unknown_time: '--:--',
    delete_confirm: 'Удалить этот диалог?',
    empty: 'История диалогов пуста',
  },
  input: {
    placeholder: 'Введите вопрос. Enter для отправки, Shift + Enter для новой строки',
  },
  query: {
    title: 'Запрос',
    copied: 'Запрос скопирован',
    copy: 'Копировать',
    execute: 'Выполнить запрос',
    execute_disabled: 'Колбэк выполнения не передан. Доступно только копирование.',
  },
  action: {
    query_generator: 'Сгенерировать запрос',
  },
  message: {
    generating: 'Генерация ответа...',
    hint: 'Подсказка',
    stopped: 'Генерация остановлена',
    request_failed: 'Ошибка запроса',
    cancelled: 'Этот ответ был отменен.',
    retry_later: 'Повторите попытку позже.',
    empty_response: 'Нет содержимого ответа',
    thinking: 'Ход рассуждений',
    unsupported_type: 'Неподдерживаемый тип содержимого: {{type}}',
  },
  form_select: {
    title: 'Пожалуйста, заполните следующую информацию, чтобы продолжить:',
    busi_group: 'Группа бизнеса',
    datasource: 'Источник данных',
    placeholder_select: 'Выберите',
    confirm: 'Подтвердить',
  },
  alert_rule: {
    title: 'Правило оповещения',
    copy: 'Копировать',
    copied: 'ID правила скопирован',
    duration_seconds: 'в течение {{seconds}} сек.',
    field: {
      id: 'ID правила',
      name: 'Название правила',
      group: 'Группа бизнеса',
      datasource: 'Источник данных',
      cate: 'Тип источника',
      severity: 'Уровень',
      metric: 'Метрика',
      condition: 'Условие',
      note: 'Текст оповещения',
    },
    severity: {
      critical: 'Critical',
      warning: 'Warning',
      info: 'Info',
    },
  },
  dashboard: {
    title: 'Дашборд',
    copied: 'ID дашборда скопирован',
    field: {
      id: 'ID дашборда',
      name: 'Название',
      group: 'Группа бизнеса',
      datasource: 'Источник данных по умолчанию',
      panels_count: 'Панелей',
      variables_count: 'Переменных',
      tags: 'Теги',
    },
  },
  empty: {
    greeting_prefix: 'Здравствуйте, я',
  },
};

export default ru_RU;

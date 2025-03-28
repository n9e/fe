const ru_RU = {
  title: 'Быстрый запрос',
  dependencies: 'Топология',
  mode: {
    id: 'Запрос по Trace ID',
    query: 'Условия запроса',
  },
  label: 'Тег',
  label_tip:
    '\n    <0>\n      Поддерживаются различные форматы\n      <1>logfmt</1>\n       \n    </0>\n    <2>Разделитель пробелов</2>\n    <3>Строки, содержащие пробелы, должны быть заключены в кавычки</3>\n    ',
  time: 'Временной диапазон',
  duration_max: 'Максимальное время выполнения',
  duration_min: 'Минимальное время выполнения',
  num_traces: 'Количество результатов',
  query: 'Запрос',
  traceid_msg: 'Пожалуйста, введите Trace ID',
  sort: {
    MOST_RECENT: '最新优先',
    LONGEST_FIRST: '时长优先',
    SHORTEST_FIRST: '时短优先',
    MOST_SPANS: 'span多优先',
    LEAST_SPANS: 'span少优先',
  },
};

export default ru_RU;

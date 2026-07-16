export const NUMBER_TYPES = ['long', 'number'];
export const DATE_TYPES = ['date'];
export const STRING_TYPES = ['text'];
export const BOOLEAN_TYPES = ['bool', 'boolean'];
export const IP_TYPES = ['ipv4', 'ipv6'];
export const FILTERABLE_TYPES = [...NUMBER_TYPES, ...DATE_TYPES, ...STRING_TYPES, ...BOOLEAN_TYPES, ...IP_TYPES];

export const EQUAL_OPERATORS = ['=', '!='];
export const COMPARISON_OPERATORS = ['>', '<', '>=', '<='];
export const IN_OPERATORS = ['in', 'not-in'];
export const NULL_OPERATORS = ['is-null', 'is-not-null'];
export const BETWEEN_OPERATORS = ['between', 'not-between'];
export const LIKE_OPERATORS = ['like', 'not-like', 'ilike', 'not_ilike'];
export const MATCH_OPERATORS = ['match', 'not_match', 'has_token'];

const SCALAR_OPERATORS = [...EQUAL_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS];
const NUMBER_TYPE_OPERATORS = [...EQUAL_OPERATORS, ...COMPARISON_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS, ...BETWEEN_OPERATORS];
const DATE_TYPE_OPERATORS = NUMBER_TYPE_OPERATORS;
const STRING_TYPE_OPERATORS = [...EQUAL_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS, ...LIKE_OPERATORS, ...MATCH_OPERATORS];
const COMPLEX_TYPE_OPERATORS = NULL_OPERATORS;

export const TYPE_OPERATOR_MAP: Record<string, string[]> = {
  long: NUMBER_TYPE_OPERATORS,
  number: NUMBER_TYPE_OPERATORS,
  date: DATE_TYPE_OPERATORS,
  text: STRING_TYPE_OPERATORS,
  json: COMPLEX_TYPE_OPERATORS,
  map: COMPLEX_TYPE_OPERATORS,
  bool: SCALAR_OPERATORS,
  boolean: SCALAR_OPERATORS,
  ipv4: SCALAR_OPERATORS,
  ipv6: SCALAR_OPERATORS,
};

export const AGGREGATE_FUNCTION_TYPE_MAP: Record<string, string[]> = {
  COUNT: FILTERABLE_TYPES,
  CPS: FILTERABLE_TYPES,
  AVG: NUMBER_TYPES,
  MAX: NUMBER_TYPES,
  MIN: NUMBER_TYPES,
  SUM: NUMBER_TYPES,
  PERCENTILE: NUMBER_TYPES,
  UNIQUE_COUNT: FILTERABLE_TYPES,
  EXIST_RATIO: FILTERABLE_TYPES,
  TOPN: FILTERABLE_TYPES,
  RATIO: FILTERABLE_TYPES,
  VARIANCE: NUMBER_TYPES,
  STDDEV: NUMBER_TYPES,
};

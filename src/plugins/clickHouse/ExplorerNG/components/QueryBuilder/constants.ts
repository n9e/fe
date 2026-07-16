export const NUMBER_TYPES = ['long', 'number'];
export const DATE_TYPES = ['date'];
export const STRING_TYPES = ['text'];
export const BOOLEAN_TYPES = ['bool', 'boolean'];
export const IP_TYPES = ['ipv4', 'ipv6'];
export const FILTERABLE_TYPES = [...NUMBER_TYPES, ...DATE_TYPES, ...STRING_TYPES, ...BOOLEAN_TYPES, ...IP_TYPES];

// Operator constants align with ClickHouse native SQL surface:
//   - Keywords use upper-case with single spaces (IN / NOT IN / IS NULL /
//     BETWEEN AND / LIKE / ILIKE), matching CK SQL Reference verbatim.
//   - Functions use camelCase (match / hasToken), matching CK function
//     names verbatim. Negated function reads as keyword + function:
//     `NOT match` mirrors the SQL the BE emits — `NOT match(f, 'p')` —
//     because no CK OSS version has a `notMatch()` function.
// See docs/ck-querybuilder-n9e-plus-fe-todo.md §2 for the full matrix.
export const EQUAL_OPERATORS = ['=', '!='];
export const COMPARISON_OPERATORS = ['>', '<', '>=', '<='];
export const IN_OPERATORS = ['IN', 'NOT IN'];
export const NULL_OPERATORS = ['IS NULL', 'IS NOT NULL'];
export const BETWEEN_OPERATORS = ['BETWEEN AND', 'NOT BETWEEN AND'];
export const LIKE_OPERATORS = ['LIKE', 'NOT LIKE', 'ILIKE', 'NOT ILIKE'];
export const MATCH_OPERATORS = ['match', 'NOT match', 'hasToken'];

const SCALAR_OPERATORS = [...EQUAL_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS];
const NUMBER_TYPE_OPERATORS = [...EQUAL_OPERATORS, ...COMPARISON_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS, ...BETWEEN_OPERATORS];
const DATE_TYPE_OPERATORS = NUMBER_TYPE_OPERATORS;
const STRING_TYPE_OPERATORS = [...EQUAL_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS, ...LIKE_OPERATORS, ...MATCH_OPERATORS];
const IP_TYPE_OPERATORS = [...EQUAL_OPERATORS, ...IN_OPERATORS, ...NULL_OPERATORS, ...BETWEEN_OPERATORS];
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
  ipv4: IP_TYPE_OPERATORS,
  ipv6: IP_TYPE_OPERATORS,
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

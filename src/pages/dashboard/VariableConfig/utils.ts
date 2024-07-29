import _ from 'lodash';
import { IVariable } from './definition';

export function normalizeESQueryRequestBody(
  params: {
    find: string;
    field: string;
    query?: string;
    size?: number;
    orderBy?: string;
    order?: string;
  },
  date_field: string | undefined,
  start: number,
  end: number,
) {
  let orderBy = '_key';
  if (params?.orderBy === 'doc_count') {
    orderBy = '_count';
  }
  const body: any = {
    size: 0,
    query: {
      bool: {
        filter: [
          {
            range: {
              [date_field || '@timestamp']: {
                gte: start,
                lte: end,
                format: 'epoch_millis',
              },
            },
          },
        ],
      },
    },
    aggs: {
      A: {
        [params.find]: {
          field: `${params.field}`,
          size: params.size || 500,
          order: {
            [orderBy]: params.order || 'desc',
          },
        },
      },
    },
  };

  if (params.query && params.query !== '') {
    body.query.bool.filter = [
      ...body.query.bool.filter,
      {
        query_string: {
          analyze_wildcard: true,
          query: params?.query,
        },
      },
    ];
  }

  return body;
}

export function getGroupIdent(groupID, groups) {
  return _.find(groups, { id: groupID })?.label_value;
}

function escapeRegExp(string: string): string {
  // 转义字符串中的特殊字符
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isPlaceholderQuoted(expression: string, placeholder: string): boolean {
  // 转义占位符以安全地用于正则表达式
  const escapedPlaceholder = escapeRegExp(placeholder);
  // 使用反向引用来确保占位符前后的引号相同
  const regex = new RegExp(`(['"])${escapedPlaceholder}(\\\\)?\\1`);
  return regex.test(expression);
}

/**
 * 如果是 ES 数据源的变量，需要如下处理
 * 1. 如果 expression 中变量占位符被引号包裹，则不需要处理
 * 2. 否则需要将变量值加上引号
 */
export function ajustVarSingleValue(expression: string, placeholder: string, value: string, varItem: IVariable, isEscapeJsonString: boolean) {
  if (varItem.datasource?.cate === 'elasticsearch') {
    if (!isPlaceholderQuoted(expression, placeholder)) {
      value = `"${value}"`;
    }
  }
  // 2024-07-09 如果是 ES 数据源的变量，在变量内部处理时需要做转义处理
  if (isEscapeJsonString) {
    value = escapeJsonString(value);
  }
  return value;
}

// 转义 JSON 字符串中的特殊字符
export function escapeJsonString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// 转义 PromQL 字符串中的特殊字符 {}[]().-
// 2024-07-25 暂时修改成只对 () 进行转义
export function escapePromQLString(str: string): string {
  return str.replace(/[()]/g, '\\\\$&');
}

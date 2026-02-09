import _ from 'lodash';

import { TYPE_MAP } from '../constants';
import { Field } from '../ExplorerNG/types';

interface Mappings {
  [index: string]: {
    properties: {
      [key: string]:
        | {
            type: string;
          }
        | Mappings;
    };
  };
}

export default function mappingsToFields(mappings: Mappings, type?: string) {
  const fields: string[] = [];
  _.forEach(mappings, (item: any) => {
    function loop(mappings, prefix = '') {
      // mappings?.doc?.properties 为了兼容 6.x 版本接口
      _.forEach(mappings?.doc?.properties || mappings?.properties, (item, key) => {
        if (item.type) {
          if (TYPE_MAP[item.type] === type || !type) {
            fields.push(`${prefix}${key}`);
          }
        } else {
          loop(item, `${prefix}${key}.`);
        }
      });
    }
    loop(item.mappings);
  });
  return _.sortBy(_.union(fields));
}

export function mappingsToFullFields(
  mappings: Mappings,
  options: {
    type?: string;
    includeSubFields?: boolean;
  } = {
    includeSubFields: false,
  },
) {
  const fields: Field[] = [];
  _.forEach(mappings, (item: any) => {
    function loop(mappings, prefix = '') {
      // mappings?.doc?.properties 为了兼容 6.x 版本接口
      _.forEach(mappings?.doc?.properties ?? mappings?._doc?.properties ?? mappings?.properties, (item, key) => {
        if (item.type) {
          if (options.includeSubFields && item.type === 'text' && item.fields) {
            fields.push({
              ...item,
              field: `${prefix}${key}`,
            });
            _.forEach(item.fields, (item, subkey) => {
              if (TYPE_MAP[item.type] === options?.type || !options?.type) {
                fields.push({
                  ...item,
                  field: `${prefix}${key}.${subkey}`,
                });
              }
            });
          } else if (TYPE_MAP[item.type] === options?.type || !options?.type) {
            fields.push({
              ...item,
              type: item.type === 'keyword' ? 'string' : item.type,
              field: `${prefix}${key}`,
            });
            if (options.includeSubFields && item.type === 'keyword') {
              fields.push({
                ...item,
                field: `${prefix}${key}.keyword`,
              });
            }
          }
        } else if (item.properties) {
          loop(item, `${prefix}${key}.`);
        }
      });
    }
    loop(item.mappings);
  });
  return _.sortBy(_.unionBy(fields, 'field'), 'field');
}

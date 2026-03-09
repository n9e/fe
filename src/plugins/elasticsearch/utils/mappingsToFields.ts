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
      // mappings?.doc?.properties 兼容 6.x 版本接口
      // mappings?.properties 兼容 7.x 版本（过渡版本，这个版本废弃了多文档类型）
      // mappings?._doc?.properties 兼容 8.x 版本
      let properties = mappings?.doc?.properties ?? mappings?._doc?.properties ?? mappings?.properties;
      // 这里还要兼容 mappings?.${document_type}?.properties 自定义文档类型的情况
      if (!properties) {
        const customType = Object.keys(mappings || {}).find((key) => key !== 'doc' && key !== '_doc' && key !== 'properties');
        if (customType) {
          if (mappings[customType]?.properties) {
            properties = mappings[customType].properties;
          }
        }
      }

      _.forEach(properties, (item, key) => {
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

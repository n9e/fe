import _ from 'lodash';

import { DataSourceType } from './types';
import { shardRSAEncrypt } from './utils';

export const mysqlLikePlaceholder = {
  mysql: {
    addr: '127.0.0.1:3306',
    db: 'order_db',
  },
  pgsql: {
    addr: '127.0.0.1:5432',
    db: 'postgres',
  },
  ck: {
    addr: '127.0.0.1:9000',
    db: 'order_db',
  },
  mongodb: {
    addr: 'mongodb://<host1>:<port1>,<host2>:<port2>,…,<hostN>:<portN>',
    db: 'order_db',
  },
};

// 命名不合理（暂不修改）该状态主要是保存单个数据的临时配置，包括连接信息等
export const defaultConnTestResult = {
  message: '',
  dbs: undefined,
  status: 'normal' as any,
};

export const defaultShardValues = (type: string) => ({
  [`${type}.addr`]: '',
  [`${type}.db`]: undefined,
  [`${type}.user`]: '',
  [`${type}.password`]: '',
  [`${type}.is_encrypt`]: false,
});
export const defaultValues = (type: string) => {
  const result = {
    settings: {
      [`${type}.method`]: 'direct',
      [`${type}.shards`]: [defaultShardValues(type)],
      [`${type}.tables`]: [
        {
          [`${type}.table.source`]: '',
          [`${type}.table.op`]: 'EQ',
          [`${type}.table.target`]: '',
        },
      ],
    },
  };
  // if (['pgsql', 'ck'].includes(type)) {
  //   result.settings[`${type}.method`] = 'direct';
  // }
  return result;
};

export const normalizeRequestValues = (values: any, type: string): DataSourceType => {
  const cloned = _.cloneDeep(values);
  const shards: any[] = [];
  if (cloned.settings && cloned.settings[`${type}.shards`]) {
    _.forEach(cloned.settings[`${type}.shards`], (shard: any) => {
      if (Array.isArray(shard[`${type}.db`])) {
        _.forEach(shard[`${type}.db`], (db: string) => {
          shards.push({
            ...shard,
            [`${type}.db`]: db,
          });
        });
      } else {
        shards.push(shard);
      }
    });
  }
  cloned.settings[`${type}.shards`] = shards.map((shard) => shardRSAEncrypt(shard, type));
  return cloned;
};

export const normalizeInitialValues = (values: any, type: string) => {
  if (!values) return undefined;
  const cloned = _.cloneDeep(values);
  if (cloned && cloned.settings && cloned.settings[`${type}.shards`]) {
    const shards = cloned.settings[`${type}.shards`];
    const grouped = _.groupBy(shards, (shard: any) => {
      return `${shard[`${type}.user`]}@${shard[`${type}.addr`]}`;
    });
    const newShards: any[] = [];
    _.forEach(grouped, (groupValues: any[]) => {
      const db = _.map(groupValues, `${type}.db`);
      newShards.push({
        ...groupValues[0],
        [`${type}.db`]: db,
      });
    });
    cloned.settings[`${type}.shards`] = newShards;
  }
  return cloned;
};

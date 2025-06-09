import _ from 'lodash';

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
  oracle: {
    addr: '127.0.0.1:3306',
    db: 'order_db',
  },
  sqlserver: {
    addr: '127.0.0.1:3306',
    db: 'order_db',
  },
};

export const defaultShardValues = (type: string) => ({
  [`${type}.addr`]: '',
  [`${type}.db`]: undefined,
  [`${type}.user`]: '',
  [`${type}.password`]: '',
  [`${type}.is_encrypt`]: false,
});

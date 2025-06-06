type TPrefix<T extends string, P extends string> = `${P}${T}`;
type TPrefixKey<T, P extends string> = {
  [K in keyof T as TPrefix<K & string, P>]: T[K];
};

interface IShardBaseType {
  '.addr': string;
  '.password': string;
  '.user': string;
  '.is_encrypt': boolean;
}

type MysqlshardBaseType = TPrefixKey<IShardBaseType, 'mysql'>;

export type ShardBaseType = Partial<MysqlshardBaseType>;

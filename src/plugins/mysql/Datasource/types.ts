export interface IConnectionStatus {
  message?: string;
  dbs?: string[];
  status: 'normal' | 'loading' | 'connected' | 'disconnected' | 'privBeyond' | 'dbsEmpty';
}

export interface ValidateType {
  help: string;
  validateStatus: undefined | 'error';
}

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
interface IShardType {
  '.addr': string;
  '.db': string;
  '.password': string;
  '.user': string;
  '.is_encrypt': boolean;
}
interface ITableType {
  '.table.op': string;
  '.table.source': string;
  '.table.target': string;
}

interface ISettingType<T extends string> {
  '.method': string;
  '.shards': TPrefixKey<IShardType, T>[];
  '.tables': TPrefixKey<ITableType, T>[];
}

type MysqlshardBaseType = TPrefixKey<IShardBaseType, 'mysql'>;
type MysqlshardType = TPrefixKey<IShardType, 'mysql'>;
type MysqltableType = TPrefixKey<ITableType, 'mysql'>;
type MysqlSettingType = TPrefixKey<ISettingType<'mysql'>, 'mysql'>;

export interface DataSourceType {
  id: number;
  plugin_id: number;
  name: string;
  description: string;
  status: string;
  plugin_type: string;
  plugin_type_name: string;
  settings: Partial<MysqltableType>;
  created_at: number;
  updated_at: number;
  connectionStatus?: string;
}

export type ShardBaseType = Partial<MysqlshardBaseType>;

export type ShardType = Partial<MysqlshardType>;

export type TableType = Partial<MysqltableType>;

export type SettingType = Partial<MysqlSettingType>;

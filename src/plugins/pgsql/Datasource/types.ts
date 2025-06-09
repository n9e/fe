type TPrefix<T extends string, P extends string> = `${P}${T}`;
type TPrefixKey<T, P extends string> = {
  [K in keyof T as TPrefix<K & string, P>]: T[K];
};

interface ITableType {
  '.table.op': string;
  '.table.source': string;
  '.table.target': string;
}

type MysqltableType = TPrefixKey<ITableType, 'mysql'>;

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

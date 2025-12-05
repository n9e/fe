export interface DataSourceType {
  id: number;
  plugin_id: number;
  name: string;
  description: string;
  status: string;
  plugin_type: string;
  plugin_type_name: string;
  settings: {
    'victorialogs.addr': string;
    'victorialogs.timeout': string;
    'victorialogs.basic': {
      'victorialogs.is_encrypt': boolean;
      'victorialogs.user': string;
      'victorialogs.password': string;
    };
    'victorialogs.tls': {
      'victorialogs.tls.skip_tls_verify': boolean;
    };
    'victorialogs.headers': {
      [key: string]: string;
    };
    'victorialogs.cluster_name': string;
  };
  created_at: number;
  updated_at: number;
  connectionStatus?: string;
}

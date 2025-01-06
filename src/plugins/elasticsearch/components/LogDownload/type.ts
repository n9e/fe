export interface ITaskItem {
  id: number;
  cate: string;
  datasource_id: number;
  query: ITaskQuery;
  version: string;
  config: ITaskConfig;
  server: string;
  status: 1;
  create_time: number;
  create_by: string;
  update_time: number;
}

export interface ITaskQuery {
  date_field: string;
  index: string;
  filter?: string;
  range: {
    end: string;
    start: string;
  };
}

export interface ITaskConfig {
  format: 'json' | 'csv';
  file_name: string;
  ascending: false;
  count: number;
  file_path: string;
}

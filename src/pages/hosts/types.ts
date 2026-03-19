export interface Item {
  id: number;
  name: string;
  ident: string;
  group_ids: number[];
  group_objs: {
    id: number;
    name: string;
  }[];
  host_tags: string[];
  tags: string[];
  note: string;

  host_ip: string;
  remote_addr: string;
  agent_version: string;
  new_version: string;
  apps: string;
  arch: string;
  os: string;
  cpu_num: number;
  cpu_util: number;
  mem_util: number;
  offset: number;
  target_up: number;
  beat_time: number;
  unixtime: number;
  update_at: number;
  meta_info: any;
}

export interface Stats {
  count: number; // 机器总数
  alive_count: number; // 有心跳的数量
  dead_count: number; // 无心跳的数量
  memory_usage: {
    [index: number]: number;
  }; // 内存用量分布
  cpu_usage: {
    [index: number]: number;
  }; // CPU 用量分布
  versions: {
    [version: string]: number; // key: 版本号，value: 数量
  };
}

export enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  None = 'none',
}

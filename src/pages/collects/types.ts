export interface CollectCateType {
  collect: string;
  favorite: boolean;
  icon_url: string;
  markdown: string;
  name: string;
}

export interface QueryType {
  key: string;
  op: string;
  values: string[];
}

export enum StatusType {
  Enable = 0,
  UnEnable = 1,
}

export interface CollectType {
  cate: string;
  content: string;
  disabled: StatusType;
  group_id: number;
  id: number;
  name: string;
  queries: QueryType[];
}

export type PostCollectType = Omit<CollectType, 'id'>;
export type PutCollectType = CollectType;

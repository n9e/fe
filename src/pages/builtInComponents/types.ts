export interface Component {
  id: number;
  ident: string;
  logo: string;
  readme: string;
  disabled: 0 | 1;
}

export type ComponentPost = Omit<Component, 'id'>;
export type ComponentPut = Component;

export enum TypeEnum {
  alert = 'alert',
  dashboard = 'dashboard',
  collect = 'collect',
  metric = 'metric',
}
export interface PayloadQuery {
  component_id: number;
  type: TypeEnum;
  cate?: string; // 某些组件有子分类
  query?: string; // 名称模糊查询
}

export interface Payload {
  id: number;
  uuid: number;
  type: TypeEnum;
  component_id: number;
  cate: string;
  name: string;
  content: string;
}

export type PayloadPost = Omit<Payload, 'id'>;
export type PayloadPut = Payload;

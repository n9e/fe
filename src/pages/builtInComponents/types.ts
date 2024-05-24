export interface Component {
  id: number;
  ident: string;
  logo: string;
  readme: string;
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
  component: string;
  type: TypeEnum;
  cate?: string; // 某些组件有子分类
  query?: string; // 名称模糊查询
}

export interface Payload {
  id: number;
  type: TypeEnum;
  component: string;
  cate: string;
  name: string;
  content: string;
}

export type PayloadPost = Omit<Payload, 'id'>;
export type PayloadPut = Payload;

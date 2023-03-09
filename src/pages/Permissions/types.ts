export interface RoleType {
  id: number;
  name: string;
  note?: string;
}

export type RolePostType = Omit<RoleType, 'id'>;

export interface OperationType {
  name: string;
  cname: string;
  ops: string[];
}

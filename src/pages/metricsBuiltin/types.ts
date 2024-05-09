export interface Record {
  uid: number; // 只是用于 panel 的 id
  id: number;
  collector: string;
  typ: string;
  name: string;
  unit: string;
  note: string;
  expression: string;
}

export type PostRecord = Omit<Record, 'id'>;
export type PutRecord = Record;

export interface Filter {
  collector?: string;
  typ?: string;
  query?: string;
}

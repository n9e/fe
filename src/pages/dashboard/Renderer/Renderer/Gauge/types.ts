export interface IFieldConfig {
  mode?: 'absolute' | 'percentage';
  steps: {
    value?: number | null;
    color: string;
    type?: string;
  }[];
}

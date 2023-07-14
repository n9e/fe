export interface IndexPattern {
  id: number;
  datasource_id: number;
  name: string;
  time_field: string;
  hide_system_indices: boolean;
  fields_format: string;
}

export interface FieldConfig {
  attrs: {
    [index: string]: {
      [index: string]: string; // alias
    };
  };
  formatMap: {
    [index: string]: {
      type: string; // date
      params: {
        [index: string]: string; // pattern
      };
    };
  };
  version: number;
}

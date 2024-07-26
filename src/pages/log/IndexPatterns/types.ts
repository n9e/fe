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

export interface FieldConfigVersion2 {
  arr: {
    attrs: {
      // [index: string]: {   这里没有这一层！！
        [index: string]: string; 
      // };
    };
    field: string;
    type: string;
    formatMap: {
      // [index: string]: {  这里没有这一层！！
        type: string; // date
        params: {
          [index: string]: string; // pattern
        };
      // };
    };
  }[];
  version: number;
}

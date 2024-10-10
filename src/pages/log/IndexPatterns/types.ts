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
      paramsArr:{
        name: string;
        urlTemplate: string;
      }[]; // 兼容从FieldConfigVersion2 合并过来的多个跳转链接的情况
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
  linkArr:{
    name: string;
    field: string;
    urlTemplate: string;
  }[];
  version: number;
}

export function convertToVersion2(data: FieldConfig): FieldConfigVersion2 {
  const version2Data: FieldConfigVersion2 = {
    arr: Object.keys(data.attrs).map(key => ({
      attrs: data.attrs[key],
      field: key,
      type: data.formatMap[key]?.type,
      formatMap: data.formatMap[key],
    })),
    linkArr: [],
    version: 2,
  };
  return version2Data;
}

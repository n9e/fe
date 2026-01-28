export interface Field {
  field: string;
  indexable: boolean;
  type: string;
  type2?: string;
  delimiters?: string[];
}
export interface IndexDataItem {
  field: string;
  indexable: boolean;
  type: string;
  type2?: string;
}

export interface Query {
  datasourceCate: string;
  datasourceValue: number;
  [key: string]: any;
}

export interface LogExplorerTabItem {
  key: string;
  isInited?: boolean;
  formValues?: any;
}

export interface DefaultFormValuesControl {
  isInited?: boolean;
  setIsInited: () => void;
  defaultFormValues?: any;
  setDefaultFormValues?: (query: any) => void;
}

export interface RenderCommonSettingsParams {
  getDefaultQueryValues?: (filterValues: Record<string, any>) => Record<string, any>;
  executeQuery: () => void;
}
export type RenderCommonSettings = ({ getDefaultQueryValues, executeQuery }: RenderCommonSettingsParams) => React.ReactNode;

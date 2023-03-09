export interface AttributeType {
  string: string;
}
export interface SearchTraceIDType {
  traceID: string;
  data_source_id: number;
}
export interface SearchTraceType {
  data_source_id: number;
  service: string;
  operation: string;
  start_time_min: number;
  start_time_max: number;
  attributes?: AttributeType;
  duration_max?: string;
  duration_min?: string;
  num_traces?: number;
}

export interface Span {
  depth: number;
  children: Span[];
  ancestorIds: string[];
  hasChildren: boolean;
  traceID: string;
  span_id: string;
  name: string;
  kind: string;
  parentSpan: string;
  start_time_unix_nano: INanoSecond;
  end_time_unix_nano: INanoSecond;
  attributes: AttributeType;
  processID: string;
  resource: AttributeType;
  scope_id: string;
  serviceName: string;
  events?: { time_unix_nano: INanoSecond; attributes: AttributeType; name?: string }[];
  status?: { code?: number; message?: string };
  relativeStartTime: INanoSecond;

  spanID: string;
  references: SpanReference[];
  startTime: INanoSecond;
  operationName: string;
  process: TraceProcess;
}

export type TraceProcess = {
  serviceName: string;
  tags: TraceKeyValuePair[];
};

export type TraceKeyValuePair = {
  key: string;
  type?: string;
  value: any;
};

export type SpanReference = {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM';
  // eslint-disable-next-line no-use-before-define
  span: Span | null | undefined;
  spanID: string;
  traceID: string;
};

export interface Resource {
  string: { serviceName: string; tags: AttributeType };
}

interface Scope {
  string: {
    name: string;
    version: string;
  };
}
export type INanoSecond = number;
export interface TraceType {
  startTime: INanoSecond;
  duration: INanoSecond;
  spans: Span[];
  traceID: string;
  processes: Resource;
  scopes?: Scope;
  spansLengh?: number;
}

export enum TraceSortItem {
  'MOST_RECENT' = '最新优先',
  'LONGEST_FIRST' = '时长优先',
  'SHORTEST_FIRST' = '时短优先',
  'MOST_SPANS' = 'span多优先',
  'LEAST_SPANS' = 'span少优先',
}

export type TNil = null | undefined;

export type KeyValuePair = {
  key: string;
  value: any;
};

export type Link = {
  url: string;
  text: string;
};

export type Log = {
  timestamp: number;
  fields: Array<KeyValuePair>;
};

export enum RelationType {
  Prom = '指标详情',
  Log = '数据详情',
  Tracing = 'tracing',
  Event = '事件墙',
  Infra = '组件',
  System = '系统',
  Dashboard = '仪表盘',
  SLS = '阿里云SLS',
}

export type TraceData = {
  processes: Record<string, TraceProcess>;
  traceID: string;
  warnings?: string[] | null;
};

export type TraceResponse = TraceData & {
  spans: TraceSpanData[];
};

export type TraceSpanData = {
  spanID: string;
  traceID: string;
  processID: string;
  operationName: string;
  // Times are in microseconds
  startTime: number;
  duration: number;
  logs: TraceLog[];
  tags?: TraceKeyValuePair[];
  references?: TraceSpanReference[];
  warnings?: string[] | null;
  stackTraces?: string[];
  flags: number;
  errorIconColor?: string;
  dataFrameRowIndex?: number;
};

export type TraceLog = {
  timestamp: number;
  fields: TraceKeyValuePair[];
};

export type TraceSpanReference = {
  refType: 'CHILD_OF' | 'FOLLOWS_FROM';
  // eslint-disable-next-line no-use-before-define
  span?: TraceSpan | null | undefined;
  spanID: string;
  traceID: string;
  tags?: TraceKeyValuePair[];
};

export type TraceSpan = TraceSpanData & {
  depth: number;
  hasChildren: boolean;
  childSpanCount: number;
  process: TraceProcess;
  relativeStartTime: number;
  tags: NonNullable<TraceSpanData['tags']>;
  references: NonNullable<TraceSpanData['references']>;
  warnings: NonNullable<TraceSpanData['warnings']>;
  subsidiarilyReferencedBy: TraceSpanReference[];
};

export type Trace = TraceData & {
  duration: number;
  endTime: number;
  spans: TraceSpan[];
  startTime: number;
  traceName: string;
  services: Array<{ name: string; numberOfSpans: number }>;
  spansLengh?: number;
};

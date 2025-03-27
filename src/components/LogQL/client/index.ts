export type { Client, Config, CacheConfig } from './aliyun-sls';

export type FetchFn = (input: RequestInfo, init?: RequestInit) => Promise<Response>;

import { FetchFn } from '.';
import LRUCache from 'lru-cache';

const fieldsApi = '/tls-fields';

export interface MetricMetadata {
  type: string;
  help: string;
}

export interface Client {
  indexNames(): Promise<string[]>;
}

export interface CacheConfig {
  maxAge?: number;
  initialMetricList?: string[];
}

export interface Config {
  url: string;
  httpErrorHandler?: (error: any) => void;
  fetchFn?: FetchFn;
  cache?: CacheConfig;
  httpMethod?: 'POST' | 'GET';
}

export class HTTPClient implements Client {
  private readonly url: string;
  private readonly errorHandler?: (error: any) => void;
  private readonly fetchFn: FetchFn = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    return fetch(input, init);
  };

  constructor(config: Config) {
    this.url = config.url;
    this.errorHandler = config.httpErrorHandler;
    if (config.fetchFn) {
      this.fetchFn = config.fetchFn;
    }
  }

  indexNames(): Promise<string[]> {
    return this.fetchAPI<string[]>(fieldsApi).catch((error) => {
      if (this.errorHandler) {
        this.errorHandler(error);
      }
      return [];
    });
  }

  private fetchAPI<T>(resource: string, init?: RequestInit): Promise<T> {
    return this.fetchFn(this.url + resource, init) as any;
  }
}

class Cache {
  private readonly completeAssociation: LRUCache<string, Map<string, Set<string>>>;
  private indexNames: string[];

  constructor(config?: CacheConfig) {
    const maxAge = config && config.maxAge ? config.maxAge : 5 * 60 * 1000;
    this.completeAssociation = new LRUCache<string, Map<string, Set<string>>>(maxAge);
    this.indexNames = [];
  }

  setIndexNames(indexNames: string[]): void {
    this.indexNames = indexNames;
  }

  getIndexNames(): string[] {
    return this.indexNames;
  }
}

export class CachedClient implements Client {
  private readonly cache: Cache;
  private readonly client: Client;

  constructor(client: Client, config?: CacheConfig) {
    this.client = client;
    this.cache = new Cache(config);
  }

  indexNames(): Promise<string[]> {
    const cachedLabel = this.cache.getIndexNames();
    if (cachedLabel && cachedLabel.length > 0) {
      return Promise.resolve(cachedLabel);
    }

    return this.client.indexNames().then((labelNames) => {
      this.cache.setIndexNames(labelNames);
      return labelNames;
    });
  }
}

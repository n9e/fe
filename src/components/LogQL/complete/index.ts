import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { HybridComplete } from './hybrid';
import { Config } from '../client';
import { HTTPClient as AliyunSLSHTTPClient, CachedClient as AliyunSLSCachedClient } from '../client/aliyun-sls';
import { HTTPClient as TencentCLSHTTPClient, CachedClient as TencentCLSCachedClient } from '../client/tencent-cls';
import { HTTPClient as VolcTLSHTTPClient, CachedClient as VolcTLSCachedClient } from '../client/volc-tls';
import { HTTPClient as HuaweiLTSHTTPClient, CachedClient as HuaweiLTSCachedClient } from '../client/huawei-lts';

export interface CompleteStrategy {
  logQL(context: CompletionContext): Promise<CompletionResult | null> | CompletionResult | null;
}

export interface CompleteConfiguration {
  clientCate: string;
  historicalRecords: [string, number][];
  remote?: Config;
  maxMetricsMetadata?: number;
  completeStrategy?: CompleteStrategy;
}

export function newCompleteStrategy(conf?: CompleteConfiguration): CompleteStrategy {
  if (conf?.completeStrategy) {
    return conf.completeStrategy;
  }
  if (conf?.remote) {
    let client;
    let cacheClient;
    if (conf.clientCate === 'aliyun-sls') {
      client = new AliyunSLSHTTPClient(conf.remote);
      cacheClient = new AliyunSLSCachedClient(client, conf.remote.cache);
    } else if (conf.clientCate === 'tencent-cls') {
      client = new TencentCLSHTTPClient(conf.remote);
      cacheClient = new TencentCLSCachedClient(client, conf.remote.cache);
    } else if (conf.clientCate === 'volc-tls') {
      client = new VolcTLSHTTPClient(conf.remote);
      cacheClient = new VolcTLSCachedClient(client, conf.remote.cache);
    } else if (conf.clientCate === 'huawei-lts') {
      client = new HuaweiLTSHTTPClient(conf.remote);
      cacheClient = new HuaweiLTSCachedClient(client, conf.remote.cache);
    }
    if (client) {
      return new HybridComplete(cacheClient, conf.historicalRecords);
    }
  }
  return new HybridComplete(undefined, conf?.historicalRecords);
}

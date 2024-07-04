import { CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { HybridComplete } from './hybrid';
import { Config } from '../client';
import { HTTPClient as ESHTTPClient, CachedClient as ESCachedClient } from '../client/elasticsearch';

export interface CompleteStrategy {
  KQL(context: CompletionContext): Promise<CompletionResult | null> | CompletionResult | null;
}

export interface CompleteConfiguration {
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
    client = new ESHTTPClient(conf.remote);
    cacheClient = new ESCachedClient(client, conf.remote.cache);
    return new HybridComplete(cacheClient, conf.historicalRecords);
  }
  return new HybridComplete();
}

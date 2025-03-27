import _ from 'lodash';
import i18next from 'i18next';
import { SyntaxNode } from 'lezer-tree';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { SQLDialect } from '@codemirror/lang-sql';
import { Client } from '../client';
import { CompleteStrategy } from '.';

export interface Context {
  kind: string;
  metricName?: string;
  labelName?: string;
}

const KEYWORDS = [
  'select',
  'as',
  'group by',
  'order by',
  'from',
  'where',
  'and',
  'or',
  'not',
  'in',
  'between',
  'contains',
  'array',
  'limit',
  'offset',
  'union',
  'intersect',
  'except',
  'asc',
  'desc',
  'having',
];
const dialect = SQLDialect.define({
  keywords: KEYWORDS.join(' '),
});
const keywords = (dialect as any).dialect.words;
const Keyword = 20;
const Type = 21;

function arrayToCompletionResult(data: Completion[], from: number, to: number, historicalRecords?: [string, number][]): CompletionResult {
  const sqlCompletions = Object.keys(keywords).map((keyword) => ({
    label: keyword.toUpperCase(),
    type: keywords[keyword] == Type ? 'type' : keywords[keyword] == Keyword ? 'keyword' : 'variable',
    boost: -99,
    detail: _.includes(['and', 'not', 'or', 'in'], keyword) ? i18next.t('logql:logicalOperators') : i18next.t('logql:sqlkeywords'),
  }));
  let options = _.concat(data, sqlCompletions);
  if (historicalRecords && to === 0) {
    const snippets: Completion[] = _.map(historicalRecords, (item) => {
      const snippet = item[0];
      return {
        label: snippet,
        type: 'snippet',
        detail: i18next.t('logql:historicalRecords'),
        apply: snippet,
        boost: 99,
        section: {
          name: i18next.t('logql:historicalRecords'),
          header: i18next.t('logql:historicalRecords'),
          rank: 0,
        },
      };
    });
    options = _.concat(snippets, options);
  }
  return {
    from: from,
    to: to,
    options: options,
    span: /^[a-zA-Z0-9_:]+$/,
  } as CompletionResult;
}

export function analyzeCompletion(node: SyntaxNode): Context[] {
  const result: Context[] = [];
  switch (node.type.id) {
    case 18:
      result.push({ kind: 'indexName' });
      break;
    case 23:
      result.push({ kind: 'indexName' });
      break;
  }
  return result;
}

export class HybridComplete implements CompleteStrategy {
  private readonly client: Client | undefined;
  private readonly historicalRecords: [string, number][] | undefined;

  constructor(client?: Client, historicalRecords?: [string, number][]) {
    this.client = client;
    this.historicalRecords = historicalRecords;
  }

  getClient(): Client | undefined {
    return this.client;
  }

  logQL(context: CompletionContext): Promise<CompletionResult | null> | CompletionResult | null {
    const { state, pos } = context;
    const tree = syntaxTree(state).resolve(pos, -1) as any;
    const contexts = analyzeCompletion(tree);
    let asyncResult: Promise<Completion[]> = Promise.resolve([]);
    for (const context of contexts) {
      switch (context.kind) {
        case 'indexName':
          asyncResult = asyncResult.then((result) => {
            if (this.client) {
              return this.autocompleteIndexName(result);
            }
            return result;
          });
          break;
      }
    }
    return asyncResult.then((result) => {
      return arrayToCompletionResult(result, tree.from, pos, this.historicalRecords);
    });
  }

  private autocompleteIndexName(result: Completion[]): Completion[] | Promise<Completion[]> {
    if (!this.client) {
      return result;
    }
    return this.client.indexNames().then((labelNames: string[]) => {
      return result.concat(labelNames.map((value) => ({ label: value, type: 'constant', detail: i18next.t('logql:fieldName'), boost: 0 })));
    });
  }
}

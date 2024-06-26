import _ from 'lodash';
import i18next from 'i18next';
import { SyntaxNode } from 'lezer-tree';
import { Completion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import { syntaxTree } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { Client } from '../client';
import { CompleteStrategy } from '.';
import { KQL, Expr, VectorSelector, FieldName, MatchOperator, Colon, Gtr, Gte, Lss, Lte, FieldValue, StringLiteral, And, Or } from '../grammar/parser';

export enum ContextKind {
  FieldName = 'fieldName',
  MatchOperator = 'matchOperator',
  FieldValue = 'fieldValue',
  BinaryOperator = 'binaryOperator',
}

export interface Context {
  kind: ContextKind;
  fieldName?: string;
  quoted?: boolean;
}

function arrayToCompletionResult(data: Completion[], from: number, to: number, historicalRecords): CompletionResult {
  let options = data;
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

function computeStartCompleteLabelPositionInLabelMatcherOrInGroupingLabel(node: SyntaxNode, pos: number): number {
  let start = node.from + 1;
  if (node.firstChild !== null) {
    start = pos;
  }
  return start;
}

export function computeStartCompletePosition(node: SyntaxNode, pos: number): number {
  let start = node.from;
  if (node.type.id === KQL || (node.type.id === 0 && (node.prevSibling?.type.id === And || node.prevSibling?.type.id === Or))) {
    start = computeStartCompleteLabelPositionInLabelMatcherOrInGroupingLabel(node, pos);
  } else if (
    node.type.id === FieldValue ||
    (node.type.id === StringLiteral && node.parent?.type.id === FieldValue) ||
    (node.type.id === 0 && node.prevSibling?.type.id === Expr) ||
    node.type.id === Colon
  ) {
    start++;
  }
  return start;
}

export function analyzeCompletion(state: EditorState, node: SyntaxNode): Context[] {
  const result: Context[] = [];
  switch (node.type.id) {
    case 0:
      if (node.prevSibling) {
        const prevSibling = node.prevSibling;
        if (prevSibling.type.id === VectorSelector) {
          result.push({ kind: ContextKind.BinaryOperator });
          break;
        } else if (prevSibling.type.id === Expr) {
          result.push({ kind: ContextKind.BinaryOperator });
          break;
        } else if (prevSibling.type.id === And || prevSibling.type.id === Or) {
          result.push({ kind: ContextKind.FieldName });
          break;
        }
      }
      break;
    case KQL:
      if (node.firstChild) {
        const firstChild = node.firstChild;
        if ((firstChild && firstChild.type.id === 0) || !firstChild) {
          result.push({ kind: ContextKind.FieldName });
          break;
        }
      }
      break;
    case FieldName:
      if (node.parent) {
        const parent = node.parent;
        if (parent && parent.type.id === VectorSelector) {
          result.push({ kind: ContextKind.FieldName });
          break;
        }
      }
    case Colon:
      if (node.parent) {
        const parent = node.parent;
        if (parent && parent.type.id === MatchOperator) {
          const prevSibling = parent.prevSibling;
          if (prevSibling && prevSibling.type.id === FieldName) {
            result.push({ kind: ContextKind.FieldValue, fieldName: state.sliceDoc(prevSibling.from, prevSibling.to), quoted: true });
          }
        }
      }
      break;
    case StringLiteral:
      if (node.parent) {
        const parent = node.parent;
        if (parent.type.id === FieldValue) {
          let prevSibling01 = parent.prevSibling;
          if (prevSibling01 && prevSibling01.type.id === 0) {
            prevSibling01 = prevSibling01.prevSibling;
          }
          if (prevSibling01 && prevSibling01.type.id === MatchOperator) {
            const firstChild = prevSibling01.firstChild;
            const prevSibling02 = prevSibling01.prevSibling;
            if (firstChild && firstChild.type.id === Colon && prevSibling02 && prevSibling02.type.id === FieldName) {
              result.push({ kind: ContextKind.FieldValue, fieldName: state.sliceDoc(prevSibling02.from, prevSibling02.to) });
            }
          }
        }
      }
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

  KQL(context: CompletionContext): Promise<CompletionResult | null> | CompletionResult | null {
    const { state, pos } = context;
    const tree = syntaxTree(state).resolve(pos, -1) as any;
    const contexts = analyzeCompletion(state, tree);
    let asyncResult: Promise<Completion[]> = Promise.resolve([]);
    for (const context of contexts) {
      switch (context.kind) {
        case ContextKind.FieldName:
          asyncResult = asyncResult.then((result) => {
            return this.autocompleteFieldName(result);
          });
          break;
        case ContextKind.FieldValue:
          asyncResult = asyncResult.then((result) => {
            if (context.fieldName) {
              return this.autocompleteFieldValue(result, context.fieldName, context.quoted);
            }
            return result;
          });
          break;
        case ContextKind.BinaryOperator:
          asyncResult = asyncResult.then((result) => {
            return _.concat(result, [
              { label: 'AND', type: 'keyword', detail: i18next.t('kql:combiningKeyword'), boost: 0 },
              { label: 'OR', type: 'keyword', detail: i18next.t('kql:combiningKeyword'), boost: 0 },
            ]);
          });
          break;
      }
    }
    return asyncResult.then((result) => {
      return arrayToCompletionResult(result, computeStartCompletePosition(tree, pos), pos, this.historicalRecords);
    });
  }

  private autocompleteFieldName(result: Completion[]): Completion[] | Promise<Completion[]> {
    if (!this.client) {
      return result;
    }
    return this.client.fields().then((fields: string[]) => {
      return _.concat(
        result,
        _.map(fields, (value) => ({ label: value, type: 'constant', detail: i18next.t('kql:fieldName'), boost: 0 })),
      );
    });
  }

  private autocompleteFieldValue(result: Completion[], field: string, quoted?: boolean): Completion[] | Promise<Completion[]> {
    if (!this.client) {
      return result;
    }
    return this.client.fieldValues(field).then((fieldValues: string[]) => {
      if (quoted) {
        fieldValues = _.map(fieldValues, (value) => `"${value}"`);
      }
      return _.concat(
        result,
        _.map(fieldValues, (value) => ({ label: value, type: 'constant', detail: i18next.t('kql:fieldValue'), boost: 0 })),
      );
    });
  }
}

import { Transformation, QueryResult } from '../types';

export default class FilterByRefIdTransformation implements Transformation {
  name = 'Filter Data by Query refId';
  constructor(private refId: string) {}

  apply(input: QueryResult[]): QueryResult[] {
    return input.filter((result) => result.refId === this.refId);
  }
}

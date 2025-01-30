import { DataPoint, TimeSeries, TableData, Transformation } from './types';
export type { DataPoint, TimeSeries, TableData, Transformation };

// 过滤转换
export class FilterTransformation implements Transformation {
  name = 'Filter';
  constructor(private fieldName: string, private condition: (value: any) => boolean) {}

  apply(input: TableData): TableData {
    const filteredRows = input.rows.filter((row) => this.condition(row[this.fieldName]));
    return { ...input, rows: filteredRows };
  }
}

// 聚合转换
export class ReduceTransformation implements Transformation {
  name = 'Reduce';
  constructor(private fieldName: string, private operation: 'sum' | 'avg' | 'max' | 'min') {}

  apply(input: TableData): TableData {
    const values = input.rows.map((row) => row[this.fieldName]);
    let result: number;

    switch (this.operation) {
      case 'sum':
        result = values.reduce((a, b) => a + b, 0);
        break;
      case 'avg':
        result = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'max':
        result = Math.max(...values);
        break;
      case 'min':
        result = Math.min(...values);
        break;
      default:
        throw new Error('Unsupported operation');
    }

    return { columns: ['result'], rows: [{ result }] };
  }
}

// Filter Data by Name
export const filterByName = new FilterTransformation('name', (value) => value === 'Alice');

// 转换链
export class TransformationPipeline {
  private transformations: Transformation[] = [];

  addTransformation(transformation: Transformation) {
    this.transformations.push(transformation);
  }

  apply(input: TimeSeries[] | TableData): TimeSeries[] | TableData {
    let result = input;
    for (const transformation of this.transformations) {
      result = transformation.apply(result);
    }
    return result;
  }
}

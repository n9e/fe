import { DataPoint, TimeSeries, TableData, Transformation } from './types';
export type { DataPoint, TimeSeries, TableData, Transformation };

// 转换链
export class TransformationPipeline {
  private transformations: Transformation[] = [];

  addTransformation(transformation: Transformation) {
    this.transformations.push(transformation);
  }

  apply(input: TimeSeries[] | TableData): TimeSeries[] | TableData {
    let result = input;
    for (const transformation of this.transformations) {
      // @ts-ignore
      result = transformation.apply(result);
    }
    return result;
  }
}

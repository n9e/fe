import { DataPoint, TimeSeries, TableData, Transformation } from './types';
import MergeTransformation from './MergeTransformation';
import OrganizeFieldsTransformation from './OrganizeFieldsTransformation';
import JoinByFieldTransformation from './JoinByFieldTransformation';
import TimeSeriesTableTransformation from './TimeSeriesTableTransformation';
import GroupedAggregateTableTransformation from './GroupedAggregateTableTransformation';

export type { DataPoint, TimeSeries, TableData, Transformation };

// 转换链
export class TransformationPipeline {
  private transformations: Transformation[] = [];

  addTransformation(transformation: Transformation) {
    this.transformations.push(transformation);
  }

  apply<T>(input: T): T {
    let result = input;
    for (const transformation of this.transformations) {
      // @ts-ignore
      result = transformation.apply(result);
    }
    return result;
  }
}

export const transformationsMap = {
  merge: MergeTransformation,
  organize: OrganizeFieldsTransformation,
  joinByField: JoinByFieldTransformation,
  timeSeriesTable: TimeSeriesTableTransformation,
  groupedAggregateTable: GroupedAggregateTableTransformation,
};

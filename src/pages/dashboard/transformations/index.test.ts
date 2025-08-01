import { TransformationPipeline } from './index';
import { TableData } from './types';
import MergeTransformation from './MergeTransformation';
import OrganizeFieldsTransformation from './OrganizeFieldsTransformation';

describe('TransformationPipeline', () => {
  let pipeline: TransformationPipeline;

  beforeEach(() => {
    pipeline = new TransformationPipeline();
  });

  it('should apply transformations in order', () => {
    const input: TableData[] = [
      {
        refId: 'A',
        columns: ['time', 'value'],
        rows: [
          { time: 1633072800000, value: 10 },
          { time: 1633076400000, value: 20 },
        ],
      },
      {
        refId: 'B',
        columns: ['time', 'value'],
        rows: [
          { time: 1633080000000, value: 30 },
          { time: 1633083600000, value: 40 },
        ],
      },
    ];

    const mergeTransformation = new MergeTransformation();
    pipeline.addTransformation(mergeTransformation);

    const organizeFieldsTransformation = new OrganizeFieldsTransformation({
      fields: ['time'],
      renameByName: { time: 'timestamp' },
    });
    pipeline.addTransformation(organizeFieldsTransformation);

    const result = pipeline.apply(input);

    expect(result.length).toBe(1);
    expect(result[0].rows).toEqual([{ timestamp: 1633072800000 }, { timestamp: 1633076400000 }, { timestamp: 1633080000000 }, { timestamp: 1633083600000 }]);
  });
});

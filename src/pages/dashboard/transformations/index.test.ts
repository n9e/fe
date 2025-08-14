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
        fields: [
          {
            name: 'time',
            type: 'time',
            values: [1633072800000, 1633076400000],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [10, 20],
            state: {},
          },
        ],
      },
      {
        refId: 'B',
        fields: [
          {
            name: 'time',
            type: 'time',
            values: [1633080000000, 1633083600000],
            state: {},
          },
          {
            name: 'value',
            type: 'number',
            values: [30, 40],
            state: {},
          },
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
    expect(result[0].fields.length).toBe(1);
    expect(result[0].fields[0].name).toBe('timestamp');
    expect(result[0].fields[0].values).toEqual([1633072800000, 1633076400000, 1633080000000, 1633083600000]);
  });
});

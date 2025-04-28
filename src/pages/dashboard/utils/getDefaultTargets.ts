import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';

// @ts-ignore
import getProDefaultTargets from 'plus:/parcels/Dashboard/getDefaultTargets';

const getDefaultTargets = (datasourceCate: DatasourceCateEnum) => {
  if (_.includes(['elasticsearch', 'opensearch'], datasourceCate)) {
    return [
      {
        refId: 'A',
        query: {
          index: '',
          filters: '',
          values: [
            {
              func: 'count',
            },
          ],
          date_field: '@timestamp',
        },
      },
    ];
  } else if (datasourceCate === DatasourceCateEnum.zabbix) {
    return [
      {
        refId: 'A',
        query: {
          mode: 'timeseries',
          subMode: 'metrics',
        },
      },
    ];
  }
  const result = getProDefaultTargets(datasourceCate);
  if (result) {
    return result;
  }
  return [
    {
      refId: 'A',
    },
  ];
};

export default getDefaultTargets;

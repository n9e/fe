import _ from 'lodash';
import moment from 'moment';

import { DatasourceCateEnum } from '@/utils/constant';
import { isMathString } from '@/components/TimeRangePicker';

export default function getFormValuesBySearchParams(params: { [index: string]: string | null }) {
  const data_source_name = _.get(params, 'data_source_name');
  const data_source_id = _.get(params, 'data_source_id');
  const query = _.get(params, 'query') || undefined;

  if (data_source_name && data_source_id) {
    const formValues: {
      datasourceCate: string;
      datasourceValue: number;
    } = {
      datasourceCate: data_source_name,
      datasourceValue: _.toNumber(data_source_id),
    };
    const range_start = _.get(params, 'start');
    const range_end = _.get(params, 'end');
    const range =
      range_start && range_end
        ? { start: !isMathString(range_start) ? moment(Number(range_start)) : range_start, end: !isMathString(range_end) ? moment(Number(range_end)) : range_end }
        : undefined;

    if (data_source_name === DatasourceCateEnum.doris) {
      const mode = _.get(params, 'mode');
      const submode = _.get(params, 'submode');
      const database = _.get(params, 'database');
      const table = _.get(params, 'table');
      const time_field = _.get(params, 'time_field');

      return {
        ...formValues,
        query: {
          mode,
          submode,
          database,
          table,
          time_field,
          query,
          range,
        },
      };
    }
  }
  return undefined;
}

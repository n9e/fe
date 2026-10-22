import { FormInstance } from 'antd/es/form';
import moment from 'moment';

import { parseRange } from '@/components/TimeRangePicker';

import { IndexTimeRange } from '../../services';

/**
 * 取当前检索时间范围（毫秒），用于 index 字段接口。后端据此把 DESC 裁到覆盖该范围的分区，
 * 不传则 DESC 整张表，大表上要几十秒。字段集随时间范围变化，所以时间范围变了要重新取。
 */
export default function getIndexTimeRange(form: FormInstance): IndexTimeRange {
  const range = form.getFieldValue(['query', 'range']);
  if (!range) {
    return {};
  }
  const parsedRange = parseRange(range);
  return {
    from: moment(parsedRange.start).valueOf(),
    to: moment(parsedRange.end).valueOf(),
  };
}

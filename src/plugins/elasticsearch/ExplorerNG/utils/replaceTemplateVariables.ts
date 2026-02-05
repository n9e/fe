import _ from 'lodash';

import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IVariable } from '@/pages/dashboard/Variables/types';
import adjustData from '@/pages/dashboard/Variables/utils/ajustData';
import { formatString } from '@/pages/dashboard/Variables/utils/formatString';
import { getBuiltInVariables } from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

export default function replaceTemplateVariables(str: string, range: IRawTimeRange, panelWidth?: number) {
  const extVariables: IVariable[] = getBuiltInVariables(range, {
    range,
    stepParams: {
      panelWidth,
    },
  });
  const data = adjustData(extVariables, {
    datasourceList: [],
  });
  const result = formatString(str, data);
  return result;
}

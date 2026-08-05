import _ from 'lodash';
import { defaultThreshold } from './config';
import { IPanel } from '../types';

export const normalizeInitialValues = (values: IPanel): IPanel => {
  const normalizedValues = _.cloneDeep(values);
  const thresholdsSteps = _.cloneDeep(normalizedValues.options?.thresholds?.steps) || [];
  if (thresholdsSteps.length === 0) {
    thresholdsSteps.push(defaultThreshold);
  } else if (thresholdsSteps.length === 1 && thresholdsSteps[0].type !== 'base') {
    thresholdsSteps.unshift(defaultThreshold);
  }

  if (normalizedValues.type === 'stat') {
    if (!normalizedValues.custom?.graphMode) {
      normalizedValues.custom.graphMode = 'none';
    }
  }

  return {
    ...normalizedValues,
    options: {
      ...normalizedValues.options,
      thresholds: {
        ...(normalizedValues.options?.thresholds || {}),
        steps: thresholdsSteps,
      },
    },
  };
};

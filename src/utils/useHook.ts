import React from 'react';
import { createGlobalState } from 'react-use';

type IGlobalVarType = {
  RangePickerHour?: string;
};
export const useGlobalVar = createGlobalState<IGlobalVarType>({});

export const useParamsAiAction = createGlobalState<any>();

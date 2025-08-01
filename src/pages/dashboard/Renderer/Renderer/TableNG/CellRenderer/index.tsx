import React from 'react';
import { ValueFormatterParams } from 'ag-grid-community';
import _ from 'lodash';

import { IOptions, IOverride, CellOptions } from '@/pages/dashboard/types';
import getOverridePropertiesByName from '@/pages/dashboard/Renderer/utils/getOverridePropertiesByName';

import { TextObject } from './types';
import Normal from './Normal';
import ColorText from './ColorText';
import ColorBackground from './ColorBackground';
import Gauge from './Gauge';

interface Props {
  formattedData: { [key: string]: TextObject }[];
  formattedValue: TextObject;
  field: string;
  params: ValueFormatterParams<string | number>;
  panelParams: {
    cellOptions: CellOptions;
    options: IOptions;
    overrides: IOverride[];
  };
}

export default function index(props: Props) {
  const { formattedData, formattedValue, field, params, panelParams } = props;
  const { cellOptions, options, overrides } = panelParams;
  const overrideProps = getOverridePropertiesByName(overrides, 'byName', field);
  const currentCellOptions = _.isEmpty(overrideProps) || !overrideProps.cellOptions?.type ? cellOptions : overrideProps.cellOptions;
  const currentOptions = _.isEmpty(overrideProps)
    ? options
    : {
        standardOptions: overrideProps.standardOptions || options.standardOptions,
        valueMappings: overrideProps.valueMappings || options.valueMappings,
        thresholds: overrideProps.thresholds || options.thresholds,
      };

  if (currentCellOptions.type === 'gauge') {
    return (
      <Gauge formattedData={formattedData} field={field} valueDomain={formattedValue.valueDomain} data={formattedValue} cellOptions={currentCellOptions} options={currentOptions} />
    );
  } else if (currentCellOptions.type === 'color-text') {
    return <ColorText data={formattedValue} />;
  } else if (currentCellOptions.type === 'color-background') {
    return <ColorBackground data={formattedValue} />;
  }
  return <Normal data={formattedValue} />;
}

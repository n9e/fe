import React from 'react';

import DataLinks from '@/pages/dashboard/Editor/Fields/DataLinks';
import StandardOptions from '@/pages/dashboard/Editor/Fields/StandardOptions';
import ValueMappings from '@/pages/dashboard/Editor/Fields/ValueMappings';
import Overrides from '@/pages/dashboard/Editor/Fields/Overrides';
import Thresholds from '@/pages/dashboard/Editor/Fields/Thresholds';

import GraphStyles from './GraphStyles';

export default function Table({ targets, chartForm, variableConfigWithOptions }) {
  return (
    <>
      <GraphStyles chartForm={chartForm} variableConfigWithOptions={variableConfigWithOptions} />
      {/* <DataLinks /> */}
      <Thresholds showMode />
      <ValueMappings />
      <StandardOptions />
      <Overrides targets={targets} overrideOptions={['custom.cellOptions', 'thresholds', 'thresholds_showMode']} />
    </>
  );
}

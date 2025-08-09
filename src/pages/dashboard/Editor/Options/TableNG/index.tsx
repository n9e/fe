import React from 'react';
import { Form } from 'antd';

import DataLinks from '@/pages/dashboard/Editor/Fields/DataLinks';
import StandardOptions from '@/pages/dashboard/Editor/Fields/StandardOptions';
import ValueMappings from '@/pages/dashboard/Editor/Fields/ValueMappings';
import Overrides from '@/pages/dashboard/Editor/Fields/Overrides';
import Thresholds from '@/pages/dashboard/Editor/Fields/Thresholds';

import GraphStyles from './GraphStyles';

export default function Table({ targets, chartForm, variableConfigWithOptions }) {
  const cellOptionsType = Form.useWatch(['custom', 'cellOptions', 'type']);

  return (
    <>
      <GraphStyles chartForm={chartForm} variableConfigWithOptions={variableConfigWithOptions} />
      <DataLinks />
      {cellOptionsType !== 'none' && <Thresholds showMode />}
      <ValueMappings isActive={false} />
      <StandardOptions isActive={false} />
      <Overrides targets={targets} matcherNames={['byName']} defaultMatcherId='byName' overrideOptions={['custom.cellOptions', 'thresholds', 'thresholds_showMode']} />
    </>
  );
}

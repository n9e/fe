import React from 'react';

import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { IPanel, IIframeStyles } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

interface IProps {
  values: IPanel;
  series: CalculatedSeries[];
  themeMode?: 'dark';
}

export default function index(props: IProps) {
  const { values } = props;
  const { custom } = values;
  const { src } = custom as unknown as IIframeStyles;
  const content = replaceTemplateVariables(src);

  return (
    <iframe
      src={content}
      width='100%'
      height='100%'
      style={{
        border: 'none',
      }}
    />
  );
}

import React from 'react';
import _ from 'lodash';
import { IPanel } from '../../types';

interface Props {
  values: IPanel;
}

export default function PanelEmpty(props: Props) {
  const { values } = props;
  const valueMappings = _.get(values, 'options.valueMappings');
  const finded = _.find(valueMappings, (item) => {
    return item.type === 'specialValue' && item.match?.specialValue === 'null';
  });

  if (finded) {
    return (
      <div
        className='renderer-body-content-empty'
        style={{
          color: finded.result?.color,
        }}
      >
        {finded.result?.text}
      </div>
    );
  }

  return <div className='renderer-body-content-empty'>No Data</div>;
}

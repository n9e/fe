import React, { useEffect } from 'react';

import FieldsList, { Field } from '@/pages/logExplorer/components/FieldsList';

interface Props {
  onFieldsChange: (fields: Field[]) => void;
}

export default function SideBarNav(props: Props) {
  const { onFieldsChange } = props;

  useEffect(() => {
    onFieldsChange([]);
  }, [onFieldsChange]);

  return (
    <div className='h-full flex flex-col flex-shrink-0'>
      <FieldsList
        loading={false}
        organizeFieldNames={[]}
        fields={[]}
        enableStats={false}
        onOperClick={() => {}}
        onValueFilter={undefined}
        fetchStats={undefined}
      />
    </div>
  );
}

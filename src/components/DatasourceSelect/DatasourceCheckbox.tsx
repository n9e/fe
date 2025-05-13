import React, { useContext } from 'react';
import { Checkbox } from 'antd';
import { CommonStateContext } from '@/App';
import { allCates } from '@/components/AdvancedWrap/utils';

interface Props {
  value?: number[];
  onChange: (val?: number[]) => void;
}

const DatasourceCheckbox: React.FC<Props> = ({ value, onChange }) => {
  const { groupedDatasourceList } = useContext(CommonStateContext);
  return (
    <div>
      {Object.entries(groupedDatasourceList).map(([type, list]) => (
        <div key={type}>
          <Checkbox.Group value={value} onChange={(checkedValue) => onChange(checkedValue.map(Number))}>
            {list.map((ds) => (
              <div key={ds.id}>
                <Checkbox className='py-1 flex items-center overflow-hidden text-ellipsis whitespace-nowrap' value={ds.id}>
                  {(() => {
                    const cate = allCates.find((c) => c.value === type);
                    return cate?.logo ? <img className='w-[14px] h-[14px]  mr-2' src={cate.logo} alt={cate.label} /> : null;
                  })()}
                  {ds.name}
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        </div>
      ))}
    </div>
  );
};

export default DatasourceCheckbox;

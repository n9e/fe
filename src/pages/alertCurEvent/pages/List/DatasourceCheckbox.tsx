import React, { useState, useMemo, useContext } from 'react';
import { Checkbox, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { allCates } from '@/components/AdvancedWrap/utils';

import { NS } from '../../constants';

interface Props {
  value?: number[];
  onChange: (val?: number[]) => void;
}

const DatasourceCheckbox: React.FC<Props> = ({ value = [], onChange }) => {
  const { t } = useTranslation(NS);
  const { datasourceList } = useContext(CommonStateContext);
  const [search, setSearch] = useState('');

  const filteredDatasource = useMemo(() => {
    return _.sortBy(
      _.filter(datasourceList, (ds) => ds.name.toLowerCase().includes(search.toLowerCase())),
      ['plugin_type', 'name'],
    );
  }, [datasourceList, search]);

  const filteredIds = filteredDatasource.map((ds) => ds.id);
  const allChecked = filteredIds.length > 0 && filteredIds.every((id) => value.includes(id));
  const indeterminate = filteredIds.some((id) => value.includes(id)) && !allChecked;

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      onChange(Array.from(new Set([...value, ...filteredIds])));
    } else {
      onChange(value.filter((id) => !filteredIds.includes(id)));
    }
  };

  return (
    <div className='h-full min-h-0 flex flex-col'>
      <div className='my-1 flex-shrink-0 flex items-center'>
        <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={(e) => handleCheckAll(e.target.checked)} />
        <Input prefix={<SearchOutlined />} allowClear className='ml-2 px-2 py-[2px] flex-1' placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className='overflow-auto h-full min-h-0'>
        <Checkbox.Group value={value} onChange={(vals) => onChange(vals.map(Number))}>
          {filteredDatasource.map((ds) => {
            const cate = allCates.find((c) => c.value === ds.plugin_type);
            return (
              <div key={ds.id}>
                <Checkbox className='py-1 flex items-center overflow-hidden text-ellipsis whitespace-nowrap' value={ds.id}>
                  {cate?.logo && <img className='w-[14px] h-[14px] mr-2' src={cate.logo} alt={cate.label} />}
                  {ds.name}
                </Checkbox>
              </div>
            );
          })}
        </Checkbox.Group>
      </div>
    </div>
  );
};

export default DatasourceCheckbox;

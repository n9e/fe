import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@ant-design/icons';

import { allCates } from '@/components/AdvancedWrap/utils';
import { getAlertCurEventsDatasource } from './services';

interface Props {
  filter: any;
  value?: number[];
  onChange: (val?: number[]) => void;
}

interface Datasource {
  id: number;
  name: string;
  plugin_type: string;
}

const DatasourceCheckbox: React.FC<Props> = ({ filter, value = [], onChange }) => {
  const { t } = useTranslation('AlertCurEvents');
  const [search, setSearch] = useState('');
  const [datasourceList, setDatasourceList] = useState<Datasource[]>([]);

  const filteredDatasource = useMemo(() => datasourceList.filter((ds) => ds.name.toLowerCase().includes(search.toLowerCase())), [datasourceList, search]);

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

  const fetchDatasource = () => {
    const params = {
      my_groups: filter.my_groups,
      query: filter.query,
      cate: filter.cate,
      rid: filter.rule_id,
      severity: filter.severity,
      prods: filter.rule_prods,
    };
    return getAlertCurEventsDatasource(params).then((res) => {
      setDatasourceList(res.dat);
      return res.dat;
    });
  };

  useEffect(() => {
    fetchDatasource();
  }, [filter.my_groups, filter.query, filter.cate, filter.rule_id, filter.severity, filter.rule_prods]);

  return (
    <div>
      <div className='mt-1 flex items-center'>
        <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={(e) => handleCheckAll(e.target.checked)} />
        <Input prefix={<SearchOutlined />} className='ml-2 px-2 py-[2px] flex-1' placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
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
  );
};

export default DatasourceCheckbox;

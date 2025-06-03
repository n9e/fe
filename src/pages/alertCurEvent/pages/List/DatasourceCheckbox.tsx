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
      _.filter(datasourceList, (ds) => {
        const includesName = _.includes(_.lowerCase(ds.name), _.lowerCase(search));
        const cate = _.find(allCates, (c) => c.value === ds.plugin_type);
        if (cate) {
          return includesName && cate.alertRule; // 只显示支持告警规则的数据源
        }
        return false;
      }),
      ['plugin_type', 'name'],
    );
  }, [datasourceList, search]) as any[];

  const filteredIds = _.map(filteredDatasource, (ds) => ds.id);
  const allChecked = _.every(filteredIds, (id) => _.includes(value, id));
  const indeterminate = _.some(filteredIds, (id) => _.includes(value, id)) && !allChecked;

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      onChange(_.union(value, filteredIds));
    } else {
      onChange(_.filter(value, (id) => !_.includes(filteredIds, id)));
    }
  };

  return (
    <div className='h-full min-h-0 flex flex-col'>
      <div className='my-1 flex-shrink-0 flex items-center'>
        <Checkbox checked={allChecked} indeterminate={indeterminate} onChange={(e) => handleCheckAll(e.target.checked)} />
        <Input prefix={<SearchOutlined />} allowClear className='ml-2 px-2 py-[2px] flex-1' placeholder={t('search')} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className='overflow-auto h-full min-h-0'>
        <Checkbox.Group value={value} onChange={(vals) => onChange(_.map(vals, _.toNumber))}>
          {filteredDatasource.map((ds) => {
            const cate = _.find(allCates, (c) => c.value === ds.plugin_type);
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

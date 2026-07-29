import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input, Radio, Empty } from 'antd';
import { SearchOutlined, DatabaseOutlined, ClusterOutlined, GlobalOutlined, ApiOutlined, HddOutlined, AppstoreOutlined } from '@ant-design/icons';
import _ from 'lodash';

import { NS } from '../../../constants';
import { CATALOG, COLLECT_CATEGORIES, CollectCategory, CollectComponent } from './catalog';

const CATEGORY_ICONS: Record<CollectCategory, React.ReactNode> = {
  db: <DatabaseOutlined />,
  middleware: <ClusterOutlined />,
  web: <GlobalOutlined />,
  net: <ApiOutlined />,
  host: <HddOutlined />,
  other: <AppstoreOutlined />,
};

interface Props {
  /** ident(小写) -> logo url，来自集成中心组件列表；取不到的组件回退分类图标 */
  logoMap: Record<string, string>;
  onPick: (component: CollectComponent) => void;
}

export default function ComponentPicker(props: Props) {
  const { logoMap, onPick } = props;
  const { t } = useTranslation(NS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CollectCategory | 'all'>('all');

  const filtered = useMemo(() => {
    const keyword = _.trim(search).toLowerCase();
    return _.filter(CATALOG, (item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (!keyword) return true;
      const displayName = t(`collect.names.${item.name}`, { defaultValue: item.label });
      return _.some([item.name, item.label, displayName], (text) => text.toLowerCase().includes(keyword));
    });
  }, [search, category, t]);

  return (
    <div>
      <div className='flex items-center gap-3 mb-3'>
        <Input
          prefix={<SearchOutlined />}
          allowClear
          className='w-[240px]'
          placeholder={t('collect.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Radio.Group size='small' value={category} onChange={(e) => setCategory(e.target.value)}>
          <Radio.Button value='all'>{t('collect.categories.all')}</Radio.Button>
          {COLLECT_CATEGORIES.map((cate) => (
            <Radio.Button key={cate} value={cate}>
              {t(`collect.categories.${cate}`)}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>
      {filtered.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className='grid grid-cols-4 gap-2'>
          {filtered.map((item) => {
            const logo = item.builtinIdent ? logoMap[item.builtinIdent.toLowerCase()] : undefined;
            return (
              <div
                key={item.name}
                className='flex flex-col items-center gap-1 p-3 fc-border rounded-lg cursor-pointer hover:border-primary hover:shadow-sm transition-all'
                onClick={() => onPick(item)}
              >
                <div className='h-8 flex items-center text-[26px] opacity-80'>
                  {logo ? <img src={logo} className='max-h-8 max-w-[72px]' alt={item.label} /> : CATEGORY_ICONS[item.category]}
                </div>
                <div className='text-[13px] font-medium text-center leading-4'>{t(`collect.names.${item.name}`, { defaultValue: item.label })}</div>
                <div className='text-[12px] opacity-50 leading-3'>{item.name}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { Input, Empty, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { NS } from '../constants';
import { MCP_TEMPLATES, MCP_TEMPLATE_CATEGORIES, MCPTemplate } from '../templates';

interface Props {
  onSelect: (template: MCPTemplate) => void;
}

const ALL = 'all';
const PAGE_SIZE = 8;

export default function TemplateGallery(props: Props) {
  const { t } = useTranslation(NS);
  const { onSelect } = props;
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return MCP_TEMPLATES.filter((tpl) => {
      if (category !== ALL && tpl.category !== category) return false;
      if (!kw) return true;
      return tpl.name.toLowerCase().includes(kw) || tpl.description.toLowerCase().includes(kw);
    });
  }, [keyword, category]);

  // 搜索或切换分类后回到第一页
  useEffect(() => {
    setPage(1);
  }, [keyword, category]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = [ALL, ...MCP_TEMPLATE_CATEGORIES];

  return (
    <div className='flex flex-col gap-3'>
      <Input
        allowClear
        prefix={<SearchOutlined className='text-hint' />}
        placeholder={t('template.search_placeholder')}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      <div className='flex flex-wrap gap-2'>
        {categories.map((cat) => (
          <span
            key={cat}
            onClick={() => setCategory(cat)}
            className={`cursor-pointer select-none rounded-full px-3 py-1 text-sm transition-colors ${
              category === cat ? 'bg-primary text-white' : 'bg-fc-100 text-main hover:bg-fc-200'
            }`}
          >
            {t(`template.category.${cat}`)}
          </span>
        ))}
      </div>
      {filtered.length ? (
        <>
          <div className='grid grid-cols-2 gap-3'>
            {paged.map((tpl) => (
              <div
                key={tpl.key}
                onClick={() => onSelect(tpl)}
                className='flex cursor-pointer gap-3 rounded-md border border-fc-300 p-3 transition-all hover:border-primary hover:shadow-mf'
              >
                <div className='flex h-10 w-10 flex-none items-center justify-center overflow-hidden rounded-md bg-white text-xl'>
                  {tpl.logo ? <img src={tpl.logo} alt={tpl.name} className='h-6 w-6 object-contain' /> : tpl.icon}
                </div>
                <div className='min-w-0 flex-auto'>
                  <div className='truncate font-medium text-main'>{tpl.name}</div>
                  <div className='mt-0.5 line-clamp-2 text-hint'>{tpl.description}</div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length > PAGE_SIZE && (
            <div className='flex justify-end'>
              <Pagination size='small' current={page} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} showSizeChanger={false} />
            </div>
          )}
        </>
      ) : (
        <Empty className='py-8' description={t('template.empty')} />
      )}
    </div>
  );
}

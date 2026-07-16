/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React from 'react';
import classnames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Divider } from 'antd';

import { SectionItem, tagClassesMap, tagI18nKeys } from '../SectionCard';
import RuleSummary from './RuleSummary';

interface IProps {
  sections: SectionItem[];
  activeSection: string;
  onSectionClick: (key: string) => void;
  datasourceList: { id: number; name: string }[];
}

export default function Sidebar(props: IProps) {
  const { sections, activeSection, onSectionClick, datasourceList } = props;
  const { t } = useTranslation('alertRules');

  return (
    <aside className='w-[260px] bg-fc-100 flex-none h-full p-4 pl-3 border-l border-[var(--fc-border-color)] flex flex-col overflow-hidden'>
      <div>
        <div className='font-bold text-soft/80 mb-2'>{t('step_title')}</div>
        <div className='flex flex-col gap-1.5'>
          {sections.map((item, index) => (
            <button
              key={item.key}
              type='button'
              className={
                'flex items-center w-full min-h-7 px-2 py-0 rounded-lg bg-transparent text-left cursor-pointer focus:outline-none border-0 ' +
                (activeSection === item.key ? 'bg-violet-300 text-violet-1100' : 'text-soft hover:bg-fc-200 hover:text-title')
              }
              onClick={() => {
                onSectionClick(item.key);
              }}
            >
              <span
                className={classnames(
                  'inline-flex items-center justify-center w-[22px] h-[22px] mr-2 rounded-full text-xs flex-none',
                  activeSection === item.key ? 'bg-violet-900 text-white' : 'fc-border text-main',
                )}
              >
                {index + 1}
              </span>
              <span className='truncate text-sm leading-5 flex-1 text-left'>{item.title}</span>
              <span className={'ml-auto text-[10px] px-1.5 py-0.5 rounded leading-none ' + tagClassesMap[item.tag]}>{t(tagI18nKeys[item.tag])}</span>
            </button>
          ))}
        </div>
      </div>
      <Divider />
      <div className='font-bold text-soft/80 mb-2'>{t('form_ng.rule_summary')}</div>
      <div className='flex-1 min-h-0 overflow-x-hidden overflow-y-auto best-looking-scroll'>
        <RuleSummary datasourceList={datasourceList} />
      </div>
    </aside>
  );
}

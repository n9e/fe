import React from 'react';
import { Drawer, Button, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { SCRIPT_TEMPLATES, ScriptTemplate, TemplateCategory, TemplateRisk } from '../../constants';

const NS = 'alertSelfHealing';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** 当前业务组，用于跳转新建页时携带 gid */
  gid?: string;
}

const riskColorMap: Record<TemplateRisk, string> = {
  none: 'green',
  medium: 'gold',
  high: 'orange',
  critical: 'red',
};

const CATEGORY_ORDER: TemplateCategory[] = ['diagnostic', 'remediation'];

export default function TemplateLibrary({ visible, onClose, gid }: Props) {
  const { t } = useTranslation(NS);
  const history = useHistory();

  const handleUse = (tpl: ScriptTemplate) => {
    const search = gid ? `gid=${gid}&tplkey=${tpl.key}` : `tplkey=${tpl.key}`;
    history.push({ pathname: '/job-tpls/add', search });
    onClose();
  };

  const grouped = _.groupBy(SCRIPT_TEMPLATES, 'category');

  return (
    <Drawer title={t('templates.drawer_title')} placement='right' width={640} visible={visible} onClose={onClose}>
      {CATEGORY_ORDER.map((category) => {
        const list = grouped[category] || [];
        if (_.isEmpty(list)) return null;
        return (
          <div key={category} className='mb-6'>
            <div className='mb-3 font-bold text-title'>{t(`templates.group_${category}`)}</div>
            <div className='flex flex-col gap-3'>
              {list.map((tpl) => (
                <div key={tpl.key} className='fc-border rounded-lg p-3 bg-fc-100'>
                  <div className='flex items-center gap-2 mb-1'>
                    <span className='font-medium text-title'>{t(`templates.${tpl.key}.title`)}</span>
                    <Tag color={riskColorMap[tpl.risk]}>{t(`templates.risk_${tpl.risk}`)}</Tag>
                  </div>
                  <div className='text-[13px] text-soft leading-snug mb-2'>{t(`templates.${tpl.key}.desc`)}</div>
                  <div className='flex items-center justify-between'>
                    <span className='text-[12px] text-soft'>
                      {/* 依赖：模板有 templates.<key>.deps 时取之，否则显示「无」 */}
                      {t('templates.deps_label')}：{t(`templates.${tpl.key}.deps`, { defaultValue: '' }) || t('templates.deps_none')}
                    </span>
                    <Button type='primary' size='small' onClick={() => handleUse(tpl)}>
                      {t('templates.use_btn')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </Drawer>
  );
}

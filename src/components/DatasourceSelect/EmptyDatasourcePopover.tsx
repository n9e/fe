import React, { useContext } from 'react';
import { CommonStateContext } from '@/App';
import { Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { IS_ENT, IS_PLUS } from '@/utils/constant';
import { allCates, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';

interface IProps {
  type?: 'metric' | 'logging';
  datasourceList: any[];
  children: React.ReactNode;
  placement?: TooltipPlacement;
  getPopupContainer?: () => HTMLElement;
}

export default function EmptyDatasourcePopover(props: IProps) {
  const { t, i18n } = useTranslation();
  const { profile } = useContext(CommonStateContext);
  const { type = 'metric', datasourceList, children, placement, getPopupContainer } = props;

  const supportedCates = _.filter(allCates, (cate) => {
    if (!_.includes(cate.type, type)) return false;
    return cate.graphPro ? IS_PLUS : true;
  });
  const supportedLabels = _.map(supportedCates, (cate) => getCateDisplayLabel(cate, i18n.language));

  const emptyTitle = !_.isEmpty(supportedLabels)
    ? t('common:datasource.empty_modal.title_with_types', { types: supportedLabels.join('、') })
    : t('common:datasource.empty_modal.title');

  let linkUrl = IS_ENT ? '/settings/source/timeseries' : '/datasources';

  if (type === 'logging') {
    linkUrl = IS_ENT ? '/settings/source/log' : '/datasources';
  }

  return (
    <Popover
      content={
        <>
          {emptyTitle} {_.includes(profile?.roles, 'Admin') ? <Link to={linkUrl}>{t('common:datasource.empty_modal.btn1')}</Link> : null}
        </>
      }
      visible={_.isEmpty(datasourceList)}
      placement={placement ?? 'bottomLeft'}
      getPopupContainer={getPopupContainer}
    >
      {children}
    </Popover>
  );
}

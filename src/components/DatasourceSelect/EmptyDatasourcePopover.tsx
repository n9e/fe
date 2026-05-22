import React, { useContext } from 'react';
import { CommonStateContext } from '@/App';
import { Popover } from 'antd';
import { TooltipPlacement } from 'antd/lib/tooltip';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { IS_ENT } from '@/utils/constant';

interface IProps {
  type?: 'metric' | 'logging';
  datasourceList: any[];
  children: React.ReactNode;
  placement?: TooltipPlacement;
  getPopupContainer?: () => HTMLElement;
}

export default function EmptyDatasourcePopover(props: IProps) {
  const { t } = useTranslation();
  const { profile } = useContext(CommonStateContext);
  const { type = 'metric', datasourceList, children, placement, getPopupContainer } = props;

  let linkUrl = IS_ENT ? '/settings/source/timeseries' : '/datasources';

  if (type === 'logging') {
    linkUrl = IS_ENT ? '/settings/source/log' : '/datasources';
  }

  return (
    <Popover
      content={
        <>
          {t('common:datasource.empty_modal.title')} {_.includes(profile?.roles, 'Admin') ? <Link to={linkUrl}>{t('common:datasource.empty_modal.btn1')}</Link> : null}
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

import React, { useContext, useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import './locale';

interface Props {
  allowedPerms: string | string[];
  children: JSX.Element;
  showUnauthorized?: boolean;
}

export default function index(props: Props) {
  const { t } = useTranslation();
  const { perms } = useContext(CommonStateContext);
  const { allowedPerms, children, showUnauthorized } = props;
  const authorized = useMemo(() => {
    return _.every(allowedPerms, (perm) => _.includes(perms, perm));
  }, [allowedPerms, perms]);

  if (authorized) {
    return children;
  }
  if (showUnauthorized) {
    return <>{t('unauthorized')}</>;
  }
  return null;
}
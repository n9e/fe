import { useContext } from 'react';
import { useRequest } from 'ahooks';

import { CommonStateContext } from '@/App';
import { getItems as getNotificationRules } from '@/pages/notificationRules/services';

const noop = () => {};

export default function useNotificationRules(ready = true) {
  const { perms } = useContext(CommonStateContext);
  const isAuthorized = Array.isArray(perms) && perms.includes('/notification-rules');
  const { data, loading, refresh } = useRequest(getNotificationRules, {
    ready: ready && isAuthorized,
    refreshDeps: [ready, isAuthorized],
  });

  return {
    notificationRules: isAuthorized ? data ?? [] : [],
    loading: isAuthorized && loading,
    refresh: isAuthorized ? refresh : noop,
    isAuthorized,
  };
}

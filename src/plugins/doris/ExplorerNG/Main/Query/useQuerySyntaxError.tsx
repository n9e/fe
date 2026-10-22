import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import { errorHandler } from '@/utils/request';
import DocumentDrawer from '@/components/DocumentDrawer';
import UsageDocs from '@/components/UsageDocs';
import { NAME_SPACE } from '@/pages/logExplorer/constants';
import { createQueryErrorHandler } from './queryErrorPolicy';

export default function useQuerySyntaxError(refreshFlag: string | undefined) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const key = `doris-query-syntax-${React.useId()}`;
  const alive = useRef(true);
  const latestRun = useRef(refreshFlag);
  latestRun.current = refreshFlag;
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    notification.close(key);
    return () => notification.close(key);
  }, [key, refreshFlag]);

  return useMemo(
    () => ({
      errorHandler: createQueryErrorHandler(
        errorHandler,
        () => {
          if (!alive.current || latestRun.current !== refreshFlag) return;
          notification.error({
            key,
            message: t('query_error.title'),
            duration: 10,
            description: (
              <div className='n9e-log-query-error'>
                <p>{t('query_error.hint')}</p>
                <UsageDocs>
                  <button
                    type='button'
                    className='n9e-log-query-doc-link'
                    onClick={() => {
                      notification.close(key);
                      DocumentDrawer({
                        language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                        darkMode,
                        title: t('guidance.docs'),
                        type: 'iframe',
                        documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-query-mode-in-doris-discover/',
                      });
                    }}
                  >
                    {t('query_error.more')} {t('guidance.docs')} →
                  </button>
                </UsageDocs>
              </div>
            ),
          });
        },
        t('query_error.hint'),
      ),
    }),
    [t, i18n.language, darkMode, key, refreshFlag],
  );
}

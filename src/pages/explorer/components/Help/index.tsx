import React, { useContext } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';

// @ts-ignore
import { proDocumentPathMap } from 'plus:/constants';

interface Props {
  datasourceCate?: string;
}

const documentPathMap = {
  [DatasourceCateEnum.prometheus]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/time-series/metrics/prometheus/',
  [DatasourceCateEnum.tdengine]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/time-series/metrics/tdengine/',
  [DatasourceCateEnum.elasticsearch]: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/log-analysis/elasticserch/',
  ...(proDocumentPathMap || {}),
};

export default function index(props: Props) {
  const { t, i18n } = useTranslation('explorer');
  const { darkMode } = useContext(CommonStateContext);
  const { datasourceCate } = props;

  if (!datasourceCate || (datasourceCate && !documentPathMap[datasourceCate])) return null;

  return (
    <span className='ant-input-group-addon'>
      <Tooltip title={t('help')}>
        <QuestionCircleOutlined
          onClick={() => {
            DocumentDrawer({
              language: i18n.language,
              darkMode,
              title: t('help'),
              type: 'iframe',
              documentPath: documentPathMap[datasourceCate],
            });
          }}
        />
      </Tooltip>
    </span>
  );
}

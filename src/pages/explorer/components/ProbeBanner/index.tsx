import React, { useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { Alert, Button, Modal, Space } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import TemplateMatchPanel from '@/components/TemplateMatch';
import { ProbeResult, PROBE_STORAGE_PREFIX } from '@/pages/datasource/utils/useDataProbe';
import { markDsJourney } from '@/pages/datasource/utils/journey';
import '@/pages/datasource/locale';

/**
 * 探索器落地横幅（产品方案 A1.6 页面二）：
 * 仅当 URL 带 __from=ds_verify 且 sessionStorage 有该数据源的体检结论时出现；
 * 用户接管（改查询/点查询）或点 × 后收起，刷新即消失，不常驻、不入库。
 * 显隐由调用方（Prometheus explorer）控制，本组件只负责渲染。
 */

interface Props {
  datasourceId?: number;
  onClose: () => void;
}

export function readProbeResult(datasourceId?: number): ProbeResult | undefined {
  if (!datasourceId) return undefined;
  try {
    const raw = sessionStorage.getItem(`${PROBE_STORAGE_PREFIX}${datasourceId}`);
    return raw ? (JSON.parse(raw) as ProbeResult) : undefined;
  } catch (e) {
    return undefined;
  }
}

export default function ProbeBanner(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { datasourceId, onClose } = props;
  const probe = useMemo(() => readProbeResult(datasourceId), [datasourceId]);
  const [tplVisible, setTplVisible] = useState(false);

  useEffect(() => {
    if (datasourceId && probe?.state === 'hasData') {
      markDsJourney(datasourceId, 'explored_at');
    }
  }, [datasourceId, probe?.state]);

  if (!probe || probe.state !== 'hasData') return null;

  return (
    <>
      <Alert
        style={{ marginBottom: 16 }}
        type='success'
        showIcon
        closable
        onClose={onClose}
        message={t('probe_banner.title', {
          count: probe.metricCount,
          ago: probe.lastDataTs ? moment.unix(probe.lastDataTs).fromNow() : '-',
        })}
        description={
          <Space split='·' wrap>
            <span>{t('probe_banner.filled')}</span>
            <Link to='/dashboards' target='_blank'>
              {t('result.create_dashboard')}
            </Link>
            <Link to='/alert-rules' target='_blank'>
              {t('result.create_alert')}
            </Link>
            {/* 模板匹配就地弹出：用户正在查数据，不该被踢去另一个页面 */}
            <Button
              type='link'
              size='small'
              className='p-0 h-auto'
              onClick={() => {
                setTplVisible(true);
              }}
            >
              {t('probe_banner.import_tpl')}
            </Button>
          </Space>
        }
      />
      <Modal
        title={t('probe_banner.import_tpl')}
        visible={tplVisible}
        width={720}
        footer={null}
        destroyOnClose
        onCancel={() => {
          setTplVisible(false);
        }}
      >
        <TemplateMatchPanel datasourceId={datasourceId} show='both' />
      </Modal>
    </>
  );
}

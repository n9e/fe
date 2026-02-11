import React, { useEffect, useState } from 'react';
import { Button, Space } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { getLogHistogram } from '../../../services';
import { NAME_SPACE } from '../../../constants';
import HistogramChart from '../components/HistogramChart';
interface Props {
  visible: boolean;
  uuid?: string;
  rowIndex?: number;
  setPatternHistogramState: (v: { visible: boolean, uuid?: string, rowIndex?: number }) => void;
}

export default function Histogram(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    if (props.uuid) {
      getLogHistogram(props.uuid).then((res) => {
        setSeries([{ data: res.values }]);
      });
    }
  }, [props.uuid]);

  return <div>
    <div className='mt-1 px-2 flex items-center h-[19px] overflow-hidden'>
      <Space>
        <span>{t('clustering.row_number')} {props.rowIndex}</span>
        <span>{t('clustering.log_statistics')}</span>
      </Space>
      <Button
        type='link'
        size='small'
        icon={<RollbackOutlined />}
        onClick={() => props.setPatternHistogramState({ visible: false })}
      >
        {t('clustering.back_to_all_logs')}
      </Button>
    </div>
    <div className='h-[120px]'>
      <HistogramChart series={series} stacked={false} onClick={() => { }} onZoomWithoutDefult={() => { }} />
    </div>
  </div>
}

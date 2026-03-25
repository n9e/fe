import React, { useEffect, useState } from 'react';
import { IMessageResponse } from '../../store';
import CheckList from '@/Packages/Outfire/pages/AiAnalysis/CheckList';
import { useRequest } from 'ahooks';
import { getAiAnalysisDetail } from '@/Packages/Outfire/services/aiAnalysis';
import { getFireMapCardDetail } from '@/Packages/Outfire/services';
import { IMetricThresholdGroup, Level2CardType } from '@/Packages/Outfire/store';
import AnalysisHeader from '@/Packages/Outfire/pages/AiAnalysis/components/AnalysisHeader';
import { EMode } from '@/Packages/Outfire/store/aiAnalysis';

interface IPorps {
  response: IMessageResponse;
}

export default function CheckListContainer(props: IPorps) {
  const { response } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<number>(1000);
  const [cardDetail, setCardDetail] = useState<Level2CardType>();
  const [curThreshold, setCurThreshold] = useState<IMetricThresholdGroup>();
  const [modeDetail, setModeDetail] = useState<{ mode: EMode; detail: any }>();

  const {
    data: aiResult,
    run,
    cancel,
    refresh,
  } = useRequest(getAiAnalysisDetail, {
    manual: true,
    pollingInterval: 5000,
    onBefore: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      // if (pollingInterval < 3000) {
      //   setPollingInterval(pollingInterval + 1000);
      // } else if (pollingInterval !== 5000) {
      //   setPollingInterval(5000);
      // }
      if (data?.is_finish) {
        setLoading(false);
        cancel();
      }
    },
    // onFinally: (params, data, error) => {},
  });

  useEffect(() => {
    getCardDetail();
  }, []);

  const getCardDetail = () => {
    const { card_id, business_id, ts, workspace_id } = response?.param;
    getFireMapCardDetail({ id: Number(card_id), business_id: Number(business_id), snapshot: true, timestamp: Number(ts), workspace_id: Number(workspace_id) }).then((res) => {
      setCardDetail(res);
      setModeDetail({ mode: EMode.Card, detail: res });
      const temp = res.multi_thresholds?.find((el, index) => index === res.threshold_index?.index);
      setCurThreshold(temp || res.multi_thresholds?.[0]);
      run(response?.param as any);
    });
  };

  return (
    <>
      <div className='srm'>
        <div className='ai-analysis-box'>
          <AnalysisHeader modeDetail={modeDetail} timestamp={response?.param?.ts} openCardDetail={() => {}} />
          <div className='ai-analysis-content'>
            <CheckList
              loading={loading}
              aiResult={aiResult}
              cardDetail={cardDetail}
              curThreshold={curThreshold}
              responseParam={response?.param}
              openCardDetail={() => {
                // 打开卡片详情抽屉的函数
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { EContentType, IMessageDetail } from '@/components/AiChat/store';
import MarkdownContainer from '../ChatBox/MessageListContainer/MarkdownContainer';
import CheckListContainer from '../ChatBox/MessageListContainer/CheckListContainer';
import HintContainer from '../ChatBox/MessageListContainer/HintContainer';
import { useRequest } from 'ahooks';
import { getMessageDetail } from '../services';
import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import qs from 'query-string';
import { addHiddenElement } from '@/Packages/Outfire/services';
import PageLayout from '@/components/pageLayout';

/**
 * 截图url示例: http://10.99.1.106:9000/firemap/slo-screenshot?chat_id=8f79b01b-0cae-4596-89b3-9aa4811955b1
 * @param props
 * @returns
 */

export default function SloScreenshot(props: any) {
  const {} = props;

  const location = useLocation();
  const urlQuery = qs.parse(location.search);

  const [messageDetail, setMessageDetail] = useState<IMessageDetail>();

  const {
    data: curMessageDetail,
    run,
    cancel,
    refresh,
  } = useRequest(getMessageDetail, {
    // manual: true,
    defaultParams: [{ chat_id: urlQuery.chat_id as string, seq_id: 1 }],
    pollingInterval: 3000,
    onSuccess: (data) => {
      if (data?.is_finish) {
        cancel();
        setMessageDetail(data);
        requestAnimationFrame(() => {
          addHiddenElement();
        });
      }
    },
    // onFinally: (params, data, error) => {},
  });

  return (
    <>
      <PageLayout title={''}>
        <div className='ai-message-box' id='ai-slo-message'>
          {messageDetail?.response?.map((el, index) => {
            return (
              <div key={index}>
                {el.content_type === EContentType.Markdown && <MarkdownContainer response={el} isCancel={false} maybeScrollToBottom={() => {}} />}
                {el.content_type === EContentType.FiremapCheckItem && <CheckListContainer response={el} />}
                {el.content_type === EContentType.Hint && <HintContainer response={el} />}
              </div>
            );
          })}
        </div>
      </PageLayout>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { IHistoryItem, IMatchRoute } from '../store';
import moment from 'moment';
import { Spin } from 'antd';
import './style.less';
import { EMode, EPageType } from '../config';
import { getChatHistory } from '../services';

interface IPoprs {
  modeChange: (mode: EMode, data?: { chat_id: string; seq_id?: number }) => void;
  isMatchRoute?: IMatchRoute;
}

export default function ChatHistory(props: IPoprs) {
  const { modeChange, isMatchRoute } = props;

  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [chatHistoryList, setChatHistoryList] = useState<IHistoryItem[]>([]);

  useEffect(() => {
    initChatHistory();
  }, [isMatchRoute]);

  const initChatHistory = (isInit?: boolean) => {
    if (!isMatchRoute) return;

    setHistoryLoading(true);
    getChatHistory()
      .then((res) => {
        // console.log('res', res, isMatchRoute);

        setChatHistoryList(res);
        if (isInit) {
          const temp = res?.find((el) => {
            const firemapType = [EPageType.FiremapHomepage, EPageType.FiremapFunction, EPageType.FiremapLevel2, EPageType.FiremapSystem];
            const sloType = [EPageType.SloList, EPageType.SloDetail];
            const pageTypeArr = firemapType.includes(isMatchRoute?.pageType) ? firemapType : [isMatchRoute?.pageType];

            if (isMatchRoute?.pageType === EPageType.SloDetail) {
              // slo必须id一致才展示历史消息
              const sloId = Number(isMatchRoute?.params?.id);
              return el.page_from.param.slo.id === sloId;
            } else {
              return pageTypeArr.includes(el.page_from.page);
            }
          });
        }
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  };

  return (
    <div className='ai-chat-body'>
      <Spin spinning={historyLoading} wrapperClassName='ai-chat-content-spin'>
        <div className='chat-history-box'>
          {chatHistoryList?.map((el) => {
            return (
              <div
                key={el.chat_id}
                className='chat-history-item'
                onClick={() => {
                  modeChange(EMode.CurrentChat, { chat_id: el.chat_id });
                }}
              >
                <div className='item-left'>{el.title}</div>
                <div className='item-righe'>
                  {moment(el.last_update, 'X').format('YYYY-MM-DD HH:mm')}
                  {/* <DeleteOutlined
                  style={{ cursor: 'pointer', marginLeft: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                /> */}
                </div>
              </div>
            );
          })}
        </div>
      </Spin>
    </div>
  );
}

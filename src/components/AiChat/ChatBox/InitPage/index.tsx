import React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRightOutlined, SwapRightOutlined } from '@ant-design/icons';
import { IMessageDetail, IRecommendActionItem } from '../../store';
import { useHistory } from 'react-router-dom';

interface IProps {
  dataSourceList: any[];
  chatDetail?: IMessageDetail;
  userSendMessage: (action?: IRecommendActionItem) => void;
}

export default function InitPage(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { dataSourceList, chatDetail, userSendMessage } = props;

  const history = useHistory();

  // console.log('chatDetail', chatDetail);

  return (
    <div className='init-page-box'>
      <div className='hello-box'>
        <div className='hello-text'>
          {t('initPage.hello')}
          <span className='highlight-text'>FlashAI</span>
        </div>
      </div>
      {!!dataSourceList?.length ? (
        <div className='prompt-operation-box'>
          {chatDetail?.recommend_action?.map((el, index) => {
            return (
              <div
                className='prompt-operation-item'
                key={index}
                onClick={() => {
                  userSendMessage(el);
                }}
              >
                <div className='operation-item-text' title={el.content}>
                  {el.content}
                </div>
                <div className='operation-item-icon'>
                  <ArrowRightOutlined />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className='nodata-box'>
          <img className='nodata-img' src='/image/nodata.png' alt='' />
          <div className='nodata-text'>
            {t('initPage.nodata')}
            <a
              style={{ marginLeft: 8 }}
              onClick={() => {
                history.push('/settings/source/infrastructure');
              }}
            >
              {t('initPage.goConfig')}
              <SwapRightOutlined style={{ marginLeft: 4 }} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

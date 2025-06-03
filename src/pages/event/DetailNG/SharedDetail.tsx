import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { Card, Alert } from 'antd';
import { useTranslation } from 'react-i18next';

import { getHistoryEventsById } from '@/services/warning';

import DetailNG from './index';

const EventDetailPage = () => {
  const { t } = useTranslation('AlertCurEvents');
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const __token = queryParams.__token as string;
  const shared = _.includes(location.pathname, '/share/alert-his-events');
  const [eventDetail, setEventDetail] = useState<any>();

  useEffect(() => {
    if (eventId && __token) {
      getHistoryEventsById(eventId, {
        __token,
      }).then((res) => {
        setEventDetail(res.dat);
      });
    }
  }, [eventId]);

  if (shared && !queryParams.__token) {
    return (
      <div className='w-screen h-screen overflow-y-auto'>
        <Alert message={t('sharing_link.no_token')} type='error' showIcon className='m-4' />
      </div>
    );
  }

  return (
    <div className='w-screen h-screen overflow-y-auto'>
      <div className='p-4'>
        <Card title={t('AlertCurEvents:detail.title')} size='small'>
          <DetailNG data={eventDetail} showGraph token={__token} />
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;

import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { Card } from 'antd';
import { useTranslation } from 'react-i18next';

import { getHistoryEventsById } from '@/services/warning';

import DetailNG from './index';
import './style.less';

const EventDetailPage = () => {
  const { t } = useTranslation('AlertCurEvents');
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const __token = queryParams.__token as string;
  const [eventDetail, setEventDetail] = useState<any>();

  useEffect(() => {
    if (eventId) {
      getHistoryEventsById(eventId, {
        __token,
      }).then((res) => {
        setEventDetail(res.dat);
      });
    }
  }, [eventId]);

  return (
    <div className='n9e-shared-event overflow-y-auto'>
      <div className='p-4'>
        <Card title={t('AlertCurEvents:detail.title')} size='small'>
          <DetailNG data={eventDetail} showGraph token={__token} />
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;

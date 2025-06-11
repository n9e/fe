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
    <div className='n9e-shared-event h-screen'>
      <div className='h-full p-2 lg:p-10'>
        <Card
          className='h-full'
          title={t('AlertCurEvents:detail.title')}
          bodyStyle={{
            height: 'calc(100% - 55px)', // Adjust height to account for the title bar
          }}
        >
          <div className='w-full h-full overflow-x-hidden overflow-y-auto'>
            <DetailNG data={eventDetail} showGraph token={__token} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EventDetailPage;

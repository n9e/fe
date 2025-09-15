/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import _ from 'lodash';
import { Card, Affix } from 'antd';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { getHistoryEventsById } from '@/services/warning';
import DetailNG from './DetailNG';
import getActions from './DetailNG/Actions';

const EventDetailPage = () => {
  const { t } = useTranslation('AlertCurEvents');
  const { eventId } = useParams<{ eventId: string }>();
  const [eventDetail, setEventDetail] = useState<any>();

  useEffect(() => {
    if (eventId) {
      getHistoryEventsById(eventId).then((res) => {
        setEventDetail(res.dat);
      });
    }
  }, [eventId]);

  return (
    <PageLayout title={t('detail.title')} showBack backPath='/alert-his-events'>
      <div className='n9e'>
        <Card size='small' className='mb-2'>
          <DetailNG data={eventDetail} showGraph />
        </Card>
        <Affix offsetBottom={0}>
          <Card size='small' className='affix-bottom-shadow'>
            {getActions({
              showAckBtn: true,
              eventDetail: eventDetail,
              showSharingLink: false,
            })}
          </Card>
        </Affix>
      </div>
    </PageLayout>
  );
};

export default EventDetailPage;

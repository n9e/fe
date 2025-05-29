import React, { useState } from 'react';
import { Space, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import queryString from 'query-string';
import { Link } from 'react-router-dom';

import { deleteAlertEventsModal } from '../index';
import SharingLinkModal from './SharingLinkModal';

interface Options {
  eventType: 'active' | 'history';
  eventDetail?: any;
  showDeleteBtn?: boolean;
  onDeleteSuccess?: () => void;
}

export default function getActions(options: Options) {
  const { t } = useTranslation('AlertCurEvents');
  const { eventType, eventDetail, showDeleteBtn, onDeleteSuccess } = options;
  const [sharingLinkModalVisible, setSharingLinkModalVisible] = useState(false);

  if (!eventDetail) {
    return [];
  }

  if (!_.includes(['firemap', 'northstar'], eventDetail?.rule_prod)) {
    return [
      <div className='action-btns'>
        <Space>
          <Link
            to={{
              pathname: '/alert-mutes/add',
              search: queryString.stringify({
                busiGroup: eventDetail.group_id,
                prod: eventDetail.rule_prod,
                cate: eventDetail.cate,
                datasource_ids: [eventDetail.datasource_id],
                tags: eventDetail.tags,
              }),
            }}
          >
            <Button type='primary'>{t('shield')}</Button>
          </Link>
          {showDeleteBtn && (
            <Button
              danger
              onClick={() => {
                if (eventDetail.group_id) {
                  deleteAlertEventsModal(
                    [eventDetail.id],
                    () => {
                      onDeleteSuccess && onDeleteSuccess();
                      // history.replace('/alert-cur-events');
                    },
                    t,
                  );
                } else {
                  message.warn('该告警未返回业务组ID');
                }
              }}
            >
              {t('common:btn.delete')}
            </Button>
          )}
          <Button
            onClick={() => {
              setSharingLinkModalVisible(true);
            }}
          >
            {t('sharing_link.title')}
          </Button>
        </Space>
        {eventDetail && (
          <SharingLinkModal
            eventType={eventType}
            eventId={eventDetail.id}
            visible={sharingLinkModalVisible}
            onClose={() => {
              setSharingLinkModalVisible(false);
            }}
          />
        )}
      </div>,
    ];
  }
  if (eventDetail?.rule_prod === 'firemap') {
    return [
      <div className='action-btns'>
        <Button
          type='primary'
          onClick={() => {
            window.open(eventDetail.rule_config.detail_url + '&mute=1', '_blank');
          }}
        >
          {t('shield')}
        </Button>
      </div>,
    ];
  }
  return [];
}

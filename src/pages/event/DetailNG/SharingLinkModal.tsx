import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Checkbox, InputNumber, Select, Space, Input, Row, Col, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';

import { postSourceToken } from '@/services/common';
import { SIZE } from '@/utils/constant';
import { copy2ClipBoard } from '@/utils';

interface Props {
  eventId: number;
  visible: boolean;
  onClose: () => void;
}

const expireUnitOptions = [
  { label: 'Day(s)', value: 'day' },
  { label: 'Hour(s)', value: 'hour' },
];

export default function SharingLinkModal(props: Props) {
  const { t } = useTranslation('AlertCurEvents');
  const { eventId, visible, onClose } = props;
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(false);
  const [expireValue, setExpireValue] = useState<number>(7);
  const [expireUnit, setExpireUnit] = useState<string>('day'); // day, hour
  const [token, setToken] = useState<string>();
  const linkSrc = allowAnonymous ? `${window.location.origin}/share/alert-his-events/${eventId}?__token=${token}` : `${window.location.origin}/alert-his-events/${eventId}`;

  const { run: fetchToken } = useDebounceFn(
    () => {
      postSourceToken({
        source_type: 'event',
        source_id: _.toString(eventId),
        expire_at: expireValue * (expireUnit === 'day' ? 86400 : 3600) + moment().unix(), // 过期时间戳，单位秒
      }).then((res) => {
        setToken(res.dat);
      });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    if (visible && allowAnonymous && expireValue) {
      fetchToken();
    }
  }, [visible, allowAnonymous, expireValue, expireUnit]);

  return (
    <Modal title={t('sharing_link.title')} visible={visible} footer={null} width={800} onCancel={onClose}>
      <div className='mb-2'>
        <Checkbox
          style={{ height: 32, lineHeight: '32px' }}
          value={allowAnonymous}
          onChange={(e) => {
            setAllowAnonymous(e.target.checked);
          }}
        >
          {t('sharing_link.allow_anonymous')}
        </Checkbox>
        {allowAnonymous && (
          <Space>
            <span>,</span>
            {t('sharing_link.expire_at')}
            <InputNumber
              value={expireValue}
              onChange={(val: number) => {
                setExpireValue(val);
              }}
              min={1}
            />
            <Select
              options={expireUnitOptions}
              value={expireUnit}
              onChange={(val) => {
                setExpireUnit(val);
              }}
            />
          </Space>
        )}
      </div>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Input readOnly value={linkSrc} />
        </Col>
        <Col flex='none'>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              copy2ClipBoard(linkSrc);
            }}
          >
            {t('common:btn.copy')}
          </Button>
        </Col>
      </Row>
    </Modal>
  );
}

import React, { useEffect, useState } from 'react';
import { Modal, Checkbox, InputNumber, Select, Space, Input, Row, Col, Button, Radio, Tooltip, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useDebounceFn } from 'ahooks';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { basePrefix } from '@/App';
import { postSourceToken } from '@/services/common';
import { getDashboard } from '@/services/dashboardV2';
import { SIZE } from '@/utils/constant';
import { copy2ClipBoard } from '@/utils';

interface IProps {
  boardId: number;
}

const expireUnitOptions = [
  { label: 'Day(s)', value: 'day' },
  { label: 'Hour(s)', value: 'hour' },
];

function SharingLinkModal(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, boardId } = props;
  const [allowAnonymous, setAllowAnonymous] = useState<boolean>(false);
  const [expireValue, setExpireValue] = useState<number>(7);
  const [expireUnit, setExpireUnit] = useState<string>('day'); // day, hour
  const [themeMode, setThemeMode] = useState<string>('default'); // default, dark, light
  const [token, setToken] = useState<string>();
  const [tokenLoading, setTokenLoading] = useState<boolean>(false);
  const [hasHostIdentVariable, setHasHostIdentVariable] = useState<boolean>(false);

  const themeQuery = themeMode === 'default' ? '' : `themeMode=${themeMode}`;
  // 匿名模式下 token 未就绪（签发中或失败）时不回退到需登录的普通链接，避免误把
  // 私有链接当分享链接复制出去；此时展示空串 + 禁用复制。非匿名模式正常给普通链接。
  const anonymousReady = allowAnonymous && !!token && !tokenLoading;
  const linkSrc = allowAnonymous
    ? anonymousReady
      ? `${window.location.origin}${basePrefix}/dashboards/share/${boardId}?__token=${token}${themeQuery ? `&${themeQuery}` : ''}`
      : ''
    : `${window.location.origin}${basePrefix}/dashboards/${boardId}${themeQuery ? `?${themeQuery}` : ''}`;
  const copyDisabled = allowAnonymous && !anonymousReady;

  const { run: fetchToken } = useDebounceFn(
    () => {
      setTokenLoading(true);
      postSourceToken({
        source_type: 'board',
        source_id: _.toString(boardId),
        expire_at: expireValue * (expireUnit === 'day' ? 86400 : 3600) + moment().unix(), // 过期时间戳，单位秒
      })
        .then((res) => {
          setToken(res.dat);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setTokenLoading(false);
        });
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    // 含机器标识变量的仪表盘依赖登录态接口，禁止匿名分享（与 PublicForm 的限制一致）。
    // 读取失败时按「不确定 → 不允许匿名」保守降级，而非静默放行
    getDashboard(boardId)
      .then((res) => {
        try {
          const configs = JSON.parse(res.configs);
          setHasHostIdentVariable(
            _.some(configs.var, (item) => {
              return item.type === 'hostIdent';
            }),
          );
        } catch (e) {
          console.error(e);
        }
      })
      .catch((error) => {
        console.error(error);
        setHasHostIdentVariable(true);
      });
  }, [boardId]);

  useEffect(() => {
    // 有效期/单位/勾选变化时先作废旧 token，防抖窗口内展示空链接而非旧有效期链接
    if (visible && allowAnonymous && expireValue) {
      setToken(undefined);
      fetchToken();
    }
  }, [visible, allowAnonymous, expireValue, expireUnit]);

  return (
    <Modal title={t('sharing_link.title')} visible={visible} footer={null} width={800} onCancel={destroy}>
      <div className='mb-2'>
        <Tooltip title={hasHostIdentVariable ? t('var.hostIdent.invalid2') : undefined}>
          <Checkbox
            style={{ height: 32, lineHeight: '32px' }}
            checked={allowAnonymous}
            disabled={hasHostIdentVariable}
            onChange={(e) => {
              setAllowAnonymous(e.target.checked);
            }}
          >
            {t('sharing_link.allow_anonymous')}
          </Checkbox>
        </Tooltip>
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
      <div className='mb-2'>
        <Space>
          {t('sharing_link.theme')}
          <Radio.Group
            value={themeMode}
            onChange={(e) => {
              setThemeMode(e.target.value);
            }}
          >
            <Radio value='default'>{t('sharing_link.theme_default')}</Radio>
            <Radio value='dark'>{t('sharing_link.theme_dark')}</Radio>
            <Radio value='light'>{t('sharing_link.theme_light')}</Radio>
          </Radio.Group>
        </Space>
      </div>
      <Row gutter={SIZE}>
        <Col flex='auto'>
          <Input readOnly value={linkSrc} placeholder={tokenLoading ? t('sharing_link.generating') : undefined} />
        </Col>
        <Col flex='none'>
          <Button
            icon={<CopyOutlined />}
            disabled={copyDisabled}
            onClick={() => {
              copy2ClipBoard(linkSrc);
            }}
          >
            {t('common:btn.copy')}
          </Button>
        </Col>
      </Row>
      {allowAnonymous && (
        <div className='mt-2'>
          <Typography.Text type='secondary'>{t('sharing_link.anonymous_tip')}</Typography.Text>
        </div>
      )}
    </Modal>
  );
}

export default ModalHOC<IProps>(SharingLinkModal);

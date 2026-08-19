import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox, InputNumber, Select, Space, Input, Button, Radio, Tooltip, Typography, Table, Popconfirm, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { basePrefix } from '@/App';
import { postSourceToken, getSourceTokens, deleteSourceToken, SourceTokenItem } from '@/services/common';
import { copy2ClipBoard } from '@/utils';

interface Props {
  boardId: number;
  // 含机器标识变量的仪表盘依赖登录态接口，禁止匿名分享；调用方负责探测并传入，
  // 探测失败时应传 true（不确定 → 不允许匿名）
  hasHostIdentVariable: boolean;
  // 调用方已在外部表达了匿名意图（公开设置里选了「匿名访问」类型），
  // 此时不再重复展示「允许不登录匿名访问」勾选框
  alwaysAnonymous?: boolean;
}

const expireUnitOptions = [
  { label: 'Hour(s)', value: 'hour' },
  { label: 'Day(s)', value: 'day' },
  { label: 'Month(s)', value: 'month' },
  { label: 'Year(s)', value: 'year' },
];

const expireUnitSeconds = {
  hour: 3600,
  day: 86400,
  month: 86400 * 30,
  year: 86400 * 365,
};

// 限时分享链接：填好备注与有效期后显式生成，签发的令牌进入下方列表，可随时注销。
// 刻意不做「打开即自动签发」——那会让每次打开弹窗都堆进一条无用记录
export default function SharingLinkSection(props: Props) {
  const { t } = useTranslation('dashboard');
  const { boardId, hasHostIdentVariable, alwaysAnonymous = false } = props;
  const [anonymousChecked, setAnonymousChecked] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [expireValue, setExpireValue] = useState<number>(30);
  const [expireUnit, setExpireUnit] = useState<string>('day');
  const [themeMode, setThemeMode] = useState<string>('default'); // default, dark, light
  const [generating, setGenerating] = useState<boolean>(false);
  const [tokens, setTokens] = useState<SourceTokenItem[]>([]);

  // alwaysAnonymous 模式下勾选框不出现，匿名意图由外部类型选择表达；
  // 但含机器标识变量时依然不能匿名，此处统一收口
  const allowAnonymous = alwaysAnonymous ? !hasHostIdentVariable : anonymousChecked;

  const fetchTokens = useCallback(() => {
    getSourceTokens({ source_type: 'board', source_id: _.toString(boardId) })
      .then((res) => {
        setTokens(res);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [boardId]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // 主题是复制链接时附加的展示参数，不属于令牌本身，故对列表里每条链接统一生效
  const buildLink = (token: string) => {
    const themeQuery = themeMode === 'default' ? '' : `&themeMode=${themeMode}`;
    return `${window.location.origin}${basePrefix}/dashboards/share/${boardId}?__token=${token}${themeQuery}`;
  };

  const handleGenerate = () => {
    setGenerating(true);
    postSourceToken({
      source_type: 'board',
      source_id: _.toString(boardId),
      note: _.trim(note),
      // 过期时间戳，单位秒。长期公开选「年」即可，但不提供「永不过期」——
      // 可过期 + 可注销是限时链接相对永久公开的核心安全价值
      expire_at: expireValue * expireUnitSeconds[expireUnit] + moment().unix(),
    })
      .then(() => {
        setNote('');
        fetchTokens();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setGenerating(false);
      });
  };

  const handleRevoke = (id: number) => {
    deleteSourceToken(id)
      .then(() => {
        message.success(t('sharing_link.revoked'));
        fetchTokens();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const columns = [
    {
      title: t('sharing_link.note'),
      dataIndex: 'note',
      width: 130,
      render: (val: string) => val || '-',
    },
    {
      title: t('sharing_link.link'),
      dataIndex: 'token',
      render: (token: string) => (
        <Space>
          <Typography.Text ellipsis style={{ maxWidth: 240 }}>
            {buildLink(token)}
          </Typography.Text>
          <Tooltip title={t('common:btn.copy')}>
            <CopyOutlined
              onClick={() => {
                copy2ClipBoard(buildLink(token));
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: t('sharing_link.expire_time'),
      dataIndex: 'expire_at',
      width: 170,
      render: (val: number) => {
        const expired = val > 0 && val <= moment().unix();
        return (
          <Typography.Text type={expired ? 'danger' : undefined}>
            {moment.unix(val).format('YYYY-MM-DD HH:mm')}
            {expired ? ` (${t('sharing_link.expired')})` : ''}
          </Typography.Text>
        );
      },
    },
    {
      title: t('sharing_link.create_by'),
      dataIndex: 'create_by',
      width: 100,
    },
    {
      title: t('common:table.operations'),
      width: 70,
      render: (record: SourceTokenItem) => (
        <Popconfirm
          title={t('sharing_link.revoke_confirm')}
          onConfirm={() => {
            handleRevoke(record.id);
          }}
        >
          <a>{t('sharing_link.revoke')}</a>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      {!alwaysAnonymous && (
        <div className='mb-2'>
          <Tooltip title={hasHostIdentVariable ? t('var.hostIdent.invalid2') : undefined}>
            <Checkbox
              style={{ height: 32, lineHeight: '32px' }}
              checked={anonymousChecked}
              disabled={hasHostIdentVariable}
              onChange={(e) => {
                setAnonymousChecked(e.target.checked);
              }}
            >
              {t('sharing_link.allow_anonymous')}
            </Checkbox>
          </Tooltip>
        </div>
      )}
      {allowAnonymous && (
        <>
          <Space wrap className='mb-2'>
            <Input
              style={{ width: 200 }}
              placeholder={t('sharing_link.note_placeholder')}
              value={note}
              maxLength={255}
              onChange={(e) => {
                setNote(e.target.value);
              }}
            />
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
            <Button type='primary' loading={generating} disabled={!expireValue || !_.trim(note)} onClick={handleGenerate}>
              {t('sharing_link.generate')}
            </Button>
          </Space>
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
          <Table<SourceTokenItem> rowKey='id' size='small' columns={columns as any} dataSource={tokens} pagination={false} scroll={{ y: 240 }} />
          <div className='mt-2'>
            <Typography.Text type='secondary'>{t('sharing_link.anonymous_tip')}</Typography.Text>
          </div>
        </>
      )}
    </>
  );
}

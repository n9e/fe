import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox, InputNumber, Select, Space, Input, Button, Radio, Tooltip, Typography, Table, Popconfirm, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';

import { basePrefix } from '@/App';
import { postSourceToken, getSourceTokens, deleteSourceToken, SourceTokenItem } from '@/services/common';
import { copy2ClipBoard } from '@/utils';

// 机器标识变量的探测状态。刻意用三态而不是 boolean：探测是异步的，boolean 的
// 初值必然是某一侧，取 false 就等于「探测返回前默认允许匿名」，那段飞行窗口里
// 用户可以直接签发出一条注定打不开的死链。checking 让调用方无需自己表达「还不知道」
export type HostIdentState = 'checking' | 'allowed' | 'blocked';

interface Props {
  boardId: number;
  // 含机器标识变量的仪表盘依赖登录态接口，禁止匿名分享。
  // 调用方负责探测并传入，任何读取/解析失败都应传 'blocked'（不确定 → 不允许匿名）
  hostIdentState: HostIdentState;
  // 调用方已在外部表达了匿名意图（公开设置里选了「匿名访问」类型），
  // 此时不再重复展示「允许不登录匿名访问」勾选框
  alwaysAnonymous?: boolean;
}

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
  const { boardId, hostIdentState, alwaysAnonymous = false } = props;
  const [anonymousChecked, setAnonymousChecked] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');
  const [expireValue, setExpireValue] = useState<number | null>(30);
  const [expireUnit, setExpireUnit] = useState<string>('day');
  const [themeMode, setThemeMode] = useState<string>('default'); // default, dark, light
  const [generating, setGenerating] = useState<boolean>(false);
  const [tokens, setTokens] = useState<SourceTokenItem[]>([]);

  const expireUnitOptions = React.useMemo(
    () => [
      { label: t('sharing_link.unit_hour'), value: 'hour' },
      { label: t('sharing_link.unit_day'), value: 'day' },
      { label: t('sharing_link.unit_month'), value: 'month' },
      { label: t('sharing_link.unit_year'), value: 'year' },
    ],
    [t],
  );

  // 两个模式的匿名意图来源不同（外部类型选择 / 本地勾选框），但机器标识变量这道
  // 闸门对两者一律生效——早先只在 alwaysAnonymous 分支里 AND 了它，详情页那条
  // 分支漏掉，导致勾上之后即使探测结果是 blocked 也照样能签发
  const allowAnonymous = hostIdentState === 'allowed' && (alwaysAnonymous || anonymousChecked);

  const fetchTokens = useCallback(() => {
    getSourceTokens({ source_type: 'board', source_id: _.toString(boardId) })
      .then((res) => {
        setTokens(res);
      })
      .catch((error) => {
        message.error(t('sharing_link.fetch_failed'));
      });
  }, [boardId, t]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  // 主题是复制链接时附加的展示参数，不属于令牌本身，故对列表里每条链接统一生效
  const buildLink = (token: string) => {
    const themeQuery = themeMode === 'default' ? '' : `&themeMode=${themeMode}`;
    return `${window.location.origin}${basePrefix}/dashboards/share/${boardId}?__token=${token}${themeQuery}`;
  };

  const handleGenerate = () => {
    // 有效期取整：InputNumber 允许键入小数，1.1 小时会算出 3960.0000000000005 这种
    // 浮点秒数，后端 ExpireAt 是 int64，encoding/json 直接报错返回 400
    const expireCount = Math.round(expireValue || 0);
    if (expireCount < 1 || !_.trim(note)) {
      return;
    }
    setGenerating(true);
    postSourceToken({
      source_type: 'board',
      source_id: _.toString(boardId),
      note: _.trim(note),
      // 过期时间戳，单位秒。长期公开选「年」即可，但不提供「永不过期」——
      // 可过期 + 可注销是限时链接相对永久公开的核心安全价值
      expire_at: expireCount * expireUnitSeconds[expireUnit] + moment().unix(),
    })
      .then(() => {
        setNote('');
        fetchTokens();
      })
      .catch((error) => {
        message.error(t('sharing_link.generate_failed'));
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
        message.error(t('sharing_link.revoke_failed'));
      });
  };

  const columns: ColumnsType<SourceTokenItem> = [
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
          <Tooltip title={hostIdentState === 'blocked' ? t('var.hostIdent.invalid2') : undefined}>
            <Checkbox
              style={{ height: 32, lineHeight: '32px' }}
              checked={anonymousChecked}
              disabled={hostIdentState !== 'allowed'}
              onChange={(e) => {
                setAnonymousChecked(e.target.checked);
              }}
            >
              {t('sharing_link.allow_anonymous')}
            </Checkbox>
          </Tooltip>
        </div>
      )}
      {/* 只有「生成」表单受匿名意图与 hostIdent 门控；已签发链接的列表与注销入口
          见下方，无条件渲染 */}
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
              onChange={(val: number | null) => {
                setExpireValue(val);
              }}
              min={1}
              step={1}
              precision={0}
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
        </>
      )}
      {/* 已签发的链接与注销入口无条件渲染：token 一旦签发就与勾选框、公开类型、
          hostIdent 全都无关——后端 boardGet 在 public/登录判定之前先校验 __token，
          只受过期与显式注销约束。把它藏在这些开关后面，等于在最需要紧急注销时
          让入口消失（改公开类型、看板后来加了机器标识变量都会触发） */}
      <Table<SourceTokenItem> rowKey='id' size='small' columns={columns} dataSource={tokens} pagination={false} scroll={{ y: 240 }} />
      <div className='mt-2'>
        <Typography.Text type='secondary'>{t('sharing_link.anonymous_tip')}</Typography.Text>
      </div>
    </>
  );
}

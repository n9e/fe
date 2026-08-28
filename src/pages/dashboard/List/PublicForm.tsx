import React, { useState, useEffect } from 'react';
import { Form, Radio, Modal, Select, Alert, Divider, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import moment from 'moment';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateBoardPublic, getDashboard } from '@/services/dashboardV2';
import { getSourceTokens, deleteSourceToken, SourceTokenItem } from '@/services/common';
import { isJsonObject, parseJson } from '@/pages/dashboard/utils/json';

import SharingLinkSection, { HostIdentState } from './SharingLinkSection';

interface BusinessGroup {
  id: number;
  name: string;
}

interface PublicDashboardValues {
  public?: number;
  public_cate?: number;
  bgids?: number[];
}

interface DashboardVariableConfig {
  var?: Array<{ type: string }>;
}

interface IProps {
  boardId: number;
  busiGroups: BusinessGroup[];
  initialValues: PublicDashboardValues;
  onOk: () => void;
}

function PublicForm(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, boardId, busiGroups, initialValues, onOk } = props;
  const [form] = Form.useForm();
  const publicVal = Form.useWatch('public', form);
  const publicCate = Form.useWatch('public_cate', form);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardVariableConfig>({});
  // 用独立状态表达「读取中 / 读到了 / 读失败」，不要往 dashboardConfig 里塞
  // 伪造的 hostIdent 变量来表达失败——那会让下面的 Alert 对用户断言「本仪表盘
  // 配置了机器标识变量」，而实际只是接口抖了一下，且用户无从分辨、也没有重试入口
  const [configState, setConfigState] = useState<'checking' | 'loaded' | 'failed'>('checking');
  const [submitting, setSubmitting] = useState(false);
  const hasHostIdentVariable = _.some(dashboardConfig.var, (item) => {
    return item.type === 'hostIdent';
  });
  // 读不到配置一律按「不确定 → 不允许匿名」处理
  const hostIdentState: HostIdentState =
    configState === 'checking' ? 'checking' : configState === 'failed' || hasHostIdentVariable ? 'blocked' : 'allowed';

  useEffect(() => {
    if (boardId) {
      setConfigState('checking');
      getDashboard(boardId)
        .then((res) => {
          // parseJson 解析失败时返回 undefined 而不是抛异常，所以「读失败」必须由返回值判定。
          // 沿用 try/catch 会让 failed 分支变成死代码，配置读不出来的看板反而被当成
          // 「确认没有机器标识变量」放行匿名分享，正好与这里要保证的失败即关闭相反
          const parsed = parseJson(res.configs);
          if (!isJsonObject(parsed)) {
            setDashboardConfig({});
            setConfigState('failed');
            return;
          }
          const variables = Array.isArray(parsed.var) ? parsed.var : [];
          setDashboardConfig({
            var: variables.filter(isJsonObject).flatMap((item) => (typeof item.type === 'string' ? [{ type: item.type }] : [])),
          });
          setConfigState('loaded');
        })
        .catch(() => {
          setDashboardConfig({});
          setConfigState('failed');
        });
    } else {
      setDashboardConfig({});
      setConfigState('loaded');
    }
  }, [boardId]);

  const submit = (values: PublicDashboardValues) => {
    return updateBoardPublic(boardId, values).then(() => {
      onOk();
      destroy();
    });
  };

  const revokeAll = (items: SourceTokenItem[]) => {
    return Promise.all(_.map(items, (item) => deleteSourceToken(item.id)));
  };

  // 匿名链接的有效性与公开设置无关：后端 boardGet 在 public/登录判定之前先校验 __token，
  // 所以把看板改成非匿名类型后，已签发的链接照样能免登录打开。改成非匿名时在保存前拦一道，
  // 让使用者显式决定是否连同注销，避免留下「看板已不公开、匿名链接仍有效」的错觉。
  //
  // 判定放在保存时而不是点单选框时：单选框只是未提交的表单值，用户还可能改回来或直接取消，
  // 而注销掉的令牌无法恢复。
  // 令牌列表现取而不用弹窗打开时的快照——SharingLinkSection 就在同一个弹窗里，期间可能刚
  // 签发过新链接。
  const submitWithRevokeCheck = (values: PublicDashboardValues) => {
    return getSourceTokens({ source_type: 'board', source_id: _.toString(boardId) }).then(
      (tokens) => {
        const alive = _.filter(tokens, (item) => item.expire_at <= 0 || item.expire_at > moment().unix());
        if (_.isEmpty(alive)) {
          return submit(values);
        }
        Modal.confirm({
          title: t('sharing_link.revoke_all_confirm_title'),
          content: t('sharing_link.revoke_all_confirm_content', { num: alive.length }),
          okText: t('sharing_link.revoke_all_ok'),
          okButtonProps: { danger: true },
          cancelText: t('common:btn.cancel'),
          // 先注销再保存：反过来一旦注销失败，就正好留下这次要消除的那个状态。
          // 失败时 reject 让确认框停在原地，避免用户以为已经注销干净
          onOk: () =>
            revokeAll(tokens)
              .then(() => submit(values))
              .catch((error) => {
                return Promise.reject(error);
              }),
        });
      },
      (error) => {
        // 读不到令牌列表时仍然保存：卡住不保存等于把看板继续留在公开状态，暴露面反而更大。
        // 但必须告诉使用者这次没能确认，否则会以为链接已经跟着失效
        console.error(error);
        message.warning(t('sharing_link.revoke_all_check_failed'));
        return submit(values);
      },
    );
  };

  return (
    <Modal
      visible={visible}
      width={800}
      title={t('public.name')}
      onCancel={destroy}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            setSubmitting(true);
            const nextAnonymous = values.public === 1 && values.public_cate === 0;
            return (nextAnonymous ? submit(values) : submitWithRevokeCheck(values)).finally(() => {
              setSubmitting(false);
            });
          })
          .catch((error) => {
            // 校验失败由 Form 自己提示，接口失败有全局错误通知，这里只保证不静默吞掉
            console.error(error);
          });
      }}
      okButtonProps={{
        loading: submitting,
        disabled: hostIdentState !== 'allowed' && publicVal === 1 && publicCate === 0,
      }}
    >
      <Form
        layout='vertical'
        form={form}
        initialValues={{
          ...initialValues,
          bgids: initialValues.bgids || [], // TODO 兼容接口返回的 null 值
        }}
      >
        <Form.Item label={t('public.name')} name='public'>
          <Radio.Group>
            <Radio value={0}>{t('public.unpublic')}</Radio>
            <Radio value={1}>{t('public.name')}</Radio>
          </Radio.Group>
        </Form.Item>
        {publicVal === 1 && (
          <>
            <Form.Item label={t('public.public_cate')} name='public_cate'>
              <Radio.Group>
                <Radio value={0}>{t('public.cate.0')}</Radio>
                <Radio value={1}>{t('public.cate.1')}</Radio>
                <Radio value={2}>{t('public.cate.2')}</Radio>
              </Radio.Group>
            </Form.Item>
            {publicCate === 2 && (
              <Form.Item label={t('public.bgids')} name='bgids'>
                <Select
                  showSearch
                  optionFilterProp='label'
                  mode='multiple'
                  options={_.map(busiGroups, (item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  })}
                />
              </Form.Item>
            )}
          </>
        )}
        {/* 两条原因分开说：真有机器标识变量 vs 配置没读到，用户需要分辨得出 */}
        {hasHostIdentVariable && publicVal === 1 && publicCate === 0 && <Alert message={t('var.hostIdent.invalid2')} type='warning' />}
        {configState === 'failed' && publicVal === 1 && publicCate === 0 && <Alert message={t('sharing_link.config_load_failed')} type='warning' />}
      </Form>
      {/* 匿名访问在新版本由限时分享链接承载，故仅在该类型下展开链接生成器；
          「不公开」等其他类型如需临时分享，走仪表盘详情页的分享入口 */}
      {publicVal === 1 && publicCate === 0 && (
        <>
          <Divider style={{ margin: '16px 0 12px' }} />
          <div className='mb-1'>
            <Typography.Text strong>{t('sharing_link.title_anonymous')}</Typography.Text>
          </div>
          <div className='mb-2'>
            <Typography.Text type='secondary'>{t('sharing_link.recommend_tip')}</Typography.Text>
          </div>
          <SharingLinkSection boardId={boardId} hostIdentState={hostIdentState} alwaysAnonymous />
        </>
      )}
    </Modal>
  );
}

export default ModalHOC<IProps>(PublicForm);

import React, { useState, useEffect } from 'react';
import { Form, Radio, Modal, Select, Alert, Divider, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateBoardPublic, getDashboard } from '@/services/dashboardV2';

import SharingLinkSection, { HostIdentState } from './SharingLinkSection';

interface IProps {
  boardId: number;
  busiGroups: any[];
  initialValues: any;
  onOk: () => void;
}

function PublicForm(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('dashboard');
  const { visible, destroy, boardId, busiGroups, initialValues, onOk } = props;
  const [form] = Form.useForm();
  const publicVal = Form.useWatch('public', form);
  const publicCate = Form.useWatch('public_cate', form);
  const [dashboardConfig, setDashboardConfig] = useState<any>({});
  // 用独立状态表达「读取中 / 读到了 / 读失败」，不要往 dashboardConfig 里塞
  // 伪造的 hostIdent 变量来表达失败——那会让下面的 Alert 对用户断言「本仪表盘
  // 配置了机器标识变量」，而实际只是接口抖了一下，且用户无从分辨、也没有重试入口
  const [configState, setConfigState] = useState<'checking' | 'loaded' | 'failed'>('checking');
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
          try {
            setDashboardConfig(JSON.parse(res.configs));
            setConfigState('loaded');
          } catch (e) {
            console.error(e);
            setDashboardConfig({});
            setConfigState('failed');
          }
        })
        .catch((error) => {
          console.error(error);
          setDashboardConfig({});
          setConfigState('failed');
        });
    } else {
      setDashboardConfig({});
      setConfigState('loaded');
    }
  }, [boardId]);

  return (
    <Modal
      visible={visible}
      width={800}
      title={t('public.name')}
      onCancel={destroy}
      onOk={() => {
        form.validateFields().then((values) => {
          updateBoardPublic(boardId, values).then(() => {
            onOk();
            destroy();
          });
        });
      }}
      okButtonProps={{
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

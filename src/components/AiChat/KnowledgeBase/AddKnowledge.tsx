import React, { useEffect, useState } from 'react';
import { Button, Checkbox, Col, Form, FormInstance, Input, InputNumber, message, Modal, Radio, Row, Select, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import MarkdownEdit from '@/components/MarkdownEdit';
import DashboardConfig from './DashboardConfig';
import Footer from '../ChatContent/Footer';
import { EMode } from '../config';
import { upsertKnowledge } from '../services';
import TipsBox from '@/components/TipsBox';
import RuleItem from '@/components/AiChat/components/RuleItem';
/** @ts-ignore */
import FiremapTreeSelector from '@/Packages/Outfire/pages/Level2/Alert/RelatedMetric';
/** @ts-ignore */
import { handleSubmitCard } from '@/Packages/Outfire/pages/Level2/Alert/RelatedMetric';

interface IProps {
  knowledgeForm: any;
  modeChange: (mode: EMode) => void;
}
export default function AddKnowledge(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { knowledgeForm, modeChange } = props;

  const [isFormEdit, setIsFormEdit] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const knowledgeSave = () => {
    knowledgeForm.validateFields().then((values) => {
      setConfirmLoading(true);
      const data = {
        ...values,
        firemap: handleSubmitCard(values.firemap),
      };
      upsertKnowledge(data)
        .then((res) => {
          message.success(t('saveSuccess'));
          setIsFormEdit(false);
          // modeChange(EMode.KnowledgeBase);
          modeChange(EMode.KnowledgeBase);
        })
        .finally(() => {
          setConfirmLoading(false);
        });
    });
  };

  const handleCancel = () => {
    if (isFormEdit) {
      Modal.confirm({
        title: t('closeTips'),
        zIndex: 1001,
        onOk: () => {
          setIsFormEdit(false);

          modeChange(EMode.KnowledgeBase);
        },
      });
    } else {
      modeChange(EMode.KnowledgeBase);
    }
  };

  return (
    <>
      <div className='ai-chat-body'>
        <Form
          form={knowledgeForm}
          onValuesChange={(changedValues, allValues) => {
            setIsFormEdit(true);
          }}
        >
          <Form.Item name={'id'} hidden>
            <InputNumber />
          </Form.Item>
          <RuleItem step={1} title={t('knowledgeBase.form.step1Title')}>
            <Form.Item name={'name'} validateTrigger={['onBlur']} rules={[{ required: true, message: t('knowledgeBase.form.namePlaceholder') }]}>
              <Input placeholder={t('knowledgeBase.form.namePlaceholder')} />
            </Form.Item>
          </RuleItem>
          <RuleItem step={2} title={t('knowledgeBase.form.step2Title')}>
            <Form.Item name={'target'} initialValue={'firemap'}>
              <Radio.Group>
                <Radio value={'firemap'}>{t('firemap')}</Radio>
                <Radio value={'dashboard'}>{t('dashboard')}</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(cur, pre) => cur.target !== pre.target}>
              {() => {
                const curTarget = knowledgeForm.getFieldValue('target');
                return curTarget === 'firemap' ? (
                  <Form.Item name={'firemap'} initialValue={[]}>
                    <FiremapTreeSelector cardDisplay={false} />
                  </Form.Item>
                ) : (
                  <>
                    <DashboardConfig />
                  </>
                );
              }}
            </Form.Item>
          </RuleItem>

          <RuleItem step={3} title={t('knowledgeBase.form.step3Title')} showLine={false}>
            <TipsBox
              tips={
                <>
                  <div>{t('knowledgeBase.form.dataTips1')}</div>
                  <div>{t('knowledgeBase.form.dataTips2')}</div>
                  <div>{t('knowledgeBase.form.dataTips3')}</div>
                </>
              }
            />
            <Form.Item name={'data'} rules={[{ required: true, message: t('knowledgeBase.form.dataPlaceholder') }]}>
              <MarkdownEdit />
            </Form.Item>
          </RuleItem>
        </Form>
      </div>

      <Footer>
        <Space>
          <Button
            type='primary'
            onClick={() => {
              knowledgeSave();
            }}
            loading={confirmLoading}
          >
            {t('confirm')}
          </Button>
          <Button
            onClick={() => {
              handleCancel();
            }}
          >
            {t('cancel')}
          </Button>
        </Space>
      </Footer>
    </>
  );
}

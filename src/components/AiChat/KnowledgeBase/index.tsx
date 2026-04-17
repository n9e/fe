import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import './stye.less';
import { EMode } from '../config';
import _ from 'lodash';
import KnowledgeBaseList from './KnowledgeBaseList';
import AddKnowledge from './AddKnowledge';

interface IProps {
  mode: EMode;
  modeChange: (mode: EMode) => void;
}

export default function KnowledgeBase(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { mode, modeChange } = props;
  const [knowledgeForm] = Form.useForm();

  return (
    <>
      <div className='ai-chat-body'>
        {mode === EMode.KnowledgeBase && <KnowledgeBaseList modeChange={modeChange} knowledgeForm={knowledgeForm} />}
        {[EMode.KnowledgeBaseAdd, EMode.KnowledgeBaseEdit].includes(mode) && <AddKnowledge knowledgeForm={knowledgeForm} modeChange={modeChange} />}
      </div>
    </>
  );
}

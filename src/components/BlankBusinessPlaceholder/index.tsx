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
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { InfoCircleOutlined } from '@ant-design/icons';
import './locale';

interface Props {
  text: string;
}
export default function BlankBusinessPlaceholder(props: Props) {
  const { t } = useTranslation();
  const { text } = props;

  return (
    <div className='blank-busi-holder'>
      <p style={{ textAlign: 'left', fontWeight: 'bold' }}>
        <InfoCircleOutlined style={{ color: '#1473ff' }} /> {t('BlankBusinessPlaceholder:title')}
      </p>
      <p>
        <Trans ns='BlankBusinessPlaceholder' i18nKey='BlankBusinessPlaceholder:content' components={{ a: <Link to='/busi-groups' /> }} />
      </p>
    </div>
  );
}

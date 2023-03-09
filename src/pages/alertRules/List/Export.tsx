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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Input } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { download, copyToClipBoard } from '@/utils';

interface IProps {
  data: string;
}

function Export(props: IProps & ModalWrapProps) {
  const { t } = useTranslation('alertRules');
  const { visible, destroy } = props;
  const [data, setData] = useState(props.data);
  return (
    <Modal
      title={t('batch.export.title')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <p>
        <a
          onClick={() => {
            download([data], 'download.json');
          }}
        >
          Download.json
        </a>
        <a style={{ float: 'right' }} onClick={() => copyToClipBoard(data, (val) => val)}>
          <CopyOutlined />
          {t('batch.export.copy')}
        </a>
      </p>
      <Input.TextArea
        value={data}
        onChange={(e) => {
          setData(e.target.value);
        }}
        rows={15}
      />
    </Modal>
  );
}

export default ModalHOC(Export);

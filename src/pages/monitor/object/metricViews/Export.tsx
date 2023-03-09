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
import _ from 'lodash';
import { Input, Modal } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { download, copyToClipBoard } from '@/utils';

interface IProps {
  data: any;
}

function Export(props: ModalWrapProps & IProps) {
  const { visible, destroy, data } = props;
  const { t } = useTranslation('objectExplorer');
  let str = data;
  try {
    str = JSON.stringify(JSON.parse(data), null, 4);
  } catch (e) {
    console.log(e);
  }

  return (
    <Modal
      title={t('export_title')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <>
        <div style={{ marginBottom: 10 }}>
          <a
            onClick={() => {
              download([data], 'download.json');
            }}
          >
            Download.json
          </a>
          <a style={{ float: 'right' }} onClick={() => copyToClipBoard(data, t)}>
            <CopyOutlined />
            {t('copy')}
          </a>
        </div>
        <Input.TextArea value={str} rows={10} />
      </>
    </Modal>
  );
}

export default ModalHOC(Export);

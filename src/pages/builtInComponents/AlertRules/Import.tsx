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
import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';

import ImportForm, { ImportFormProps } from './ImportForm';

/**
 * 弹窗形态的导入入口（集成中心在用）。表单本体在 ImportForm，
 * 数据源引导的模板匹配则把同一个 ImportForm 内联在 Tab 里，不再叠第二层弹窗。
 */
function Import(props: ImportFormProps & ModalWrapProps) {
  const { t } = useTranslation('builtInComponents');
  const { visible, destroy, onSuccess, ...formProps } = props;

  return (
    <Modal
      title={t('import_to_buisGroup')}
      visible={visible}
      onCancel={() => {
        destroy();
      }}
      footer={null}
    >
      <ImportForm
        {...formProps}
        onSuccess={() => {
          onSuccess?.();
          destroy();
        }}
      />
    </Modal>
  );
}

// 显式给出泛型参数：T 处在 `T & ModalWrapProps` 交叉位置，裸写 ModalHOC(Import) 时 TS 推不出来，
// 调用方入参等于不做检查（notificationRulesAuthorized 漏传就是这么溜进去的）
export default ModalHOC<ImportFormProps>(Import);

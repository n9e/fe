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
import { Drawer, Segmented } from 'antd';
import { useTranslation } from 'react-i18next';

import ResultContent from '../ResultContent';

interface Props {
  title?: string;
  visible: boolean;
  onClose: () => void;
  taskId: string;
  busiId: number;
  hideCloneTask?: boolean;
  metaAlias?: string;
  initialOutputMode?: { outputType: 'stdout' | 'stderr'; host?: string };
  onOutputOpen?: (info: { outputType: 'stdout' | 'stderr'; host?: string }) => void;
  onOutputClose?: (info: { outputType: 'stdout' | 'stderr'; host?: string }) => void;
}

const sizeWidthMap = {
  small: '35%',
  middle: '55%',
  large: '75%',
};

type SizeType = 'small' | 'middle' | 'large';

export default function ResultDrawer(props: Props) {
  const { t } = useTranslation('navigableDrawer');
  const { title, visible, onClose, taskId, busiId, hideCloneTask, metaAlias, initialOutputMode, onOutputOpen, onOutputClose } = props;
  const [size, setSize] = useState<SizeType>('middle');

  return (
    <Drawer
      width={sizeWidthMap[size]}
      title={title}
      placement='right'
      onClose={onClose}
      visible={visible}
      extra={
        <Segmented
          options={[
            { label: t('size.small'), value: 'small' },
            { label: t('size.middle'), value: 'middle' },
            { label: t('size.large'), value: 'large' },
          ]}
          value={size}
          onChange={(value) => setSize(value as SizeType)}
        />
      }
    >
      {visible && (
        <ResultContent
          taskId={taskId}
          busiId={busiId}
          hideCloneTask={hideCloneTask}
          metaAlias={metaAlias}
          initialOutputMode={initialOutputMode}
          onOutputOpen={onOutputOpen}
          onOutputClose={onOutputClose}
        />
      )}
    </Drawer>
  );
}

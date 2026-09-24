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
import { Button } from 'antd';
import { LineChartOutlined, ReloadOutlined } from '@ant-design/icons';

import { createLazyComponent } from '../../Renderer/registry/lazyComponent';
import { getPanelTypeDefinition } from '../../Renderer/registry';
import type { PanelOptionsProps } from '../../Renderer/registry';
import type { ITarget, IType } from '../../types';

interface OptionsProps {
  type: IType;
  targets: ITarget[];
}

/**
 * 选项面板组件缓存：同一类型只创建一次可重试的加载组件，
 * 编辑过程中切换图表类型不会重复构造组件实例。
 */
const optionsComponentCache = new Map<string, React.ComponentType<PanelOptionsProps>>();

/** 选项面板加载中的局部占位。 */
function OptionsLoading() {
  const { t } = useTranslation('dashboard');
  return (
    <div className='flex items-center justify-center py-8' role='status' aria-label={t('common:loading')} data-testid='panel-options-loading'>
      <LineChartOutlined style={{ fontSize: 24, opacity: 0.18 }} />
    </div>
  );
}

/**
 * 选项面板加载失败：在表单内就地提示并可重试。
 *
 * 编辑器不套错误边界，若让失败态冒泡会导致整个编辑弹窗（乃至整页）不可用。
 */
function OptionsLoadError({ error, onRetry }: { error: string; onRetry: () => void }) {
  const { t } = useTranslation('dashboard');
  return (
    <div className='flex flex-col items-center justify-center gap-2 py-8 text-center' role='alert' data-testid='panel-options-load-error'>
      <div>{t('detail.optionsLoadFailed', { defaultValue: '图表选项加载失败' })}</div>
      <div className='max-w-full break-all opacity-60'>{error}</div>
      <Button size='small' icon={<ReloadOutlined />} onClick={onRetry}>
        {t('detail.retry', { defaultValue: '重试' })}
      </Button>
    </div>
  );
}

/** 取得（或创建）某类型的懒加载选项面板；未注册类型返回 null。 */
function getLazyOptionsComponent(type: IType | string) {
  const definition = getPanelTypeDefinition(type);
  if (!definition) return null;
  let optionsComponent = optionsComponentCache.get(definition.type);
  if (!optionsComponent) {
    optionsComponent = createLazyComponent<PanelOptionsProps>(definition.loadOptions, { Loading: OptionsLoading, Error: OptionsLoadError });
    optionsComponentCache.set(definition.type, optionsComponent);
  }
  return optionsComponent;
}

/**
 * 图表选项面板入口。
 *
 * 选项面板通过注册表的动态加载器引入，避免查看态因为引用注册表而打包编辑器代码；
 * 加载失败只在选项区域内提示并可重试。
 */
export default function index({ type, targets }: OptionsProps) {
  const { t } = useTranslation('dashboard');
  const OptionsCpt = getLazyOptionsComponent(type);

  if (!OptionsCpt) {
    return <div>{`${t('detail.invalidPanelType')} ${type}`}</div>;
  }

  return <OptionsCpt targets={targets} />;
}

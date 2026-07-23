import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';

import { getAntdLocale } from '@/utils/antdLocale';

export interface ModalWrapProps {
  visible: boolean;
  destroy: () => void;
}

export default function ModalHOC<T>(Component: React.FC<T & ModalWrapProps>) {
  return function ModalControl(
    config: T & {
      language?: string;
    },
  ) {
    const div = document.createElement('div');
    document.body.appendChild(div);
    div.className = 'theme-dark';
    const root: Root = createRoot(div);

    function destroy() {
      root.unmount();
      if (div.parentNode) {
        div.parentNode.removeChild(div);
      }
    }

    const language = config.language ? config.language : window.localStorage.getItem('language') || 'zh_CN';

    function render(props: any) {
      root.render(
        <ConfigProvider locale={getAntdLocale(language)}>
          <Router>
            <Component {...props} />
          </Router>
        </ConfigProvider>,
      );
    }

    render({ ...config, visible: true, destroy });

    return {
      destroy,
    };
  };
}

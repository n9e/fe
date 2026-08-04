import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import _ from 'lodash';
import { ConfigProvider } from 'antd';

import { getAntdLocale } from '@/utils/antdLocale';
import { CommonStateContext, ICommonState } from '@/App';

export interface ModalWrapProps {
  visible: boolean;
  destroy: () => void;
}

export default function ModalHOC<T>(Component: React.FC<T & ModalWrapProps>) {
  return function ModalControl(
    config: T & {
      language?: string;
      /**
       * 这棵树是 createRoot 挂在 body 上的游离节点，拿不到 App 里的 CommonStateContext，
       * 于是 useContext 恒为 `{}`（createContext 的默认值）—— useIsAuthorized 恒为 false、
       * busiGroups / datasourceList 恒为 undefined，弹窗里的子组件会被误判成「没权限 / 没数据」。
       * 调用方把 useContext(CommonStateContext) 的值原样传进来即可接上；开弹窗那一刻的快照，
       * 不随外面刷新而更新，对生命周期很短的弹窗够用。
       */
      commonState?: ICommonState;
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
    // commonState 是给这棵树补 Provider 用的，不往业务组件的 props 里塞
    const { commonState, ...componentProps } = config;

    function render(props: any) {
      const tree = (
        <ConfigProvider locale={getAntdLocale(language)}>
          <Router>
            <Component {...props} />
          </Router>
        </ConfigProvider>
      );
      root.render(commonState ? <CommonStateContext.Provider value={commonState}>{tree}</CommonStateContext.Provider> : tree);
    }

    render({ ...componentProps, visible: true, destroy });

    return {
      destroy,
    };
  };
}

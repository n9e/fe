import { createContext } from 'react';

interface ICommonState {
  ignoreNextOutsideClick: () => void; // 标记下一次外部点击忽略
}

const CommonStateContext = createContext({} as ICommonState);

export default CommonStateContext;

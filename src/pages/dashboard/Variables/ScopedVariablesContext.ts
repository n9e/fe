import { createContext } from 'react';

import type { ScopedVariables } from '../types';

/** 面板内部的变量引用默认继承当前 repeat 实例的取值。 */
export const ScopedVariablesContext = createContext<ScopedVariables | undefined>(undefined);

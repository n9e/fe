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
interface window {
  '&': any;
  JQuery: {
    daterangepicker: Function;
  };
}
declare module '*.md' {
  const content: any;
  export default content;
}

declare module 'plus:/pages/LogExploreLinkSetting/components/DrilldownBtn' {
  import type { FC } from 'react';

  export type DrilldownMode = 'list' | 'add' | 'edit' | 'clone';

  export interface DrilldownInitialValues {
    cate?: string;
    datasource_id?: number;
    resource?: Record<string, any>;
    query?: any;
    logMode?: string;
    linkField?: string;
    linkName?: string;
    [key: string]: any;
  }

  const DrilldownBtn: FC<{
    dataSourceId?: number;
    type?: 'button' | 'text' | 'none';
    visible?: boolean;
    onVisibleChange?: (visible: boolean) => void;
    initialMode?: DrilldownMode;
    initialValues?: DrilldownInitialValues;
  }>;

  export default DrilldownBtn;
}

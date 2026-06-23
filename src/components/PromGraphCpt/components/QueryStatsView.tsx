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
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Space } from 'antd';

export interface QueryStats {
  loadTime: number;
  resolution?: number;
  resultSeries: number;
}

const QueryStatsView: FC<QueryStats> = (props) => {
  const { t } = useTranslation('promGraphCpt');
  const { loadTime, resolution, resultSeries } = props;

  return (
    <div className='query-stats'>
      <Space>
        {t('load_time', { time: loadTime })}
        {resolution && t('resolution', { resolution })}
        {t('result_series', { count: resultSeries })}
      </Space>
    </div>
  );
};

export default QueryStatsView;

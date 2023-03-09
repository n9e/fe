import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { sourceLogoMap } from './config';
import { getDataSourcePluginList } from './services';
import SourceCards from './components/SourceCards';
import TableSource from './components/TableSource';
import Detail from './Detail';
import Form from './Form';
import './locale';

export { Form };

export default function index() {
  const { t } = useTranslation('datasourceManage');
  const [pluginList, setPluginList] = useState<any[]>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState();

  useEffect(() => {
    getDataSourcePluginList().then((res) => {
      setPluginList(
        _.map(res, (item) => {
          return {
            name: item.plugin_type_name,
            category: item.category,
            type: item.plugin_type,
            logo: sourceLogoMap[item.plugin_type],
          };
        }),
      );
    });
  }, []);

  return (
    <PageLayout title={t('title')}>
      <div className='srm'>
        <SourceCards sourceMap={pluginList} urlPrefix='help/source' />
        <div className='page-title'>{t('list_title')}</div>
        {pluginList && (
          <TableSource
            pluginList={pluginList}
            nameClick={(record) => {
              setDetailVisible(true);
              setDetailData(record);
            }}
          />
        )}
        {detailVisible && (
          <Detail
            visible={detailVisible}
            data={detailData}
            onClose={() => {
              setDetailVisible(false);
            }}
          />
        )}
      </div>
    </PageLayout>
  );
}

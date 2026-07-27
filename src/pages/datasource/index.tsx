import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Input, Button, Modal, Space } from 'antd';
import { useDebounce } from 'ahooks';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { getCateByValue } from '@/components/AdvancedWrap/utils';
import { getDataSourcePluginList } from './services';
import SourceCards from './components/SourceCards';
import TableSource from './components/TableSource';
import Detail from './Detail';
import Form from './Form';
import GrafanaImportModal from './components/GrafanaImportModal';
import './locale';
import { SearchOutlined } from '@ant-design/icons';
// @ts-ignore
import useIsPlus from 'plus:/components/useIsPlus';

export { Form };

export default function index() {
  const { t } = useTranslation('datasourceManage');
  const isPlus = useIsPlus();
  const [pluginList, setPluginList] = useState<any[]>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState();
  const [searchVal, setSearchVal] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchVal, { wait: 500 });
  const [chooseDataSourceTypeModalVisible, setChooseDataSourceTypeModalVisible] = useState(false);
  const [grafanaImportVisible, setGrafanaImportVisible] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  useEffect(() => {
    getDataSourcePluginList().then((res) => {
      setPluginList(
        _.map(res, (item) => {
          const logoSrc = getCateByValue(item.plugin_type)?.logo;
          return {
            name: item.plugin_type_name,
            category: item.category,
            type: item.plugin_type,
            logo: logoSrc,
          };
        }),
      );
    });
  }, []);

  return (
    <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/datasource/'>
      <div>
        <div
          className='fc-border'
          style={{
            padding: 16,
          }}
        >
          <div
            className='mb-4'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Input
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              placeholder={t('search_placeholder')}
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
              }}
            />
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  setChooseDataSourceTypeModalVisible(true);
                }}
              >
                {t('common:btn.add')}
              </Button>
              {isPlus && <Button onClick={() => setGrafanaImportVisible(true)}>{t('import_grafana.entry')}</Button>}
            </Space>
          </div>
          {pluginList && (
            <TableSource
              key={listRefreshKey}
              debouncedSearchValue={debouncedSearchValue}
              pluginList={pluginList}
              nameClick={(record) => {
                setDetailVisible(true);
                setDetailData(record);
              }}
              onAdd={() => {
                setChooseDataSourceTypeModalVisible(true);
              }}
              onImportGrafana={isPlus ? () => setGrafanaImportVisible(true) : undefined}
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
      </div>
      <Modal
        title={t('chooseDataSourceType')}
        visible={chooseDataSourceTypeModalVisible}
        destroyOnClose
        width={960}
        footer={null}
        onCancel={() => {
          setChooseDataSourceTypeModalVisible(false);
        }}
      >
        <SourceCards sourceMap={pluginList} urlPrefix='datasources' />
      </Modal>
      <GrafanaImportModal
        visible={grafanaImportVisible}
        onClose={() => setGrafanaImportVisible(false)}
        onImported={() => setListRefreshKey((k) => k + 1)}
      />
    </PageLayout>
  );
}

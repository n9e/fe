import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import { Input, Button, Modal, Space } from 'antd';
import { useDebounce } from 'ahooks';
import { useHistory, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
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

export { Form };

export default function index() {
  const { t } = useTranslation('datasourceManage');
  const history = useHistory();
  const location = useLocation<{ openAddModal?: boolean } | undefined>();
  const { profile } = useContext(CommonStateContext);
  // 数据源的新增/导入/管理均为 admin 操作(后端 upsert/import 走 rt.admin())，非 admin 隐藏入口。
  const isAdmin = !!profile.roles?.includes('Admin');
  const [pluginList, setPluginList] = useState<any[]>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState();
  const [searchVal, setSearchVal] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchVal, { wait: 500 });
  // 新增入口本身是 admin 专属，带回来的意图也只对 admin 生效
  const [chooseDataSourceTypeModalVisible, setChooseDataSourceTypeModalVisible] = useState(isAdmin && !!location.state?.openAddModal);
  const [grafanaImportVisible, setGrafanaImportVisible] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  // 保存结果弹窗的「继续添加数据源」带着意图回来；消费掉即清，避免刷新后又弹一次
  useEffect(() => {
    if (location.state?.openAddModal) {
      history.replace({ pathname: location.pathname, state: undefined });
    }
  }, []);

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
              {isAdmin && (
                <Button
                  type='primary'
                  onClick={() => {
                    setChooseDataSourceTypeModalVisible(true);
                  }}
                >
                  {t('common:btn.add')}
                </Button>
              )}
              {isAdmin && <Button onClick={() => setGrafanaImportVisible(true)}>{t('import_grafana.entry')}</Button>}
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
              onAdd={isAdmin ? () => setChooseDataSourceTypeModalVisible(true) : undefined}
              onImportGrafana={isAdmin ? () => setGrafanaImportVisible(true) : undefined}
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

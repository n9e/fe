import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Input, Button, Modal } from 'antd';
import { useDebounce } from 'ahooks';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { allCates } from '@/components/AdvancedWrap/utils';
import { getDataSourcePluginList } from './services';
import SourceCards from './components/SourceCards';
import TableSource from './components/TableSource';
import Detail from './Detail';
import Form from './Form';
import './locale';
import { SearchOutlined } from '@ant-design/icons';

export { Form };

export default function index() {
  const { t } = useTranslation('datasourceManage');
  const [pluginList, setPluginList] = useState<any[]>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState();
  const [searchVal, setSearchVal] = useState<string>('');
  const debouncedSearchValue = useDebounce(searchVal, { wait: 500 });
  const [chooseDataSourceTypeModalVisible, setChooseDataSourceTypeModalVisible] = useState(false);

  useEffect(() => {
    getDataSourcePluginList().then((res) => {
      setPluginList(
        _.map(res, (item) => {
          const logoSrc = _.find(allCates, { value: item.plugin_type })?.logo;
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
    <PageLayout title={t('title')}>
      <div>
        <div
          className='n9e-border-base'
          style={{
            padding: 16,
          }}
        >
          <div
            className='mb2'
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
            <Button
              type='primary'
              onClick={() => {
                setChooseDataSourceTypeModalVisible(true);
              }}
            >
              {t('common:btn.add')}
            </Button>
          </div>
          {pluginList && (
            <TableSource
              debouncedSearchValue={debouncedSearchValue}
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
        <SourceCards sourceMap={pluginList} urlPrefix='help/source' />
      </Modal>
    </PageLayout>
  );
}

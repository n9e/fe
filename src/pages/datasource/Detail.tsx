import React, { useContext, useMemo } from 'react';
import _ from 'lodash';
import { Button, Drawer, Space, Tag } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import Code from '@/components/Code';
import { CommonStateContext } from '@/App';
import { allCates, getCateDisplayLabel, Cate } from '@/components/AdvancedWrap/utils';

import Detail from './Datasources/Detail';
import { getNextActions, getPrimaryExploreAction } from './nextActions';
import NextActionButton from './components/NextActionButton';
import './index.less';

interface Props {
  data: any;
  visible: boolean;
  onClose: () => void;
}

export default function TimeSeriesDetail(props: Props) {
  const { t, i18n } = useTranslation('datasourceManage');
  const { data, visible, onClose } = props;
  const history = useHistory();
  const { isPlus } = useContext(CommonStateContext);

  const cate = useMemo(() => _.find(allCates, { value: data?.plugin_type }) as Cate | undefined, [data?.plugin_type]);
  const actions = useMemo(() => getNextActions(cate, data?.id, isPlus), [cate, data?.id, isPlus]);
  const exploreAction = useMemo(() => getPrimaryExploreAction(cate, data?.id, isPlus), [cate, data?.id, isPlus]);

  const goto = (url: string) => {
    onClose();
    history.push(url);
  };

  return (
    <Drawer
      width={584}
      bodyStyle={{ padding: 16 }}
      title={
        <Space size={8}>
          <span>{data.name}</span>
          <Tag className='m-0'>{getCateDisplayLabel(cate, i18n.language) || data.plugin_type}</Tag>
        </Space>
      }
      placement='right'
      onClose={onClose}
      visible={visible}
      footer={
        <Space>
          <NextActionButton action={exploreAction} label={t('detail_actions.explore')} hint={t('result.explore_hint')} type='primary' />
          <NextActionButton action={_.find(actions, { key: 'create_alert' })} label={t('result.create_alert')} hint={t('result.create_alert_hint')} />
          <NextActionButton action={_.find(actions, { key: 'create_dashboard' })} label={t('result.create_dashboard')} hint={t('result.create_dashboard_hint')} />
          <Button
            onClick={() => {
              goto(`/datasources/edit/${data.plugin_type}/${data.id}`);
            }}
          >
            {t('common:btn.edit')}
          </Button>
        </Space>
      }
    >
      <div>
        <div className='page-title'>{t('id')}</div>
        <Code>{data.id}</Code>
        <Detail data={data} />
        {data.description && (
          <>
            <div className='page-title'>{t('description')}</div>
            <div className='flash-cat-block'>{data.description}</div>
          </>
        )}
      </div>
    </Drawer>
  );
}

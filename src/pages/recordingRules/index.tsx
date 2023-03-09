import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import { SettingOutlined } from '@ant-design/icons';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { useQuery } from '@/utils';
import { BusinessGroup } from '@/pages/monObjectManage';
import { CommonStateContext } from '@/App';
import PageTable from './PageTable';
import Edit from './edit';
import Add from './add';
import './locale';

export { Edit, Add };

const Strategy: React.FC = () => {
  const commonState = useContext(CommonStateContext);
  const { t } = useTranslation('recordingRules');
  const urlQuery = useQuery();
  const history = useHistory();
  const id = urlQuery.get('id');
  const bgid = id ? Number(id) : commonState.curBusiId;

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div className='strategy-content'>
        <BusinessGroup
          curBusiId={bgid}
          setCurBusiId={(id) => {
            history.push(`/recording-rules?id=${id}`);
            commonState.setCurBusiId(id);
          }}
        />
        {bgid ? <PageTable bgid={bgid}></PageTable> : <BlankBusinessPlaceholder text={t('title')} />}
      </div>
    </PageLayout>
  );
};

export default Strategy;

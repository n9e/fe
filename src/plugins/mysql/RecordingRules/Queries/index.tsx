import React, { useContext } from 'react';
import { Form, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import LogQL from '@/components/LogQL';
import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import { NAME_SPACE } from '@/plugins/mysql/constants';

import AdvancedSettings from '../../components/AdvancedSettings';
import DocumentDrawer from '../../components/DocumentDrawer';
import GraphPreview from '../../AlertRule/Queries/GraphPreview';

interface IProps {
  datasourceValue: number;
  field: any;
  prefixPath: (string | number)[];
  path: (string | number)[];
}

export default function index(props: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { datasourceValue, field, prefixPath } = props;
  const disabled = false;
  const cate = DatasourceCateEnum.mysql;
  const path = [field.name, 'config'];
  const query = Form.useWatch([...prefixPath, 'config']);

  return (
    <>
      <InputGroupWithFormItem
        label={
          <Space>
            {t('query.query')}
            <InfoCircleOutlined
              onClick={() => {
                DocumentDrawer({
                  darkMode,
                });
              }}
            />
          </Space>
        }
      >
        <Form.Item {...field} name={[...path, 'sql']}>
          <LogQL datasourceCate={DatasourceCateEnum.mysql} datasourceValue={datasourceValue} query={{}} historicalRecords={[]} placeholder={t('query.query_placeholder2')} />
        </Form.Item>
      </InputGroupWithFormItem>
      <AdvancedSettings mode='graph' prefixField={field} prefixName={path} disabled={disabled} expanded />
      <GraphPreview cate={cate} datasourceValue={datasourceValue} query={query} />
    </>
  );
}

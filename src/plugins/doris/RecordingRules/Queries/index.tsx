import React, { useContext } from 'react';
import { Form, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import LogQL from '@/components/LogQL';
import { CommonStateContext } from '@/App';
import { DatasourceCateEnum } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE } from '../../constants';
import AdvancedSettings from '../../components/AdvancedSettings';
import GraphPreview from '../../AlertRule/GraphPreview';

interface IProps {
  datasourceValue: number;
  field: any;
  prefixPath: (string | number)[];
  path: (string | number)[];
}

export default function index(props: IProps) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const { datasourceValue, field, prefixPath } = props;
  const disabled = false;
  const cate = DatasourceCateEnum.doris;
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
                  language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                  darkMode,
                  title: t('common:document_link'),
                  type: 'iframe',
                  documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
                });
              }}
            />
          </Space>
        }
      >
        <Form.Item {...field} name={[...path, 'sql']}>
          <LogQL datasourceCate={DatasourceCateEnum.doris} datasourceValue={datasourceValue} query={{}} historicalRecords={[]} />
        </Form.Item>
      </InputGroupWithFormItem>
      <AdvancedSettings prefixField={field} prefixName={path} disabled={disabled} expanded />
      <GraphPreview cate={cate} datasourceValue={datasourceValue} sql={query?.sql} />
    </>
  );
}

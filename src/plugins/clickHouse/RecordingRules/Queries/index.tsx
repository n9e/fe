import React, { useContext } from 'react';
import { Form, Space, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '../../components/AdvancedSettings';
import { CommonStateContext } from '@/App';
import GraphPreview from './GraphPreview';
import DocumentDrawer from '../../components/DocumentDrawer';
import LogQL from '@/components/LogQL';
import { DatasourceCateEnum } from '@/utils/constant';
import { NAME_SPACE } from '../../constants';

interface IProps {
  datasourceValue: number;
  field: any;
  prefixPath: (string | number)[];
  path: (string | number)[];
}

export default function index({ field = {}, prefixPath = [], path = [], datasourceValue }: IProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);
  const datasourceID = _.isArray(datasourceValue) ? datasourceValue[0] : datasourceValue;
  const queryConfig = Form.useWatch([...prefixPath, 'config']);

  return (
    <>
      <Row gutter={8}>
        <Col flex='auto'>
          <div className='tdengine-discover-query'>
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
                <LogQL datasourceCate={DatasourceCateEnum.ck} datasourceValue={datasourceID} query={{}} historicalRecords={[]} placeholder={t('query.query_placeholder2')} />
              </Form.Item>
            </InputGroupWithFormItem>
          </div>
        </Col>
      </Row>
      <AdvancedSettings mode='graph' prefixField={field} prefixName={path} expanded />
      <GraphPreview datasourceValue={datasourceID} query={queryConfig} />
    </>
  );
}

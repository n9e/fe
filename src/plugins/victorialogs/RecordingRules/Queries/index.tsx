import React, { useContext } from 'react';
import { Form, Space, Row, Col, Input, Alert } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE, DEFAULT_QUERY } from '../../constants';
import GraphPreview from '../../AlertRule/Queries/GraphPreview';

interface IProps {
  datasourceValue: number;
  field: any;
  path: (string | number)[];
  prefixPath: (string | number)[];
}

export default function index({ field = {}, path = [], prefixPath = [], datasourceValue }: IProps) {
  const { t, i18n } = useTranslation(NAME_SPACE);
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
                  {t('explorer.query')}
                  <InfoCircleOutlined
                    onClick={() => {
                      DocumentDrawer({
                        language: i18n.language,
                        darkMode,
                        title: t('common:page_help'),
                        type: 'iframe',
                        documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/victorialogs/',
                      });
                    }}
                  />
                </Space>
              }
            >
              <Form.Item {...field} name={[...path, 'query']} initialValue={DEFAULT_QUERY}>
                <Input.TextArea autoSize={{ minRows: 1 }} />
              </Form.Item>
            </InputGroupWithFormItem>
          </div>
        </Col>
      </Row>
      <GraphPreview datasourceValue={datasourceID} query={queryConfig} />
    </>
  );
}

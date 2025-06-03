import React, { useContext, useRef, useState } from 'react';
import { Button, Popover, Space, Select, Form, Alert } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import PromTable from '@/components/PromGraphCpt/Table';
import { N9E_PATHNAME } from '@/utils/constant';

export default function GraphPreview({ form, fieldName, promqlFieldName = 'prom_ql' }) {
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const { t } = useTranslation('alertRules');
  const divRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [datasourceId, setDatasourceId] = useState<number>();
  const [timestamp, setTimestamp] = useState<number>();
  const [errorContent, setErrorContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const var_enabled = Form.useWatch(['rule_config', 'queries', fieldName, 'var_enabled']);
  const promql = Form.useWatch(['rule_config', 'queries', fieldName, promqlFieldName]);
  const controlsPortalDomNodeRef = useRef<HTMLDivElement | null>(null);

  // 启用变量时无法预览，这里隐藏预览按钮
  if (!!var_enabled) return null;

  return (
    <div ref={divRef}>
      <Popover
        placement='right'
        visible={visible}
        onVisibleChange={(visible) => {
          setVisible(visible);
          if (!visible) {
            setErrorContent('');
          }
        }}
        title={
          <div className='flex justify-between items-center'>
            <div>{t('preview')}</div>
            <Space>
              <InputGroupWithFormItem label={t('common:datasource.name')}>
                <Select
                  value={datasourceId}
                  onChange={(value) => {
                    setDatasourceId(value);
                  }}
                  style={{ width: 200 }}
                  options={_.map(groupedDatasourceList.prometheus, (item) => {
                    return {
                      label: item.name,
                      value: item.id,
                    };
                  })}
                />
              </InputGroupWithFormItem>
              <div ref={controlsPortalDomNodeRef} />
            </Space>
          </div>
        }
        content={
          <div
            style={{
              width: 1280,
              maxHeight: 450,
              overflow: 'auto',
            }}
          >
            {errorContent && <Alert className='mb-2' message={errorContent} type='error' />}
            {visible && datasourceId && (
              <PromTable
                url={`/api/${N9E_PATHNAME}/proxy`}
                datasourceValue={datasourceId}
                promql={promql}
                contentMaxHeight={400}
                setErrorContent={setErrorContent}
                timestamp={timestamp}
                setTimestamp={setTimestamp}
                loading={loading}
                setLoading={setLoading}
                controlsPortalDomNode={controlsPortalDomNodeRef.current}
              />
            )}
          </div>
        }
        trigger='click'
        getPopupContainer={() => divRef.current || document.body}
      >
        <Button
          size='small'
          type='primary'
          ghost
          onClick={() => {
            if (!visible) {
              const datasource_id = form.getFieldValue('datasource_value');
              setDatasourceId(datasource_id);
              setVisible(true);
            }
          }}
        >
          {t('preview')}
        </Button>
      </Popover>
    </div>
  );
}

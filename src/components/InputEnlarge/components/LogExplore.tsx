import React, { useState, useEffect, useContext } from 'react';
import { Form, Drawer, Select, Button } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import { rangeOptions } from '@/components/TimeRangePicker/config';
import Vars from './Vars';
import LogForm from './LogRow';
import { formatLogExploreLink } from './LogRow';
import { ILogMappingParams, ILogExtract } from '@/pages/log/IndexPatterns/types';
import { replaceVarAndGenerateLink } from '@/pages/explorer/components/Links';
export default function LogExplore({
  vars,
  rawData,
  extracts,
  mappingParamsArr,
}: {
  vars: string[];
  rawData: object;
  extracts?: ILogExtract[];
  mappingParamsArr?: ILogMappingParams[];
}) {
  const { t } = useTranslation('inputEnlarge');
  const form = Form.useFormInstance();
  const [url, setUrl] = useState('');
  const handleClickVar = (v: string) => {
    const value = form.getFieldValue(['logExplore', 'query_string']) || '';
    form.setFields([
      {
        name: ['logExplore', 'query_string'],
        value: value + '$' + v,
      },
    ]);
  };
  return (
    <div>
      <Form.Item name={['logExplore', 'range']} label={t('时间范围')} initialValue={'from-to'}>
        <Select>
          <Select.Option value='from-to'>{t('继承当前查询时间')}</Select.Option>
          {rangeOptions.map((item) => (
            <Select.Option key={item.display} value={item.start + '|' + item.end}>
              {t(`timeRangePicker:rangeOptions.${item.display}`)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <LogForm availableVars={vars} form={form} />
      <Button
        type='link'
        style={{ float: 'right' }}
        onClick={async () => {
          const values = await form.validateFields();
          const range = values.logExplore.range === 'from-to' ? { start: 'now-5m', end: 'now' } : { start: values.logExplore.range, end: 'now' };
          const url = formatLogExploreLink(values.logExplore, range as unknown as { start: number; end: number });
          const realUrl = replaceVarAndGenerateLink(url, rawData, extracts, mappingParamsArr);
          setUrl(`/login?accessToken=${localStorage.getItem('access_token')}&refreshToken=${localStorage.getItem('refresh_token')}&redirect=${encodeURIComponent(realUrl)}`);
        }}
      >
        {t('预览结果')}
      </Button>
      <Vars vars={vars} handleClickVar={handleClickVar} />

      {url && (
        <Drawer
          title='Log Explore'
          visible={true}
          onClose={() => {
            setUrl('');
            sessionStorage.removeItem('menuHide');
          }}
          footer={null}
          width={'80%'}
        >
          <iframe
            src={url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          ></iframe>
        </Drawer>
      )}
    </div>
  );
}

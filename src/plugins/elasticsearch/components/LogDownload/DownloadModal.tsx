import React, { useContext, useEffect, useState } from 'react';
import { Button, Col, Dropdown, Form, Input, InputNumber, Menu, Modal, Radio, Row, Select, message } from 'antd';
import TimeRangePicker, { parseRange } from '@/components/TimeRangePicker';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import { addLogsDownloadTask } from '@/pages/explorer/Elasticsearch/services';

interface IProps {
  queryData: any;
}

export default function DownloadModal(props: IProps) {
  const { t } = useTranslation('explorer');
  const { queryData } = props;

  const [form] = Form.useForm();

  const [downloadVisible, setDownloadVisible] = useState<boolean>(false);

  useEffect(() => {
    if (queryData && downloadVisible) {
      form.setFieldsValue({
        ...queryData,
        cate: queryData.datasourceCate,
        datasource_id: queryData.datasourceValue,
        config: {
          format: 'json',
          time_sort: 'asc',
          countType: 'custom',
          count: 0,
        },
      });
    }
  }, [queryData, downloadVisible]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const parsedRange = parseRange(values.query.range);
      const data = {
        ...values,
        query: {
          ...values.query,
          start: Number(moment(parsedRange.start).format('X')),
          end: Number(moment(parsedRange.end).format('X')),
        },
        config: {
          ...values.config,
          count: values.config?.countType === 'all' ? 0 : values.config?.count,
        },
      };

      addLogsDownloadTask(data).then((res) => {
        message.success(t('log.log_download.createSuccess'));
        setDownloadVisible(false);
      });
    });
  };

  return (
    <>
      <a
        style={{ marginLeft: '8px' }}
        onClick={() => {
          setDownloadVisible(true);
        }}
      >
        {t('log.log_download.title')}
      </a>
      <Modal
        title={t('log.log_download.download_title')}
        visible={downloadVisible}
        onCancel={() => {
          setDownloadVisible(false);
        }}
        onOk={() => {
          handleSubmit();
        }}
        centered
      >
        <Form layout='vertical' form={form} initialValues={{ config: { format: 'json', count: 0 } }}>
          <Form.Item name={'cate'} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={'datasource_id'} hidden>
            <InputNumber />
          </Form.Item>
          <Form.Item name={'date_field'} hidden>
            <Input />
          </Form.Item>
          <Form.Item label={t('datasource:es.index')} name={['query', 'index']}>
            <Input disabled />
          </Form.Item>
          <Form.Item label={t('datasource:es.filter')} name={['query', 'filter']}>
            <Input disabled />
          </Form.Item>
          <Form.Item label={t('datasource:es.date_field')} name={['query', 'date_field']} hidden={queryData?.mode === 'index-patterns'}>
            <Input disabled />
          </Form.Item>

          <Form.Item label={t('log.log_download.range')} name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
            <TimeRangePicker disabled />
          </Form.Item>
          <Form.Item label={t('log.log_download.format')} name={['config', 'format']}>
            <Select>
              <Select.Option value={'json'}>JSON</Select.Option>
              <Select.Option value={'csv'}>CSV</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label={t('log.log_download.time_sort')} name={['config', 'time_sort']}>
            <Radio.Group style={{ width: '100%' }}>
              <Radio value='asc'>{t('log.log_download.time_sort_asc')}</Radio>
              <Radio value='desc'>{t('log.log_download.time_sort_desc')}</Radio>
            </Radio.Group>
          </Form.Item>
          <div style={{ display: 'flex' }}>
            <Form.Item label={t('log.log_download.count')} name={['config', 'countType']}>
              <Radio.Group
                style={{ width: '100%' }}
                onChange={(e) => {
                  if (e.target.value === 'all') {
                    form.setFields([{ name: ['config', 'count'], value: 0 }]);
                  }
                }}
              >
                {/* <Radio value='all'>
                  {t('log.log_download.all')}（{t('log.log_download.all_quantity')} {queryData.total}）
                </Radio> */}
                <Radio value='custom'>
                  {t('log.log_download.custom')}（{t('log.log_download.all_quantity')} {queryData.total}）
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(cur, pre) => cur?.config?.countType !== pre?.config?.countType}>
              {() => {
                const curCountType = form.getFieldValue(['config', 'countType']);
                return curCountType === 'all' ? null : (
                  <Form.Item name={['config', 'count']} rules={[{ required: true, type: 'number', min: 1, max: 65535, message: t('log.log_download.custom_validated') }]}>
                    <InputNumber size='small' style={{ marginTop: '32px' }} />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
}

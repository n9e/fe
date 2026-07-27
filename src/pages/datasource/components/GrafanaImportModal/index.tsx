import React, { useState } from 'react';
import { Modal, Form, Input, Radio, Checkbox, Button, Table, Tag, Alert, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import { getCateByValue, getCateDisplayLabel } from '@/components/AdvancedWrap/utils';
import { fetchGrafanaDatasources, importGrafanaDatasources } from '../../services';

interface Props {
  visible: boolean;
  onClose: () => void;
  // 导入成功后触发父组件刷新数据源列表（与关闭解耦，避免依赖关闭瞬间的状态）。
  onImported?: () => void;
}

// datasource 是后端已构建好、原样回传即可导入的 models.Datasource（字段动态，透传不强类型）。
interface PreviewItem {
  key: number;
  grafana_type: string;
  grafana_name: string;
  supported: boolean;
  need_auth: boolean;
  duplicate: boolean;
  reason?: string;
  datasource: any | null;
}

interface ImportResult {
  name: string;
  status: 'imported' | 'pending_auth' | 'skipped' | 'failed';
  reason?: string;
}

const AUTH_TOKEN = 'token';
const AUTH_BASIC = 'basic';

export default function GrafanaImportModal(props: Props) {
  const { visible, onClose, onImported } = props;
  const { t, i18n } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const [authType, setAuthType] = useState<string>(AUTH_TOKEN);
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [items, setItems] = useState<PreviewItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [results, setResults] = useState<ImportResult[] | null>(null);

  const loading = fetching || importing;

  const reset = () => {
    form.resetFields();
    setAuthType(AUTH_TOKEN);
    setFetching(false);
    setImporting(false);
    setFetched(false);
    setItems([]);
    setSelectedKeys([]);
    setResults(null);
  };

  const handleClose = () => {
    if (loading) return; // 拉取/导入进行中不允许关闭，避免竞态与陈旧回填
    reset();
    onClose();
  };

  const handleFetch = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setFetching(true);
    setFetched(false);
    setItems([]);
    setSelectedKeys([]);
    setResults(null);
    try {
      const res = await fetchGrafanaDatasources({
        url: values.url,
        auth_type: values.auth_type,
        token: values.token,
        username: values.username,
        password: values.password,
        skip_tls_verify: !!values.skip_tls_verify,
      });
      const list: PreviewItem[] = (res?.items || []).map((it: any, idx: number) => ({
        key: idx,
        grafana_type: it.grafana_type,
        grafana_name: it.grafana_name,
        supported: !!it.supported,
        need_auth: !!it.need_auth,
        duplicate: !!it.duplicate,
        reason: it.reason,
        datasource: it.datasource || null,
      }));
      setItems(list);
      setSelectedKeys(list.filter((it) => it.supported && !it.duplicate).map((it) => it.key));
      setFetched(true);
    } catch (err: any) {
      message.error(err?.message || t('import_grafana.fetch_failed'));
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async () => {
    const selected = items.filter((it) => selectedKeys.includes(it.key) && it.datasource);
    if (selected.length === 0) return;

    setImporting(true);
    try {
      const res = await importGrafanaDatasources(selected.map((it) => it.datasource));
      const resultItems: ImportResult[] = res?.items || [];
      setResults(resultItems);
      // 导入成功即刻独立触发父列表刷新，不依赖关闭瞬间捕获的状态。
      if (resultItems.some((r) => r.status === 'imported' || r.status === 'pending_auth')) {
        onImported?.();
      }
    } catch (err: any) {
      message.error(err?.message || t('import_grafana.fetch_failed'));
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnsType<PreviewItem> = [
    { title: t('import_grafana.col_grafana_type'), dataIndex: 'grafana_type' },
    { title: t('import_grafana.col_grafana_name'), dataIndex: 'grafana_name' },
    {
      title: t('import_grafana.col_type'),
      render: (_val: unknown, r: PreviewItem) =>
        r.datasource ? getCateDisplayLabel(getCateByValue(r.datasource.plugin_type), i18n.language) || r.datasource.plugin_type : '-',
    },
    {
      title: t('import_grafana.col_supported'),
      render: (_val: unknown, r: PreviewItem) =>
        r.supported ? <Tag color='green'>{t('import_grafana.tag_supported')}</Tag> : <Tag color='red'>{t('import_grafana.tag_unsupported')}</Tag>,
    },
    {
      title: t('import_grafana.col_duplicate'),
      render: (_val: unknown, r: PreviewItem) => (r.duplicate ? <Tag color='orange'>{t('import_grafana.tag_duplicate')}</Tag> : '-'),
    },
    {
      title: t('import_grafana.col_need_auth'),
      render: (_val: unknown, r: PreviewItem) => (r.need_auth ? <Tag color='gold'>{t('import_grafana.tag_need_auth')}</Tag> : '-'),
    },
  ];

  const renderResult = () => {
    if (!results) return null;
    const count = (s: ImportResult['status']) => results.filter((r) => r.status === s).length;
    const summary = `${t('import_grafana.result_imported')} ${count('imported')} / ${t('import_grafana.result_pending_auth')} ${count(
      'pending_auth',
    )} / ${t('import_grafana.result_skipped')} ${count('skipped')} / ${t('import_grafana.result_failed')} ${count('failed')}`;
    const failed = results.filter((r) => r.status === 'failed');
    return (
      <Alert
        style={{ marginTop: 12 }}
        showIcon
        type={count('failed') > 0 ? 'warning' : 'success'}
        message={`${t('import_grafana.import_done')}: ${summary}`}
        description={
          failed.length > 0 ? (
            <div>
              {failed.map((r) => (
                <div key={r.name}>
                  {r.name}: {r.reason}
                </div>
              ))}
            </div>
          ) : undefined
        }
      />
    );
  };

  return (
    <Modal
      title={t('import_grafana.modal_title')}
      visible={visible}
      destroyOnClose
      width={960}
      maskClosable={false}
      keyboard={!loading}
      closable={!loading}
      onCancel={handleClose}
      footer={[
        <Button key='close' disabled={loading} onClick={handleClose}>
          {t('common:btn.cancel')}
        </Button>,
        <Button key='import' type='primary' loading={importing} disabled={selectedKeys.length === 0} onClick={handleImport}>
          {t('import_grafana.import_btn')}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={{ auth_type: AUTH_TOKEN }}
        onValuesChange={(changed) => {
          if (changed.auth_type) setAuthType(changed.auth_type);
        }}
      >
        <Form.Item label={t('import_grafana.url')} name='url' rules={[{ required: true }]}>
          <Input placeholder={t('import_grafana.url_placeholder')} />
        </Form.Item>
        <Form.Item label={t('import_grafana.auth_type')} name='auth_type'>
          <Radio.Group>
            <Radio value={AUTH_TOKEN}>{t('import_grafana.auth_type_token')}</Radio>
            <Radio value={AUTH_BASIC}>{t('import_grafana.auth_type_basic')}</Radio>
          </Radio.Group>
        </Form.Item>
        {authType === AUTH_BASIC ? (
          <>
            <Form.Item label={t('import_grafana.username')} name='username'>
              <Input autoComplete='off' />
            </Form.Item>
            <Form.Item label={t('import_grafana.password')} name='password'>
              <Input.Password autoComplete='new-password' />
            </Form.Item>
          </>
        ) : (
          <Form.Item label={t('import_grafana.token')} name='token'>
            <Input.Password placeholder={t('import_grafana.token_placeholder')} autoComplete='new-password' />
          </Form.Item>
        )}
        <Form.Item name='skip_tls_verify' valuePropName='checked'>
          <Checkbox>{t('import_grafana.skip_tls')}</Checkbox>
        </Form.Item>
        <Button type='primary' loading={fetching} onClick={handleFetch}>
          {t('import_grafana.fetch_btn')}
        </Button>
      </Form>

      {items.length > 0 && (
        <Table
          style={{ marginTop: 16 }}
          size='small'
          rowKey='key'
          columns={columns}
          dataSource={items}
          pagination={false}
          scroll={{ y: 300 }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: (keys) => setSelectedKeys(keys),
            getCheckboxProps: (r) => ({ disabled: !r.supported }),
          }}
        />
      )}
      {fetched && items.length === 0 && <div style={{ marginTop: 16, color: 'var(--fc-text-3)' }}>{t('import_grafana.empty')}</div>}
      {renderResult()}
    </Modal>
  );
}

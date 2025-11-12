import { useTranslation } from "react-i18next";
import { NS } from "../../constants";
import { Form, Input, InputNumber, Space, Tooltip } from "antd";
import React from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

export default function Pagerduty() {
    const { t } = useTranslation(NS);
    const names = ['request_config', 'pagerduty_request_config'];
    const request_type = Form.useWatch('request_type');
    const isRequired = request_type === 'pagerduty';

    return (
        <div
            style={{
                display: request_type === 'pagerduty' ? 'block' : 'none',
            }}
        >
            <Form.Item
                label={
                    <Space size={4}>
                        {t('pagerduty_request_config.api_key')}
                        <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t('pagerduty_request_config.api_key_tip')}>
                            <QuestionCircleOutlined />
                        </Tooltip>
                    </Space>
                }
                name={[...names, 'api_key']}
                rules={[{ required: isRequired }]}
            >
                <Input />
            </Form.Item>
            <Form.Item label={t('pagerduty_request_config.proxy')} tooltip={t('pagerduty_request_config.proxy_tip')} name={[...names, 'proxy']}>
                <Input />
            </Form.Item>
            <Form.Item label={t('pagerduty_request_config.timeout')} name={[...names, 'timeout']}>
                <InputNumber min={0} className='w-full' />
            </Form.Item>
            <Form.Item label={t('pagerduty_request_config.retry_times')} name={[...names, 'retry_times']}>
                <InputNumber min={0} className='w-full' />
            </Form.Item>
        </div>
    );
}
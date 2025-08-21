import React from 'react';
import _ from 'lodash';
import { Form, Select, Row, Col, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

const cellTypes = ['none', 'color-text', 'color-background', 'gauge'];
const colorBackgroundModes = ['basic'];
const gaugeModes = ['basic', 'lcd'];
const gaugeValueDisplayModes = ['color', 'text', 'hidden'];

interface CellOptionsProps {
  namePath?: (string | number)[];
  prefixNamePath?: (string | number)[];
}

export default function CellOptions(props: CellOptionsProps) {
  const { t } = useTranslation('dashboard');
  const { namePath = [], prefixNamePath = [] } = props;
  const form = Form.useFormInstance();
  const type = form.getFieldValue([...prefixNamePath, ...namePath, 'type']);

  return (
    <Row gutter={10}>
      <Col span={24}>
        <Form.Item label={t('panel.custom.tableNG.cellOptions.type.label')} name={[...namePath, 'type']} initialValue='none'>
          <Select
            options={_.map(cellTypes, (item) => {
              return {
                label: t(`panel.custom.tableNG.cellOptions.type.options.${item}`),
                value: item,
              };
            })}
          />
        </Form.Item>
      </Col>
      {/* {type === 'color-background' && (
        <Col span={24}>
          <Form.Item label={t('panel.custom.tableNG.cellOptions.color-background.mode.label')} name={[...namePath, 'mode']} initialValue='basic'>
            <Select
              options={_.map(colorBackgroundModes, (item) => {
                return {
                  label: t(`panel.custom.tableNG.cellOptions.color-background.mode.options.${item}`),
                  value: item,
                };
              })}
            />
          </Form.Item>
        </Col>
      )} */}
      {(type === 'none' || type === 'color-text') && (
        <Form.Item
          label={t('panel.custom.tableNG.cellOptions.wrapText')}
          tooltip={t('panel.custom.tableNG.cellOptions.wrapText_tip')}
          name={[...namePath, 'wrapText']}
          valuePropName='checked'
        >
          <Switch />
        </Form.Item>
      )}
      {type === 'gauge' && (
        <>
          <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.cellOptions.gauge.mode.label')} name={[...namePath, 'mode']} initialValue='basic'>
              <Select
                options={_.map(gaugeModes, (item) => {
                  return {
                    label: t(`panel.custom.tableNG.cellOptions.gauge.mode.options.${item}`),
                    value: item,
                  };
                })}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('panel.custom.tableNG.cellOptions.gauge.valueDisplayMode.label')} name={[...namePath, 'valueDisplayMode']} initialValue='text'>
              <Select
                options={_.map(gaugeValueDisplayModes, (item) => {
                  return {
                    label: t(`panel.custom.tableNG.cellOptions.gauge.valueDisplayMode.options.${item}`),
                    value: item,
                  };
                })}
              />
            </Form.Item>
          </Col>
        </>
      )}
    </Row>
  );
}

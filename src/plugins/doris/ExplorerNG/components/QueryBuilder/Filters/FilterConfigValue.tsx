import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Col, Form, Select, AutoComplete } from 'antd';

import { NAME_SPACE } from '../../../../constants';

import { EQUAL_OPERATORS, IN_OPERATORS, NULL_OPERATORS, BETWEEN_OPERATORS, LIKE_OPERATORS, MATCH_OPERATORS } from '../constants';

interface Props {
  operator: string;
  fieldSample?: string[];
}

export default function FilterConfigValue(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { operator, fieldSample } = props;

  if (_.includes(NULL_OPERATORS, operator)) {
    return null;
  }
  if (_.includes(IN_OPERATORS, operator)) {
    return (
      <Col span={24}>
        <Form.Item
          label={t('builder.filters.value')}
          name='value'
          rules={[
            {
              required: true,
              message: t('builder.filters.value_placeholder'),
            },
          ]}
        >
          <Select
            dropdownClassName='doris-query-builder-popup'
            placeholder={t('builder.filters.value_placeholder')}
            options={_.map(fieldSample, (item) => {
              return {
                label: item,
                value: item,
              };
            })}
            showSearch
            optionFilterProp='label'
            dropdownMatchSelectWidth={false}
            mode='tags'
          />
        </Form.Item>
      </Col>
    );
  }
  if (_.includes(BETWEEN_OPERATORS, operator)) {
    return (
      <>
        <Col span={12}>
          <Form.Item
            name={['value', 0]}
            rules={[
              {
                required: true,
                message: t('builder.filters.value_placeholder'),
              },
            ]}
          >
            <AutoComplete
              dropdownClassName='doris-query-builder-popup'
              placeholder={t('builder.filters.value_placeholder')}
              options={_.map(fieldSample, (item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
              showSearch
              optionFilterProp='label'
              dropdownMatchSelectWidth={false}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name={['value', 1]}
            rules={[
              {
                required: true,
                message: t('builder.filters.value_placeholder'),
              },
            ]}
          >
            <AutoComplete
              dropdownClassName='doris-query-builder-popup'
              placeholder={t('builder.filters.value_placeholder')}
              options={_.map(fieldSample, (item) => {
                return {
                  label: item,
                  value: item,
                };
              })}
              showSearch
              optionFilterProp='label'
              dropdownMatchSelectWidth={false}
            />
          </Form.Item>
        </Col>
      </>
    );
  }
  if (_.includes([...EQUAL_OPERATORS, ...LIKE_OPERATORS, ...MATCH_OPERATORS], operator)) {
    return (
      <Col span={24}>
        <Form.Item
          name='value'
          rules={[
            {
              required: true,
              message: t('builder.filters.value_placeholder'),
            },
          ]}
        >
          <AutoComplete
            dropdownClassName='doris-query-builder-popup'
            placeholder={t('builder.filters.value_placeholder')}
            options={_.map(fieldSample, (item) => {
              return {
                label: item,
                value: item,
              };
            })}
            showSearch
            optionFilterProp='label'
            dropdownMatchSelectWidth={false}
          />
        </Form.Item>
      </Col>
    );
  }

  return null;
}

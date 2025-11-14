import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Space, Popover, Form } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { parseRange } from '@/components/TimeRangePicker';
import { Link, handleNav } from '@/pages/explorer/components/Links';

import { NAME_SPACE } from '../../constants';
import { getGlobalState } from '../../globalState';

interface RenderValueProps {
  name: string;
  value: string;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
  rawValue?: { [key: string]: any };
}

export default function FieldValueWithFilter({ name, value, onValueFilter, rawValue }: RenderValueProps) {
  const { t } = useTranslation(NAME_SPACE);
  const fieldConfig = getGlobalState('fieldConfig');
  const form = Form.useFormInstance();
  const [popoverVisible, setPopoverVisible] = useState(false);
  const relatedLinks = fieldConfig?.linkArr?.filter((item) => item.field === name);
  const range = form.getFieldValue(['query', 'range']);
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;
  return (
    <Popover
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        if (onValueFilter) {
          setPopoverVisible(visible);
        }
      }}
      trigger={['click']}
      overlayClassName='explorer-origin-field-val-popover'
      content={
        <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
          <li
            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
            onClick={() => {
              setPopoverVisible(false);
              onValueFilter?.({
                key: name,
                value,
                operator: 'AND',
              });
            }}
          >
            <Space>
              <PlusCircleOutlined />
              {t('logs.filterAnd')}
            </Space>
          </li>
          <li
            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
            onClick={() => {
              setPopoverVisible(false);
              onValueFilter?.({
                key: name,
                value,
                operator: 'NOT',
              });
            }}
          >
            <Space>
              <MinusCircleOutlined />
              {t('logs.filterNot')}
            </Space>
          </li>

          {relatedLinks && relatedLinks.length > 0 && <li className='ant-dropdown-menu-item-divider'></li>}
          {relatedLinks?.map((i) => {
            return (
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                style={{ textDecoration: 'underline' }}
                onClick={() => {
                  const valueObjected = Object.entries(rawValue || {}).reduce((acc, [key, value]) => {
                    if (typeof value === 'string') {
                      try {
                        acc[key] = JSON.parse(value);
                      } catch (e) {
                        acc[key] = value;
                      }
                    } else {
                      acc[key] = value;
                    }
                    return acc;
                  }, {});

                  handleNav(i.urlTemplate, valueObjected, { start, end }, fieldConfig?.regExtractArr, fieldConfig?.mappingParamsArr);
                }}
              >
                {i.name}
              </li>
            );
          })}
        </ul>
      }
    >
      {relatedLinks && relatedLinks.length > 0 ? <Link text={value} /> : <div className='explorer-origin-field-val'>{value}</div>}
    </Popover>
  );
}

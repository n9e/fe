import React, { useState } from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Space } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange } from '@/components/TimeRangePicker';

import Token from './Token';
import ExistsIcon from './ExistsIcon';
import './style.less';

interface IProps {
  fieldKey: string;
  fieldValue: string;
  fieldConfig?: FieldConfigVersion2;
  rawValue: object; // 待提取的日志原文数据
  range: IRawTimeRange;
  adjustFieldValue?: (formatedValue: string) => React.ReactNode;
  onActionClick?: (params: { key: string; value?: string; operator: string }) => void;
  tokenHide?: boolean;
}

const splitRegex = /\r\n|\n|\r|\\r\\n|\\n|\\r/g;

export default function RenderValue(props: IProps) {
  const { t } = useTranslation('explorer');
  const { fieldKey, fieldValue, fieldConfig, rawValue, range, adjustFieldValue, onActionClick, tokenHide } = props;

  if (splitRegex.test(fieldValue)) {
    return renderMultipleLineValue(fieldValue);
  }

  let displayValue = fieldValue;
  const fieldAttr = fieldConfig?.arr?.find((i) => i.field === fieldKey);
  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern) {
    displayValue = moment(fieldValue).format(fieldAttr?.formatMap?.params?.pattern);
  }
  if (fieldAttr?.formatMap?.type === 'url' && fieldAttr?.formatMap?.params?.urlTemplate) {
    displayValue = fieldAttr?.formatMap?.params?.labelTemplate.replace('{{value}}', fieldValue);
  }
  const value = adjustFieldValue ? adjustFieldValue(displayValue) : displayValue;

  return (
    <Token
      tokenHide={tokenHide}
      name={fieldKey}
      value={fieldValue}
      valueNode={value}
      onTokenClick={({ key, value, operator }) => {
        if (onActionClick) {
          onActionClick({
            key,
            value,
            operator,
          });
        }
      }}
      fieldConfig={fieldConfig}
      rawValue={rawValue}
      range={range}
      actionsValueMap={{
        and: 'is',
        not: 'is not',
      }}
      extraActions={
        <li
          className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
          onClick={() => {
            if (onActionClick) {
              onActionClick({
                key: fieldKey,
                operator: 'exists',
              });
            }
          }}
        >
          <Space>
            <ExistsIcon />
            {t('log.field_actions.exists')}
          </Space>
        </li>
      }
    />
  );
}

function renderMultipleLineValue(value: string) {
  // e.g. 报错信息
  const limit = 18;
  const { t } = useTranslation();
  const [expand, setExpand] = useState(false);
  const valArr = _.split(value, splitRegex);
  if (typeof value === 'string') {
    if (valArr.length > 1) {
      const lines = !expand ? _.slice(valArr, 0, limit) : valArr;
      return (
        <div style={{ display: 'inline-block', wordBreak: 'break-all', lineHeight: 1.4 }}>
          {_.map(lines, (v, idx) => {
            return (
              <div key={idx}>
                <span>{v}</span>
                {idx === lines.length - 1 && valArr.length > limit && (
                  <a
                    onClick={() => {
                      setExpand(!expand);
                    }}
                    style={{
                      marginLeft: 8,
                    }}
                  >
                    {expand ? t('common:btn.collapse') : t('common:btn.expand')}
                    {expand ? <LeftOutlined /> : <RightOutlined />}
                  </a>
                )}

                <br />
              </div>
            );
          })}
        </div>
      );
    }
    return <div style={{ display: 'inline-block', wordBreak: 'break-all' }}>{value}</div>;
  }
  return <div style={{ display: 'inline-block', wordBreak: 'break-all' }}>{value}</div>;
}

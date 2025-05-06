import React, { useState } from 'react';
import _ from 'lodash';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Links from '@/pages/explorer/components/Links';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
interface IProps {
  fieldKey: string;
  fieldValue: string;
  fieldConfig?: FieldConfigVersion2;
  rawValue: object; // 待提取的日志原文数据
  range: IRawTimeRange;
  adjustFieldValue?: (formatedValue: string) => React.ReactNode;
}

const splitRegex = /\r\n|\n|\r|\\r\\n|\\n|\\r/g;

export default function RenderValue(props: IProps) {
  const { fieldKey, fieldValue, fieldConfig, rawValue, range, adjustFieldValue } = props;

  if (splitRegex.test(fieldValue)) {
    return renderMultipleLineValue(fieldValue);
  }

  const fieldAttr = fieldConfig?.arr?.find((i) => i.field === fieldKey);
  const fieldLinks = fieldConfig?.linkArr?.filter((i) => i.field === fieldKey);
  let displayValue = fieldValue;
  if (fieldAttr?.formatMap?.type === 'date' && fieldAttr?.formatMap?.params?.pattern) {
    displayValue = moment(fieldValue).format(fieldAttr?.formatMap?.params?.pattern);
  }
  if (fieldAttr?.formatMap?.type === 'url' && fieldAttr?.formatMap?.params?.urlTemplate) {
    displayValue = fieldAttr?.formatMap?.params?.labelTemplate.replace('{{value}}', fieldValue);
  }

  const value = adjustFieldValue ? adjustFieldValue(displayValue) : displayValue;

  if (rawValue && fieldLinks && fieldLinks.length > 0) {
    return <Links rawValue={rawValue} range={range} text={value} paramsArr={fieldLinks} regExtractArr={fieldConfig?.regExtractArr} />;
  }
  return <span>{value}</span>;
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
        <div style={{ display: 'inline-block', wordBreak: 'break-all' }}>
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

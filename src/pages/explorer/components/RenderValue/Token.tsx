import React, { useState } from 'react';
import { Popover, Space, Form } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { Link, handleNav } from '@/pages/explorer/components/Links';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
import { parseRange, IRawTimeRange } from '@/components/TimeRangePicker';

import { toString } from './util';

interface Props {
  name: string; // 字段名
  value: string; // 字段值
  valueNode: React.ReactNode; // 可能是被高亮处理的 React 元素
  onTokenClick: (parmas: { key: string; value: string; operator: string }) => void;
  fieldConfig?: FieldConfigVersion2;
  rawValue?: object;
  range: IRawTimeRange; // 时间范围
  parentKey?: string;
  actionsValueMap?: {
    and: string;
    not: string;
  }; // 操作符值
  extraActions?: React.ReactNode; // 额外的操作项
  tokenHide?: boolean; // 是否隐藏 token和extraActions,目前仅用在srm 联合查询
}

export default function Token(props: Props) {
  const { t } = useTranslation('explorer');
  const form = Form.useFormInstance();
  const {
    name,
    value,
    valueNode,
    onTokenClick,
    fieldConfig,
    rawValue,
    range,
    parentKey,
    actionsValueMap = {
      and: 'AND',
      not: 'NOT',
    },
    extraActions,
    tokenHide,
  } = props;

  const [popoverVisible, setPopoverVisible] = useState(false);
  const relatedLinks = fieldConfig?.linkArr?.filter((item) => (parentKey ? item.field === parentKey + '.' + name : item.field === name));
  const parsedRange = range ? parseRange(range) : null;
  let start = parsedRange ? moment(parsedRange.start).unix() : 0;
  let end = parsedRange ? moment(parsedRange.end).unix() : 0;

  return (
    <Popover
      placement='right'
      visible={popoverVisible}
      onVisibleChange={(visible) => {
        setPopoverVisible(visible);
      }}
      trigger={['click']}
      overlayClassName='n9e-log-field-val-popover'
      content={
        <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
          {!tokenHide && (
            <>
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  setPopoverVisible(false);
                  onTokenClick({
                    key: name,
                    value,
                    operator: actionsValueMap.and,
                  });
                }}
              >
                <Space>
                  <PlusCircleOutlined />
                  {t('log.field_actions.and')}
                </Space>
              </li>
              <li
                className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                onClick={() => {
                  setPopoverVisible(false);
                  onTokenClick({
                    key: name,
                    value,
                    operator: actionsValueMap.not,
                  });
                }}
              >
                <Space>
                  <MinusCircleOutlined />
                  {t('log.field_actions.not')}
                </Space>
              </li>
            </>
          )}
          {!tokenHide && extraActions}
          {!tokenHide && relatedLinks && relatedLinks.length > 0 && <li className='ant-dropdown-menu-item-divider'></li>}
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
                {toString(valueNode)}
              </li>
            );
          })}
        </ul>
      }
    >
      {relatedLinks && relatedLinks.length > 0 ? <Link text={toString(valueNode)} /> : <div className='n9e-log-field-val-token'>{toString(valueNode)}</div>}
    </Popover>
  );
}

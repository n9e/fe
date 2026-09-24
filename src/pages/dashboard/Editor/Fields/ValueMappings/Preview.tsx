import React from 'react';
import { Button } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';

import type { IValueMapping } from '../../../types';

interface Props {
  valueMappings?: IValueMapping[];
  showColor?: boolean;
  editText: string;
  onEdit: () => void;
}

export function getValueMappingConditionText(mapping: IValueMapping) {
  const { match = {} } = mapping;

  if (mapping.type === 'range') {
    const from = match.from == null ? '-Infinity' : match.from;
    const to = match.to == null ? 'Infinity' : match.to;
    return `[${from} - ${to}]`;
  }
  if (mapping.type === 'specialValue') {
    return match.specialValue === 'empty' ? 'Empty string' : 'Null';
  }
  if (mapping.type === 'textValue') {
    return match.textValue == null || match.textValue === '' ? '-' : String(match.textValue);
  }
  return match.special == null ? '-' : String(match.special);
}

export default function Preview({ valueMappings = [], showColor = false, editText, onEdit }: Props) {
  return (
    <div>
      {valueMappings.map((mapping, index) => {
        const color = mapping.result?.color;

        return (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minHeight: 24,
              marginBottom: 4,
            }}
          >
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{getValueMappingConditionText(mapping)}</span>
            <ArrowRightOutlined style={{ color: 'var(--fc-text-3)' }} />
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{mapping.result?.text || '-'}</span>
            {showColor && (
              <span
                aria-hidden='true'
                style={{
                  flex: '0 0 16px',
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: color || 'transparent',
                }}
              />
            )}
          </div>
        );
      })}
      <Button block onClick={onEdit} style={{ marginTop: valueMappings.length > 0 ? 8 : 0 }}>
        {editText}
      </Button>
    </div>
  );
}

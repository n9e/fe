import React from 'react';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface DataSourceSelectTagProps {
  children: React.ReactNode;
  name: string;
  disabled?: boolean;
  onRemove: () => void;
}

export default function DataSourceSelectTag(props: DataSourceSelectTagProps) {
  const { children, name, disabled, onRemove } = props;
  const { t } = useTranslation('dataSourceSelectionSelect');

  return (
    <span
      className='data-source-selection-select-tag-box'
      onMouseDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {children}
      {!disabled ? (
        <button
          type='button'
          className='data-source-selection-select-tag-close'
          aria-label={t('removeSource', { name })}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <CloseOutlined />
        </button>
      ) : null}
    </span>
  );
}

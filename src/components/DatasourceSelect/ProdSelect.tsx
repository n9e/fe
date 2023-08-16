import React, { useContext } from 'react';
import { Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';
import { getProdOptions } from '@/pages/alertRules/Form/components/ProdSelect';

interface Props {
  value?: string;
  onChange: (val?: string) => void;
  style?: React.CSSProperties;
}

export default function ProdSelect(props: Props) {
  const { feats } = useContext(CommonStateContext);
  const { t } = useTranslation();
  const { value, onChange, style } = props;
  const prodOptions = getProdOptions(feats);

  return (
    <Select style={style} placeholder={t('common:datasource.prod')} allowClear value={value} onChange={onChange}>
      {prodOptions.map((item) => {
        return (
          <Select.Option value={item.value} key={item.value}>
            {item.label}
          </Select.Option>
        );
      })}
    </Select>
  );
}

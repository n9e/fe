import React, { useState } from 'react';
import { Affix, AffixProps } from 'antd';

export default function index(props: AffixProps) {
  const { children } = props;
  const [affixed, setAffixed] = useState<Boolean>();

  return (
    <Affix
      offsetBottom={props.offsetBottom ?? 0}
      onChange={(affixed) => {
        setAffixed(affixed);
      }}
    >
      <div className={!affixed ? 'mt2' : ''}>{children}</div>
    </Affix>
  );
}

import React, { useState, useContext, useRef } from 'react';
import { Input, Tooltip, InputProps, Button } from 'antd';
import { FullscreenOutlined, ToolOutlined } from '@ant-design/icons';
import useOnClickOutside from '../useOnClickOutside';
import { CommonStateContext } from '@/App';
import LinkBuilder from './LinkBuilder';
import { ILogMappingParams, ILogExtract } from '@/pages/log/IndexPatterns/types';

export default function InputEnlarge({
  disabled,
  value,
  onChange,
  linkBuilder,
  ...props
}: InputProps & { linkBuilder?: { variables?: string[]; extracts?: ILogExtract[]; mappingParamsArr?: ILogMappingParams[]; rawData?: object } }) {
  const { darkMode } = useContext(CommonStateContext);
  const [visible, setVisible] = useState(false);
  const [linkBuilderVisible, setLinkBuilderVisible] = useState(false);
  const vars = [
    ...(linkBuilder?.variables || []),
    ...(linkBuilder?.extracts?.filter((i) => !!i).map((i) => i.newField) || []),
    ...(linkBuilder?.mappingParamsArr?.length ? ['__mapping_para__'] : []),
  ];

  const eleRef = useRef<any>(null);

  useOnClickOutside(eleRef, () => {
    setVisible(false);
  });
  return (
    <div style={{ display: 'flex', flex: 1 }} ref={eleRef}>
      <Tooltip
        visible={visible}
        // @ts-ignore
        title={<Input.TextArea style={{ width: 600 }} autoSize={{ minRows: 2, maxRows: 6 }} value={value} onChange={onChange} />}
        getPopupContainer={() => eleRef.current}
        color={darkMode ? 'rgb(24,27,31)' : '#fff'}
        overlayStyle={{ maxWidth: 615 }}
        overlayInnerStyle={{ width: 615 }}
        placement='topRight'
      >
        <Input.Group compact>
          <Input style={{ width: linkBuilder ? 'calc(100% - 64px)' : 'calc(100% - 32px)' }} disabled={disabled} value={value} onChange={onChange} {...props} />
          <Button icon={<FullscreenOutlined onClick={() => setVisible(true)} />} />
          {linkBuilder && <Button icon={<ToolOutlined />} onClick={() => setLinkBuilderVisible(true)} />}
        </Input.Group>
      </Tooltip>
      <LinkBuilder
        rawData={linkBuilder?.rawData || {}}
        vars={vars}
        visible={linkBuilderVisible}
        onClose={() => {
          setLinkBuilderVisible(false);
        }}
        onChange={onChange}
        extracts={linkBuilder?.extracts}
        mappingParamsArr={linkBuilder?.mappingParamsArr}
      />
    </div>
  );
}

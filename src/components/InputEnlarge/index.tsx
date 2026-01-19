import React, { useState, useContext, useRef } from 'react';
import { Input, Tooltip, InputProps, Button } from 'antd';
import { FullscreenOutlined, ToolFilled } from '@ant-design/icons';
import useOnClickOutside from '../useOnClickOutside';
import { CommonStateContext } from '@/App';
import LinkBuilder from './LinkBuilder';
import { ILogMappingParams, ILogExtract } from '@/pages/log/IndexPatterns/types';
import { useTranslation } from 'react-i18next';

export default function InputEnlarge({
  disabled,
  value,
  onChange,
  linkBuilder,
  ...props
}: InputProps & { linkBuilder?: { variables?: string[]; extracts?: ILogExtract[]; mappingParamsArr?: ILogMappingParams[]; rawData?: object } }) {
  const { darkMode: appDarkMode } = useContext(CommonStateContext);
  // hoc打开的组件获取不到 App 中 useContext, 这里用localStorage兜底；无痕第一次登录时 兜不住，再拿body上的classname来兜底一下
  const darkMode = appDarkMode || localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('theme-dark');
  const [visible, setVisible] = useState(false);
  const [linkBuilderVisible, setLinkBuilderVisible] = useState(false);
  const vars = [
    ...(linkBuilder?.variables || []),
    ...(linkBuilder?.extracts?.filter((i) => !!i).map((i) => i.newField) || []),
    ...(linkBuilder?.mappingParamsArr?.length ? ['__mapping_para__'] : []),
  ];
  const { t } = useTranslation('inputEnlarge');
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
          {linkBuilder && (
            <Tooltip title={t('linkBuilderTip')}>
              <Button icon={<ToolFilled />} onClick={() => setLinkBuilderVisible(true)} />
            </Tooltip>
          )}
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

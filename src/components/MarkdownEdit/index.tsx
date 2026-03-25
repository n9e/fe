import React, { useContext } from 'react';
import MDEditor, { commands, EditorContext } from '@uiw/react-md-editor';
import { useTranslation } from 'react-i18next';
import './style.less';
import { CommonStateContext } from '@/App';

const PreviewButton = () => {
  const { preview, dispatch } = useContext(EditorContext);
  const click = () => {
    dispatch!({
      preview: preview === 'edit' ? 'preview' : 'edit',
    });
  };
  return (
    <button type='button' onClick={click}>
      {preview === 'edit' ? 'Preview' : 'Edit'}
    </button>
  );
};

interface IProps {
  value?: string;
  onChange?: (value?: string) => void;
  isDisabled?: boolean;
}

export default function MarkdownEdit(props: IProps) {
  const { t } = useTranslation();

  const { value, onChange, isDisabled } = props;

  const { darkMode: appDarkMode } = useContext(CommonStateContext);
  // hoc打开的组件获取不到 App 中 useContext, 这里用localStorage兜底；无痕第一次登录时 兜不住，再拿body上的classname来兜底一下
  const darkMode = appDarkMode || localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('theme-dark');
  return (
    <div data-color-mode={darkMode ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        className='mdEditor-box'
        preview={'edit'}
        onChange={(value, event, state) => {
          onChange && onChange(value);
        }}
        textareaProps={{
          disabled: isDisabled,
          placeholder: 'Markdown is supported',
        }}
        extraCommands={[
          {
            name: 'preview',
            keyCommand: 'preview',
            value: 'preview',
            icon: <PreviewButton />,
          },
        ]}
        commands={[
          ...commands.getCommands()?.filter((el, index) => {
            // console.log('commands.getCommands()', commands.getCommands());
            // 去掉最后的 help 和 竖线
            return index < commands.getCommands()?.length - 2;
          }),
        ]}
      />
    </div>
  );
}

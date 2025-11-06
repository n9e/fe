import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { EditOutlined } from '@ant-design/icons';

import { IVariable } from './types';
import { useGlobalState } from '../globalState';
import EditModal from './EditModal';
import Main from './Main';

import './style.less';

export type { IVariable } from './types';

interface Props {
  queryParams: Record<string, any>;
  editable: boolean;
  editModalVariablecontainerRef: React.RefObject<HTMLDivElement>;
  onChange: (newVariables: IVariable[]) => void;
  onInitialized?: () => void;
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { queryParams, editable, editModalVariablecontainerRef, onChange, onInitialized } = props;
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const [editing, setEditing] = useState<boolean>(false);
  const hasCalledInitializedRef = React.useRef<boolean>(false);

  // 追踪 Query 变量的初始化状态
  React.useEffect(() => {
    if (hasCalledInitializedRef.current || !onInitialized || _.isEmpty(variablesWithOptions)) return;

    const queryVariables = _.filter(variablesWithOptions, (item) => item.type === 'query');

    // 如果没有 query 类型的变量，立即触发回调
    if (queryVariables.length === 0) {
      hasCalledInitializedRef.current = true;
      onInitialized();
      return;
    }

    // 检查所有 query 变量是否都已初始化（有 options 属性，注意是检查属性存在，不是检查值）
    const allInitialized = _.every(queryVariables, (variable) => {
      return variable.options !== undefined; // 只要 options 属性存在就算初始化完成，可以是空数组
    });

    if (allInitialized) {
      hasCalledInitializedRef.current = true;
      onInitialized();
    }
  }, [variablesWithOptions, onInitialized]);

  const renderBtns = () => {
    if (editable) {
      if (_.isEmpty(variablesWithOptions)) {
        return (
          <a
            onClick={() => {
              setEditing(true);
            }}
          >
            {t('var.btn')}
          </a>
        );
      } else if (_.isEmpty(_.filter(variablesWithOptions, (item) => !item.hide && item.type !== 'constant'))) {
        return (
          <a
            onClick={() => {
              setEditing(true);
            }}
          >
            {t('var.title.edit')}
          </a>
        );
      } else {
        return (
          <EditOutlined
            className='n9e-dashboard-variable-edit-icon'
            onClick={() => {
              setEditing(true);
            }}
          />
        );
      }
    }
    return null;
  };

  return (
    <div className='n9e-dashboard-variables-container'>
      <Main variableValueFixed={queryParams.__variable_value_fixed} loading={false} renderBtns={renderBtns} />
      {/** 用 createPortal 复制渲染变量 */}
      {editModalVariablecontainerRef.current &&
        createPortal(<Main variableValueFixed={queryParams.__variable_value_fixed} loading={false} />, editModalVariablecontainerRef.current)}
      <EditModal visible={editing} setVisible={setEditing} onChange={onChange} />
    </div>
  );
}

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
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { queryParams, editable, editModalVariablecontainerRef, onChange } = props;
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const [editing, setEditing] = useState<boolean>(false);

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

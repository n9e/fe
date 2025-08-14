import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FormListFieldData } from 'antd/es/form/FormList';
import { Form, Button } from 'antd';
import _ from 'lodash';

import { Panel } from '../../Components/Collapse';
import LinkItem from './LinkItem';
import FormModal, { ModalState } from './FormModal';

interface Props {
  field?: FormListFieldData;
  namePath?: (string | number)[];
  prefixNamePath?: (string | number)[];
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { field = {}, namePath = ['options'], prefixNamePath = [] } = props;
  const [modalState, setModalState] = useState<ModalState>({
    visible: false,
    action: 'add',
    fieldName: 0,
  });
  const form = Form.useFormInstance();

  return (
    <Panel header={t('panel.options.links.label')}>
      <Form.List {..._.omit(field, ['name', 'key'])} name={[...namePath, 'links']}>
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <Form.Item key={key} {...restField} name={name} noStyle>
                <LinkItem
                  onEdit={(value) => {
                    setModalState({
                      visible: true,
                      action: 'edit',
                      fieldName: name,
                      data: value,
                    });
                  }}
                  onDelete={() => {
                    remove(name);
                  }}
                />
              </Form.Item>
            ))}
            <Button
              onClick={() => {
                setModalState({
                  visible: true,
                  action: 'add',
                  fieldName: fields.length,
                });
              }}
              block
            >
              {t('panel.options.links.add_btn')}
            </Button>
          </>
        )}
      </Form.List>
      <FormModal
        modalState={modalState}
        setModalState={setModalState}
        onOk={(data) => {
          const valuesClone = _.cloneDeep(form.getFieldsValue());
          if (modalState.action === 'edit') {
            _.set(valuesClone, [...prefixNamePath, ...namePath, 'links', modalState.fieldName], data);
          } else {
            const links = _.get(valuesClone, [...prefixNamePath, ...namePath, 'links'], []);
            _.set(valuesClone, [...prefixNamePath, ...namePath, 'links'], [...links, data]);
          }
          form.setFieldsValue(valuesClone);
        }}
      />
    </Panel>
  );
}

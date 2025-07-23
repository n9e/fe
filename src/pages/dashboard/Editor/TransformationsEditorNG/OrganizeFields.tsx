import React, { useState, useEffect } from 'react';
import { Input, Row, Col, Button, Space, Form, Empty } from 'antd';
import { MenuOutlined, EyeOutlined, EyeInvisibleOutlined, InfoCircleOutlined, BugOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';

import EyeSwitch from '../Components/EyeSwitch';
import Collapse, { Panel } from '../Components/Collapse';
import { useGlobalState } from '../../globalState';

interface Value {
  excludeByName?: {
    [index: string]: boolean;
  };
  indexByName?: {
    [index: string]: number;
  };
  renameByName?: {
    [index: string]: string;
  };
}

interface IProps {
  field: FormListFieldData;
  onClose: () => void;
  value?: Value;
  onChange?: (value: Value) => void;
}

const SortableBody = SortableContainer(({ children }) => {
  return <div>{children}</div>;
});
const SortableItem = SortableElement(({ children }) => <div style={{ marginBottom: 8 }}>{children}</div>);
const DragHandle = SortableHandle(() => <Button icon={<MenuOutlined />} />);

export default function OrganizeFields(props: IProps) {
  const { t } = useTranslation('dashboard');
  const { field, onClose, value, onChange } = props;
  const { name, key, ...resetField } = field;
  const [displayedTableFields, setDisplayedTableFields] = useGlobalState('displayedTableFields');
  const [fields, setFields] = useState(_.flatten(displayedTableFields));

  useEffect(() => {
    setFields(_.flatten(displayedTableFields));
  }, [JSON.stringify(displayedTableFields)]);

  return (
    <Collapse>
      <Panel
        header={t('transformations.organize.title')}
        extra={
          <Space size={2}>
            <Button icon={<InfoCircleOutlined />} type='text' size='small' />
            <Button icon={<BugOutlined />} type='text' size='small' />
            <Form.Item {...resetField} name={[name, 'disabled']} noStyle>
              <EyeSwitch />
            </Form.Item>
            <Button
              icon={<DeleteOutlined />}
              type='text'
              size='small'
              onClick={() => {
                onClose();
              }}
            />
          </Space>
        }
      >
        <SortableBody
          useDragHandle
          helperClass='n9e-dashboard-editor-transformationNG-organizeFields-row-dragging'
          onSortEnd={({ oldIndex, newIndex }) => {
            const newFields = arrayMoveImmutable(fields, oldIndex, newIndex);
            setFields(newFields);
            onChange &&
              onChange({
                ...(value || {}),
                indexByName: _.reduce(
                  newFields,
                  (result, value, index) => {
                    result[value] = index;
                    return result;
                  },
                  {},
                ),
              });
          }}
        >
          {_.isEmpty(fields) ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            _.map(fields, (field, index) => {
              const exclude = _.find(value?.excludeByName, (val, key) => {
                return key === field;
              });
              const rename = _.find(value?.renameByName, (val, key) => {
                return key === field;
              });
              return (
                <SortableItem key={field} index={index}>
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <DragHandle />
                    </Col>
                    <Col flex='32px'>
                      <Button
                        icon={exclude ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        onClick={() => {
                          onChange &&
                            onChange({
                              ...(value || {}),
                              excludeByName: {
                                ...(value?.excludeByName || {}),
                                [field]: !exclude,
                              },
                            });
                        }}
                      />
                    </Col>
                    <Col flex='auto'>
                      <InputGroupWithFormItem label={field}>
                        <Input
                          value={rename}
                          onChange={(e) => {
                            onChange &&
                              onChange({
                                ...(value || {}),
                                renameByName: {
                                  ...(value?.renameByName || {}),
                                  [field]: e.target.value,
                                },
                              });
                          }}
                        />
                      </InputGroupWithFormItem>
                    </Col>
                  </Row>
                </SortableItem>
              );
            })
          )}
        </SortableBody>
      </Panel>
    </Collapse>
  );
}

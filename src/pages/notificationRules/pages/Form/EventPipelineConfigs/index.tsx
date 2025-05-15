import React, { useEffect, useState } from 'react';
import { Form, Card, Space, Switch, Row, Col, Button, Select, Tooltip } from 'antd';
import { PlusOutlined, MinusCircleOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import { arrayMoveImmutable } from 'array-move';

import { SIZE } from '@/utils/constant';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { NS as eventPipelineNS, PERM as eventPipelinePERM } from '@/pages/eventPipeline/constants';
import { getList as getEventPipelineList, Item as EventPipeline } from '@/pages/eventPipeline/services';

import { NS } from '../../../constants';
import DragIcon from './DragIcon';

/**
 * @description 获取其他的 pipeline 列表，排除掉已选择的，包括当前的 pipeline
 */
function getOtherPipelineList(pipelineList: EventPipeline[], curPipelineId: number, selectedPipelineIds: number[]) {
  const selectedPipelineIdSet = new Set(selectedPipelineIds);
  return pipelineList.filter((item) => {
    return item.id === curPipelineId || !selectedPipelineIdSet.has(item.id);
  });
}

const SortableBody = SortableContainer(({ children }) => {
  return <div>{children}</div>;
});
const SortableItem = SortableElement(({ children }) => <div>{children}</div>);
const DragHandle = SortableHandle(() => <Button type='text' icon={<DragIcon />} />);

export default function index() {
  const { t } = useTranslation(NS);
  const isAuthorized = useIsAuthorized([eventPipelinePERM]);
  const form = Form.useFormInstance();
  const pipelineConfigs = Form.useWatch('pipeline_configs');
  const [eventPipelineList, setEventPipelineList] = useState<EventPipeline[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    getEventPipelineList()
      .then((res) => {
        setEventPipelineList(res);
      })
      .catch(() => {
        setEventPipelineList([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card
      className='mb2'
      title={
        <Space>
          {t('pipeline_configuration.title')}
          {isAuthorized && (
            <Link to={`/${eventPipelineNS}`} target='_blank'>
              <SettingOutlined />
            </Link>
          )}
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              fetchData();
              e.preventDefault();
            }}
          />
        </Space>
      }
    >
      <Form.List name='pipeline_configs'>
        {(fields, { add, remove }) => (
          <>
            <SortableBody
              useDragHandle
              helperClass='row-dragging'
              onSortEnd={({ oldIndex, newIndex }) => {
                const newPipelineConfigs = arrayMoveImmutable(pipelineConfigs, oldIndex, newIndex);
                form.setFieldsValue({
                  pipeline_configs: newPipelineConfigs,
                });
              }}
            >
              <Space direction='vertical' size={0} className='w-full mb-2'>
                {fields.map(({ key, name, ...restField }, index) => {
                  const selectedPipelineIds = _.compact(_.map(pipelineConfigs, 'pipeline_id'));
                  const pipelineId = form.getFieldValue(['pipeline_configs', name, 'pipeline_id']);
                  const enable = form.getFieldValue(['pipeline_configs', name, 'enable']);

                  return (
                    <SortableItem key={key} index={index}>
                      <Row key={key} gutter={SIZE * 2} align='middle'>
                        <Col flex='auto'>
                          <Form.Item {...restField} name={[name, 'pipeline_id']} rules={[{ required: true, message: t('pipeline_configuration.name_required') }]}>
                            <Select
                              className='w-full'
                              options={_.map(getOtherPipelineList(eventPipelineList, pipelineId, selectedPipelineIds), (item) => {
                                return {
                                  originLabel: item.name,
                                  label: (
                                    <Space>
                                      {item.name}
                                      <Link to={`/${eventPipelineNS}/edit/${item.id}`} target='_blank'>
                                        {t('common:btn.view')}
                                      </Link>
                                    </Space>
                                  ),
                                  value: item.id,
                                };
                              })}
                              showSearch
                              optionFilterProp='originLabel'
                              optionLabelProp='originLabel'
                              placeholder={t('pipeline_configuration.name_placeholder')}
                              dropdownMatchSelectWidth={false}
                            />
                          </Form.Item>
                        </Col>
                        <Col flex='none'>
                          <Space size={SIZE}>
                            <Tooltip title={enable ? t('pipeline_configuration.disable') : t('pipeline_configuration.enable')}>
                              <Form.Item {...restField} name={[name, 'enable']} valuePropName='checked'>
                                <Switch size='small' />
                              </Form.Item>
                            </Tooltip>
                            <Space size={0}>
                              <Form.Item>
                                <Button
                                  type='text'
                                  icon={<MinusCircleOutlined />}
                                  onClick={() => {
                                    remove(name);
                                  }}
                                />
                                <DragHandle />
                              </Form.Item>
                            </Space>
                          </Space>
                        </Col>
                      </Row>
                    </SortableItem>
                  );
                })}
              </Space>
            </SortableBody>
            <div>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  add({
                    enable: true,
                  });
                }}
              >
                {t('pipeline_configuration.add_btn')}
              </Button>
            </div>
          </>
        )}
      </Form.List>
    </Card>
  );
}

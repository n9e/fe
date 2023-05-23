/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useEffect, useState, useCallback, useContext, useRef } from 'react';
import { Modal, Tag, Form, Input, Alert, Select, Tooltip, Divider, Space, Button, notification } from 'antd';
import { DatabaseOutlined, PlusOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import { useTranslation } from 'react-i18next';
import _, { debounce } from 'lodash';
import classNames from 'classnames';
import { bindTags, unbindTags, moveTargetBusi, updateTargetNote, deleteTargets, getTargetTags } from '@/services/targets';
import PageLayout from '@/components/pageLayout';
import { getBusiGroups } from '@/services/common';
import { CommonStateContext } from '@/App';
import List from './List';
import BusinessGroup from './BusinessGroup';
import './locale';
import './index.less';

export { BusinessGroup };

enum OperateType {
  BindTag = 'bindTag',
  UnbindTag = 'unbindTag',
  UpdateBusi = 'updateBusi',
  RemoveBusi = 'removeBusi',
  UpdateNote = 'updateNote',
  Delete = 'delete',
  None = 'none',
}

interface OperateionModalProps {
  operateType: OperateType;
  setOperateType: any;
  idents: string[];
  reloadList: () => void;
}

const { TextArea } = Input;

const OperationModal: React.FC<OperateionModalProps> = ({ operateType, setOperateType, idents, reloadList }) => {
  const { t } = useTranslation('targets');
  const { busiGroups } = useContext(CommonStateContext);
  const [form] = Form.useForm();
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);
  const [identList, setIdentList] = useState<string[]>(idents);
  const [tagsList, setTagsList] = useState<string[]>([]);
  const [tagsAllList, setTagsAllList] = useState<string[]>([]);
  const detailProp = operateType === OperateType.UnbindTag ? tagsList : (operateType === OperateType.BindTag ? tagsAllList:busiGroups);
  const inputRef = useRef<InputRef>(null);
  const [tag, setTag] = useState('');
  const [tagStatus, setTagStatus] = useState<any>();

  // 绑定标签弹窗内容
  const bindTagDetail = (tagsAllList) => {
    const contentRegExp = /^cmdb_[a-zA-Z_][\w]*={1}[^=]+$/;
    const onTagChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setTag(event.target.value);
    };
    const addTag = (e) => {
      e.stopPropagation()
      e.preventDefault();
      const { isCorrectFormat, isLengthAllowed } = isTagValid_add(tag)
      if(isCorrectFormat && isLengthAllowed){
        if(tagsAllList.indexOf(tag)==-1){
          setTagsAllList([...tagsAllList, tag]);
          setTagStatus(undefined)
        }else{
          setTagStatus('error')
          notification.warning({
            message: '此标签已存在',
          });
        }
      } else {
        notification.warning({
          message: 'key 以字母或下划线开头，由字母、数字和下划线组成。[cmdb_为保留前缀]',
        });
        setTagStatus('error')
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    };
    // 校验单个标签格式是否正确
    function isTagValid(tag) {
      const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
      return {
        isCorrectFormat: contentRegExp.test(tag.toString()),
        isLengthAllowed: tag.toString().length <= 64,
      };
    }
    function isTagValid_add(tag) {
      const contentRegExp = /^(?!cmdb_)[a-zA-Z_][\w]*={1}[^=]+$/;
      return {
        isCorrectFormat: contentRegExp.test(tag.toString()),
        isLengthAllowed: tag.toString().length <= 64,
      };
    }

    function dropdownRender(menu) {
      return (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <Input
              placeholder='标签格式 key=value'
              ref={inputRef}
              status={tagStatus}
              value={tag}
              style={{width:'280px'}}
              onPressEnter={addTag}
              onChange={onTagChange}
            />
            <Button type="text" icon={<PlusOutlined />} onClick={addTag}>
              新增标签
            </Button>
          </Space>
        </>
      )
    }

    // 渲染标签
    function tagRender(content) {
      const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
      return isCorrectFormat && isLengthAllowed ? (
        <Tag closable={content.closable} onClose={content.onClose}>
          {content.value}
        </Tag>
      ) : (
        <Tooltip title={isCorrectFormat ? t('bind_tag.render_tip1') : t('bind_tag.render_tip2')}>
          <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
            {content.value}
          </Tag>
        </Tooltip>
      );
    }

    // 校验所有标签格式
    function isValidFormat() {
      return {
        validator(_, value) {
          const isInvalid = value.some((tag) => {
            const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
            if (!isCorrectFormat || !isLengthAllowed) {
              return true;
            }
          });
          return isInvalid ? Promise.reject(new Error(t('bind_tag.msg2'))) : Promise.resolve();
        },
      };
    }

    return {
      operateTitle: t('bind_tag.title'),
      requestFunc: bindTags,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('common:table.tag')} name='tags' rules={[{ required: true, message: t('bind_tag.msg1') }, isValidFormat]}>
            <Select
              mode='multiple' showArrow={true}
              placeholder={t('bind_tag.placeholder_select')}
              dropdownRender={dropdownRender}
              options={tagsAllList.map((tag) => ({ label: tag, value: tag, disabled: contentRegExp.test(tag) }))} />
          </Form.Item>
        );
      },
    };
  };

  // 解绑标签弹窗内容
  const unbindTagDetail = (tagsList) => {
    const contentRegExp = /^cmdb_[a-zA-Z_][\w]*={1}[^=]+$/;
    return {
      operateTitle: t('unbind_tag.title'),
      requestFunc: unbindTags,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('common:table.tag')} name='tags' rules={[{ required: true, message: t('unbind_tag.msg') }]}>
            <Select mode='multiple' showArrow={true} placeholder={t('unbind_tag.placeholder')} options={tagsList.map((tag) => ({ label: tag, value: tag, disabled: contentRegExp.test(tag) }))} />
          </Form.Item>
        );
      },
    };
  };

  // 移出业务组弹窗内容
  const removeBusiDetail = () => {
    return {
      operateTitle: t('remove_busi.title'),
      requestFunc: moveTargetBusi,
      isFormItem: false,
      render() {
        return <Alert message={t('remove_busi.msg')} type='error' />;
      },
    };
  };

  // 修改备注弹窗内容
  const updateNoteDetail = () => {
    return {
      operateTitle: t('update_note.title'),
      requestFunc: updateTargetNote,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('common:table.note')} name='note'>
            <Input maxLength={64} placeholder={t('update_note.placeholder')} />
          </Form.Item>
        );
      },
    };
  };

  // 批量删除弹窗内容
  const deleteDetail = () => {
    return {
      operateTitle: t('batch_delete.title'),
      requestFunc: deleteTargets,
      isFormItem: false,
      render() {
        return <Alert message={t('batch_delete.msg')} type='error' />;
      },
    };
  };

  // 修改业务组弹窗内容
  const updateBusiDetail = (busiGroups) => {
    return {
      operateTitle: t('update_busi.title'),
      requestFunc: moveTargetBusi,
      isFormItem: true,
      render() {
        return (
          <Form.Item label={t('update_busi.label')} name='bgid' rules={[{ required: true }]}>
            <Select
              showSearch
              style={{ width: '100%' }}
              options={filteredBusiGroups.map(({ id, name }) => ({
                label: name,
                value: id,
              }))}
              optionFilterProp='label'
              filterOption={false}
              onSearch={handleSearch}
              onFocus={() => {
                getBusiGroups('').then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              }}
              onClear={() => {
                getBusiGroups('').then((res) => {
                  setFilteredBusiGroups(res.dat || []);
                });
              }}
            />
          </Form.Item>
        );
      },
    };
  };

  const operateDetail = {
    bindTagDetail,
    unbindTagDetail,
    updateBusiDetail,
    removeBusiDetail,
    updateNoteDetail,
    deleteDetail,
    noneDetail: () => ({
      operateTitle: '',
      requestFunc() {
        return Promise.resolve();
      },
      isFormItem: false,
      render() {},
    }),
  };
  const { operateTitle, requestFunc, isFormItem, render } = operateDetail[`${operateType}Detail`](detailProp);
  const [filteredBusiGroups, setFilteredBusiGroups] = useState(busiGroups);
  function formatValue() {
    const inputValue = form.getFieldValue('idents');
    const formattedIdents = inputValue.split(/[ ,\n]+/).filter((value) => value);
    const formattedValue = formattedIdents.join('\n');
    // 自动格式化表单内容
    if (inputValue !== formattedValue) {
      form.setFieldsValue({
        idents: formattedValue,
      });
    }
    // 当对象标识变更时，更新标识数组
    if (identList.sort().join('\n') !== formattedIdents.sort().join('\n')) {
      setIdentList(formattedIdents);
    }
  }

  // 提交表单
  function submitForm() {
    form.validateFields().then((data) => {
      setConfirmLoading(true);
      data.idents = data.idents.split('\n');
      requestFunc(data)
        .then(() => {
          setOperateType(OperateType.None);
          reloadList();
          form.resetFields();
          setConfirmLoading(false);
        })
        .catch(() => setConfirmLoading(false));
    });
  }

  // 初始化展示所有业务组
  useEffect(() => {
    if (!filteredBusiGroups.length) {
      setFilteredBusiGroups(busiGroups);
    }
  }, [busiGroups]);

  const fetchBusiGroup = (e) => {
    getBusiGroups(e).then((res) => {
      setFilteredBusiGroups(res.dat || []);
    });
  };
  const handleSearch = useCallback(debounce(fetchBusiGroup, 800), []);

  // 点击批量操作时，初始化默认监控对象列表
  useEffect(() => {
    if (operateType !== OperateType.None) {
      setIdentList(idents);
      form.setFieldsValue({
        idents: idents.join('\n'),
      });
    }
  }, [operateType, idents]);

  useEffect(() => {
    if (operateType === OperateType.UnbindTag && identList.length) {// 解绑标签时，根据输入框监控对象动态获取标签列表
      getTargetTags({ idents: identList.join(',') }).then(({ dat }) => {
        // 删除多余的选中标签
        const curSelectedTags = form.getFieldValue('tags') || [];
        form.setFieldsValue({
          tags: curSelectedTags.filter((tag) => dat.includes(tag)),
        });

        setTagsList(dat);
      });
    }else if (operateType === OperateType.BindTag && identList.length) {// 绑定标签时，全量获取标签列表
      getTargetTags(undefined).then((res) => {
        setTagsAllList(
          _.filter(res?.dat || [],(item)=>{
            const contentRegExp = /^(?!cmdb_)[a-zA-Z_][\w]*={1}[^=]+$/;
            return contentRegExp.test(item)
          }).map(res?.dat || [], (item) => {
            return item;
          }),
        );
      })
    }
  }, [operateType, identList]);

  return (
    <Modal
      visible={operateType !== 'none'}
      title={operateTitle}
      confirmLoading={confirmLoading}
      okButtonProps={{
        danger: operateType === OperateType.RemoveBusi || operateType === OperateType.Delete,
      }}
      okText={operateType === OperateType.RemoveBusi ? t('remove_busi.btn') : operateType === OperateType.Delete ? t('batch_delete.btn') : t('common:btn.ok')}
      onOk={submitForm}
      onCancel={() => {
        setOperateType(OperateType.None);
        form.resetFields();
      }}
    >
      {/* 基础展示表单项 */}
      <Form form={form} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
        <Form.Item label={t('targets')} name='idents' rules={[{ required: true }]}>
          <TextArea autoSize={{ minRows: 3, maxRows: 10 }} placeholder={t('targets_placeholder')} onBlur={formatValue} />
        </Form.Item>
        {isFormItem && render()}
      </Form>
      {!isFormItem && render()}
    </Modal>
  );
};

const Targets: React.FC = () => {
  const { t } = useTranslation('targets');
  const commonState = useContext(CommonStateContext);
  const [curBusiId, setCurBusiId] = useState<number>(commonState.curBusiId);
  const [operateType, setOperateType] = useState<OperateType>(OperateType.None);
  const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>([]);
  const [selectedIdents, setSelectedIdents] = useState<string[]>([]);
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));

  return (
    <PageLayout icon={<DatabaseOutlined />} title={t('title')}>
      <div className='object-manage-page-content'>
        <BusinessGroup
          curBusiId={curBusiId}
          setCurBusiId={(id) => {
            commonState.setCurBusiId(id);
            setCurBusiId(id);
          }}
          renderHeadExtra={() => {
            return (
              <div>
                <div className='left-area-group-title'>{t('default_filter')}</div>
                <div
                  className={classNames({
                    'n9e-metric-views-list-content-item': true,
                    active: curBusiId === 0,
                  })}
                  onClick={() => {
                    setCurBusiId(0);
                  }}
                >
                  {t('ungrouped_targets')}
                </div>
                <div
                  className={classNames({
                    'n9e-metric-views-list-content-item': true,
                    active: curBusiId === -1,
                  })}
                  onClick={() => {
                    setCurBusiId(-1);
                  }}
                >
                  {t('all_targets')}
                </div>
              </div>
            );
          }}
        />
        <div
          className='table-area'
          style={{
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <List
            curBusiId={curBusiId}
            selectedIdents={selectedIdents}
            setSelectedIdents={setSelectedIdents}
            selectedRowKeys={selectedRowKeys}
            setSelectedRowKeys={setSelectedRowKeys}
            refreshFlag={refreshFlag}
            setRefreshFlag={setRefreshFlag}
            setOperateType={setOperateType}
          />
        </div>
      </div>
      <OperationModal
        operateType={operateType}
        setOperateType={setOperateType}
        idents={selectedIdents}
        reloadList={() => {
          setRefreshFlag(_.uniqueId('refreshFlag_'));
        }}
      />
    </PageLayout>
  );
};

export default Targets;

import React, { useEffect, useState } from 'react';
import IconFont from '@/components/IconFont';
import { Button, Input, message, Popover, Select, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { IHiddenFeature, IRecommendActionItem } from '../../store';
import { CloseOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { deletePrompt } from '../../services';

interface IProps {
  dataSourceList: any[];
  defaultModel: any;
  setDefaultModel: (model: any) => void;
  userInput: string;
  setUserInput: (input: string) => void;
  promptList: string[];
  setPromptList: (list: string[]) => void;
  userSendMessage: (action?: IRecommendActionItem) => void;
  userCancelMessage: () => void;
  messageLoading: boolean;
  hiddenFeature?: IHiddenFeature;
}

export default function UserInput(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { dataSourceList, defaultModel, setDefaultModel, userInput, setUserInput, promptList, setPromptList, userSendMessage, messageLoading, userCancelMessage, hiddenFeature } =
    props;

  const [promptPopoverVisible, setPromptPopoverVisible] = useState<boolean>(false);
  const [selectModalVisible, setSelectModalVisible] = useState<boolean>(false);
  const [modalTipsVisible, setModalTipsVisible] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const handleDel = (prompt: string) => {
    deletePrompt({ prompt }).then((res) => {
      message.success(t('userInput.delPromptSuccess'));
      setPromptList(promptList.filter((el) => el !== prompt));
    });
  };

  return (
    <div className='user-input-box'>
      <Input.TextArea
        bordered={false}
        autoSize={{ minRows: 2, maxRows: 5 }}
        style={{ resize: 'none' }}
        maxLength={32468}
        value={userInput}
        placeholder={t('userInput.placeholder')}
        onChange={(e) => {
          if (e.target.value?.length > 32468) {
            message.error(t('userInput.maxLength'));
          } else {
            setUserInput(e.target.value);
          }
        }}
        // onPressEnter={(e) => {
        //   e.preventDefault();
        //   userInput?.trim();
        //   userSendMessage();
        // }}
        onCompositionStart={(e) => {
          setIsComposing(true);
        }}
        onCompositionEnd={(e) => {
          setIsComposing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.shiftKey) {
            // Shift+Enter: 允许换行，不发送消息
            // 不阻止默认行为，让浏览器自然插入换行符
          } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            // ctrl+enter 换行
            // cmd+enter 换行
            e.preventDefault();
            const textarea = e.target as HTMLTextAreaElement;
            const { selectionStart, selectionEnd } = textarea;
            const newText = userInput.slice(0, selectionStart) + '\n' + userInput.slice(selectionEnd);
            setUserInput(newText);
            requestAnimationFrame(() => {
              textarea.setSelectionRange(selectionStart + 1, selectionEnd + 1);
            });
          } else if (e.key === 'Enter' && !isComposing) {
            e.preventDefault();
            userInput?.trim();
            userSendMessage();
          }
        }}
      />
      <div className='input-option-box'>
        <div className='option-left'>
          {!hiddenFeature?.modalSelector && (
            <Tooltip
              title={t('userInput.modelTip')}
              placement='left'
              visible={modalTipsVisible && !selectModalVisible}
              onVisibleChange={(val) => {
                setModalTipsVisible(val);
              }}
            >
              <Select
                onDropdownVisibleChange={(val) => {
                  setSelectModalVisible(val);
                  val && setModalTipsVisible(false);
                }}
                value={defaultModel?.id}
                bordered={false}
                className='model-select'
                onChange={(val) => {
                  const tempModel = dataSourceList?.find((item) => item.id === val);
                  setDefaultModel(tempModel);
                }}
                options={dataSourceList?.map((item) => ({
                  label: item.name,
                  value: item.id,
                }))}
              ></Select>
            </Tooltip>
          )}

          {!hiddenFeature?.promptIcon && (
            <Popover
              overlayClassName='prompt-popover'
              content={
                <>
                  {promptList?.map((el, index) => {
                    return (
                      <div
                        className='prompt-item'
                        key={index}
                        onClick={() => {
                          setUserInput(el);
                        }}
                      >
                        <div className='prompt-item-text' title={el}>
                          {el}
                        </div>
                        <div className='prompt-item-icon'>
                          <CloseOutlined
                            className='prompt-item-icon-del'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDel(el);
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </>
              }
              placement='topLeft'
              trigger={['click']}
              visible={promptPopoverVisible}
              onVisibleChange={(val) => {
                setPromptPopoverVisible(val);
              }}
            >
              <Tooltip
                title={!promptList?.length ? t('userInput.promptTip') : ''}
                placement='right'
                visible={!promptList?.length && promptPopoverVisible}
                onVisibleChange={(val) => {
                  if (!promptList?.length) {
                    setPromptPopoverVisible(val);
                  }
                }}
              >
                <div className='prompt-btn'>
                  <IconFont type='icon-ic_collection' style={{ fontSize: 14 }} />
                </div>
              </Tooltip>
            </Popover>
          )}
        </div>
        <div className='option-right'>
          <Tooltip title={t('userInput.send')}>
            <Button
              type='primary'
              shape='circle'
              // loading={messageLoading}
              icon={messageLoading ? <PauseCircleOutlined /> : <IconFont type='icon-ic_send' style={{ color: '#fff', fontSize: 14 }} />}
              onClick={() => {
                if (messageLoading) {
                  userCancelMessage();
                } else {
                  userInput?.trim() && userSendMessage();
                  setUserInput('');
                }
              }}
            />
          </Tooltip>
          {/* <div className='send-btn'>
            <IconFont type='icon-ic_send' style={{ color: '#fff', fontSize: 14 }} />
          </div> */}
        </div>
      </div>
    </div>
  );
}

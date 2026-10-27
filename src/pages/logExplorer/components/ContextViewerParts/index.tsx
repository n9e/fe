import React, { useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import purify from 'dompurify';
import type { InputRef } from 'antd';
import { Button, Col, Input, Modal, Row, Space, Tag, Tooltip } from 'antd';
import { CloseSquareOutlined, EyeInvisibleOutlined, PlusOutlined, PlusSquareOutlined } from '@ant-design/icons';

/** 上下文抽屉共用的部件（SLS 风格）：关键词标签、字段显示设置、关键词标记 */

export interface DynamicTagsProps {
  newTagText?: string;
  value?: string[];
  onChange?: (tags: string[]) => void;
}

export function DynamicTags(props: DynamicTagsProps) {
  const { newTagText = 'New Tag', value = [], onChange } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [editInputIndex, setEditInputIndex] = useState(-1);
  const [editInputValue, setEditInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);
  const editInputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  useEffect(() => {
    editInputRef.current?.focus();
  }, [editInputIndex]);

  const confirmInput = () => {
    if (inputValue && !_.includes(value, inputValue)) {
      onChange?.([...value, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  const confirmEditInput = () => {
    const newTags = [...value];
    newTags[editInputIndex] = editInputValue;
    onChange?.(_.filter(newTags));
    setEditInputIndex(-1);
    setEditInputValue('');
  };

  return (
    <Space size={0}>
      {_.map(value, (tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              size='small'
              value={editInputValue}
              onChange={(e) => setEditInputValue(e.target.value)}
              onBlur={confirmEditInput}
              onPressEnter={confirmEditInput}
            />
          );
        }

        const tagElem = (
          <Tag
            key={tag}
            closable
            onClose={() => {
              onChange?.(_.filter(value, (item) => item !== tag));
            }}
          >
            <span
              onDoubleClick={(e) => {
                setEditInputIndex(index);
                setEditInputValue(tag);
                e.preventDefault();
              }}
            >
              {tag.length > 20 ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        );
        return tag.length > 20 ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        );
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          size='small'
          className='min-w-[80px]'
          placeholder={newTagText}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={confirmInput}
          onPressEnter={confirmInput}
        />
      ) : (
        <Tag className='cursor-pointer' onClick={() => setInputVisible(true)}>
          <PlusOutlined /> {newTagText}
        </Tag>
      )}
    </Space>
  );
}

export function DynamicTagsTrigger(props: DynamicTagsProps) {
  const { newTagText = 'New Tag', value = [], onChange } = props;
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisible) inputRef.current?.focus();
  }, [inputVisible]);

  const confirmInput = () => {
    if (inputValue && !_.includes(value, inputValue)) {
      onChange?.([...value, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  if (inputVisible) {
    return (
      <Input
        ref={inputRef}
        className='min-w-[80px]'
        placeholder={newTagText}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={confirmInput}
        onPressEnter={confirmInput}
      />
    );
  }
  return (
    <Button onClick={() => setInputVisible(true)} icon={<PlusOutlined />}>
      {newTagText}
    </Button>
  );
}

export interface OrganizeFieldsLabels {
  title: string;
  tip: (fields: string) => string;
  allFields: string;
  showFields: string;
  showFieldsEmpty: string;
}

export function OrganizeFields(props: { fields: string[]; organizeFields: string[]; onChange: (fields: string[]) => void; labels: OrganizeFieldsLabels }) {
  const { fields, organizeFields, onChange, labels } = props;
  const [visible, setVisible] = useState(false);
  const [currentFields, setCurrentFields] = useState(organizeFields);

  useEffect(() => {
    setCurrentFields(organizeFields);
  }, [JSON.stringify(organizeFields)]);

  return (
    <>
      <Button onClick={() => setVisible(true)}>
        <Space>
          {labels.title}
          {!_.isEmpty(organizeFields) && (
            <Tooltip title={labels.tip(_.join(organizeFields, ', '))}>
              <EyeInvisibleOutlined className='text-gray-500' />
            </Tooltip>
          )}
        </Space>
      </Button>
      <Modal
        className='log-explorer-ignore-click-away'
        title={labels.title}
        visible={visible}
        onOk={() => {
          onChange(currentFields);
          setVisible(false);
        }}
        onCancel={() => setVisible(false)}
      >
        <Row gutter={16}>
          <Col span={12}>
            <div>
              <div className='border border-solid border-fc-300 border-b-0 py-2 px-4'>
                <h3 className='m-0'>{labels.allFields}</h3>
              </div>
              <div className='border border-solid border-fc-300 p-4 overflow-y-auto h-[450px]'>
                {_.map(_.xor(fields, currentFields), (field) => (
                  <div
                    key={field}
                    className='cursor-pointer mb-2'
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentFields([...currentFields, field]);
                    }}
                  >
                    <Space>
                      <PlusSquareOutlined />
                      {field}
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div>
              <div className='border border-solid border-fc-300 border-b-0 py-2 px-4'>
                <h3 className='m-0'>{labels.showFields}</h3>
              </div>
              <div className='border border-solid border-fc-300 p-4 overflow-y-auto h-[450px]'>
                {_.isEmpty(currentFields) && <div className='text-gray-400'>{labels.showFieldsEmpty}</div>}
                {_.map(currentFields, (field) => (
                  <div
                    key={field}
                    className='cursor-pointer mb-2'
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentFields(_.filter(currentFields, (item) => item !== field));
                    }}
                  >
                    <Space>
                      <CloseSquareOutlined />
                      {field}
                    </Space>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </Modal>
    </>
  );
}

function stringifyContextValue(value: any) {
  if (_.isPlainObject(value) || _.isArray(value)) {
    return JSON.stringify(value);
  }
  return _.toString(value ?? '');
}

function highlightPattern(keywords: string[]) {
  const escapedKeywords = _.filter(_.map(keywords, (keyword) => _.escapeRegExp(_.escape(keyword))));
  if (_.isEmpty(escapedKeywords)) return null;
  return new RegExp(`(${_.join(escapedKeywords, '|')})`, 'gi');
}

/** 过滤关键词标红、高亮关键词黄底；先转义再替换，输出经 DOMPurify 净化 */
export function renderMarkedText(value: any, filterKeywords: string[], highlightKeywords: string[]) {
  let html = _.escape(stringifyContextValue(value));
  const filterPattern = highlightPattern(filterKeywords);
  if (filterPattern) {
    html = html.replace(filterPattern, "<span style='color: #f50;'>$1</span>");
  }
  const bgPattern = highlightPattern(highlightKeywords);
  if (bgPattern) {
    html = html.replace(bgPattern, "<span style='background-color: yellow;'>$1</span>");
  }
  return <span dangerouslySetInnerHTML={{ __html: purify.sanitize(html) }} />;
}

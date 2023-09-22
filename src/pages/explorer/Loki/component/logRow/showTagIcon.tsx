import React, { useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

interface IProps {
  showTags: boolean;
  onShowTagsChange: (showTags: boolean) => void;
}

const ShowTagSelectIcon = (props: IProps) => {
  const { showTags, onShowTagsChange } = props;
  return <>{showTags ? <DownOutlined onClick={() => onShowTagsChange(false)} /> : <RightOutlined onClick={() => onShowTagsChange(true)} />}</>;
};

export default ShowTagSelectIcon;

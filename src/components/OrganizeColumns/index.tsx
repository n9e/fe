import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { List, Modal, Space } from 'antd';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
export { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from './utils';

interface Key {
  name: string;
  i18nKey?: string;
  visible: boolean;
}

interface OrganizeColumnsProps {
  i18nNs: string;
  value: Key[];
  onChange: (value: Key[]) => void;
}

function OrganizeColumns(props: OrganizeColumnsProps & ModalWrapProps) {
  const { t } = useTranslation(props.i18nNs);
  const { value, onChange, visible, destroy } = props;
  const [list, setList] = React.useState<Key[]>(value);

  return (
    <Modal
      title={t('targets:organize_columns.title')}
      visible={visible}
      onCancel={destroy}
      onOk={() => {
        onChange(list);
        destroy();
      }}
    >
      <List
        bordered
        dataSource={list}
        renderItem={(item) => (
          <List.Item>
            <Space>
              <span
                onClick={() => {
                  const newList = _.cloneDeep(list);
                  const index = newList.findIndex((i) => i.name === item.name);
                  newList[index].visible = !newList[index].visible;
                  setList(newList);
                }}
              >
                {item.visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
              </span>
              {t(item.i18nKey || item.name)}
            </Space>
          </List.Item>
        )}
      />
    </Modal>
  );
}

export default ModalHOC<OrganizeColumnsProps>(OrganizeColumns);

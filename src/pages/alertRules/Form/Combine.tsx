import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse } from 'antd';
import { CaretRightOutlined,  } from '@ant-design/icons';
import { panelBaseProps,  } from '../constants';
import Combine from './components/combine'
const { Panel } = Collapse;

export default function index({disabled}) {
  const { t } = useTranslation('alertRules');
  return (
    <Collapse {...panelBaseProps} defaultActiveKey={['0']}>
      <Panel header="自定义报警通知" key="0">
        <Collapse
          accordion
          defaultActiveKey={[]}
          expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}>
          <Panel header="一级报警" key="1" forceRender={true}>
            <Combine index={'1'} disabled={disabled} />
          </Panel>
          <Panel header="二级报警" key="2" forceRender={true}>
            <Combine index={'2'} disabled={disabled} />
          </Panel>
          <Panel header="三级报警" key="3" forceRender={true}>
            <Combine index={'3'} disabled={disabled} />
          </Panel>
        </Collapse>
      </Panel>
    </Collapse>
  );
}

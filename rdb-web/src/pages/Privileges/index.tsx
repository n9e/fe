import React from 'react'
import { Tabs } from 'antd';
import Glbal from './CreateSelectedNode';

const { TabPane } = Tabs;
const defaultActiveKey = window.localStorage.getItem('user-manmgement-privileges-active') || 'global';

const index = () => {
  return <>
    <Tabs
      defaultActiveKey={defaultActiveKey}
      onChange={(key) => {
        window.localStorage.setItem('user-manmgement-privileges-active', key);
      }}
    >
      <TabPane tab="页面权限" key="global">
        <Glbal type='global' />
      </TabPane>
      <TabPane tab="资源权限" key="local">
        <Glbal type='local' />
      </TabPane>
    </Tabs>
  </>
}

export default index;



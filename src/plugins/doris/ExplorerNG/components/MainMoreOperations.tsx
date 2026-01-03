import React from 'react';
import { Form, Button, Space, Dropdown, Menu } from 'antd';
import { MoreOutlined, ApartmentOutlined, DownloadOutlined } from '@ant-design/icons';

import { ShareLinkText } from '@/pages/logExplorer/components/Share';

// @ts-ignore
import ExportModal from 'plus:/components/LogDownload/ExportModal';
// @ts-ignore
import DrilldownBtn from 'plus:/pages/LogExploreLinkSetting/components/DrilldownBtn';

export default function MainMoreOperations() {
  const datasourceValue = Form.useWatch('datasourceValue');

  return (
    <Dropdown
      overlay={
        <Menu
          items={[
            {
              label: (
                <Space>
                  <ApartmentOutlined />
                  <ExportModal datasourceValue={datasourceValue} />
                </Space>
              ),
              key: 'export',
            },
            {
              label: (
                <Space>
                  <DownloadOutlined />
                  <DrilldownBtn dataSourceId={datasourceValue} />
                </Space>
              ),
              key: 'drilldown',
            },
            {
              label: <ShareLinkText hideText={false} />,
              key: 'share',
            },
          ]}
        />
      }
    >
      <Button icon={<MoreOutlined />} />
    </Dropdown>
  );
}

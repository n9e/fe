import React from 'react';
import { Button, Dropdown, Form, Menu, Space } from 'antd';
import { ApartmentOutlined, DownloadOutlined, MoreOutlined } from '@ant-design/icons';

import { IS_PLUS } from '@/utils/constant';
import { ShareLinkText } from '@/pages/logExplorer/components/Share';

// @ts-ignore
import ExportModal from 'plus:/components/LogDownload/ExportModal';
// @ts-ignore
import DrilldownBtn from 'plus:/pages/LogExploreLinkSetting/components/DrilldownBtn';

export default function MainMoreOperations() {
  const datasourceValue = Form.useWatch('datasourceValue');
  const menuItems = [
    ...(IS_PLUS
      ? [
          {
            label: (
              <Space>
                <DownloadOutlined />
                <ExportModal datasourceValue={datasourceValue} type='text' />
              </Space>
            ),
            key: 'export',
          },
          {
            label: (
              <Space>
                <ApartmentOutlined />
                <DrilldownBtn dataSourceId={datasourceValue} type='text' />
              </Space>
            ),
            key: 'drilldown',
          },
        ]
      : []),
    {
      label: <ShareLinkText hideText={false} />,
      key: 'share',
    },
  ];

  return (
    <Dropdown
      overlay={
        <Menu items={menuItems} />
      }
    >
      <Button icon={<MoreOutlined />} />
    </Dropdown>
  );
}

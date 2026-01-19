import React, { useEffect } from 'react';
import { Form } from 'antd';
import _ from 'lodash';
import { useLocation } from 'react-router-dom';

import { DefaultFormValuesControl } from './types';

// @ts-ignore
import PlusLogExplorer from 'plus:/parcels/LogExplorer';

interface Props {
  active: boolean;
  tabKey: string;
  tabIndex?: number;
  defaultFormValuesControl?: DefaultFormValuesControl;
}

export default function Explorer(props: Props) {
  const location = useLocation();
  const { active, tabKey, defaultFormValuesControl } = props;
  const [form] = Form.useForm();
  const datasourceCate = Form.useWatch('datasourceCate', form);

  useEffect(() => {
    if (active && defaultFormValuesControl?.defaultFormValues && defaultFormValuesControl?.isInited === false) {
      const searchParams = new URLSearchParams(location.search);
      defaultFormValuesControl.setIsInited();
      form.setFieldsValue({
        ...defaultFormValuesControl.defaultFormValues,
        refreshFlag: defaultFormValuesControl.defaultFormValues?.refreshFlag
          ? defaultFormValuesControl.defaultFormValues?.refreshFlag
          : searchParams.get('__execute__')
          ? _.uniqueId('refreshFlag_')
          : undefined,
      });
    }
  }, [active]);

  return (
    <div className={`h-full explorer-container-${tabKey}`}>
      <div className='h-full bg-fc-100 border border-fc-300 rounded-sm p-4'>
        <Form form={form} layout='vertical' className='h-full'>
          <Form.Item name='datasourceCate' hidden>
            <div />
          </Form.Item>
          <Form.Item name='datasourceValue' hidden>
            <div />
          </Form.Item>
          <PlusLogExplorer tabKey={tabKey} datasourceCate={datasourceCate} defaultFormValuesControl={defaultFormValuesControl} />
        </Form>
      </div>
    </div>
  );
}

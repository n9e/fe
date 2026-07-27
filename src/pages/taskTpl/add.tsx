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
import React, { useContext } from 'react';
import { Button, Card, Modal, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout';
import request from '@/utils/request';
import api from '@/utils/api';
import TplForm, { defaultInitialValues } from './tplForm';
import ScenarioTips from './components/ScenarioTips';
import { DOC_URL, SCRIPT_TEMPLATES, SCRIPT_TEMPLATES_ENABLED } from './constants';
import { CommonStateContext } from '@/App';

const NS = 'alertSelfHealing';

const Add = (props: any) => {
  const history = useHistory();
  const location = useLocation();
  const query = queryString.parse(location.search);
  const { businessGroup } = useContext(CommonStateContext);
  const curBusiId = (query.gid as string) || businessGroup.id!;
  const { t } = useTranslation('common');
  const { t: tsh } = useTranslation(NS);

  // 从模板创建：query.tplkey 命中内置模板则预填脚本 / 参数 / 超时，标题给出模板名（可改）
  // 模板库暂未开放，用 SCRIPT_TEMPLATES_ENABLED 收口，避免直接访问 ?tplkey= 触发隐藏功能
  const template = SCRIPT_TEMPLATES_ENABLED && query.tplkey ? _.find(SCRIPT_TEMPLATES, { key: query.tplkey as string }) : undefined;
  const initialValues = template
    ? {
        ...defaultInitialValues,
        group_id: _.toNumber(curBusiId),
        title: tsh(`templates.${template.key}.title`),
        script: template.script,
        args: template.args,
        timeout: template.timeout,
      }
    : { ...defaultInitialValues, group_id: _.toNumber(curBusiId) };

  const handleSubmit = (values: any) => {
    request(`${api.tasktpls(curBusiId)}`, {
      method: 'POST',
      body: JSON.stringify(values),
    }).then(() => {
      message.success(t('msg.create.success'));
      // 建完引导下一步：自愈脚本只有绑定到告警规则才会执行
      Modal.confirm({
        title: tsh('next_step.title'),
        content: tsh('next_step.desc'),
        okText: tsh('next_step.go_bind'),
        cancelText: tsh('next_step.later'),
        onOk: () => history.push('/alert-rules'),
        onCancel: () => history.push('/job-tpls'),
      });
    });
  };

  return (
    <PageLayout
      title={
        <>
          <RollbackOutlined className='back' onClick={() => history.push('/job-tpls')} />
          {t('tpl')}
        </>
      }
      doc={DOC_URL}
    >
      <div className='p-4'>
        <div className='w-full max-w-[1200px] mx-auto'>
          <ScenarioTips />
        </div>
        <Card title={t('common:btn.create')}>
          <TplForm
            bgid={_.toNumber(curBusiId)}
            initialValues={initialValues}
            onSubmit={handleSubmit}
            footer={
              <div>
                <Button type='primary' htmlType='submit' style={{ marginRight: 8 }}>
                  {t('btn.submit')}
                </Button>
              </div>
            }
          />
        </Card>
      </div>
    </PageLayout>
  );
};

export default Add;

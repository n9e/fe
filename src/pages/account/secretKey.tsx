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
import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Button, message } from 'antd';
import { GetSecret, UpdateSecret, CreateSecret } from '@/services/account';
import { useTranslation } from 'react-i18next';
export default function SecretKey() {
  const { t } = useTranslation();
  const [data, setData] = useState([]); // 为什么不写useEffect就会一直请求   因为GetSecret后一直重绘，本方法就一直调用

  useEffect(() => {
    getSecret();
  }, []);

  const updateSecret = async (token) => {
    await UpdateSecret({
      token,
    });
    message.success(t('Token更新成功'));
    getSecret();
  };

  const getSecret = () => {
    GetSecret().then((res) => {
      if (res.err) return;
      setData(res.dat);
    });
  };

  const createSecret = async () => {
    await CreateSecret();
    message.success(t('Token创建成功'));
    getSecret();
  };

  const columns = [
    {
      title: 'Token',
      dataIndex: 'token',
    },
    {
      title: t('操作'),
      key: 'action',
      render: (text, record) => (
        <Space size='middle'>
          <a onClick={() => updateSecret(record.token)}>{t('重新生成')}</a>
        </Space>
      ),
    },
  ];
  return (
    <>
      <Table size='small' columns={columns} dataSource={data} pagination={false} rowKey={(record) => record.token} />
      {data.length < 2 && (
        <Button
          onClick={createSecret}
          style={{
            marginTop: 10,
          }}
        >
          {t('生成')}
        </Button>
      )}
    </>
  );
}

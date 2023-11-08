import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Drawer, Table, Button, Space, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { CloseOutlined } from '@ant-design/icons';
import { getDataSourcePerm, delDataSourcePerm } from './services';
const autoDatasourcetype = ['elasticsearch', 'aliyun-sls'];
export type AutoDatasourcetypeValue = typeof autoDatasourcetype[number];
import AuthForm from './Form';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import useAssigneeList from './useAssigneeList';

interface IAuthProps {
  visible: boolean;
  onClose: () => void;
  name: string;
  type: AutoDatasourcetypeValue;
  dataSourceId: number;
}

export interface IAuth {
  comment: string;
  create_by: string;
  ds_cate: string;
  ds_id: number;
  resource: Resource;
  scope: Scope;
  update_at: number;
}

export interface Resource {
  //   cls_resource: ClsResource;
  es_resource?: EsResource;
  sls_resource?: SlsResource;
}

export interface ClsResource {
  logset_name: string;
  topic_name: string;
}

export interface EsResource {
  index: string;
}

export interface SlsResource {
  logstore: string;
  project: string;
}

export interface Scope {
  busi_group_ids?: number[];
  user_group_ids?: number[];
  user_ids?: number[];
  user_is_all?: boolean;
  user_group_is_all?: boolean;
  busi_group_is_all?: boolean;
}

function AuthList(props: IAuthProps) {
  const { visible, onClose, name, type, dataSourceId } = props;
  const [formVisible, setFormVisible] = useState(false);
  const [edittingV, setEdittingV] = useState<IAuth>();
  const [list, setList] = useState<IAuth[]>([]);
  const { t } = useTranslation('datasourceManage');
  const { userList, teamList, busiGroupList } = useAssigneeList();

  const esColumnItems = [
    {
      dataIndex: 'resource',
      title: t('auth.index'),
      render(v, record) {
        return record.resource.es_resource?.index;
      },
    },
  ];

  const slsColumnItems = [
    {
      dataIndex: 'resource',
      title: t('auth.project'),
      render(v, record) {
        return record.resource.sls_resource?.project;
      },
    },
    {
      dataIndex: 'resource1',
      title: t('auth.logstore'),
      render(v, record) {
        return record.resource.sls_resource?.logstore;
      },
    },
  ];

  const getList = async () => {
    const res = await getDataSourcePerm(dataSourceId);
    setList(res);
  };

  useEffect(() => {
    getList();
  }, []);

  const handleDelete = (record) => {
    Modal.confirm({
      title: t('auth.delMessage'),
      async onOk() {
        await delDataSourcePerm([record.id]);
        getList();
      },
    });
  };

  let columns: ColumnsType<IAuth> = [
    {
      dataIndex: 'update_at',
      title: t('auth.updatetime'),
      width: 200,
      render(v) {
        return moment.unix(v).format('YYYY-MM-DD HH:mm');
      },
    },
    { dataIndex: 'create_by', title: t('auth.owner'), width: 180 },
    {
      dataIndex: 'scope',
      title: t('auth.assign'),
      render(v) {
        let result = [];
        if (v.user_is_all) {
          result.push(t('auth.alluser'));
        }
        if (v.user_group_is_all) {
          result.push(t('auth.allusergroup'));
        }
        if (v.busi_group_is_all) {
          result.push(t('auth.allbusiness'));
        }
        if (v.user_ids) {
          result = result.concat(...v.user_ids.map((id) => userList?.find((el) => el.value === id)?.label));
        }
        if (v.user_group_ids) {
          result = result.concat(...v.user_group_ids.map((id) => teamList?.find((el) => el.value === id)?.label));
        }
        if (v.busi_group_ids) {
          result = result.concat(...v.busi_group_ids.map((id) => busiGroupList?.find((el) => el.value === id)?.label));
        }
        return result.join(' ');
      },
    },
    {
      dataIndex: 'handle',
      title: t('common:table.operations'),
      render(v, record) {
        return (
          <Space>
            <Button
              type='link'
              onClick={() => {
                setFormVisible(true);
                setEdittingV(record);
              }}
            >
              {t('common:btn.modify')}
            </Button>
            <Button
              type='link'
              onClick={() => {
                handleDelete(record);
              }}
            >
              {t('common:btn.delete')}
            </Button>
          </Space>
        );
      },
    },
  ];

  if (type === 'elasticsearch') {
    columns = [...esColumnItems, ...columns];
  } else if (type === 'aliyun-sls') {
    columns = [...slsColumnItems, ...columns];
  }

  return (
    <>
      <Drawer
        title={
             <div>
               {t('auth.manage')}({name})
             </div> 
        }
        visible={visible}
        onClose={() => onClose()}
        width={960}
      >
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type='primary' onClick={() => setFormVisible(true)}>
              {t('auth.new')}
            </Button>
          </div>
          <Table columns={columns} dataSource={list} pagination={false} />
        </div>
      </Drawer>
      {formVisible && (
        <AuthForm
          initialV={edittingV}
          visible={formVisible}
          onClose={(b) => {
            setFormVisible(false);
            setEdittingV(undefined);
            if (b) {
              getList();
            }
          }}
          type={type}
          dataSourceId={dataSourceId}
        />
      )}
    </>
  );
}

export { autoDatasourcetype, AuthList };

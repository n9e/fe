import React, { useEffect, useState } from 'react';
import { Button, FormInstance, Input, message, Popconfirm, Space, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { IKnowledge } from '../../store';
import { useTranslation } from 'react-i18next';
import { deleteKnowledge, getKnowledgeList } from '../../services';
import { SearchOutlined } from '@ant-design/icons';
import { EMode } from '../../config';
import moment from 'moment';
import _ from 'lodash';
/** @ts-ignore */
import { handleRawSelectCard } from '@/Packages/Outfire/pages/Level2/Alert/RelatedMetric';

interface IProps {
  modeChange: (mode: EMode) => void;
  knowledgeForm: FormInstance;
}

export default function KnowledgeBaseList(props: IProps) {
  const { t } = useTranslation('aiChat');
  const { modeChange, knowledgeForm } = props;

  const [list, setList] = useState<IKnowledge[]>([]);
  const [filterList, setFilterList] = useState<IKnowledge[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>();

  useEffect(() => {
    getList();
  }, []);

  const columns: ColumnsType<IKnowledge> = [
    {
      title: t('knowledgeBase.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => {
        return (
          <a
            onClick={() => {
              // console.log(record);
              knowledgeForm.setFieldsValue({
                ...record,
                firemap: record.target === 'firemap' ? record.firemap?.map(handleRawSelectCard) : undefined,
                dashboard: record.target === 'dashboard' ? record.dashboard : undefined,
              });
              modeChange(EMode.KnowledgeBaseEdit);
            }}
          >
            {text}
          </a>
        );
      },
    },
    {
      title: t('knowledgeBase.target'),
      dataIndex: 'target',
      key: 'target',
      ellipsis: true,
      filters: [
        {
          text: t('firemap'),
          value: 'firemap',
        },
        {
          text: t('dashboard'),
          value: 'dashboard',
        },
      ],
      onFilter: (value, record) => {
        return record.target === value;
      },
      render: (text, record) => {
        return record.target === 'firemap' ? t('firemap') : t('dashboard');
      },
    },
    {
      title: t('knowledgeBase.updateAt'),
      dataIndex: 'update_at',
      key: 'update_at',
      width: 120,
      sorter: (a, b) => a.update_at - b.update_at,
      render: (text, record) => {
        return moment(record.update_at, 'X').format('YYYY-MM-DD HH:mm');
      },
    },
    {
      title: t('knowledgeBase.updateUser'),
      dataIndex: 'update_user',
      key: 'update_user',
      width: 100,
    },
    {
      title: t('knowledgeBase.operation'),
      dataIndex: 'operation',
      key: 'operation',
      width: 120,
      render: (text, record) => {
        return (
          <div>
            <Button
              size='small'
              type='link'
              onClick={() => {
                // console.log(record);
                knowledgeForm.setFieldsValue({
                  ...record,
                  firemap: record.target === 'firemap' ? record.firemap?.map(handleRawSelectCard) : undefined,
                  dashboard: record.target === 'dashboard' ? record.dashboard : undefined,
                });
                modeChange(EMode.KnowledgeBaseEdit);
              }}
            >
              {t('edit')}
            </Button>
            <Popconfirm
              placement='topLeft'
              title={t(`deleteConfirm`)}
              onConfirm={() => {
                handleDel(record.id!);
              }}
            >
              <Button size='small' type='link' danger>
                {t('delete')}
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const getList = () => {
    setLoading(true);
    getKnowledgeList()
      .then((res) => {
        setList(res);
        setFilterList(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDel = (id: number) => {
    deleteKnowledge({ id }).then((res) => {
      message.success(t('deleteSuccess'));
      const tempList = list.filter((el) => el.id !== id);
      const tempFilterList = filterList.filter((el) => el.id !== id);
      setList(tempList);
      setFilterList(tempFilterList);
    });
  };

  const handleSearch = _.debounce((val?: string) => {
    const tmep: IKnowledge[] = [];
    list?.forEach((el) => {
      if (el.name?.toLocaleLowerCase().includes(val?.toLocaleLowerCase() || '')) {
        tmep.push(el);
      }
    });
    setFilterList(tmep);
  }, 300);

  return (
    <>
      <div className='ai-chat-body'>
        <div className='knowledge-base-box'>
          <div className='knowledge-base-header'>
            <Input
              value={search}
              allowClear
              onChange={(e) => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder={t('knowledgeBase.searchPlaceholder')}
              prefix={<SearchOutlined />}
              style={{ width: '400px' }}
            />
            <Button
              type='primary'
              onClick={() => {
                knowledgeForm.resetFields();
                modeChange(EMode.KnowledgeBaseAdd);
              }}
            >
              {t('add')}
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={filterList}
            rowKey='id'
            size='small'
            loading={loading}
            pagination={{ showSizeChanger: true, showQuickJumper: true, showTotal: (total) => t('tableTotal', { total }) }}
          />
        </div>
      </div>
    </>
  );
}

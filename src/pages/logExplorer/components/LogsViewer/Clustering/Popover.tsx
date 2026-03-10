import React, { useState, useEffect } from 'react';
import { Space, Tag, Dropdown, Button, Menu, Popover, Spin, Progress, Row, Col, Statistic, Tooltip } from 'antd';
import { CaretDownOutlined, MinusCircleOutlined, PlusCircleOutlined, CopyOutlined, BarChartOutlined, SyncOutlined } from '@ant-design/icons';
import { copy2ClipBoard } from '@/utils';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { PRIMARY_COLOR } from '@/utils/constant';
import { NAME_SPACE } from '../../../constants';
import { getLogClustering, ClusteringItem, getQueryClustering, getLogPattern } from '../../../services';
import { ClusterPattern } from '../../../types';
import { OnValueFilterParams, OptionsType } from '../types';
import { DatasourceCateEnum } from '@/utils/constant';
import ExistsIcon from '@/pages/explorer/components/RenderValue/ExistsIcon';

function PatternPopover({ uuid, partId, children, title }: { uuid: string; partId: number; children: React.ReactNode; title: string }) {
    const { t } = useTranslation(NAME_SPACE);
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [patternData, setPatternData] = useState<ClusterPattern | null>(null);

    const handleVisibleChange = (v: boolean) => {
        setVisible(v);
        if (v && !patternData) {
            setLoading(true);
            getLogPattern(uuid, partId)
                .then((res) => {
                    setPatternData(res);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    };

    const content = (
        <div style={{ width: 320 }}>
            <Spin spinning={loading}>
                {patternData && (
                    <>
                        <div className='bg-fc-200 p-4'>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic className='n9e-logexplorer-field-statistic text-center' title={t('stats.unique_count')} value={patternData.count} />
                                </Col>
                                <Col span={12}>
                                    <Statistic className='n9e-logexplorer-field-statistic text-center' title={t('stats.exist_ratio')} value={patternData.percentage} suffix='%' />
                                </Col>
                            </Row>
                        </div>
                        <div>
                            <div className='my-2 text-l2'>
                                <strong>{t('clustering.top5_title')}</strong>
                            </div>
                            {_.isEmpty(patternData.top5) && t('clustering.no_data')}
                            {_.map(_.orderBy(patternData.top5, ['count'], ['desc']), (item) => {
                                const percent = _.floor(item.percentage, 2);
                                return (
                                    <div key={item.value} className='mb-2'>
                                        <div className='flex justify-between'>
                                            <Tooltip title={item.value}>
                                                <div style={{ width: 'calc(100% - 80px)' }} className='truncate'>
                                                    {_.isEmpty(item.value) && !_.isNumber(item.value) ? '(empty)' : item.value}
                                                </div>
                                            </Tooltip>
                                            <span>{item.count?.toLocaleString()}</span>
                                        </div>
                                        <div className='flex justify-between items-center'>
                                            <div style={{ width: 'calc(100% - 60px)' }}>
                                                <Progress percent={percent} size='small' showInfo={false} strokeColor={PRIMARY_COLOR} />
                                            </div>
                                            <span>{percent}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </Spin>
        </div>
    );

    return (
        <Popover trigger='click' visible={visible} onVisibleChange={handleVisibleChange} content={content} title={title}>
            {children}
        </Popover>
    );
}

interface ConstPopoverProps {
    value: string;
    children: React.ReactNode;
    field: string;
    cate: DatasourceCateEnum;
    onValueFilter: (condition: OnValueFilterParams) => void;
}

function ConstPopover({ value, children, field, cate, onValueFilter }: ConstPopoverProps) {
    const { t } = useTranslation(NAME_SPACE);
    const [popoverVisible, setPopoverVisible] = useState(false);
    return (
        <Popover
            visible={popoverVisible}
            onVisibleChange={setPopoverVisible}
            trigger='click'
            overlayClassName='explorer-origin-field-val-popover'
            content={
                <ul className='ant-dropdown-menu ant-dropdown-menu-root ant-dropdown-menu-vertical ant-dropdown-menu-light'>
                    <li
                        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                        onClick={() => {
                            setPopoverVisible(false);
                            copy2ClipBoard(`${field}:${value}`);
                        }}
                    >
                        <Space>
                            <CopyOutlined />
                            {t('common:btn.copy')}
                        </Space>
                    </li>
                    <li
                        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                        onClick={() => {
                            setPopoverVisible(false);
                            onValueFilter({
                                key: field,
                                value,
                                assignmentOperator: '=',
                                operator: 'AND',
                            });
                        }}
                    >
                        <Space>
                            <PlusCircleOutlined />
                            {t('logs.filterAllAnd')}
                        </Space>
                    </li>
                    <li
                        className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                        onClick={() => {
                            setPopoverVisible(false);
                            onValueFilter({
                                key: field,
                                value,
                                assignmentOperator: '=',
                                operator: 'NOT',
                            });
                        }}
                    >
                        <Space>
                            <MinusCircleOutlined />
                            {t('logs.filterAllNot')}
                        </Space>
                    </li>
                    {cate === DatasourceCateEnum.elasticsearch && (
                        <li
                            className='ant-dropdown-menu-item ant-dropdown-menu-item-only-child'
                            onClick={() => {
                                setPopoverVisible(false);
                                onValueFilter?.({
                                    key: field,
                                    value: value,
                                    assignmentOperator: '=',
                                    operator: 'EXISTS',
                                    indexName: field,
                                });
                            }}
                        >
                            <Space>
                                <ExistsIcon />
                                {t('logs.filterExists')}
                            </Space>
                        </li>
                    )}
                </ul>
            }
        >
            {children}
        </Popover>
    );
}

export { PatternPopover, ConstPopover };
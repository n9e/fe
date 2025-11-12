import React, { useEffect, useState, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Form, Input, Select } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import stringToRegex from '../../utils/stringToRegex';
import Preview from '../Preview';

interface Props {
  editMode?: number;
  formatedReg: string;
  footerExtraRef: React.RefObject<HTMLDivElement>;
}

export default function Datasource(props: Props) {
  const { t } = useTranslation('dashboard');
  const { groupedDatasourceList, datasourceCateOptions } = useContext(CommonStateContext);
  const { editMode, formatedReg } = props;
  const definition = Form.useWatch('definition');
  const regex = useMemo(() => stringToRegex(formatedReg), [formatedReg]);
  const [options, setOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    let currentDatasourceList = definition ? (groupedDatasourceList[definition] as any) : [];
    if (regex) {
      currentDatasourceList = _.filter(currentDatasourceList, (option) => {
        return regex.test(option.name);
      });
    }
    const itemOptions = _.map(currentDatasourceList, (ds) => {
      return { label: ds.name, value: ds.id }; // TODO value 实际是 number 类型
    });
    setOptions(itemOptions);
  }, [JSON.stringify(definition), regex]);

  return (
    <>
      <Form.Item label={t('var.datasource.definition')} name='definition' rules={[{ required: true }]}>
        <Select disabled={editMode === 0}>
          {_.map(datasourceCateOptions, (item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label={t('var.datasource.regex')}
        name='regex'
        tooltip={
          <Trans
            ns='dashboard'
            i18nKey='var.datasource.regex_tip'
            components={{ a: <a target='_blank' href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions' /> }}
          />
        }
        rules={[{ pattern: new RegExp('^/(.*?)/(g?i?m?y?)$'), message: 'invalid regex' }]}
      >
        <Input placeholder='/vm/' />
      </Form.Item>
      <Form.Item label={t('var.datasource.defaultValue')} name='defaultValue'>
        <Select>
          {_.map(
            _.filter(groupedDatasourceList[definition], (item) => {
              if (regex) {
                return regex.test(item.name);
              }
              return true;
            }),
            (item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
      {createPortal(<Preview options={options} />, props.footerExtraRef.current!)}
    </>
  );
}

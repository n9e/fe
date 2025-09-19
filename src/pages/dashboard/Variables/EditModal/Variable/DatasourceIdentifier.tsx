import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { Form, Input, Select, Tag } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';

import stringToRegex from '../../utils/stringToRegex';

interface Props {
  editMode?: number;
  formatedReg: string;
}

export default function DatasourceIdentifier(props: Props) {
  const { t } = useTranslation('dashboard');
  const { editMode, formatedReg } = props;
  const { groupedDatasourceList, datasourceCateOptions } = useContext(CommonStateContext);
  const definition = Form.useWatch('definition');
  const regex = stringToRegex(formatedReg);
  const [options, setOptions] = useState<
    {
      label: string;
      value: string;
    }[]
  >([]);

  useEffect(() => {
    let datasourceList = definition
      ? _.filter(groupedDatasourceList[definition] as any, (item) => {
          return item.identifier;
        })
      : [];
    if (regex) {
      datasourceList = _.filter(datasourceList, (option) => {
        return regex.test(option.identifier);
      });
    }
    const itemOptions = _.map(datasourceList, (ds) => {
      return { label: ds.name, value: ds.identifier };
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
              if (item.identifier) {
                if (regex) {
                  return regex.test(item.identifier);
                }
                return true;
              }
              return false;
            }),
            (item) => (
              <Select.Option key={item.identifier} value={item.identifier}>
                {item.identifier}
              </Select.Option>
            ),
          )}
        </Select>
      </Form.Item>
      <Form.Item label={t('common:btn.data_preview')}>
        <div className='max-h-[100px] overflow-y-auto'>
          {_.isEmpty(options) ? (
            <span className='text-gray-400'>{t('common:nodata')}</span>
          ) : (
            _.map(options, (optionsItem) => {
              return (
                <Tag key={optionsItem.value} className='mb-2'>
                  {optionsItem.label}
                </Tag>
              );
            })
          )}
        </div>
      </Form.Item>
    </>
  );
}

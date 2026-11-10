import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';

// @ts-ignore the query builder form is supplied by the commercial package.
import ESQueryBuilder from 'plus:/datasource/elasticsearch/ExplorerNG/components/QueryBuilder';
import BuilderContext from './builderContext';

import { defaultBuilderValues, ESBuilderValues } from '../../useQueryWorkspace';

// The popovers used to teach the floating panel to ignore outside clicks; inline nothing floats over the form.
const inlineBuilderContext = { ignoreNextOutsideClick: () => {} };

interface Props {
  explorerForm: FormInstance;
  form: FormInstance<ESBuilderValues>;
  datasourceValue: number;
  index?: string;
  date_field?: string;
  onChange: () => void;
}

/** The builder form the query workspace hosts: the plus package owns the fields, the workspace owns the actions. */
export default function Builder({ explorerForm, form, datasourceValue, index, date_field, onChange }: Props) {
  return (
    <BuilderContext.Provider value={inlineBuilderContext}>
      <Form form={form} component='div' layout='vertical' initialValues={defaultBuilderValues} onValuesChange={onChange}>
        <ESQueryBuilder embedded form={form} explorerForm={explorerForm} datasourceValue={datasourceValue} index={index} date_field={date_field} visible hideActions />
      </Form>
    </BuilderContext.Provider>
  );
}

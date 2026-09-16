/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/App', () => ({
  __esModule: true,
  CommonStateContext: React.createContext({
    datasourceList: [],
    datasourceCateOptions: [],
    isPlus: false,
  }),
}));
jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'zh_CN' } }),
}));
jest.mock('@/components/AdvancedWrap/utils', () => ({
  __esModule: true,
  getCateDisplayLabel: () => undefined,
}));
jest.mock('../EmptyDatasourcePopover', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import DatasourceSelectV3 from './index';

describe('DatasourceSelectV3', () => {
  it('keeps an injected datasource variable value instead of marking it as deleted', () => {
    render(
      <DatasourceSelectV3
        value='${datasource}'
        datasourceList={[]}
        datasourceCateList={[]}
        ajustDatasourceList={() => [
          {
            id: '${datasource}',
            name: '${datasource}',
            plugin_type: 'prometheus',
          },
        ]}
        showEmptyDatasourcePopover={false}
      />,
    );

    expect(screen.getByText('${datasource}')).toBeInTheDocument();
    expect(screen.queryByText(/deleted/)).not.toBeInTheDocument();
  });
});

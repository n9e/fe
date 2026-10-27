/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';

import HistoricalRecords from './index';
import ConditionHistoricalRecords from './ConditionHistoricalRecords';

jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

// A text trigger carries the datasource's history icon button, and the cell it sits in (the query box's addon)
// is taller than that button. The button is block-level, so the trigger fills the cell and centers it.
function expectTriggerCentersInCell(trigger: HTMLElement) {
  expect(trigger.parentElement).toHaveClass('cursor-pointer', 'underline', 'flex', 'h-full', 'items-center');
}

it('fills the cell with the SQL history text trigger', () => {
  render(
    <HistoricalRecords localKey='history-test' datasourceValue={1} onSelect={() => {}} type='text'>
      <button type='button'>history</button>
    </HistoricalRecords>,
  );
  expectTriggerCentersInCell(screen.getByRole('button', { name: 'history' }));
});

it('fills the cell with the query history text trigger', () => {
  render(
    <ConditionHistoricalRecords localKey='history-test' datasourceValue={1} renderItem={() => null} type='text'>
      <button type='button'>history</button>
    </ConditionHistoricalRecords>,
  );
  expectTriggerCentersInCell(screen.getByRole('button', { name: 'history' }));
});

/** @jest-environment jsdom */
import React, { useRef, useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FullscreenContext } from '../../FullscreenButton/context';
import useScrollParent from './useScrollParent';

const Content = React.memo(() => {
  const ref = useRef<HTMLDivElement>(null);
  const parent = useScrollParent(ref);
  return (
    <div ref={ref} data-testid='parent'>
      {parent?.id}
    </div>
  );
});
// Deliberately retain the same children, as FullscreenButton.Provider does.
const content = <Content />;
function Fixture() {
  const [fullscreen, setFullscreen] = useState(false);
  return (
    <FullscreenContext.Provider value={{ viewModalVisible: fullscreen, setViewModalVisible: setFullscreen }}>
      <div id='page' style={{ overflowY: 'auto' }}>
        <div id='modal' style={{ overflowY: fullscreen ? 'auto' : 'visible' }}>
          {content}
        </div>
        <button onClick={() => setFullscreen(!fullscreen)}>toggle</button>
      </div>
    </FullscreenContext.Provider>
  );
}

it('rebinds retained/memoized results when entering and leaving fullscreen', async () => {
  render(<Fixture />);
  await waitFor(() => expect(screen.getByTestId('parent')).toHaveTextContent('page'));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByTestId('parent')).toHaveTextContent('modal'));
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByTestId('parent')).toHaveTextContent('page'));
});

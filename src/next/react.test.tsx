import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { createDialogs, useReactiveDialog, type DialogWrapperProps } from './react';

function Wrapper({ open, children }: DialogWrapperProps) {
  return open ? <div>{children}</div> : null;
}

function Counter({ count }: { count: number }) {
  return <output>{count}</output>;
}

test('provider renders instances pushed before it mounts', () => {
  const { dialogs, DialogsProvider } = createDialogs({
    modals: { wrapper: Wrapper, dialogs: { counter: Counter } },
  });
  dialogs.modals.counter.push({ count: 3 });

  render(<DialogsProvider />);
  expect(screen.getByText('3')).toBeInTheDocument();
});

test('reactive instances follow their owner and outlive its unmount', () => {
  const { dialogs, DialogsProvider } = createDialogs({
    modals: { wrapper: Wrapper, dialogs: { counter: Counter } },
  });

  function Launcher({ count }: { count: number }) {
    const counter = useReactiveDialog(dialogs.modals.counter, { count });
    return <button onClick={() => counter.push()}>Open</button>;
  }

  function App({ count, show }: { count: number; show: boolean }) {
    return (
      <React.StrictMode>
        {show && <Launcher count={count} />}
        <DialogsProvider />
      </React.StrictMode>
    );
  }

  const view = render(<App count={1} show />);
  fireEvent.click(screen.getByText('Open'));
  expect(screen.getByText('1')).toBeInTheDocument();

  view.rerender(<App count={2} show />);
  expect(screen.getByText('2')).toBeInTheDocument();

  view.rerender(<App count={3} show={false} />);
  expect(screen.getByText('2')).toBeInTheDocument();
  act(() => { dialogs.modals.counter.pop(); });
  expect(screen.queryByText('2')).not.toBeInTheDocument();
});

test('server rendering starts with an empty host without losing registry state', () => {
  const { dialogs, DialogsProvider } = createDialogs({
    modals: { wrapper: Wrapper, dialogs: { counter: Counter } },
  });
  dialogs.modals.counter.push({ count: 7 });
  expect(renderToString(<DialogsProvider />)).not.toContain('7');
  expect(dialogs.modals.counter.pop()?.props).toEqual({ count: 7 });
});

test('visual layers keep exiting roots in order until their exit completes', () => {
  function RetainingWrapper({ open, layerIndex, isVisualTop, onExitComplete, children }: DialogWrapperProps) {
    return (
      <div data-layer={layerIndex} data-open={open} data-visual-top={isVisualTop}>
        {children}
        {!open && <button onClick={onExitComplete}>Finish exit</button>}
      </div>
    );
  }

  const { dialogs, DialogsProvider } = createDialogs({
    modals: { wrapper: RetainingWrapper, dialogs: { counter: Counter } },
  });
  render(<DialogsProvider />);

  act(() => { dialogs.modals.counter.push({ count: 1 }); });
  act(() => { dialogs.modals.counter.push({ count: 2 }); });
  act(() => { dialogs.modals.counter.pop(); });
  act(() => { dialogs.modals.counter.push({ count: 3 }); });

  const layer = (count: string) => screen.getByText(count).closest('[data-layer]');
  expect(layer('1')).toHaveAttribute('data-layer', '0');
  expect(layer('2')).toHaveAttribute('data-layer', '1');
  expect(layer('2')).toHaveAttribute('data-open', 'false');
  expect(layer('3')).toHaveAttribute('data-layer', '2');
  expect(layer('3')).toHaveAttribute('data-visual-top', 'true');

  act(() => { dialogs.modals.counter.pop(); });
  expect(layer('1')).toHaveAttribute('data-visual-top', 'false');
  expect(layer('3')).toHaveAttribute('data-open', 'false');
  expect(layer('3')).toHaveAttribute('data-visual-top', 'true');

  fireEvent.click(screen.getAllByText('Finish exit')[0]);
  expect(screen.queryByText('2')).not.toBeInTheDocument();
  expect(layer('3')).toHaveAttribute('data-layer', '1');
  expect(layer('1')).toHaveAttribute('data-visual-top', 'false');

  fireEvent.click(screen.getByText('Finish exit'));
  expect(layer('1')).toHaveAttribute('data-visual-top', 'true');
});

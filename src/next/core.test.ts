import { createDialogs, defineDialog } from './core';

function setup() {
  return createDialogs({
    sheets: { dialogs: { edit: defineDialog<{ id: string }>() } },
    alerts: { dialogs: { confirm: defineDialog<{ message: string }>() } },
  });
}

test('scoped pops choose the latest matching instance and leave other groups open', () => {
  const { dialogs, getSnapshot } = setup();
  const first = dialogs.sheets.edit.push({ id: 'A' });
  const alert = dialogs.alerts.confirm.push({ message: 'Save?' });
  const second = dialogs.sheets.edit.push({ id: 'B' });

  expect(dialogs.sheets.pop()).toBe(second);
  expect(dialogs.sheets.edit.pop()).toBe(first);
  expect(getSnapshot().map((item) => item.id)).toEqual([alert.id]);
  expect(dialogs.sheets.pop()).toBeUndefined();
  expect(dialogs.pop()).toBe(alert);
  expect(dialogs.pop()).toBeUndefined();
});

test('an instance handle pops only itself and repeated pops are silent', () => {
  const { dialogs } = setup();
  const first = dialogs.sheets.edit.push({ id: 'A' });
  const second = dialogs.sheets.edit.push({ id: 'B' });

  expect(first.pop()).toBe(first);
  expect(first.pop()).toBeUndefined();
  expect(dialogs.sheets.edit.pop()).toBe(second);
  expect(dialogs.sheets.edit.popAll()).toEqual([]);
});

test('popAll returns newest first within its scope', () => {
  const { dialogs, getSnapshot } = setup();
  const first = dialogs.sheets.edit.push({ id: 'A' });
  const alert = dialogs.alerts.confirm.push({ message: 'Save?' });
  const second = dialogs.sheets.edit.push({ id: 'B' });

  expect(dialogs.sheets.popAll()).toEqual([second, first]);
  expect(getSnapshot().map((item) => item.id)).toEqual([alert.id]);
  expect(dialogs.popAll()).toEqual([alert]);
  expect(dialogs.popAll()).toEqual([]);
});

test('subscribers see immutable snapshots and live props can update through the registry', () => {
  const { dialogs, subscribe, getSnapshot, setInstanceProps } = setup();
  const versions: number[] = [];
  const unsubscribe = subscribe(() => versions.push(getSnapshot().length));
  const instance = dialogs.sheets.edit.push({ id: 'A' });
  const before = getSnapshot();

  setInstanceProps(instance, { id: 'B' });
  expect(before[0].props).toEqual({ id: 'A' });
  expect(getSnapshot()[0].props).toEqual({ id: 'B' });
  expect(instance.props).toEqual({ id: 'B' });
  instance.pop();
  unsubscribe();
  dialogs.sheets.edit.push({ id: 'C' });
  expect(versions).toEqual([1, 1, 0]);
});

test('reserved method names are rejected', () => {
  expect(() => createDialogs({ pop: { dialogs: {} } } as any)).toThrow('Reserved dialog group');
  expect(() => createDialogs({ sheets: { dialogs: { popAll: {} } } } as any)).toThrow(
    'Reserved dialog name',
  );
});

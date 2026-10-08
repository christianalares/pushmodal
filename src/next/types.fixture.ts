import { createDialogs as createCoreDialogs, defineDialog } from './core';
import { createDialogs as createReactDialogs } from './react';

export function checkPublicTypes() {
  const core = createCoreDialogs({
    sheets: { dialogs: { edit: defineDialog<{ addressId: string }>() } },
  });
  core.dialogs.sheets.edit.push({ addressId: '123' });
  // @ts-expect-error addressId is required
  core.dialogs.sheets.edit.push();
  // @ts-expect-error pop is reserved for scope methods
  createCoreDialogs({ pop: { dialogs: {} } });
  // @ts-expect-error popAll is reserved for scope methods
  createCoreDialogs({ sheets: { dialogs: { popAll: defineDialog() } } });

  const react = createReactDialogs({
    sheets: {
      wrapper: () => null,
      dialogs: { edit: (_props: { addressId: string }) => null },
    },
  });
  react.dialogs.sheets.edit.push({ addressId: '123' });
  // @ts-expect-error addressId is required
  react.dialogs.sheets.edit.push();
  // @ts-expect-error pop is reserved for scope methods
  createReactDialogs({ pop: { wrapper: () => null, dialogs: {} } });
}

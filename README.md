# Pushmodal 2.0 (next branch)

Pushmodal manages named dialog instances in a shared stack. The core does not depend on React, Radix UI, Base UI, or CSS. The React adapter renders dialogs through wrappers supplied by your app.

This branch is a prerelease prototype. It is not published to npm.

## What is new

- Register named dialogs once with `createDialogs`, grouped by the scopes your app uses. Mount its `DialogsProvider` once. Each group has a wrapper for its UI library, and individual dialogs may override it.
- Open a dialog through its typed scope, such as `dialogs.modals.settings.push({ label: 'General' })`, instead of calling `pushModal('settings', props)`. Use `dialogs.pop()`, `dialogs.sheets.pop()`, or `dialogs.sheets.editAddress.pop()` to choose how much of the stack an operation can affect. The handle returned by `push()` can close that exact instance.
- Keep ordinary `push()` calls as snapshots. Use `useReactiveDialog` only when an already open dialog should follow props from a React component as that component renders.
- Use the framework-independent `pushmodal/core` registry when you need the stack without React. The React adapter is exported from `pushmodal/react`.

This is a proposed 2.0 API for review, not a published migration path. See the [API sketch](docs/next-api-sketch.md) for the current design and remaining validation work.

## Run the playground

From this branch's repository root, with Node.js 20.19+ or 22.12+ and pnpm installed:

```sh
pnpm install
pnpm playground:dev
```

Open the local URL printed by Vite. The playground lives in [examples/playground](examples/playground/README.md) and uses this workspace package directly. It compares Base UI, Radix, and a plain React wrapper, and includes both snapshot and reactive props. Its README has a short tour and points to the relevant source. The [earlier selection prototype](examples/dialog-selection-prototype.html) is a standalone HTML experiment about scoped and instance-specific closing; it does not run the package.

## React setup

```tsx
// components/ui/dialogs/index.tsx
import { createDialogs } from 'pushmodal/react'
import { ModalWrapper, SheetWrapper, AlertWrapper } from './wrappers'
import { SettingsModal, TimerModal, EditAddressSheet, ConfirmAlert } from './content'

export const { dialogs, DialogsProvider } = createDialogs({
  modals: { wrapper: ModalWrapper, dialogs: { settings: SettingsModal, timer: TimerModal } },
  sheets: { wrapper: SheetWrapper, dialogs: { editAddress: EditAddressSheet } },
  alerts: { wrapper: AlertWrapper, dialogs: { confirm: ConfirmAlert } },
})
```

Mount `<DialogsProvider />` once for that registry. A wrapper receives `open`, `onOpenChange`, `position`, `layerIndex`, `isVisualTop`, `children`, and an optional `onExitComplete` callback. It can use any controlled dialog component or plain React. Content components receive their typed `push` props.

```tsx
import { dialogs } from './ui/dialogs'

const instance = dialogs.sheets.editAddress.push({ addressId: '123' })
dialogs.sheets.editAddress.pop() // Latest editAddress instance
instance.pop()                   // This exact instance

dialogs.sheets.pop()             // Latest sheet
dialogs.sheets.popAll()          // Every sheet, leaving alerts and modals open
dialogs.pop()                    // Latest dialog across all groups
dialogs.popAll()                 // Every dialog
```

`pop()` returns the selected instance, or `undefined` when empty. `popAll()` returns selected instances newest first, or `[]`. Repeated pops are silent no-ops. Each group and dialog name is chosen by the app, except `pop` and `popAll`, which are reserved for scope methods.

Calling `push(props)` stores a snapshot. For local React values that should continue updating an open dialog, use `useReactiveDialog`:

```tsx
import { useState } from 'react'
import { useReactiveDialog } from 'pushmodal/react'
import { dialogs } from './ui/dialogs'

function TimerButton() {
  const [count, setCount] = useState(0)
  const timer = useReactiveDialog(dialogs.modals.timer, { count })
  return <>
    <button onClick={() => setCount((value) => value + 1)}>Tick</button>
    <button onClick={() => timer.push()}>Open timer</button>
  </>
}
```

Every instance opened through the hook follows later renders of its caller. When that caller unmounts, its dialogs stay open with their last props. Ordinary `push` remains available for snapshot values.

## Framework-independent core

```ts
import { createDialogs, defineDialog } from 'pushmodal/core'

const { dialogs, subscribe, getSnapshot } = createDialogs({
  sheets: { dialogs: { editAddress: defineDialog<{ addressId: string }>() } },
})

const unsubscribe = subscribe(() => {
  for (const item of getSnapshot()) console.log(item.position)
})
dialogs.sheets.editAddress.push({ addressId: '123' })
unsubscribe()
```

The core stores logical open instances, calculates each open instance's global and group position, and provides subscriptions. Adapters decide how to render them. Popping removes an instance from core state immediately. The React host retains the closed root with its last position while its wrapper or UI library animates out, then removes it when content unmounts. `layerIndex` is the mounted root's visual order, including roots still exiting; use it for backdrop and content stacking. `isVisualTop` identifies the highest mounted root. `position` describes only the logical open stack. Wrappers using independently mounted modal primitives should use `isVisualTop` to prevent a background root from dismissing itself while another dialog is on top or animating out. Wrappers that keep closed content mounted should call `onExitComplete` after their exit finishes.

## Migration from 1.x

Version 2 changes registration and import paths. Replace `createPushModal`, `pushModal('name')`, and `popModal('name')` with `createDialogs` and typed named scopes. Move UI primitives into your app's wrappers. Import React features from `pushmodal/react`; use `pushmodal` or `pushmodal/core` for the framework-independent registry. Version 1.x remains installable for apps that are not ready to migrate.

See [the API sketch](docs/next-api-sketch.md) and [the release decision](docs/adr/0004-release-next-api-as-major.md) for the design rationale.

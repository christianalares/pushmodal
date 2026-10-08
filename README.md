# Pushmodal 2.0 (next branch)

Pushmodal manages named dialog instances in a shared stack. The core does not depend on React, Radix UI, Base UI, or CSS. The React adapter renders dialogs through wrappers supplied by your app.

This branch is a prerelease prototype. It is not published to npm.

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

Mount `<DialogsProvider />` once for that registry. A wrapper receives `open`, `onOpenChange`, `position`, `children`, and an optional `onExitComplete` callback. It can use any controlled dialog component or plain React. Content components receive their typed `push` props.

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

const unsubscribe = subscribe(() => console.log(getSnapshot()))
dialogs.sheets.editAddress.push({ addressId: '123' })
unsubscribe()
```

The core stores logical open instances and provides subscriptions. Adapters decide how to render them. Popping removes an instance from core state immediately. The React host retains the closed root while its wrapper or UI library animates out, then removes it when content unmounts. Wrappers that keep closed content mounted should call `onExitComplete` after their exit finishes.

## Migration from 1.x

Version 2 changes registration and import paths. Replace `createPushModal`, `pushModal('name')`, and `popModal('name')` with `createDialogs` and typed named scopes. Move UI primitives into your app's wrappers. Import React features from `pushmodal/react`; use `pushmodal` or `pushmodal/core` for the framework-independent registry. Version 1.x remains installable for apps that are not ready to migrate.

See [the API sketch](docs/next-api-sketch.md) and [the release decision](docs/adr/0004-release-next-api-as-major.md) for the design rationale.

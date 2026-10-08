# Pushmodal 2.0 API sketch

Status: Draft implementation under local playground review. This branch is not a release.

## React registration

```tsx
// components/ui/dialogs/index.tsx
import { createDialogs } from 'pushmodal/react'

export const { dialogs, DialogsProvider } = createDialogs({
  modals: {
    wrapper: ModalWrapper,
    dialogs: { timer: TimerDialog },
  },
  sheets: {
    wrapper: SheetWrapper,
    dialogs: { editAddress: EditAddressSheet },
  },
  alerts: {
    wrapper: AlertWrapper,
    dialogs: { confirm: ConfirmAlert },
  },
})
```

The app mounts one `DialogsProvider` for this registry. Each `createDialogs` call makes an isolated registry and provider. The group wrapper receives controlled open state, a change callback, position data, and children. The registered component receives only the props supplied to `push()`.

## Operations

```tsx
const instance = dialogs.sheets.editAddress.push({ addressId: '123' })

dialogs.sheets.editAddress.pop() // Last open editAddress instance
dialogs.sheets.pop()             // Last open sheet
dialogs.pop()                    // Last open dialog across groups

instance.pop()                   // This exact instance, if still open
dialogs.sheets.editAddress.popAll()
dialogs.sheets.popAll()
dialogs.popAll()
```

`pop()` returns the selected instance or `undefined`; `popAll()` returns selected instances newest first or `[]`. A repeated pop is a silent no-op. Group operations never select instances from another group. UI dismissal closes the exact rendered instance. Instances from all groups share an order, but wrappers decide how to present them.

## React props that change after opening

```tsx
// components/timer-button.tsx
import { useState } from 'react'
import { useReactiveDialog } from 'pushmodal/react'
import { dialogs } from './ui/dialogs'

function TimerButton() {
  const [seconds, setSeconds] = useState(0)
  const timer = useReactiveDialog(dialogs.modals.timer, { count: seconds })

  return (
    <>
      <button onClick={() => setSeconds((value) => value + 1)}>Tick</button>
      <button onClick={() => timer.push()}>Open timer</button>
    </>
  )
}
```

`useReactiveDialog` is optional. Every instance opened through one hook follows the latest props from that calling component's renders. When the caller unmounts, the binding ends and those dialogs stay open with their last props. A remounted hook does not claim old instances. Ordinary `dialogs.modals.timer.push({ count: seconds })` remains available and treats its arguments as a snapshot.

## Core and release boundary

The package root and `pushmodal/core` export a framework-independent registry that accepts group and dialog names without UI components. Its snapshots include derived global and group position data. `pushmodal/react` consumes those positions and provides component registration and the provider. Core registration uses `createDialogs({ group: { dialogs: { name: defineDialog<Props>() } } })`.

The React provider can render an empty initial stack on the server. Opening dialogs is a client-side action in the first release. Registry state persists independently of provider mounting.

The redesign is a major 2.0 release. Version 1.x remains installable, and a migration guide explains the new import paths and API. The publish workflow must stop automatically publishing `latest` on every main-branch push before the major release is merged.

## Playground checks before implementation is accepted

- Base UI, Radix, and a plain controlled wrapper, including portals and multiple animated parts.
- Automatic exit cleanup without animation durations or per-dialog flags. Determine whether wrappers that keep closed content mounted need a completion signal.
- React Strict Mode behavior for reactive binding cleanup and UI dismissal.
- Duplicate instances, scoped pop operations, instance identity, and position data while one instance exits.
- Vanilla core subscriptions, React server rendering and hydration, and the exact core registration syntax.

The separate local `pushmodal-playground` repository now exercises Base UI dialogs and alerts, Radix sheets, and a plain React timer wrapper. Browser checks confirmed that a sheet-scoped `popAll()` leaves an alert open, two instances of the same sheet can stack, a reactive timer follows its caller's state, and both Base UI and Radix retain their closed content for the tested exit animations before unmounting. Core and React tests cover scoped selection, exact instance handles, subscriptions, server rendering, and caller unmount behavior.

Still to validate before a 2.0 release: hydration in a real server-rendered app, wrappers with several animated parts that finish at different times, and cleanup when a wrapper keeps closed content mounted. The existing 1.x source and examples also need removal or migration before this branch is ready for a public pull request.

# Pushmodal 2.0 playground

This app runs the proposed `next` API from the same repository. It lets you try the stack with Base UI, Radix, and a plain React wrapper. Nothing here requires an npm release.

## Run it

From the repository root:

```sh
pnpm install
pnpm playground:dev
```

Open the local URL printed by Vite. The root script builds Pushmodal first, then starts the playground. After changing library code, restart that command so the playground uses a fresh build. To check a production build of the example, run `pnpm playground:build` from the root.

## What to try

1. Open a Base UI or Radix sheet, then use its **Stack sheet** button to open a second instance. Both instances have the same registered name but distinct handles and positions.
2. Open an alert from a sheet, then choose **Pop all sheets, keep alert**. Group operations select only that group, even when an alert is above it.
3. Use the stack controls to compare global `dialogs.pop()` with group `dialogs.sheets.pop()` and `dialogs.sheets.popAll()`.
4. Open both kinds of timer and change the count. The reactive timer follows the launcher's React state. The snapshot timer keeps the count from its `push()` call. Unmount the launcher to see a reactive timer stay open with its last value.
5. Try backdrop, Escape, and close buttons. The wrapper receives `isVisualTop` so a dialog underneath another one cannot dismiss itself while the top dialog exits.

## Where to look in the code

The runnable registration and examples are in [`src/main.tsx`](src/main.tsx). It contains the group wrappers, dialog components, the `createDialogs` call, and the `useReactiveDialog` launcher. Generated shadcn components are in `src/components/ui/base` and `src/components/ui/radix`; the wrapper code shows the Pushmodal integration points.

The registration has one default wrapper per group. A dialog can provide its own wrapper when it uses a different UI primitive:

```tsx
const { dialogs, DialogsProvider } = createDialogs({
  modals: {
    wrapper: BaseDialogWrapper,
    dialogs: {
      baseSettings: BaseSettings,
      radixSettings: { component: RadixSettings, wrapper: RadixDialogWrapper },
    },
  },
})
```

Mount `<DialogsProvider />` once for this registry. Registered content receives only the props passed at `push()` time. The wrapper receives controlled `open` state, `onOpenChange`, position and layer data, and children. Your app owns those wrappers, so Pushmodal does not prescribe Base UI, Radix, CSS, or animation behavior.

### Named scopes and exact instances

```tsx
const settings = dialogs.modals.baseSettings.push({ label: 'General' })

dialogs.modals.baseSettings.pop() // Latest baseSettings instance
dialogs.modals.pop()              // Latest modal, regardless of its name
dialogs.pop()                     // Latest instance across all groups
settings.pop()                    // The instance opened above, if still open
```

This replaces the 1.x string lookup `pushModal('baseSettings', { label: 'General' })`. Types come from the registered component's props. `popAll()` is available at the named, group, and global levels. A second pop of an already closed handle does nothing.

### Why the reactive hook exists

Ordinary `push({ count })` takes a snapshot. That is useful for a confirmation message or an address ID that should stay as it was when the dialog opened. A timer, progress display, or editor preview may instead need to follow state in the component that opened it. `useReactiveDialog` provides that opt-in binding:

```tsx
function TimerLauncher() {
  const [count, setCount] = React.useState(0)
  const timer = useReactiveDialog(dialogs.modals.timer, { count })

  return <>
    <button onClick={() => setCount((value) => value + 1)}>Increment</button>
    <button onClick={() => timer.push()}>Open reactive timer</button>
    <button onClick={() => dialogs.modals.timer.push({ count })}>Open snapshot timer</button>
  </>
}
```

Every instance opened through one hook follows that caller's latest props. The ordinary `push` instance does not. When the caller unmounts, its binding ends and its dialogs stay open with their last props. Remounting the caller does not rebind old instances.

## Current limits

This branch is a prototype. Hydration in a server-rendered app, exit cleanup for wrappers with independently animated parts, and wrappers that keep closed content mounted still need validation. See the [API sketch](../../docs/next-api-sketch.md) for the full review list. The old 1.x source still exists in this branch and needs migration or removal before a 2.0 pull request.

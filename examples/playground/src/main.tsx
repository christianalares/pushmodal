import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { createDialogs, useReactiveDialog, type DialogWrapperProps } from 'pushmodal/react'
import * as BD from '@/components/ui/base/dialog'
import * as BS from '@/components/ui/base/sheet'
import * as BA from '@/components/ui/base/alert-dialog'
import * as RD from '@/components/ui/radix/dialog'
import * as RS from '@/components/ui/radix/sheet'
import * as RA from '@/components/ui/radix/alert-dialog'
import { Button as BaseButton } from '@/components/ui/base/button'
import { Button as RadixButton } from '@/components/ui/radix/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import './index.css'
import './style.css'

function Position({ position }: Pick<DialogWrapperProps, 'position'>) {
  return <small className="text-xs text-muted-foreground">Stack {position.globalIndex + 1}/{position.globalCount} · group {position.groupIndex + 1}/{position.groupCount}</small>
}

function layers(layerIndex: number) {
  const zIndex = 100 + layerIndex * 2
  return { overlayStyle: { zIndex }, contentStyle: { zIndex: zIndex + 1 } }
}

function BaseDialogWrapper({ open, onOpenChange, position, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const layer = layers(layerIndex)
  return <BD.Dialog open={open} onOpenChange={(next) => { if (isVisualTop) onOpenChange(next) }}>
    <BD.DialogContent overlayStyle={layer.overlayStyle} style={layer.contentStyle}>
      <Position position={position} />{children}
    </BD.DialogContent>
  </BD.Dialog>
}

function RadixDialogWrapper({ open, onOpenChange, position, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const layer = layers(layerIndex)
  return <RD.Dialog open={open} onOpenChange={(next) => { if (isVisualTop) onOpenChange(next) }}>
    <RD.DialogContent overlayStyle={layer.overlayStyle} style={layer.contentStyle}
      onInteractOutside={(event) => { if (!isVisualTop) event.preventDefault() }}
      onEscapeKeyDown={(event) => { if (!isVisualTop) event.preventDefault() }}>
      <Position position={position} />{children}
    </RD.DialogContent>
  </RD.Dialog>
}

function BaseSheetWrapper({ open, onOpenChange, position, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const layer = layers(layerIndex)
  return <BS.Sheet open={open} onOpenChange={(next) => { if (isVisualTop) onOpenChange(next) }}>
    <BS.SheetContent className="base-sheet-mount" overlayClassName="base-sheet-overlay"
      overlayStyle={layer.overlayStyle} style={{ ...layer.contentStyle, right: position.isGroupTop ? 0 : 18 }}>
      <Position position={position} />{children}
    </BS.SheetContent>
  </BS.Sheet>
}

function RadixSheetWrapper({ open, onOpenChange, position, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const layer = layers(layerIndex)
  return <RS.Sheet open={open} onOpenChange={(next) => { if (isVisualTop) onOpenChange(next) }}>
    <RS.SheetContent overlayStyle={layer.overlayStyle} style={{ ...layer.contentStyle, right: position.isGroupTop ? 0 : 18 }}
      onInteractOutside={(event) => { if (!isVisualTop) event.preventDefault() }}
      onEscapeKeyDown={(event) => { if (!isVisualTop) event.preventDefault() }}>
      <Position position={position} />{children}
    </RS.SheetContent>
  </RS.Sheet>
}

function BaseAlertWrapper({ open, onOpenChange, position, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const layer = layers(layerIndex)
  return <BA.AlertDialog open={open} onOpenChange={(next) => { if (isVisualTop) onOpenChange(next) }}>
    <BA.AlertDialogContent overlayStyle={layer.overlayStyle} style={layer.contentStyle}>
      <Position position={position} />{children}
    </BA.AlertDialogContent>
  </BA.AlertDialog>
}

function RadixAlertWrapper({ open, onOpenChange, position, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const layer = layers(layerIndex)
  return <RA.AlertDialog open={open} onOpenChange={(next) => { if (isVisualTop) onOpenChange(next) }}>
    <RA.AlertDialogContent overlayStyle={layer.overlayStyle} style={layer.contentStyle}
      onEscapeKeyDown={(event) => { if (!isVisualTop) event.preventDefault() }}>
      <Position position={position} />{children}
    </RA.AlertDialogContent>
  </RA.AlertDialog>
}

function TimerWrapper({ open, onOpenChange, position, layerIndex, children }: DialogWrapperProps) {
  if (!open) return null
  return <aside className="fixed bottom-6 left-6 flex w-[min(90vw,350px)] flex-col gap-3 rounded-xl border bg-popover p-5 shadow-xl"
    style={{ left: 24 + position.groupIndex * 24, bottom: 24 + position.groupIndex * 24, zIndex: 101 + layerIndex * 2 }}>
    <Position position={position} />{children}
    <BaseButton variant="outline" onClick={() => onOpenChange(false)}>Close timer</BaseButton>
  </aside>
}

function BaseSettings({ label }: { label: string }) {
  return <>
    <BD.DialogHeader><BD.DialogTitle>Settings: {label}</BD.DialogTitle>
      <BD.DialogDescription>Base UI dialog generated by shadcn.</BD.DialogDescription></BD.DialogHeader>
    <BD.DialogFooter>
      <BaseButton onClick={() => dialogs.alerts.baseConfirm.push({ message: 'Keep these settings?' })}>Open Base UI alert</BaseButton>
      <BD.DialogClose render={<BaseButton variant="outline" />}>Close</BD.DialogClose>
    </BD.DialogFooter>
  </>
}

function RadixSettings({ label }: { label: string }) {
  return <>
    <RD.DialogHeader><RD.DialogTitle>Settings: {label}</RD.DialogTitle>
      <RD.DialogDescription>Radix dialog generated by shadcn.</RD.DialogDescription></RD.DialogHeader>
    <RD.DialogFooter>
      <RadixButton onClick={() => dialogs.alerts.radixConfirm.push({ message: 'Keep these settings?' })}>Open Radix alert</RadixButton>
      <RD.DialogClose asChild><RadixButton variant="outline">Close</RadixButton></RD.DialogClose>
    </RD.DialogFooter>
  </>
}

function Timer({ count }: { count: number }) {
  return <><h2 className="font-heading text-lg font-medium">Reactive timer</h2>
    <p className="text-sm text-muted-foreground">This value follows React state when opened through useReactiveDialog.</p>
    <strong className="text-5xl tabular-nums">{count}</strong></>
}

function BaseAddress({ addressId }: { addressId: string }) {
  const [street, setStreet] = React.useState('')
  return <>
    <BS.SheetHeader><BS.SheetTitle>Edit address {addressId}</BS.SheetTitle>
      <BS.SheetDescription>Base UI sheet generated by shadcn.</BS.SheetDescription></BS.SheetHeader>
    <div className="grid gap-2 px-4"><Label htmlFor={`base-${addressId}`}>Street</Label>
      <Input id={`base-${addressId}`} value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Type here" /></div>
    <BS.SheetFooter>
      <BaseButton onClick={() => dialogs.sheets.baseAddress.push({ addressId: `${addressId}.2` })}>Stack Base UI sheet</BaseButton>
      <BaseButton variant="secondary" onClick={() => dialogs.alerts.baseConfirm.push({ message: `Save address ${addressId}?` })}>Open Base UI alert</BaseButton>
      <BS.SheetClose render={<BaseButton variant="outline" />}>Close sheet</BS.SheetClose>
    </BS.SheetFooter>
  </>
}

function RadixAddress({ addressId }: { addressId: string }) {
  const [street, setStreet] = React.useState('')
  return <>
    <RS.SheetHeader><RS.SheetTitle>Edit address {addressId}</RS.SheetTitle>
      <RS.SheetDescription>Radix sheet generated by shadcn.</RS.SheetDescription></RS.SheetHeader>
    <div className="grid gap-2 px-4"><Label htmlFor={`radix-${addressId}`}>Street</Label>
      <Input id={`radix-${addressId}`} value={street} onChange={(event) => setStreet(event.target.value)} placeholder="Type here" /></div>
    <RS.SheetFooter>
      <RadixButton onClick={() => dialogs.sheets.radixAddress.push({ addressId: `${addressId}.2` })}>Stack Radix sheet</RadixButton>
      <RadixButton variant="secondary" onClick={() => dialogs.alerts.radixConfirm.push({ message: `Save address ${addressId}?` })}>Open Radix alert</RadixButton>
      <RS.SheetClose asChild><RadixButton variant="outline">Close sheet</RadixButton></RS.SheetClose>
    </RS.SheetFooter>
  </>
}

function BaseConfirm({ message }: { message: string }) {
  return <>
    <BA.AlertDialogHeader><BA.AlertDialogTitle>Confirm</BA.AlertDialogTitle>
      <BA.AlertDialogDescription>{message}</BA.AlertDialogDescription></BA.AlertDialogHeader>
    <BA.AlertDialogFooter>
      <BA.AlertDialogCancel>Cancel</BA.AlertDialogCancel>
      <BA.AlertDialogAction onClick={() => dialogs.alerts.baseConfirm.pop()}>Confirm</BA.AlertDialogAction>
    </BA.AlertDialogFooter>
    <BaseButton variant="ghost" onClick={() => dialogs.sheets.popAll()}>Pop all sheets, keep alert</BaseButton>
  </>
}

function RadixConfirm({ message }: { message: string }) {
  return <>
    <RA.AlertDialogHeader><RA.AlertDialogTitle>Confirm</RA.AlertDialogTitle>
      <RA.AlertDialogDescription>{message}</RA.AlertDialogDescription></RA.AlertDialogHeader>
    <RA.AlertDialogFooter>
      <RA.AlertDialogCancel>Cancel</RA.AlertDialogCancel>
      <RA.AlertDialogAction onClick={() => dialogs.alerts.radixConfirm.pop()}>Confirm</RA.AlertDialogAction>
    </RA.AlertDialogFooter>
    <RadixButton variant="ghost" onClick={() => dialogs.sheets.popAll()}>Pop all sheets, keep alert</RadixButton>
  </>
}

const { dialogs, DialogsProvider } = createDialogs({
  modals: {
    wrapper: BaseDialogWrapper, dialogs: {
      baseSettings: BaseSettings,
      radixSettings: { component: RadixSettings, wrapper: RadixDialogWrapper },
      timer: { component: Timer, wrapper: TimerWrapper },
    }
  },
  sheets: {
    wrapper: BaseSheetWrapper, dialogs: {
      baseAddress: BaseAddress,
      radixAddress: { component: RadixAddress, wrapper: RadixSheetWrapper },
    }
  },
  alerts: {
    wrapper: BaseAlertWrapper, dialogs: {
      baseConfirm: BaseConfirm,
      radixConfirm: { component: RadixConfirm, wrapper: RadixAlertWrapper },
    }
  },
})

function ReactiveLauncher() {
  const [seconds, setSeconds] = React.useState(0)
  React.useEffect(() => {
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(interval)
  }, [])
  const timerModal = useReactiveDialog(dialogs.modals.timer, { count: seconds })
  return <Card><CardHeader><CardTitle>Reactive local props</CardTitle>
    <CardDescription>The count ticks each second. Compare a subscribed timer with a snapshot.</CardDescription></CardHeader>
    <CardContent className="flex flex-wrap gap-2">
      <BaseButton variant="outline" onClick={() => setSeconds((value) => value + 1)}>Tick: {seconds}</BaseButton>
      <BaseButton onClick={() => timerModal.push()}>Open reactive timer</BaseButton>
      <BaseButton variant="secondary" onClick={() => dialogs.modals.timer.push({ count: seconds })}>Open snapshot timer</BaseButton>
    </CardContent></Card>
}

function Snippet({ children }: { children: string }) {
  return <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm leading-6 text-zinc-100"><code>{children}</code></pre>
}

function App() {
  const [showLauncher, setShowLauncher] = React.useState(true)
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:py-12">
    <header className="space-y-2"><p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pushmodal 2.0 API preview</p>
      <h1 className="font-heading text-4xl font-semibold tracking-tight">Dialog playground</h1>
      <p className="max-w-2xl text-muted-foreground">Try the proposed registration and named stack API with Base UI, Radix, and a plain React wrapper. The examples below run against the package in this repository.</p></header>
    <h2 className="font-heading text-xl font-semibold">Try the wrappers</h2>
    <section className="grid gap-4 md:grid-cols-3">
      <Card><CardHeader><CardTitle>Dialog</CardTitle><CardDescription>Centered settings dialog</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <BaseButton onClick={() => dialogs.modals.baseSettings.push({ label: 'General' })}>Base UI</BaseButton>
          <RadixButton variant="outline" onClick={() => dialogs.modals.radixSettings.push({ label: 'General' })}>Radix</RadixButton>
        </CardContent></Card>
      <Card><CardHeader><CardTitle>Sheet</CardTitle><CardDescription>Right side address editor</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <BaseButton onClick={() => dialogs.sheets.baseAddress.push({ addressId: 'A' })}>Base UI</BaseButton>
          <RadixButton variant="outline" onClick={() => dialogs.sheets.radixAddress.push({ addressId: 'A' })}>Radix</RadixButton>
        </CardContent></Card>
      <Card><CardHeader><CardTitle>Alert dialog</CardTitle><CardDescription>Confirmation above the stack</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <BaseButton onClick={() => dialogs.alerts.baseConfirm.push({ message: 'A Base UI alert above everything.' })}>Base UI</BaseButton>
          <RadixButton variant="outline" onClick={() => dialogs.alerts.radixConfirm.push({ message: 'A Radix alert above everything.' })}>Radix</RadixButton>
        </CardContent></Card>
    </section>
    <section className="grid gap-4 md:grid-cols-2">
      <Card><CardHeader><CardTitle>Stack controls</CardTitle><CardDescription>Each action applies to its named scope.</CardDescription></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <BaseButton variant="outline" onClick={() => dialogs.pop()}>dialogs.pop()</BaseButton>
          <BaseButton variant="outline" onClick={() => dialogs.sheets.pop()}>sheets.pop()</BaseButton>
          <BaseButton variant="outline" onClick={() => dialogs.sheets.popAll()}>sheets.popAll()</BaseButton>
          <BaseButton variant="outline" onClick={() => dialogs.alerts.popAll()}>alerts.popAll()</BaseButton>
          <BaseButton variant="destructive" onClick={() => dialogs.popAll()}>dialogs.popAll()</BaseButton>
        </CardContent></Card>
      {showLauncher ? <ReactiveLauncher /> : <Card><CardHeader><CardTitle>Launcher unmounted</CardTitle><CardDescription>Open timers keep their last value.</CardDescription></CardHeader></Card>}
    </section>
    <BaseButton variant="ghost" onClick={() => setShowLauncher((value) => !value)}>{showLauncher ? 'Unmount' : 'Remount'} timer launcher</BaseButton>
    <p className="text-sm text-muted-foreground">Try opening an alert from a sheet, then call sheets.popAll(). The alert should remain.</p>
    <h2 className="font-heading text-xl font-semibold">How the API works</h2>
    <section aria-label="What changed" className="grid gap-4">
      <Card><CardHeader><CardTitle>Register once</CardTitle><CardDescription>Group dialogs and choose the wrapper that renders each group.</CardDescription></CardHeader>
        <CardContent><Snippet>{"const { dialogs, DialogsProvider } =\n  createDialogs({\n    modals: { wrapper, dialogs: { settings } }\n  })"}</Snippet></CardContent></Card>
      <Card><CardHeader><CardTitle>Open by name</CardTitle><CardDescription>Typed scopes replace string names and let you close globally, by group, or by instance.</CardDescription></CardHeader>
        <CardContent><Snippet>{"const instance = dialogs.modals.settings.push(props)\n\ndialogs.modals.pop()\ninstance.pop()"}</Snippet></CardContent></Card>
      <Card><CardHeader><CardTitle>Follow React state</CardTitle><CardDescription>Use the hook when an open dialog needs fresh props. Ordinary push keeps a snapshot.</CardDescription></CardHeader>
        <CardContent><Snippet>{"const timerModal = useReactiveDialog(dialogs.modals.timer, { count })\ntimerModal.push()"}</Snippet></CardContent></Card>
    </section>
    <DialogsProvider />
  </main>
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>)

import * as Dialog from '@/components/ui/base/dialog'
import { Button } from '@/components/ui/base/button'

export function SettingsModal({ section }: { section: string }) {
  return <>
    <Dialog.DialogHeader>
      <Dialog.DialogTitle>{section} settings</Dialog.DialogTitle>
      <Dialog.DialogDescription>Change the settings for this section.</Dialog.DialogDescription>
    </Dialog.DialogHeader>
    <Dialog.DialogFooter>
      <Dialog.DialogClose render={<Button variant="outline" />}>Close</Dialog.DialogClose>
    </Dialog.DialogFooter>
  </>
}

import type { DialogWrapperProps } from 'pushmodal/react'
import * as Dialog from '@/components/ui/base/dialog'
import * as Sheet from '@/components/ui/base/sheet'

export function ModalWrapper({ open, onOpenChange, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const zIndex = 100 + layerIndex * 2
  return <Dialog.Dialog open={open} onOpenChange={(next) => {
    if (isVisualTop) onOpenChange(next)
  }}>
    <Dialog.DialogContent overlayStyle={{ zIndex }} style={{ zIndex: zIndex + 1 }}>
      {children}
    </Dialog.DialogContent>
  </Dialog.Dialog>
}

export function SheetWrapper({ open, onOpenChange, layerIndex, isVisualTop, children }: DialogWrapperProps) {
  const zIndex = 100 + layerIndex * 2
  return <Sheet.Sheet open={open} onOpenChange={(next) => {
    if (isVisualTop) onOpenChange(next)
  }}>
    <Sheet.SheetContent overlayStyle={{ zIndex }} style={{ zIndex: zIndex + 1 }}>
      {children}
    </Sheet.SheetContent>
  </Sheet.Sheet>
}

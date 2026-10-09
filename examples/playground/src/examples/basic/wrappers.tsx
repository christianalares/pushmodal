import type { DialogWrapperProps } from 'pushmodal/react';
import { Dialog, DialogContent } from '@/components/ui/base/dialog';
import { Sheet, SheetContent } from '@/components/ui/base/sheet';

export function ModalWrapper({
  open,
  onOpenChange,
  layerIndex,
  isVisualTop,
  children,
}: DialogWrapperProps) {
  const zIndex = 100 + layerIndex * 2;
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isVisualTop) onOpenChange(next);
      }}
    >
      <DialogContent overlayStyle={{ zIndex }} style={{ zIndex: zIndex + 1 }}>
        {children}
      </DialogContent>
    </Dialog>
  );
}

export function SheetWrapper({
  open,
  onOpenChange,
  layerIndex,
  isVisualTop,
  children,
}: DialogWrapperProps) {
  const zIndex = 100 + layerIndex * 2;
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (isVisualTop) onOpenChange(next);
      }}
    >
      <SheetContent overlayStyle={{ zIndex }} style={{ zIndex: zIndex + 1 }}>
        {children}
      </SheetContent>
    </Sheet>
  );
}

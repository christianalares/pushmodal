import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/base/dialog';
import { Button } from '@/components/ui/base/button';

export function SettingsModal({ section }: { section: string }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{section} settings</DialogTitle>
        <DialogDescription>Change the settings for this section.</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
      </DialogFooter>
    </>
  );
}

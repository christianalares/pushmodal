import { useState } from 'react';
import {
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/base/sheet';
import { Button } from '@/components/ui/base/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EditAddressSheet({ addressId }: { addressId: string }) {
  const [street, setStreet] = useState('');

  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit address {addressId}</SheetTitle>
        <SheetDescription>This value belongs to this sheet instance.</SheetDescription>
      </SheetHeader>
      <div className="grid gap-2 px-4">
        <Label htmlFor={`street-${addressId}`}>Street</Label>
        <Input
          id={`street-${addressId}`}
          value={street}
          onChange={(event) => setStreet(event.target.value)}
        />
      </div>
      <SheetFooter>
        <SheetClose render={<Button variant="outline" />}>Close</SheetClose>
      </SheetFooter>
    </>
  );
}

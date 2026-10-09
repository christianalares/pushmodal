import { useState } from 'react'
import * as Sheet from '@/components/ui/base/sheet'
import { Button } from '@/components/ui/base/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function EditAddressSheet({ addressId }: { addressId: string }) {
  const [street, setStreet] = useState('')

  return <>
    <Sheet.SheetHeader>
      <Sheet.SheetTitle>Edit address {addressId}</Sheet.SheetTitle>
      <Sheet.SheetDescription>This value belongs to this sheet instance.</Sheet.SheetDescription>
    </Sheet.SheetHeader>
    <div className="grid gap-2 px-4">
      <Label htmlFor={`street-${addressId}`}>Street</Label>
      <Input id={`street-${addressId}`} value={street} onChange={(event) => setStreet(event.target.value)} />
    </div>
    <Sheet.SheetFooter>
      <Sheet.SheetClose render={<Button variant="outline" />}>Close</Sheet.SheetClose>
    </Sheet.SheetFooter>
  </>
}

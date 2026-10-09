import { Button } from '@/components/ui/base/button';
import { dialogs, DialogsProvider } from './dialogs';

export function BasicApp() {
  return (
    <>
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <a className="text-sm underline underline-offset-4" href="?">
          Back to the full playground
        </a>
        <h1 className="font-heading text-3xl font-semibold">Two-dialog example</h1>
        <p className="text-muted-foreground">
          One registry, two wrappers, and one provider. Open either dialog to try the setup below.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => dialogs.modals.settings.push({ section: 'General' })}>
            Open settings
          </Button>
          <Button
            variant="outline"
            onClick={() => dialogs.sheets.editAddress.push({ addressId: 'A' })}
          >
            Edit address
          </Button>
        </div>
      </main>
      <DialogsProvider />
    </>
  );
}

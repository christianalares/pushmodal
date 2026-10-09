import { createDialogs } from 'pushmodal/react'
import { SettingsModal } from './settings-modal'
import { EditAddressSheet } from './edit-adress-sheet'
import { ModalWrapper, SheetWrapper } from './wrappers'

export const { dialogs, DialogsProvider } = createDialogs({
  modals: {
    wrapper: ModalWrapper,
    dialogs: { settings: SettingsModal },
  },
  sheets: {
    wrapper: SheetWrapper,
    dialogs: { editAddress: EditAddressSheet },
  },
})

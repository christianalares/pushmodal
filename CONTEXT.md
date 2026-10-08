# Pushmodal

Pushmodal manages dialog-like UI that an application opens on demand.

## Language

**Dialog group**:
An application-defined namespace of related dialog-like UI, such as sheets or alerts. Groups do not prescribe a particular UI library.

**Dialog instance**:
One opening of a registered dialog-like item. Instances from every group share an order, regardless of how they are presented.

**Modal**:
A property of a dialog's interaction with the rest of the page, where outside content cannot be used while the dialog is open.
_Avoid_: Using modal as the umbrella term for every managed dialog, sheet, or alert.

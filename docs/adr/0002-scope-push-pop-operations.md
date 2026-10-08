# Use push and pop across dialog scopes

Each dialog scope selects from its own ordered view of open instances. `pop()` removes and returns the last instance in that scope, or returns `undefined` if the scope is empty. `popAll()` removes and returns every instance in that scope, newest first. A handle returned by `push()` may also use `pop()` to remove that exact instance, including when newer instances exist. This keeps one verb family across global, group, named dialog, and instance operations.

Popping removes an instance from the open order immediately, even if an adapter keeps it rendered during an exit animation. Popping that instance again is a silent no-op and returns `undefined`; popping an empty scope also returns `undefined`, and popping all from an empty scope returns `[]`. Repeated dismissal callbacks for an exiting instance cannot select another instance.

When a rendered dialog asks to close, such as after Escape or an outside press, the adapter pops that exact instance. A delayed dismissal from an older instance must not pop a newer instance of the same registered dialog.

The names `pop` and `popAll` are reserved for group and dialog keys wherever they would collide with these operations. Registration rejects known collisions in TypeScript and checks them at runtime for JavaScript or dynamic input.

The new API initially composes `pop()` and `push()` when one dialog gives way to another. It does not add a dedicated replacement operation without a demonstrated need. Existing `replaceWithModal()` remains available in installable 1.x releases during migration.

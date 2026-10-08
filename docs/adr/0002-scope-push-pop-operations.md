# Use push and pop across dialog scopes

Each dialog scope selects from its own ordered view of open instances. `pop()` removes and returns the last instance in that scope, or returns `undefined` if the scope is empty. `popAll()` removes every instance in that scope. A handle returned by `push()` may also use `pop()` to remove that exact instance, including when newer instances exist. This keeps one verb family across global, group, named dialog, and instance operations.

The names `pop` and `popAll` are reserved for group and dialog keys wherever they would collide with these operations. Registration rejects known collisions in TypeScript and checks them at runtime for JavaScript or dynamic input.

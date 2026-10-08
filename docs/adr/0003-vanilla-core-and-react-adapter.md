# Keep the core framework independent

The public core owns registration, ordered instances, and operations without depending on React. A React adapter uses that core and offers a single component-registration setup with one provider. Vanilla JavaScript users can use the core directly. This preserves a simple React setup while allowing other renderers to share the same state model and operation semantics.

The first new release supports the public vanilla core and includes a runnable vanilla example. The core owns logical open state but no mounting or animation. The React host stays mounted, creates a separate rendered root for each pushed instance, passes `open={false}` when one is popped, and removes that root when the wrapper signals that its visual exit is complete. A new push during an older instance's exit creates a new instance immediately.

The React setup separates each group's default controlled `wrapper` from its `dialogs` map, and lets an individual dialog override that wrapper. Direct core consumers provide their own DOM rendering and animation; the core exposes registration, state, operations, and subscriptions without a built-in DOM host.

The core and React adapter use new explicit import paths. Existing 1.x import paths keep their current meaning during migration, including the React-based `pushmodal/core` path.

# Keep the core framework independent

The public core owns registration, ordered instances, and operations without depending on React. A React adapter uses that core and offers a single component-registration setup with one provider. Vanilla JavaScript users can use the core directly. This preserves a simple React setup while allowing other renderers to share the same state model and operation semantics.

The core and React adapter use new explicit import paths. Existing 1.x import paths keep their current meaning during migration, including the React-based `pushmodal/core` path.

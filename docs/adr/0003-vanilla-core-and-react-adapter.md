# Keep the core framework independent

The public core owns registration, ordered instances, and operations without depending on React. A React adapter uses that core and offers a single component-registration setup with one provider. Vanilla JavaScript users can use the core directly. This preserves a simple React setup while allowing other renderers to share the same state model and operation semantics.

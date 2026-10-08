# Release the new API as a major version

The new framework-independent core and React adapter replace the existing public API in a 2.0 release. Version 1.x remains installable for applications that have not migrated; version 2.0 does not carry legacy API shims. A migration guide and runnable examples explain the changes before the stable release. This keeps the new API and its dependency boundary clear while giving existing users an explicit upgrade path.

The current workflow publishes npm `latest` after pushes to `main`, so release work must address that behavior before any major-version merge. A deprecation-only 1.x release is unnecessary without a usable migration target.

# Keep one order across dialog groups

Applications define their own dialog groups, but open instances from every group participate in one shared order. This lets a host coordinate presentations such as an alert opened above a sheet and gives global actions a clear top instance. A group-wide close selects only instances in that group, so closing all sheets does not silently close an alert.

Each instance can expose its position within its group and within the shared order to rendering adapters. This supports stack-aware presentation without exposing other instances' props or prescribing styles.

Position data follows the logically open stack. When the top instance is popped, the instance below immediately becomes the top open instance. The exiting instance can retain its last position for rendering until its exit completes.

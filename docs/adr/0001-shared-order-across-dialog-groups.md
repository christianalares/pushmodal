# Keep one order across dialog groups

Applications define their own dialog groups, but open instances from every group participate in one shared order. This lets a host coordinate presentations such as an alert opened above a sheet and gives global actions a clear top instance. Group actions still select instances from their own group, so a sheet action does not silently close an alert.

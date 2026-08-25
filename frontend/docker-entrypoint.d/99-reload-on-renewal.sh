#!/bin/sh
# nginx holds a renewed certificate's predecessor open until it is told to
# reload, so the certbot sidecar's work stays invisible without this.
#
# The loop lives here rather than wrapped around the container command because
# the nginx image only runs /docker-entrypoint.d when the command is nginx
# itself - replacing the command with a shell would skip template rendering.
# The subshell outlives this script and is reparented to nginx as PID 1.
#
# Six hours caps how long a renewal can sit unused. certbot renews at 30 days
# remaining, so the margin is wide.

( while :; do
      sleep 6h
      nginx -s reload
  done ) &

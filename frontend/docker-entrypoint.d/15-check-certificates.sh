#!/bin/sh
# The nginx image runs everything in /docker-entrypoint.d in name order before
# starting nginx, under set -e, so failing here stops the container with a
# message rather than letting nginx crashloop on a missing certificate file.

if [ -z "$APP_DOMAIN" ]; then
    echo "APP_DOMAIN is not set. Copy .env.example to .env and fill it in." >&2
    exit 1
fi

cert="/etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem"

if [ ! -f "$cert" ]; then
    echo "No certificate found at $cert" >&2
    echo "Issue one before starting the stack - see the HTTPS section of README.md:" >&2
    echo "  docker compose -f docker-compose-prod.yml --profile init up certbot-init" >&2
    exit 1
fi

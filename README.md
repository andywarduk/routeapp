# CCC Route Finder

Originally derived from the MERN tutorial at:

- [Ep01 - Setting up a development environment with Docker](https://medium.com/codebase/mern-ep01-setting-up-a-development-environment-with-docker-1bb0b6e4d464)
- [Ep02 - Developing the back end with MongoDB, NodeJS and Express](https://medium.com/codebase/mern-ep02-developing-the-back-end-with-mongodb-nodejs-and-express-556a6748b550)
- [Ep03 - Developing the front end with NodeJS, ReactJS and Bootstrap 3](https://medium.com/codebase/mern-ep03-developing-the-front-end-with-nodejs-reactjs-and-bootstrap-3-eda5aba8f8d6)

## Running

Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to
`frontend/.env`, then fill in the values.

```bash
docker compose -f docker-compose-dev.yml build
docker compose -f docker-compose-dev.yml up
```

Use `docker-compose-prod.yml` for production. Add `--pull` to refresh base
images. The production stack serves over HTTPS and needs the one-time setup
below.

Podman works as a drop-in - substitute `podman compose` for `docker compose`.
It needs a running machine first:

```bash
podman machine start
```

## HTTPS

The production stack terminates TLS in the frontend container, using a Let's
Encrypt certificate obtained with certbot. Two things have to be true before
any of it can work:

- A domain with an A or AAAA record pointing at this host. Let's Encrypt will
  not issue for a bare IP address.
- Ports 80 and 443 reachable from the internet. Port 80 stays open after
  setup - it answers the renewal challenge, and redirects everything else.

Copy `.env.example` to `.env` and fill in `APP_DOMAIN` and `CERTBOT_EMAIL`.

The first certificate has to exist before nginx will start, because nginx will
not load a TLS server block whose certificate file is missing. Issue it with
the stack down, so that port 80 is free:

```bash
docker compose -f docker-compose-prod.yml --profile init up certbot-init
```

Then bring the stack up as normal. If the certificate is not there the frontend
container stops with a message saying so rather than crashlooping.

Renewal needs no intervention. The certbot service checks twice a day and
renews at 30 days remaining, answering the challenge through the running nginx
rather than binding port 80 itself, and nginx reloads every six hours to pick
up whatever has been renewed. That path is worth proving once, straight after
the first issuance, rather than finding out in three months:

```bash
docker compose -f docker-compose-prod.yml run --rm --entrypoint certbot certbot renew --webroot -w /var/www/certbot --dry-run
```

Let's Encrypt allows five failed validations an hour, so use `--dry-run` while
working anything out.

The dev stack is plain HTTP on port 3000 and is unaffected by all of this.

## Local development without Docker

```bash
cd backend  && npm ci && BACKEND_URL=http://localhost:6200 npm run watch
cd frontend && npm ci && BACKEND_URL=http://localhost:6200 npm run dev
```

Requires Node 24 (the active LTS line). Node 22 enters end-of-life in April
2027 and is already security-fixes-only.

## Checks

Both packages expose the same scripts, which is what CI runs:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

CCC Route Finder
================

Originally derived from the MERN tutorial at:

https://medium.com/codebase/mern-ep01-setting-up-a-development-environment-with-docker-1bb0b6e4d464
https://medium.com/codebase/mern-ep02-developing-the-back-end-with-mongodb-nodejs-and-express-556a6748b550
https://medium.com/codebase/mern-ep03-developing-the-front-end-with-nodejs-reactjs-and-bootstrap-3-eda5aba8f8d6

Running
-------

Copy backend/.env.example to backend/.env and frontend/.env.example to
frontend/.env, then fill in the values.

  docker compose -f docker-compose-dev.yml build
  docker compose -f docker-compose-dev.yml up

Use docker-compose-prod.yml for production. Add --pull to refresh base images.

Local development without Docker
--------------------------------

  cd backend  && npm ci && BACKEND_URL=http://localhost:6200 npm run watch
  cd frontend && npm ci && BACKEND_URL=http://localhost:6200 npm run dev

Requires Node 24 (the active LTS line). Node 22 enters end-of-life in April
2027 and is already security-fixes-only.

Checks
------

Both packages expose the same scripts, which is what CI runs:

  npm run lint
  npm run typecheck
  npm test
  npm run build

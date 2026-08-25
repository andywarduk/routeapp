/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRAVA_CLIENT_ID?: string
  readonly VITE_MAP_CENTRE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

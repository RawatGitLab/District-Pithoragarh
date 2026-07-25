/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEOPORTAL_USERNAME?: string;
  readonly VITE_GEOPORTAL_PASSWORD?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

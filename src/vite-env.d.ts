/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AI_PROVIDER?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly AWS_REGION?: string;
  readonly VITE_BEDROCK_MODEL_ID?: string;
  readonly VITE_MAX_RETRIES?: string;
  readonly VITE_INITIAL_DELAY_MS?: string;
  readonly VITE_MAX_DELAY_MS?: string;
  readonly VITE_BACKOFF_MULTIPLIER?: string;
  readonly VITE_MAX_REQUESTS_PER_MINUTE?: string;
  readonly VITE_MAX_TOKENS_PER_MINUTE?: string;
  readonly APP_VERSION?: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

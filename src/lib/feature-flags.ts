/**
 * Feature flags — flip these to toggle features without touching UI/business logic.
 *
 * When a flag is `false`, related components are not rendered (tree-shaken by
 * conditional import) and no side effects (API calls, Gemini requests) run.
 */
export const featureFlags = {
  /** AI-Assisted Product Creation (Gemini image scanner). Disabled for client. */
  enableAIProductCreation: false,
} as const;

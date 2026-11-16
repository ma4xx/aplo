// Feature switches for things Aplo does not ship yet.
//
// Aplo has no account system, no billing and no hosted backend. Everything in
// the app has to work on the user's own Mac with their own API keys or local
// models. Anything that needs the upstream product's accounts, plans or servers
// is switched off here, not deleted: the code stays, and flipping a switch to
// true shows the feature again (for example when Aplo gets its own accounts and
// a paid plan).
//
// Features that were paid in the upstream product stay off on purpose, so they
// can become Aplo's paid features later instead of being given away now.

/** Sharing notes, folders, templates and automations; "shared with me". */
export const SHARING_ENABLED = false;

/** Sign-in, the Account page, the "create an account" badge and onboarding step. */
export const ACCOUNTS_ENABLED = false;

/** The upstream product's own cloud services: transcription, language models, web search. */
export const HOSTED_MODELS_ENABLED = false;

/** Features the upstream product sells in its Pro plan (app icons, template auto-format). */
export const PAID_FEATURES_ENABLED = false;

/** The Developers page: CLI, MCP, agent skills, cloud API, webhooks. */
export const DEVELOPER_TOOLS_ENABLED = false;

/** Importing meeting history from other apps; most sources sign in through the upstream backend. */
export const IMPORTS_ENABLED = false;

/** Links, prompts and content hosted by the upstream product: its Discord, GitHub and X, the welcome demo. */
export const UPSTREAM_COMMUNITY_ENABLED = false;

/**
 * The badge collection on the Insights page. It waits for an account session
 * before it shows anything, and without an account backend that never arrives,
 * so the page would say "loading" forever.
 */
export const INSIGHT_BADGES_ENABLED = false;

/** Automatic updates and release notes. Aplo has no update server yet. */
export const APP_UPDATES_ENABLED = false;

/** Usage-data and crash-report settings. No collection endpoint ships with Aplo. */
export const TELEMETRY_SETTINGS_ENABLED = false;

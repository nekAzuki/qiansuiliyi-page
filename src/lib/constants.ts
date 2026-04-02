export const PAGE_SIZE = 30;
export const MAX_VERSIONS = 50;
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
export const LIKE_MAX_PER_IP = 50;
export const JWT_EXPIRY_HOURS = 24;
export const SEARCH_DEBOUNCE_MS = 200;

export const LANGUAGES = ['国语', '外语'] as const;
export type Language = (typeof LANGUAGES)[number];

import { supabase } from "@/integrations/supabase/client";

type MaybeSessionError = {
  code?: string;
  message?: string;
  status?: number;
};

const SESSION_ERROR_CODES = new Set(["PGRST301"]);
const SESSION_ERROR_PATTERNS = [
  /jwt/i,
  /refresh token/i,
  /auth session missing/i,
  /invalid claim/i,
  /session has expired/i,
  /user from sub claim in jwt/i,
];

const clearStorageKeys = (storage: Storage | undefined) => {
  if (!storage) return;

  Object.keys(storage).forEach((key) => {
    if (key.startsWith("sb-") || key.includes("supabase.auth.token")) {
      storage.removeItem(key);
    }
  });
};

export const isSessionError = (error: unknown) => {
  const sessionError = error as MaybeSessionError | null;
  if (!sessionError) return false;

  if (typeof sessionError.code === "string" && SESSION_ERROR_CODES.has(sessionError.code)) {
    return true;
  }

  if (sessionError.status === 401 || sessionError.status === 403) {
    return true;
  }

  if (typeof sessionError.message === "string") {
    return SESSION_ERROR_PATTERNS.some((pattern) => pattern.test(sessionError.message));
  }

  return false;
};

export const resetClientSession = async () => {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Ignore sign-out failures and clear client storage directly.
  }

  if (typeof window === "undefined") return;

  clearStorageKeys(window.localStorage);
  clearStorageKeys(window.sessionStorage);
};

export const ensureFreshSession = async () => {
  try {
    await supabase.auth.getSession();
  } catch {
    // Swallow transient errors; do not nuke the session.
  }
};

export const runWithSessionRecovery = async <T>(queryFn: () => Promise<T>) => {
  await ensureFreshSession();

  try {
    return await queryFn();
  } catch (error) {
    if (!isSessionError(error)) throw error;

    await resetClientSession();
    return await queryFn();
  }
};

export const withTimeout = async <T>(promise: Promise<T>, timeoutMs = 15000, message = "Request timed out") => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};
declare const __APP_VERSION__: string;

const BUILD_VERSION = __APP_VERSION__;
const VERSION_KEY = "app_build_version";
const RELOAD_TARGET_KEY = "app_build_reload_target";
const RELOAD_QUERY_PARAM = "__lv";
const REQUEST_TIMEOUT_MS = 4000;

const getCurrentEntryUrl = () => {
  const script = document.querySelector<HTMLScriptElement>('script[type="module"][src]');
  return script?.src ?? import.meta.url;
};

const normalizeUrl = (value: string) => {
  try {
    const url = new URL(value, window.location.origin);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return value;
  }
};

const removeReloadQueryParam = () => {
  const url = new URL(window.location.href);
  if (!url.searchParams.has(RELOAD_QUERY_PARAM)) return;

  url.searchParams.delete(RELOAD_QUERY_PARAM);
  const nextUrl = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", nextUrl);
};

const clearStaleClientState = () => {
  const reloadTarget = sessionStorage.getItem(RELOAD_TARGET_KEY);

  try {
    localStorage.clear();
  } catch {
    Object.keys(localStorage).forEach((key) => localStorage.removeItem(key));
  }

  try {
    sessionStorage.clear();
  } catch {
    Object.keys(sessionStorage).forEach((key) => sessionStorage.removeItem(key));
  }

  if (reloadTarget) {
    sessionStorage.setItem(RELOAD_TARGET_KEY, reloadTarget);
  }

  if ("caches" in window) {
    void caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => undefined);
  }
};

const fetchLatestEntryUrl = async () => {
  const url = new URL(window.location.href);
  url.searchParams.set(RELOAD_QUERY_PARAM, Date.now().toString());

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: {
        "cache-control": "no-cache, no-store, max-age=0",
        pragma: "no-cache",
      },
      signal: controller.signal,
    });

    if (!response.ok) return null;

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const latestScript = parsed.querySelector<HTMLScriptElement>('script[type="module"][src]')?.getAttribute("src");

    if (!latestScript) return null;
    return new URL(latestScript, window.location.origin).toString();
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

const buildHasChanged = async () => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion && storedVersion !== BUILD_VERSION) {
    return { changed: true, target: BUILD_VERSION };
  }

  const latestEntryUrl = await fetchLatestEntryUrl();
  if (!latestEntryUrl) {
    return { changed: false, target: BUILD_VERSION };
  }

  const currentEntryUrl = getCurrentEntryUrl();
  const changed = normalizeUrl(latestEntryUrl) !== normalizeUrl(currentEntryUrl);

  return {
    changed,
    target: normalizeUrl(latestEntryUrl),
  };
};

export const checkAndInvalidateCache = async () => {
  if (typeof window === "undefined") return true;

  removeReloadQueryParam();

  const { changed, target } = await buildHasChanged();

  if (changed) {
    const previousTarget = sessionStorage.getItem(RELOAD_TARGET_KEY);

    if (previousTarget !== target) {
      sessionStorage.setItem(RELOAD_TARGET_KEY, target);
      clearStaleClientState();

      const refreshUrl = new URL(window.location.href);
      refreshUrl.searchParams.set(RELOAD_QUERY_PARAM, Date.now().toString());
      window.location.replace(refreshUrl.toString());
      return false;
    }
  }

  sessionStorage.removeItem(RELOAD_TARGET_KEY);
  localStorage.setItem(VERSION_KEY, BUILD_VERSION);
  return true;
};

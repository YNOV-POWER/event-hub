const DEFAULT_PATH = "/events";
const LOCAL_ORIGIN = "http://eventhub.invalid";

export function getSafeRedirect(next: string | null): string {
  if (!next?.startsWith("/")) return DEFAULT_PATH;
  try {
    const url = new URL(next, LOCAL_ORIGIN);
    return url.origin === LOCAL_ORIGIN ? `${url.pathname}${url.search}${url.hash}` : DEFAULT_PATH;
  } catch {
    return DEFAULT_PATH;
  }
}

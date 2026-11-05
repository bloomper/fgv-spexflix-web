/**
 * The page of everything a name takes part in. Names are matched without regard to case on the server.
 */
export function creditHref(name: string): string {
  return `/credits/${encodeURIComponent(name.trim())}`;
}

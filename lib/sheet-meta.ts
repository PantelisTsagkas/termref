// Verification metadata shared by the UI, the validator and the weekly
// version watch. Plain functions with no imports so Node can load this file
// directly from the .mjs scripts and tests.

export const REPO = "PantelisTsagkas/termref";
export const STALE_AFTER_MONTHS = 6;

export type WatchLevel = "major" | "minor";

export type Watch = {
  name: string;
  source: string; // "pypi:<pkg>", "npm:<pkg>", "github-releases:<owner/repo>", "github-tags:<owner/repo>"
  checked: string;
  level: WatchLevel;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseDate(iso: string): Date | null {
  if (!ISO_DATE.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== iso ? null : d;
}

// The date a sheet was last checked against official docs plus six calendar
// months. Formatting and arithmetic are pinned to UTC so a visitor west of
// Greenwich never sees the day before.
export function staleAfter(verified: string): Date | null {
  const d = parseDate(verified);
  if (!d) return null;
  d.setUTCMonth(d.getUTCMonth() + STALE_AFTER_MONTHS);
  return d;
}

export function isStale(verified: string | null, now: Date = new Date()): boolean {
  if (!verified) return false;
  const due = staleAfter(verified);
  return due !== null && now.getTime() >= due.getTime();
}

export function formatDate(iso: string): string {
  const d = parseDate(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(d);
}

export function verificationLine(sheet: {
  verified: string | null;
  version: string | null;
}): string {
  if (!sheet.verified) return "not yet verified against official docs";
  const date = `verified ${formatDate(sheet.verified)}`;
  return sheet.version ? `${sheet.version} · ${date}` : date;
}

// Versions are compared on their numeric major.minor.patch only. Anything with
// a pre-release suffix (rc, beta, dev) is ignored by stableVersion().
export function parseVersion(v: string): [number, number, number] | null {
  const m = /^v?(\d+)\.(\d+)(?:\.(\d+))?$/.exec(v.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3] ?? 0)] : null;
}

export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) throw new Error(`Not a stable version: ${pa ? b : a}`);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

export function latestStable(versions: string[]): string | null {
  const stable = versions.filter((v) => parseVersion(v) !== null);
  if (!stable.length) return null;
  return stable.reduce((best, v) => (compareVersions(v, best) > 0 ? v : best));
}

// "minor" flags 2.54 -> 2.55 and 3.x -> 4.x; "major" only flags 3.x -> 4.x.
// Patch releases never trigger a re-verification.
export function needsReverify(checked: string, latest: string, level: WatchLevel): boolean {
  const c = parseVersion(checked);
  const l = parseVersion(latest);
  if (!c || !l) return false;
  if (l[0] !== c[0]) return l[0] > c[0];
  return level === "minor" && l[1] > c[1];
}

// One issue per tool per release line. The title doubles as the dedupe key,
// so it must stay stable across weekly runs and patch releases.
export function releaseLine(latest: string, level: WatchLevel): string {
  const v = parseVersion(latest);
  if (!v) return latest;
  return level === "major" ? `${v[0]}` : `${v[0]}.${v[1]}`;
}

export function watchIssueTitle(sheetId: string, watch: Watch, latest: string): string {
  const line = releaseLine(latest, watch.level);
  const suffix = watch.level === "major" ? ".x" : "";
  return `${watch.name} ${line}${suffix} released: re-verify the ${sheetId} sheet`;
}

// Short link text for a source URL: the host plus the last meaningful path
// segment, so two pages on the same docs site stay distinguishable.
export function sourceLabel(url: string): string {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, "");
  const release = /^\/([^/]+\/[^/]+)\/releases\/tag\/([^/]+)$/.exec(u.pathname);
  if (host === "github.com" && release) return `${release[1]}@${release[2]}`;
  const segments = u.pathname
    .split("/")
    .map((seg) => seg.replace(/\.html?$/, ""))
    .filter((seg) => seg && seg !== "index");
  const last = segments.at(-1);
  return last ? `${host}/${last}` : host;
}

export function reportIssueUrl(sheetId: string, sheetTitle: string, version: string | null): string {
  const title = `Outdated command in the ${sheetId} sheet${version ? ` (${version})` : ""}`;
  const body = [
    `Sheet: ${sheetTitle}${version ? ` (${version})` : ""}`,
    "",
    "Command:",
    "",
    "What changed, ideally with a link to the official docs:",
    "",
  ].join("\n");
  // No "labels" parameter: GitHub returns a 404 for visitors who cannot label
  // issues. The template applies the "outdated" label instead.
  const q = new URLSearchParams({ template: "outdated-command.md", title, body });
  return `https://github.com/${REPO}/issues/new?${q.toString()}`;
}

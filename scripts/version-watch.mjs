// Weekly version watch. For every "watch" entry in data/cheatsheets, looks up
// the latest stable release and compares it with the version the sheet was
// verified against. A new release line (minor or major, per entry) means the
// sheet needs re-verifying.
//
//   node scripts/version-watch.mjs                  # report only
//   node scripts/version-watch.mjs --create-issues  # also open GitHub issues
//
// Issue titles double as the dedupe key and are matched across open and
// closed issues, so closing an issue never makes it come back next week.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  compareVersions,
  latestStable,
  needsReverify,
  parseVersion,
  watchIssueTitle,
} from "../lib/sheet-meta.ts";

const DIR = "data/cheatsheets";
const LABEL = "version-watch";
const createIssues = process.argv.includes("--create-issues");
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers: { "user-agent": "termref-version-watch", ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} from ${url}`);
  return res.json();
}

function gitTags(repo) {
  const out = execFileSync(
    "git",
    ["ls-remote", "--tags", "--refs", `https://github.com/${repo}.git`],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return out
    .split("\n")
    .map((line) => line.split("refs/tags/")[1])
    .filter(Boolean);
}

const LOOKUPS = {
  async pypi(pkg) {
    const data = await getJson(`https://pypi.org/pypi/${pkg}/json`);
    const v = data.info.version;
    return parseVersion(v) ? v : latestStable(Object.keys(data.releases));
  },
  async npm(pkg) {
    return (await getJson(`https://registry.npmjs.org/${pkg}/latest`)).version;
  },
  // Not /releases/latest: that sorts by creation date, so a backport patch to
  // an older line (e.g. Kubernetes 1.35.x after 1.37.0) would look "latest".
  async "github-releases"(repo) {
    const auth = token ? { authorization: `Bearer ${token}` } : {};
    const rels = await getJson(`https://api.github.com/repos/${repo}/releases?per_page=100`, auth);
    return latestStable(rels.filter((r) => !r.draft && !r.prerelease).map((r) => r.tag_name));
  },
  async "github-tags"(repo) {
    return latestStable(gitTags(repo));
  },
};

const watches = readdirSync(DIR)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => {
    const sheet = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    return (sheet.watch ?? []).map((w) => ({ sheetId: f.replace(/\.json$/, ""), ...w }));
  });

const results = await Promise.all(
  watches.map(async (w) => {
    const [kind, id] = w.source.split(/:(.*)/s);
    try {
      const latest = await LOOKUPS[kind](id);
      if (!latest || !parseVersion(latest)) throw new Error(`no stable version found (got ${latest})`);
      if (compareVersions(w.checked, latest) > 0) {
        throw new Error(`sheet claims ${w.checked}, newer than the latest release ${latest}`);
      }
      return { ...w, latest, reverify: needsReverify(w.checked, latest, w.level) };
    } catch (e) {
      return { ...w, error: e.message };
    }
  }),
);

for (const r of results) {
  const status = r.error ? `ERROR ${r.error}` : r.reverify ? "RE-VERIFY" : "ok";
  console.log(
    `${r.sheetId.padEnd(11)}${r.name.padEnd(16)}${r.checked.padEnd(10)}` +
      `${(r.latest ?? "-").padEnd(14)}${r.level.padEnd(7)}${status}`,
  );
}

const due = results.filter((r) => r.reverify);
const failed = results.filter((r) => r.error);
console.log(`\n${results.length} watched, ${due.length} need re-verifying, ${failed.length} failed`);

if (createIssues) {
  const gh = (...args) => execFileSync("gh", args, { encoding: "utf8" });
  // Both labels are created idempotently on every run. "outdated" is applied
  // by the reader-report issue template, which ignores labels that don't exist.
  gh("label", "create", LABEL, "--force", "--color", "f0a500", "--description", "A tool released a new version");
  gh("label", "create", "outdated", "--force", "--color", "ff4c6a", "--description", "A reader reported an outdated command");
  const existing = new Set(
    JSON.parse(gh("issue", "list", "--state", "all", "--label", LABEL, "--limit", "1000", "--json", "title")).map(
      (i) => i.title,
    ),
  );
  for (const r of due) {
    const title = watchIssueTitle(r.sheetId, r, r.latest);
    if (existing.has(title)) {
      console.log(`exists: ${title}`);
      continue;
    }
    const body = [
      `The \`${r.sheetId}\` sheet was verified against ${r.name} ${r.checked}. The latest release is ${r.latest}.`,
      "",
      "To close this:",
      `1. Re-check every command in \`data/cheatsheets/${r.sheetId}.json\` against the release notes and docs.`,
      `2. Update \`verified\`, \`version\` and this watch entry's \`checked\` to ${r.latest.replace(/^v/, "")}.`,
      "",
      `Source: \`${r.source}\`. Opened by the weekly version watch.`,
    ].join("\n");
    gh("issue", "create", "--title", title, "--body", body, "--label", LABEL);
    console.log(`opened: ${title}`);
  }
}

// Fail the run after any issues are filed, so a broken lookup is visible in
// the Actions tab without blocking the tools that did resolve.
if (failed.length) process.exit(1);

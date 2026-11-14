import assert from "node:assert/strict";
import { test } from "node:test";
import { sheetToMarkdown, sheetToText } from "../lib/cheat-sheet.ts";
import {
  formatDate,
  isStale,
  latestStable,
  needsReverify,
  parseDate,
  reportIssueUrl,
  sourceLabel,
  verificationLine,
  watchIssueTitle,
} from "../lib/sheet-meta.ts";

const utc = (iso) => new Date(`${iso}T00:00:00Z`);

test("dates are shown in UTC, so no visitor sees the day before", () => {
  assert.equal(formatDate("2026-11-14"), "14 Nov 2026");
});

test("parseDate rejects impossible and badly formatted dates", () => {
  assert.equal(parseDate("2026-02-30"), null);
  assert.equal(parseDate("14/11/2026"), null);
  assert.ok(parseDate("2026-11-14"));
});

test("a sheet goes stale exactly six calendar months after verification", () => {
  assert.equal(isStale("2026-11-14", utc("2027-05-13")), false);
  assert.equal(isStale("2026-11-14", utc("2027-05-14")), true);
  assert.equal(isStale(null, utc("2030-01-01")), false);
});

test("verification line names the version and the date, or admits it is unverified", () => {
  assert.equal(
    verificationLine({ verified: "2026-11-14", version: "Airflow 3.1" }),
    "Airflow 3.1 · verified 14 Nov 2026",
  );
  assert.equal(
    verificationLine({ verified: null, version: null }),
    "not yet verified against official docs",
  );
});

test("exports carry the verification line", () => {
  const sheet = {
    title: "T",
    verified: "2026-11-14",
    version: "Git 2.54",
    sources: [],
    sections: [{ title: "S", commands: [{ cmd: "ls", desc: "List" }] }],
  };
  assert.match(sheetToText(sheet), /^CHEAT SHEET: T\nGit 2\.54 · verified 14 Nov 2026\n/);
  assert.match(sheetToMarkdown(sheet), /^# T\n\n_Git 2\.54 · verified 14 Nov 2026_\n/);
});

test("latestStable ignores pre-releases and compares numerically", () => {
  assert.equal(latestStable(["v2.9.0", "v2.10.0", "v2.11.0-rc1", "v2.10.1"]), "v2.10.1");
  assert.equal(latestStable(["1.0.0b1", "0.9.9"]), "0.9.9");
  assert.equal(latestStable(["nightly"]), null);
});

test("minor watches flag new minors and majors, never patches", () => {
  assert.equal(needsReverify("2.54.0", "2.54.3", "minor"), false);
  assert.equal(needsReverify("2.54.0", "2.55.0", "minor"), true);
  assert.equal(needsReverify("2.54.0", "3.0.0", "minor"), true);
  assert.equal(needsReverify("2.54.0", "2.53.9", "minor"), false);
});

test("major watches only flag a new major", () => {
  assert.equal(needsReverify("2.31.0", "2.40.0", "major"), false);
  assert.equal(needsReverify("2.31.0", "3.0.0", "major"), true);
});

test("issue titles stay the same across patch releases so issues are not duplicated", () => {
  const watch = { name: "Git", source: "github-tags:git/git", checked: "2.54.0", level: "minor" };
  const a = watchIssueTitle("git", watch, "v2.55.0");
  assert.equal(a, "Git 2.55 released: re-verify the git sheet");
  assert.equal(watchIssueTitle("git", watch, "v2.55.2"), a);
  const major = { ...watch, name: "AWS CLI", level: "major" };
  assert.equal(watchIssueTitle("aws", major, "3.0.1"), "AWS CLI 3.x released: re-verify the aws sheet");
});

test("report link opens a pre-filled issue on the repo", () => {
  const url = new URL(reportIssueUrl("git", "Git Cheat Sheet", "Git 2.54"));
  assert.equal(url.pathname, "/PantelisTsagkas/termref/issues/new");
  assert.equal(url.searchParams.get("template"), "outdated-command.md");
  assert.equal(url.searchParams.get("labels"), null);
  assert.match(url.searchParams.get("title"), /git sheet/);
  assert.match(url.searchParams.get("body"), /Git Cheat Sheet \(Git 2\.54\)/);
});

test("source labels keep two pages on the same site apart", () => {
  assert.equal(
    sourceLabel("https://airflow.apache.org/docs/apache-airflow/stable/release_notes.html"),
    "airflow.apache.org/release_notes",
  );
  assert.equal(
    sourceLabel("https://awscli.amazonaws.com/v2/documentation/api/latest/reference/index.html"),
    "awscli.amazonaws.com/reference",
  );
  assert.equal(sourceLabel("https://www.example.com/"), "example.com");
  assert.equal(sourceLabel("https://github.com/npm/cli/releases/tag/v12.0.0"), "npm/cli@v12.0.0");
});

// Validates every cheat sheet in data/cheatsheets against the shape and
// style rules the UI and exporters rely on, plus the verification metadata
// the version watch reads. Run with --fix to rewrite the files in the
// canonical one-command-per-line layout.
//
// Malformed metadata fails the run. A sheet that is merely old only warns,
// so CI never goes red from the passing of time alone.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { isStale, parseDate, parseVersion, staleAfter } from "../lib/sheet-meta.ts";

const DIR = "data/cheatsheets";
const SOURCES = /^(pypi|npm|github-releases|github-tags):[\w.\-/]+$/;
const fix = process.argv.includes("--fix");
const errors = [];
const warnings = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);

const registered = new Set(
  [...readFileSync("lib/technologies.ts", "utf8").matchAll(/id: "([^"]+)"/g)].map(
    (m) => m[1],
  ),
);
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));

for (const id of registered) {
  if (!files.includes(`${id}.json`)) fail(`${id}.json`, "registered but missing");
}

const j = JSON.stringify;

function format(sheet) {
  const sections = sheet.sections.map((s) => {
    const cmds = s.commands
      .map((c) => `        { "cmd": ${j(c.cmd)}, "desc": ${j(c.desc)} }`)
      .join(",\n");
    return `    {\n      "title": ${j(s.title)},\n      "commands": [\n${cmds}\n      ]\n    }`;
  });
  const list = (items, render) =>
    items.length ? `[\n${items.map((x) => `    ${render(x)}`).join(",\n")}\n  ]` : "[]";
  return [
    "{",
    `  "title": ${j(sheet.title)},`,
    `  "verified": ${j(sheet.verified ?? null)},`,
    `  "version": ${j(sheet.version ?? null)},`,
    `  "sources": ${list(sheet.sources ?? [], j)},`,
    `  "watch": ${list(sheet.watch ?? [], (w) =>
      `{ "name": ${j(w.name)}, "source": ${j(w.source)}, "checked": ${j(w.checked)}, "level": ${j(w.level)} }`,
    )},`,
    `  "sections": [\n${sections.join(",\n")}\n  ]`,
    "}",
    "",
  ].join("\n");
}

function checkMeta(file, sheet) {
  const { verified, version, sources, watch } = sheet;
  if (!("verified" in sheet)) return fail(file, `missing "verified" (use null if not yet verified)`);
  if (!Array.isArray(sources)) fail(file, `"sources" must be an array`);
  if (!Array.isArray(watch)) fail(file, `"watch" must be an array`);
  if (verified === null) {
    if (watch?.length) fail(file, "an unverified sheet cannot be watched");
    return;
  }
  const date = parseDate(String(verified));
  if (!date) return fail(file, `"verified" must be a YYYY-MM-DD date: ${verified}`);
  if (date.getTime() > Date.now()) fail(file, `"verified" is in the future: ${verified}`);
  if (typeof version !== "string" || !version.trim()) fail(file, `verified sheets need a "version"`);
  if (!sources?.length) fail(file, `verified sheets need at least one entry in "sources"`);
  for (const url of sources ?? []) {
    if (!/^https:\/\/\S+$/.test(url)) fail(file, `source is not an https URL: ${url}`);
  }
  for (const w of watch ?? []) {
    if (!w.name || !SOURCES.test(w.source ?? "")) fail(file, `bad watch entry: ${j(w)}`);
    if (!parseVersion(w.checked ?? "")) fail(file, `watch "${w.name}" checked is not a version: ${w.checked}`);
    if (w.level !== "major" && w.level !== "minor") fail(file, `watch "${w.name}" level must be major or minor`);
  }
  if (isStale(verified)) {
    const due = staleAfter(verified).toISOString().slice(0, 10);
    warnings.push(`${file}: verified ${verified}, re-verification was due ${due}`);
  }
}

for (const file of files) {
  const raw = readFileSync(join(DIR, file), "utf8");
  let sheet;
  try {
    sheet = JSON.parse(raw);
  } catch (e) {
    fail(file, `invalid JSON: ${e.message}`);
    continue;
  }
  if (!registered.has(file.replace(/\.json$/, ""))) fail(file, "not registered in lib/technologies.ts");
  if (typeof sheet.title !== "string" || !sheet.title.trim()) fail(file, "missing title");
  checkMeta(file, sheet);
  if (!Array.isArray(sheet.sections) || sheet.sections.length === 0) {
    fail(file, "no sections");
    continue;
  }
  const seen = new Set();
  for (const sec of sheet.sections) {
    if (!sec.title || sec.title !== sec.title.toUpperCase()) {
      fail(file, `section title must be UPPER CASE: "${sec.title}"`);
    }
    if (!Array.isArray(sec.commands) || sec.commands.length === 0) {
      fail(file, `section "${sec.title}" has no commands`);
      continue;
    }
    for (const c of sec.commands) {
      if (typeof c.cmd !== "string" || !c.cmd.trim()) fail(file, `empty cmd in "${sec.title}"`);
      if (typeof c.desc !== "string" || !c.desc.trim()) fail(file, `empty desc for "${c.cmd}"`);
      if (seen.has(c.cmd)) fail(file, `duplicate cmd "${c.cmd}"`);
      seen.add(c.cmd);
      if (/\.$/.test(c.desc)) fail(file, `desc ends with a period: "${c.cmd}"`);
      if (/[—]/.test(c.cmd + c.desc)) fail(file, `em dash in "${c.cmd}"`);
    }
  }
  if (fix && raw !== format(sheet)) writeFileSync(join(DIR, file), format(sheet));
}

if (warnings.length) console.warn(`stale (older than 6 months):\n  ${warnings.join("\n  ")}\n`);
if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) in ${files.length} sheets`);
  process.exit(1);
}
const unverified = files.filter((f) => JSON.parse(readFileSync(join(DIR, f), "utf8")).verified === null);
console.log(
  `${files.length} sheets OK` + (unverified.length ? ` (${unverified.length} not yet verified)` : ""),
);

// Validates every cheat sheet in data/cheatsheets against the shape and
// style rules the UI and exporters rely on. Run with --fix to rewrite the
// files in the canonical one-command-per-line layout.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "data/cheatsheets";
const fix = process.argv.includes("--fix");
const errors = [];
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

function format(sheet) {
  const sections = sheet.sections.map((s) => {
    const cmds = s.commands
      .map((c) => `        { "cmd": ${JSON.stringify(c.cmd)}, "desc": ${JSON.stringify(c.desc)} }`)
      .join(",\n");
    return `    {\n      "title": ${JSON.stringify(s.title)},\n      "commands": [\n${cmds}\n      ]\n    }`;
  });
  return `{\n  "title": ${JSON.stringify(sheet.title)},\n  "sections": [\n${sections.join(",\n")}\n  ]\n}\n`;
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

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s) in ${files.length} sheets`);
  process.exit(1);
}
console.log(`${files.length} sheets OK`);

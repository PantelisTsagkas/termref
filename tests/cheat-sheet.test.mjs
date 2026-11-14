import assert from "node:assert/strict";
import { test } from "node:test";
import { countCommands, sheetToMarkdown, sheetToText } from "../lib/cheat-sheet.ts";

const sheet = {
  title: "Test Sheet",
  sections: [
    {
      title: "PIPES",
      commands: [
        { cmd: "history | grep 'cmd'", desc: "Search history" },
        { cmd: "aws ec2 describe-instances --filters \"Name=instance-state-name,Values=running\"", desc: "Running only" },
        { cmd: "ls", desc: "List files" },
      ],
    },
  ],
};

test("markdown escapes pipes so each command stays one table row", () => {
  const md = sheetToMarkdown(sheet);
  const row = md.split("\n").find((l) => l.includes("history"));
  assert.equal(row, "| `history \\| grep 'cmd'` | Search history |");
  // An unescaped | splits cells; a valid row has exactly 3 separators.
  assert.equal(row.replace(/\\\|/g, "").split("|").length - 1, 3);
});

test("text export never runs a long command into its description", () => {
  const lines = sheetToText(sheet).split("\n");
  const i = lines.findIndex((l) => l.includes("describe-instances"));
  assert.ok(!lines[i].includes("Running only"));
  assert.match(lines[i + 1], /^\s{40}Running only$/);
});

test("text export keeps short commands on one aligned line", () => {
  const line = sheetToText(sheet).split("\n").find((l) => l.includes("List files"));
  assert.equal(line, `${"  ls".padEnd(40)}List files`);
});

test("countCommands sums every section", () => {
  assert.equal(countCommands(sheet), 3);
});

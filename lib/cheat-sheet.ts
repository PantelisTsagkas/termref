export type Command = { cmd: string; desc: string };

export type CheatSheet = {
  title: string;
  sections: { title: string; commands: Command[] }[];
};

const TXT_CMD_WIDTH = 40;

export function countCommands(sheet: CheatSheet): number {
  return sheet.sections.reduce((n, s) => n + s.commands.length, 0);
}

// Long commands get their description on the next line, aligned with the
// description column, so the two never run together.
export function sheetToText(sheet: CheatSheet): string {
  let out = `CHEAT SHEET: ${sheet.title}\n${"=".repeat(50)}\n\n`;
  for (const sec of sheet.sections) {
    out += `▸ ${sec.title}\n${"-".repeat(40)}\n`;
    for (const c of sec.commands) {
      const cmd = `  ${c.cmd}`;
      out +=
        cmd.length < TXT_CMD_WIDTH
          ? `${cmd.padEnd(TXT_CMD_WIDTH)}${c.desc}\n`
          : `${cmd}\n${" ".repeat(TXT_CMD_WIDTH)}${c.desc}\n`;
    }
    out += "\n";
  }
  return out;
}

// GFM table cells end at any unescaped "|", even inside a code span.
function escapeCell(text: string): string {
  return text.replace(/\|/g, "\\|");
}

export function sheetToMarkdown(sheet: CheatSheet): string {
  let md = `# ${sheet.title}\n\n`;
  for (const sec of sheet.sections) {
    md += `## ${sec.title}\n\n| Command | Description |\n|---------|-------------|\n`;
    for (const c of sec.commands) {
      md += `| \`${escapeCell(c.cmd)}\` | ${escapeCell(c.desc)} |\n`;
    }
    md += "\n";
  }
  return md;
}

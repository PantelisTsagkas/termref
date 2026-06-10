export type CheatSheet = {
  title: string;
  sections?: {
    title: string;
    commands?: { cmd: string; desc: string }[];
  }[];
};

export function sheetToText(sheet: CheatSheet | null): string {
  if (!sheet) return "";
  let out = `CHEAT SHEET: ${sheet.title}\n${"=".repeat(50)}\n\n`;
  for (const sec of sheet.sections || []) {
    out += `▸ ${sec.title}\n${"-".repeat(40)}\n`;
    for (const c of sec.commands || []) {
      out += `  ${c.cmd.padEnd(36)}${c.desc}\n`;
    }
    out += "\n";
  }
  return out;
}

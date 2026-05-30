export type CheatSheet = {
  title: string;
  sections?: {
    title: string;
    commands?: { cmd: string; desc: string }[];
  }[];
};

export function parseCheatSheet(raw: string): CheatSheet | null {
  if (!raw?.trim()) return null;

  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) text = fenced[1].trim();

  try {
    return JSON.parse(text) as CheatSheet;
  } catch {
    // fall through
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as CheatSheet;
  } catch {
    // Truncated JSON from max_tokens — close open strings/brackets heuristically
    try {
      let repaired = candidate;
      const openQuotes = (repaired.match(/(?<!\\)"/g) || []).length % 2 === 1;
      if (openQuotes) repaired += '"';
      repaired = repaired.replace(/,\s*$/, "");
      const opens = (repaired.match(/[\[{]/g) || []).length;
      const closes = (repaired.match(/[\]}]/g) || []).length;
      for (let i = 0; i < opens - closes; i++) {
        repaired += repaired.lastIndexOf("[") > repaired.lastIndexOf("{") ? "]" : "}";
      }
      return JSON.parse(repaired) as CheatSheet;
    } catch {
      return null;
    }
  }
}

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

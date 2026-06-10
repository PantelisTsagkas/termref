"use client";

import { useRef, useState } from "react";
import { sheetToText, type CheatSheet } from "@/lib/cheat-sheet";
import { getCheatSheet } from "@/lib/cheatsheets";
import { CATEGORIES, TECHNOLOGIES } from "@/lib/technologies";

export default function TermrefApp() {
  const [activeCat, setActiveCat] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [sheet, setSheet] = useState<CheatSheet | null>(null);
  const [error, setError] = useState("");
  const [rawText, setRawText] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);

  const filteredTech =
    activeCat === "All"
      ? TECHNOLOGIES
      : TECHNOLOGIES.filter((t) => t.category === activeCat);

  function loadSheet() {
    if (!selected) return;
    setError("");
    setSheet(null);
    setRawText("");

    const sheet = getCheatSheet(selected);
    if (!sheet?.title) {
      setError("Cheat sheet not found.");
      return;
    }

    setSheet(sheet);
    setRawText(sheetToText(sheet));
  }

  function downloadTxt() {
    if (!rawText) return;
    const blob = new Blob([rawText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}-cheatsheet.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setSheet(null);
    setRawText("");
    setError("");
    setSelected(null);
  }

  function downloadMd() {
    if (!sheet) return;
    let md = `# ${sheet.title}\n\n`;
    for (const sec of sheet.sections || []) {
      md += `## ${sec.title}\n\n| Command | Description |\n|---------|-------------|\n`;
      for (const c of sec.commands || []) {
        md += `| \`${c.cmd}\` | ${c.desc} |\n`;
      }
      md += "\n";
    }
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}-cheatsheet.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo-box">&gt;_</div>
        <div className="header-text">
          <h1>TERMREF</h1>
          <p>CURATED TERMINAL CHEAT SHEET REFERENCE</p>
        </div>
        <div className="badge">15 TECHNOLOGIES</div>
      </header>

      <div className="main">
        <aside className="left-panel">
          <div className="panel-label">// select technology</div>
          <div className="cat-row">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`cat-btn${activeCat === c ? " active" : ""}`}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="tech-grid">
            {filteredTech.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tech-btn${selected === t.id ? " selected" : ""}`}
                onClick={() => setSelected(t.id)}
              >
                <span className="tech-icon">{t.icon}</span>
                <span className="tech-name">{t.label}</span>
                <span className="tech-cat">{t.category}</span>
                {selected === t.id && <span className="check">✓</span>}
              </button>
            ))}
          </div>
        </aside>

        <div className="right-panel">
          <div className="prompt-bar">
            <span className="prompt-prefix">$ termref</span>
            <span className="prompt-status">
              {selected
                ? TECHNOLOGIES.find((t) => t.id === selected)?.label
                : "select a technology…"}
            </span>
            <button
              type="button"
              className="gen-btn"
              onClick={loadSheet}
              disabled={!selected}
            >
              LOAD ↵
            </button>
          </div>

          <div className="output-box">
            <div className="output-toolbar">
              <div className="dot dot-r" />
              <div className="dot dot-y" />
              <div className="dot dot-g" />
              <span className="toolbar-title">
                {sheet
                  ? sheet.title
                  : selected
                    ? `ready — ${TECHNOLOGIES.find((t) => t.id === selected)?.label}`
                    : "no file open"}
              </span>
              {(sheet || error) && (
                <button type="button" className="dl-btn" onClick={reset}>
                  ↺ RESET
                </button>
              )}
              <button
                type="button"
                className="dl-btn"
                disabled={!sheet}
                onClick={downloadTxt}
              >
                ↓ .TXT
              </button>
              <button
                type="button"
                className="dl-btn"
                disabled={!sheet}
                onClick={downloadMd}
              >
                ↓ .MD
              </button>
            </div>

            <div className="output-scroll" ref={outputRef}>
              {!sheet && !error && (
                <div className="empty-state">
                  <div className="empty-ascii">{"{ }"}</div>
                  <div>select a technology → load</div>
                  <div className="empty-hint">
                    pick a tool from the sidebar, then press LOAD
                  </div>
                </div>
              )}

              {error && <div className="error-box">⚠ {error}</div>}

              {sheet && (
                <div>
                  <div className="sheet-header">
                    <div className="sheet-title">{sheet.title}</div>
                    <div className="sheet-subtitle">
                      {sheet.sections?.reduce(
                        (a, s) => a + (s.commands?.length || 0),
                        0,
                      )}{" "}
                      COMMANDS · {sheet.sections?.length} SECTIONS
                    </div>
                  </div>

                  {sheet.sections?.map((sec, si) => (
                    <div className="section" key={si}>
                      <div className="section-title">{sec.title}</div>
                      <div className="cmd-list">
                        {sec.commands?.map((cmd, ci) => (
                          <div className="cmd-row" key={ci}>
                            <div className="cmd-code">{cmd.cmd}</div>
                            <div className="cmd-desc">{cmd.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <span>TERMREF v1.0 · CURATED CONTENT — VERIFY BEFORE USE</span>
        <span>
          {sheet
            ? `loaded: ${new Date().toLocaleTimeString()}`
            : "no sheet loaded"}
        </span>
      </footer>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { useLang } from "../i18n";
import { Reveal, useReducedMotion } from "./shared";

// An illustrative agent session — the shape of a normal day, not a transcript.
const PROMPT = `claude "add retry with backoff to the exchange adapter. keep CI green."`;
const LINES = [
  { s: "● Reading 12 files", c: "dim" },
  { s: "● Plan: 2 edits · 1 new test", c: "dim" },
  { s: "✓ RetryPolicy.java                 +41", c: "" },
  { s: "✓ ExchangeAdapterTest.java         +28", c: "" },
  { s: "✓ mvn test                      passed", c: "" },
  { s: "✓ docker smoke · health          200", c: "" },
  { s: "→ Diff ready. I review before it merges.", c: "strong" },
];

function Terminal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) { setTyped(PROMPT.length); setShown(LINES.length); return; }
    let i = 0;
    const type = setInterval(() => {
      i += 2;
      setTyped(Math.min(i, PROMPT.length));
      if (i >= PROMPT.length) {
        clearInterval(type);
        LINES.forEach((_, j) => setTimeout(() => setShown(j + 1), 450 + j * 420));
      }
    }, 28);
    return () => clearInterval(type);
  }, [inView, reduced]);

  return (
    <div className="term" ref={ref}>
      <div className="term-bar"><i /><i /><i /><span>agent — zsh</span></div>
      <pre className="term-body">
        <span className="dim">~/lyrithm ❯ </span>{PROMPT.slice(0, typed)}{typed < PROMPT.length && <span className="caret" />}
        {"\n"}
        {LINES.slice(0, shown).map(l => <span key={l.s} className={`tl ${l.c}`}>{l.s}{"\n"}</span>)}
        {shown === LINES.length && <span className="caret" />}
      </pre>
    </div>
  );
}

export default function AI() {
  const { t } = useLang();
  const points = [["ai.p1t", "ai.p1"], ["ai.p2t", "ai.p2"], ["ai.p3t", "ai.p3"]] as const;
  return (
    <section className="ai light" id="ai">
      <Reveal className="head">
        <p className="eyebrow">{t("ai.eyebrow")}</p>
        <h2 className="title">{t("ai.t1")}<br /><span className="dim">{t("ai.t2")}</span></h2>
      </Reveal>
      <div className="ai-grid">
        <Reveal><Terminal /><p className="fine">{t("ai.note")}</p></Reveal>
        <div className="points">
          {points.map(([h, p], i) => (
            <Reveal key={h} className="point" delay={i * 0.1}><h3>{t(h)}</h3><p>{t(p)}</p></Reveal>
          ))}
        </div>
      </div>
      <Reveal className="tags">
        {["Claude Code", "OpenAI Codex", "ChatGPT", "MCP", "Agent Skills", "Prompt engineering", "LLM APIs", "TTS pipelines"].map(s => <span key={s}>{s}</span>)}
      </Reveal>
    </section>
  );
}

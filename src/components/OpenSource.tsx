import { useEffect, useState } from "react";
import { useLang, type Key } from "../i18n";
import { Reveal } from "./shared";

type Row = { name: string; href: string; desc: Key; lang: string; repo?: string; live?: boolean; stars?: number };

const ROWS: Row[] = [
  { name: "hk-neon-frames", href: "https://github.com/xxxJay123/hk-neon-frames", desc: "p.1", lang: "JavaScript", repo: "xxxJay123/hk-neon-frames", stars: 2 },
  { name: "reMarkable Chinese Toolkit", href: "https://github.com/xxxJay123/remarkable-chinese-toolkit", desc: "p.2", lang: "C++ · QML", repo: "xxxJay123/remarkable-chinese-toolkit", stars: 3 },
  { name: "AI Tools: A Beginner's Guide", href: "https://xxxjay123.github.io/ai-tools-beginner-guide/", desc: "p.3", lang: "HTML · JS", live: true },
  { name: "ProTrader", href: "https://stock-trainer-nine.vercel.app", desc: "p.4", lang: "React · Vite", live: true },
  { name: "lyrithm-strategy-sdk", href: "https://github.com/Lyrithm-io/lyrithm-strategy-sdk", desc: "p.5", lang: "Python", repo: "Lyrithm-io/lyrithm-strategy-sdk" },
  { name: "demo-microservice", href: "https://github.com/xxxJay123/demo-microservice", desc: "p.6", lang: "Java", repo: "xxxJay123/demo-microservice" },
];

async function gh<T>(path: string): Promise<T> {
  const key = `gh:${path}`;
  try {
    const hit = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (hit && Date.now() - hit.t < 3_600_000) return hit.v as T;
  } catch { /* storage blocked */ }
  const res = await fetch(`https://api.github.com/${path}`, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(String(res.status));
  const v = (await res.json()) as T;
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch { /* storage blocked */ }
  return v;
}

export default function OpenSource() {
  const { t } = useLang();
  const [stars, setStars] = useState<Record<string, number>>({});
  const [repoCount, setRepoCount] = useState<number | null>(null);

  useEffect(() => {
    ROWS.filter(r => r.repo).forEach(r =>
      gh<{ stargazers_count: number }>(`repos/${r.repo}`)
        .then(d => setStars(s => ({ ...s, [r.repo!]: d.stargazers_count })))
        .catch(() => {}));
    gh<{ public_repos: number }>("users/xxxJay123").then(u => setRepoCount(u.public_repos)).catch(() => {});
  }, []);

  return (
    <section className="oss light" id="projects">
      <Reveal className="head">
        <p className="eyebrow">{t("p.eyebrow")}</p>
        <h2 className="title">{t("p.title")}</h2>
      </Reveal>
      <div className="rows">
        {ROWS.map((r, i) => (
          <Reveal key={r.name} delay={i * 0.04}>
            <a className="row" href={r.href} target="_blank" rel="noopener">
              <b>{r.name}</b>
              <span className="row-desc">{t(r.desc)}</span>
              <span className="row-lang">{r.lang}</span>
              <span className="row-meta">{r.live ? t("p.live") : `★ ${r.repo && stars[r.repo] !== undefined ? stars[r.repo] : (r.stars ?? "–")}`}</span>
              <span className="row-arrow">↗</span>
            </a>
          </Reveal>
        ))}
      </div>
      <Reveal>
        <a className="more" href="https://github.com/xxxJay123?tab=repositories" target="_blank" rel="noopener">
          {t("p.all")}{repoCount !== null ? ` (${repoCount})` : ""} ›
        </a>
      </Reveal>
    </section>
  );
}

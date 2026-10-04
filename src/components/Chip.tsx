import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useLang, type Key } from "../i18n";
import { LogoMark, Reveal } from "./shared";

type Core = { area: string; k: Key; name: string; v: string | Key };

// Lighting order: the cores first, the Neural Engine (AI) last.
const CORES: Core[] = [
  { area: "perf", k: "c.perf", name: "Java · Spring Boot", v: "gRPC · REST · microservices" },
  { area: "eff", k: "c.eff", name: "Python", v: "c.effv" },
  { area: "ui", k: "c.ui", name: "TypeScript", v: "React · Next.js · Vite · Tailwind" },
  { area: "mem", k: "c.mem", name: "PostgreSQL · Redis", v: "MongoDB · MySQL · D1 · Firestore" },
  { area: "io", k: "c.io", name: "Docker · CI/CD", v: "GitHub Actions · Cloudflare · Linux" },
  { area: "gpu", k: "c.gpu", name: "Three.js · WebGL2", v: "c.gpuv" },
  { area: "sec", k: "c.sec", name: "Web3", v: "Solidity · SHA-256 · on-chain perps" },
  { area: "neural", k: "c.neural", name: "AI Agents", v: "Claude Code · Codex · MCP · Skills" },
];

export default function Chip() {
  const { t } = useLang();
  const stage = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start end", "center 0.55"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [58, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.78, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [120, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.35], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", p => setLit(Math.floor(Math.max(0, p - 0.3) / 0.7 * (CORES.length + 0.999))));

  const tr = (v: string) => (v.startsWith("c.") ? t(v as Key) : v);

  return (
    <section className="chip-section" id="chip">
      <Reveal className="head center">
        <p className="eyebrow">{t("c.eyebrow")}</p>
        <h2 className="title">{t("c.t1")}<br /><span className="dim">{t("c.t2")}</span></h2>
      </Reveal>
      <div className="chip-stage" ref={stage}>
        <motion.div className="chip" style={{ rotateX, scale, y, opacity }}>
          <div className="chip-id">
            <LogoMark size={16} />
            <b>J1</b>
            <span>JAY CHENG · HK · 2018—</span>
          </div>
          <div className="die">
            {CORES.map((c, i) => (
              <div key={c.area} className={`core core-${c.area}${i < lit ? " lit" : ""}`}>
                <span className="core-k">{t(c.k)}</span>
                <b>{c.name}</b>
                <span className="core-v">{tr(c.v)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

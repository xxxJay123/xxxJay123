import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLang, type Key } from "../i18n";
import { EASE } from "./shared";

/* An illustrative Vegas-tunnel chart: the tunnel compounds upward, price runs
   above it and pulls back to touch it at every milestone — a new "entry". */

const MILESTONES: { x: number; year: string; k: Key }[] = [
  { x: 0.05, year: "2018", k: "m.2018" },
  { x: 0.17, year: "2020", k: "m.2020" },
  { x: 0.29, year: "2022", k: "m.2022" },
  { x: 0.41, year: "2023", k: "m.2023" },
  { x: 0.53, year: "2024", k: "m.2024" },
  { x: 0.65, year: "2025", k: "m.2025" },
  { x: 0.77, year: "2026", k: "m.2026" },
];
const NOW = 0.8;
const STEP_AT = [0, 0.47, 0.64]; // reveal thresholds for Accumulate / Wait / Grow

const tunnelY = (x: number) => (Math.exp(2.3 * x) - 1) / (Math.exp(2.3) - 1);
const halfBand = (x: number) => 0.014 + 0.014 * x;
const knots = [0, ...MILESTONES.map(m => m.x), NOW];

function priceY(x: number) {
  const base = tunnelY(x);
  if (x > NOW) {
    const t = (x - NOW) / (1 - NOW);
    return base + halfBand(x) + 0.05 * Math.sin(Math.PI * t * 0.9) + 0.02 * t;
  }
  let i = 0;
  while (i < knots.length - 2 && x > knots[i + 1]) i++;
  const t = (x - knots[i]) / (knots[i + 1] - knots[i]);
  const bump = Math.pow(Math.sin(Math.PI * t), 1.25);
  const amp = 0.04 + 0.08 * x;
  const wiggle = Math.sin(x * 160) * 0.18 + Math.sin(x * 71 + 1.3) * 0.22;
  return base + halfBand(x) * (1 - bump) + bump * amp * (1 + wiggle * 0.35);
}

type Geo = { band: string; upper: string; lower: string; price: string; area: string; proj: string; pts: { x: number; y: number }[]; head: (r: number) => { x: number; y: number } };

function buildGeo(W: number, H: number): Geo {
  // On phones the chart sits below the copy, so it can use its full height,
  // and gets side padding so the first label isn't clipped.
  const phone = W < 700;
  const top = H * (phone ? 0.12 : 0.36), bottom = H * 0.86;
  const padL = phone ? 26 : 0, padR = phone ? 14 : 0;
  const X = (x: number) => padL + x * (W - padL - padR);
  const Y = (v: number) => bottom - v * (bottom - top);
  const N = 420;
  const xs = Array.from({ length: N + 1 }, (_, i) => i / N);
  const now = xs.filter(x => x <= NOW + 1e-9);
  const later = xs.filter(x => x >= NOW - 1e-9);
  const line = (arr: number[], f: (x: number) => number) => arr.map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`).join("");
  const up = (x: number) => tunnelY(x) + halfBand(x);
  const lo = (x: number) => tunnelY(x) - halfBand(x);
  const band = line(xs, up) + [...xs].reverse().map(x => `L${X(x).toFixed(1)} ${Y(lo(x)).toFixed(1)}`).join("") + "Z";
  const price = line(now, priceY);
  const area = price + `L${X(NOW).toFixed(1)} ${H}L0 ${H}Z`;
  return {
    band, upper: line(xs, up), lower: line(xs, lo), price, area,
    proj: line(later, priceY),
    pts: MILESTONES.map(m => ({ x: X(m.x), y: Y(tunnelY(m.x)) })),
    head: (r: number) => ({ x: X(r), y: Y(priceY(r)) }),
  };
}

export default function Tunnel() {
  const { t } = useLang();
  const section = useRef<HTMLElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const clip = useRef<SVGRectElement>(null);
  const head = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ W: 1200, H: 600 });
  const [reached, setReached] = useState(-1);
  const [step, setStep] = useState(0);
  const [future, setFuture] = useState(false);
  const geo = useMemo(() => buildGeo(size.W, size.H), [size]);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ W: Math.round(e.contentRect.width), H: Math.round(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const apply = (p: number) => {
    const r = Math.min(1, Math.max(0.001, p * 1.12 - 0.04));
    const nowR = Math.min(r, NOW);
    clip.current?.setAttribute("width", String(nowR * size.W));
    const h = geo.head(nowR);
    head.current?.setAttribute("transform", `translate(${h.x} ${h.y})`);
    setReached(MILESTONES.reduce((acc, m, i) => (r >= m.x ? i : acc), -1));
    setStep(r >= STEP_AT[2] ? 2 : r >= STEP_AT[1] ? 1 : 0);
    setFuture(r > NOW + 0.04);
  };
  useMotionValueEvent(scrollYProgress, "change", apply);
  useEffect(() => apply(scrollYProgress.get()), [geo]);

  const steps: [Key, Key][] = [["t.s1t", "t.s1"], ["t.s2t", "t.s2"], ["t.s3t", "t.s3"]];
  const year = reached >= 0 ? MILESTONES[reached].year : "2018";

  return (
    <section className="tunnel" id="story" ref={section}>
      <div className="tunnel-stick">
        <AnimatePresence mode="popLayout">
          <motion.span key={year} className="ghost-year" aria-hidden="true"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6, ease: EASE }}>{year}</motion.span>
        </AnimatePresence>

        <div className="tunnel-copy">
          <p className="eyebrow">{t("t.eyebrow")}</p>
          <div className="steps">
            {steps.map(([title, body], i) => (
              <div key={title} className={`step${i === step ? " on" : ""}`}>
                <h2>{t(title)}</h2>
                <p>{t(body)}</p>
              </div>
            ))}
          </div>
          <div className="step-dots" aria-hidden="true">{steps.map((_, i) => <i key={i} className={i <= step ? "on" : ""} />)}</div>
        </div>

        <div className="chart" ref={box}>
          <svg width={size.W} height={size.H} viewBox={`0 0 ${size.W} ${size.H}`} aria-hidden="true">
            <defs>
              <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="7" stroke="#fff" strokeOpacity="0.32" strokeWidth="1.2" />
              </pattern>
              <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
              <clipPath id="reveal"><rect ref={clip} x="0" y="0" width="0" height={size.H} /></clipPath>
            </defs>

            <g clipPath="url(#reveal)">
              <path d={geo.band} fill="url(#hatch)" />
              <path d={geo.upper} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />
              <path d={geo.lower} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />
              <path d={geo.area} fill="url(#fade)" />
              <path d={geo.price} fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
            </g>

            <path d={geo.proj} fill="none" stroke="#fff" strokeOpacity={future ? 0.7 : 0} strokeWidth="2" strokeDasharray="2 9" strokeLinecap="round" className="proj" />

            {geo.pts.map((pt, i) => {
              const below = pt.y + 54 < size.H;
              return (
                <g key={MILESTONES[i].year} className={`ms${i <= reached ? " on" : ""}`} transform={`translate(${pt.x} ${pt.y})`}>
                  <rect x="-6" y="-6" width="12" height="12" />
                  <text className="ms-year" y={below ? 30 : -34} textAnchor="middle">{MILESTONES[i].year}</text>
                  <text className="ms-label" y={below ? 48 : -16} textAnchor="middle">{t(MILESTONES[i].k)}</text>
                </g>
              );
            })}

            <g className={`ms next${future ? " on" : ""}`} transform={`translate(${geo.head(0.985).x - 4} ${geo.head(0.985).y})`}>
              <text className="ms-year" y={-30} textAnchor="end">NEXT</text>
              <text className="ms-label" y={-12} textAnchor="end">{t("m.next")}</text>
            </g>

            <g ref={head} className="head">
              <circle r="16" className="head-ring" />
              <rect x="-5" y="-5" width="10" height="10" fill="#fff" />
            </g>
          </svg>
        </div>
        <p className="chart-note">{t("t.note")}</p>
      </div>
    </section>
  );
}

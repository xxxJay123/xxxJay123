import { useLayoutEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useLang, type Key } from "../i18n";
import { useReducedMotion } from "./shared";

type Tile = { k: Key; title: Key; desc: Key; big: string; cap: Key | string; dark?: boolean };

const TILES: Tile[] = [
  { k: "w.k.desktop", title: "w.t1", desc: "w.d1", big: "1,000+", cap: "w.m1", dark: true },
  { k: "w.k.auto", title: "w.t2", desc: "w.d2", big: "~2 hrs", cap: "w.m2" },
  { k: "w.k.desktop", title: "w.t3", desc: "w.d3", big: "PDF", cap: "w.m3" },
  { k: "w.k.web", title: "w.t4", desc: "w.d4", big: "Edge", cap: "Cloudflare Workers · D1" },
  { k: "w.k.safety", title: "w.t5", desc: "w.d5", big: "Rev.A", cap: "w.m5" },
  { k: "w.k.web", title: "w.t6", desc: "w.d6", big: "Live", cap: "React · Firebase" },
  { k: "w.k.motion", title: "w.t7", desc: "w.d7", big: "60fps", cap: "WebGL2 · NumPy audio" },
  { k: "w.k.it", title: "w.t8", desc: "w.d8", big: "HK", cap: "w.m8" },
];

export default function Work() {
  const { t } = useLang();
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!track.current) return;
      setDist(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -dist]);
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const cap = (c: string) => (c.startsWith("w.") ? t(c as Key) : c);

  return (
    <section className={`work light${reduced ? " static" : ""}`} id="work" ref={section}
      style={reduced ? undefined : { height: `calc(100vh + ${dist}px)` }}>
      <div className="work-stick">
        <div className="head">
          <p className="eyebrow">{t("w.eyebrow")}</p>
          <h2 className="title">{t("w.title")}</h2>
        </div>
        <motion.div className="rail" ref={track} style={reduced ? undefined : { x }}>
          {TILES.map((tile, i) => (
            <article key={tile.title} className={`tile${tile.dark ? " dark" : ""}`}>
              <span className="tile-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="tile-k">{t(tile.k)}</span>
              <h3>{t(tile.title)}</h3>
              <p>{t(tile.desc)}</p>
              <div className="tile-big"><b>{tile.big}</b><span>{cap(tile.cap)}</span></div>
            </article>
          ))}
        </motion.div>
        <div className="work-foot">
          <p className="fine">{t("w.note")}</p>
          <div className="bar"><motion.i style={{ scaleX: bar }} /></div>
        </div>
      </div>
    </section>
  );
}

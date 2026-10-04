import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { EASE, Fallback, LogoMark, asset, useReducedMotion, webglAvailable } from "./shared";

const VoxelPortrait = lazy(() => import("./VoxelPortrait"));

export default function Hero() {
  const { t } = useLang();
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);
  const [gl] = useState(webglAvailable);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.2], [0, -70]);
  const midOpacity = useTransform(scrollYProgress, [0.36, 0.52, 0.84, 1], [0, 1, 1, 0]);
  const midScale = useTransform(scrollYProgress, [0.36, 1], [0.9, 1.08]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const flat = <div className="portrait-flat"><LogoMark size={260} /></div>;
  const words = [t("hero.w1"), t("hero.w2"), t("hero.w3")];

  return (
    <section className="hero" id="top" ref={ref}>
      <div className="hero-stick">
        <div className="hero-canvas">
          {gl ? (
            <Fallback fallback={flat}>
              <Suspense fallback={null}>
                <VoxelPortrait progress={scrollYProgress} active={active} reduced={reduced} />
              </Suspense>
            </Fallback>
          ) : flat}
        </div>

        <motion.div className="hero-copy" style={{ opacity: textOpacity, y: textY }}>
          <motion.p className="pixel-cap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}>
            {t("hero.cap")}
          </motion.p>
          <h1 className="hero-title">
            {words.map((w, i) => (
              <motion.span key={w + i} className={i === 2 ? "hw strong" : "hw"}
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 1.25 + i * 0.28, duration: 1, ease: EASE }}>
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.p className="hero-sub" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }}>
            {t("hero.sub1")}<br />{t("hero.sub2")}
          </motion.p>
          <motion.div className="cta" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.4, duration: 0.9, ease: EASE }}>
            <a className="btn btn-white" href="#story">{t("hero.cta1")}</a>
            <a className="btn btn-text" href={asset("Jay-Cheng-CV.pdf")} target="_blank" rel="noopener">{t("hero.cta2")} ›</a>
          </motion.div>
        </motion.div>

        <motion.p className="hero-mid" style={{ opacity: midOpacity, scale: midScale }}>{t("hero.mid")}</motion.p>
        <motion.div className="scroll-cue" style={{ opacity: cueOpacity }}><span>{t("hero.scroll")}</span><i /></motion.div>
      </div>
    </section>
  );
}

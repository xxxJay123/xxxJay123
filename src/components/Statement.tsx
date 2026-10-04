import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useLang } from "../i18n";

function Word({ text, range, progress, strong }: { text: string; range: [number, number]; progress: MotionValue<number>; strong: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return <motion.span className={strong ? "sw strong" : "sw"} style={{ opacity }}>{text}</motion.span>;
}

export default function Statement() {
  const { t, lang } = useLang();
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });

  const split = (s: string) => (lang === "zh" ? Array.from(s) : s.split(/(?<=\s)/));
  const gap = lang === "zh" ? "" : " ";
  const parts = [...split(t("st.a") + gap).map(w => ({ w, strong: false })), ...split(t("st.b")).map(w => ({ w, strong: true }))];
  const n = parts.length;

  return (
    <section className="statement light">
      <p className="statement-text" ref={ref} key={lang}>
        {parts.map((p, i) => (
          <Word key={i} text={p.w} strong={p.strong} progress={scrollYProgress} range={[i / n, (i + 1) / n]} />
        ))}
      </p>
    </section>
  );
}

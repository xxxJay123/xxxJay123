import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useLang } from "../i18n";
import { Reveal } from "./shared";

export default function Lyrithm() {
  const { t } = useLang();
  const ref = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.45"] });
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["0.6em", "-0.055em"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);
  const blur = useTransform(scrollYProgress, [0, 0.8], ["blur(14px)", "blur(0px)"]);

  const specs = [["7", "l.s1"], ["0", "l.s2"], ["B/G", "l.s3"], ["CI", "l.s4"]] as const;

  return (
    <section className="lyrithm" id="lyrithm">
      <Reveal as="p" className="eyebrow">{t("l.eyebrow")}</Reveal>
      <motion.h2 ref={ref} className="wordmark" style={{ letterSpacing, opacity, filter: blur }}>Lyrithm</motion.h2>
      <Reveal as="p" className="tagline">{t("l.tag")}</Reveal>
      <Reveal as="p" className="lead">{t("l.lead")}</Reveal>
      <div className="specs">
        {specs.map(([n, k], i) => (
          <Reveal key={k} className="spec" delay={i * 0.08}><b>{n}</b><span>{t(k)}</span></Reveal>
        ))}
      </div>
      <Reveal as="p" className="stackline">Java · Spring Boot · gRPC · Python · Next.js · Docker · Clerk · Telegram</Reveal>
      <Reveal className="cta">
        <a className="btn btn-white" href="https://lyrithm.io" target="_blank" rel="noopener">{t("l.cta1")}</a>
        <a className="btn btn-text" href="https://github.com/Lyrithm-io/lyrithm-strategy-sdk" target="_blank" rel="noopener">{t("l.cta2")} ›</a>
      </Reveal>
    </section>
  );
}

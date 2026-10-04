import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { useLang } from "../i18n";
import { Reveal } from "./shared";

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: v => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{n.toLocaleString()}</span>;
}

export default function Numbers() {
  const { t } = useLang();
  return (
    <section className="numbers">
      <Reveal className="num"><b><Count to={1000} />+</b><span>{t("n.1")}</span></Reveal>
      <Reveal className="num" delay={0.08}><b>&lt;1<small>{t("n.day")}</small></b><span>{t("n.2")}</span></Reveal>
      <Reveal className="num" delay={0.16}><b><Count to={8} /></b><span>{t("n.3")}</span></Reveal>
      <Reveal className="num" delay={0.24}><b><Count to={7} /></b><span>{t("n.4")}</span></Reveal>
    </section>
  );
}

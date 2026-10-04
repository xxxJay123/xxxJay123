import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { useLang } from "../i18n";
import { LOGO_CELLS, LOGO_H, LOGO_W } from "../lib/logo";
import { Reveal, asset } from "./shared";

const EMAIL = "jay6677884@gmail.com";

/** The pixel portrait, popping in pixel by pixel. */
function PixelBuild() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  return (
    <svg ref={ref} className={`pixel-build${inView ? " in" : ""}`} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} shapeRendering="crispEdges" aria-hidden="true">
      {LOGO_CELLS.map(({ r, c }) => (
        <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1"
          style={{ transitionDelay: `${(r * 0.018 + ((c * 37 + r * 11) % 17) * 0.012).toFixed(3)}s` }} />
      ))}
    </svg>
  );
}

export default function Contact() {
  const { t } = useLang();
  const [toast, setToast] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setToast(true);
      setTimeout(() => setToast(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <>
      <section className="contact" id="contact">
        <PixelBuild />
        <Reveal as="h2" className="big">{t("k.t1")}<br /><span className="dim">{t("k.t2")}</span></Reveal>
        <Reveal>
          <button className="email" type="button" onClick={copy}>
            <span>{EMAIL}</span><em>{t("k.copy")}</em>
          </button>
        </Reveal>
        <Reveal className="links">
          <a href="https://www.linkedin.com/in/xxxjay123" target="_blank" rel="noopener">LinkedIn ›</a>
          <a href="https://github.com/xxxJay123" target="_blank" rel="noopener">GitHub ›</a>
          <a href="https://x.com/xxxjaylife" target="_blank" rel="noopener">X ›</a>
          <a href={asset("Jay-Cheng-CV.pdf")} target="_blank" rel="noopener">{t("k.cv")} ›</a>
          <a href="https://drive.google.com/file/d/10tL_A8WlTC0od6T_uDsBXBJlbiLsp5tV/view" target="_blank" rel="noopener">{t("k.cert")} ›</a>
        </Reveal>
      </section>
      <footer className="footer">
        <span>© {new Date().getFullYear()} Jay Cheng · Hong Kong</span>
        <span className="footer-links">
          <a href="https://x.com/xxxjaylife" target="_blank" rel="noopener">X</a>
          <a href="https://www.instagram.com/xxjaylife11_/" target="_blank" rel="noopener">Instagram</a>
          <a href="https://github.com/xxxJay123/xxxJay123" target="_blank" rel="noopener">{t("f.source")}</a>
        </span>
      </footer>
      <div className={`toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast ? t("k.copied") : ""}</div>
    </>
  );
}

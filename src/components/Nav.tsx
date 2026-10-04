import { useEffect, useState } from "react";
import { useLang, type Key } from "../i18n";
import { LogoMark, asset } from "./shared";

const LINKS: [string, Key][] = [
  ["story", "nav.story"], ["chip", "nav.stack"], ["ai", "nav.ai"], ["work", "nav.work"], ["contact", "nav.contact"],
];

export default function Nav() {
  const { t, lang, toggle } = useLang();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <div className="nav-veil" aria-hidden="true" />
      <header className="nav">
        <a href="#top" className="brand" aria-label="Jay Cheng, home" onClick={() => setOpen(false)}>
          <LogoMark size={20} />
          <span>Jay Cheng</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {LINKS.map(([id, k]) => <a key={id} href={`#${id}`}>{t(k)}</a>)}
        </nav>
        <div className="nav-actions">
          <button className="lang" type="button" onClick={toggle} aria-label="Switch language">
            <span className={lang === "en" ? "on" : ""}>EN</span>
            <span className={lang === "zh" ? "on" : ""}>中</span>
          </button>
          <a className="nav-cv" href={asset("Jay-Cheng-CV.pdf")} target="_blank" rel="noopener">{t("nav.cv")}</a>
          <button className={`menu-btn${open ? " open" : ""}`} type="button" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
            <span /><span />
          </button>
        </div>
      </header>
      <div className={`sheet${open ? " open" : ""}`} aria-hidden={!open}>
        {LINKS.map(([id, k], i) => (
          <a key={id} href={`#${id}`} style={{ transitionDelay: `${open ? 0.05 + i * 0.04 : 0}s` }} onClick={() => setOpen(false)}>{t(k)}</a>
        ))}
        <a href={asset("Jay-Cheng-CV.pdf")} target="_blank" rel="noopener" onClick={() => setOpen(false)}>{t("nav.cv")} ↗</a>
      </div>
    </>
  );
}

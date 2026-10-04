import { useEffect } from "react";
import Lenis from "lenis";
import { motion, useScroll } from "motion/react";
import { LangProvider } from "./i18n";
import { useReducedMotion } from "./components/shared";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Statement from "./components/Statement";
import Tunnel from "./components/Tunnel";
import Numbers from "./components/Numbers";
import Chip from "./components/Chip";
import AI from "./components/AI";
import Work from "./components/Work";
import Lyrithm from "./components/Lyrithm";
import Web3 from "./components/Web3";
import OpenSource from "./components/OpenSource";
import Contact from "./components/Contact";

function SmoothScroll() {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const lenis = new Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
    return () => lenis.destroy();
  }, [reduced]);
  return null;
}

function Progress() {
  const { scrollYProgress } = useScroll();
  return <motion.div className="progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />;
}

export default function App() {
  return (
    <LangProvider>
      <SmoothScroll />
      <Progress />
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Tunnel />
        <Numbers />
        <Chip />
        <AI />
        <Work />
        <Lyrithm />
        <Web3 />
        <OpenSource />
        <Contact />
      </main>
    </LangProvider>
  );
}

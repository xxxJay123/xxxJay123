import { Component, useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { LOGO_H, LOGO_RUNS, LOGO_W } from "../lib/logo";

export const BASE = import.meta.env.BASE_URL;
export const asset = (path: string) => `${BASE}assets/${path}`;
export const EASE = [0.22, 1, 0.36, 1] as const;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Fade-and-rise when scrolled into view. */
export function Reveal({ children, delay = 0, className, as = "div" }: {
  children: ReactNode; delay?: number; className?: string; as?: "div" | "p" | "li" | "h2";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

/** The pixel portrait as crisp vector, coloured by currentColor. */
export function LogoMark({ className, size = 22 }: { className?: string; size?: number }) {
  const d = LOGO_RUNS.map(({ r, c, len }) => `M${c} ${r}h${len}v1h-${len}z`).join("");
  return (
    <svg className={className} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} width={size} height={(size * LOGO_H) / LOGO_W}
      shapeRendering="crispEdges" aria-hidden="true">
      <path fill="currentColor" d={d} />
    </svg>
  );
}

/** Renders children, or a fallback if they throw (e.g. no WebGL). */
export class Fallback extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

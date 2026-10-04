import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { Reveal } from "./shared";

/* A three-block chain with real SHA-256 proof of work (Web Crypto). */

const DIFF = "000";
const ZERO = "0".repeat(64);
const SEED = ["Accumulate: one skill at a time", "Wait: for the pullback", "Grow: let it compound"];

type Block = { data: string; nonce: number; prev: string; hash: string; stat: string };

const enc = new TextEncoder();
async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, "0")).join("");
}
const payload = (i: number, nonce: number, data: string, prev: string) => `${i}|${nonce}|${data}|${prev}`;
const short = (h: string) => `${h.slice(0, 18)}…${h.slice(-6)}`;

async function findNonce(i: number, data: string, prev: string, onTick?: (n: number, h: string) => void) {
  const BATCH = 400;
  for (let n = 0; ; n += BATCH) {
    const hashes = await Promise.all(Array.from({ length: BATCH }, (_, k) => sha256(payload(i, n + k, data, prev))));
    const hit = hashes.findIndex(h => h.startsWith(DIFF));
    if (hit >= 0) return { nonce: n + hit, hash: hashes[hit] };
    onTick?.(n + BATCH, hashes[BATCH - 1]);
    await new Promise(r => requestAnimationFrame(r));
  }
}

async function relink(chain: Block[], from: number) {
  const next = chain.map(b => ({ ...b }));
  for (let i = from; i < next.length; i++) {
    next[i].prev = i === 0 ? ZERO : next[i - 1].hash;
    next[i].hash = await sha256(payload(i, next[i].nonce, next[i].data, next[i].prev));
    if (i > from) next[i].stat = "";
  }
  return next;
}

export default function Web3() {
  const { t } = useLang();
  const [chain, setChain] = useState<Block[]>([]);
  const [busy, setBusy] = useState<number | null>(null);
  const chainRef = useRef(chain);
  const version = useRef(0);
  chainRef.current = chain;

  const reset = useCallback(async () => {
    const blocks: Block[] = [];
    for (let i = 0; i < SEED.length; i++) {
      const prev = i === 0 ? ZERO : blocks[i - 1].hash;
      const { nonce, hash } = await findNonce(i, SEED[i], prev);
      blocks.push({ data: SEED[i], nonce, prev, hash, stat: "" });
    }
    setChain(blocks);
  }, []);
  useEffect(() => { reset(); }, [reset]);

  const edit = async (i: number, data: string) => {
    const v = ++version.current;
    const draft = chainRef.current.map((b, j) => (j === i ? { ...b, data, stat: "" } : b));
    chainRef.current = draft;
    setChain(draft);
    const linked = await relink(draft, i);
    if (v === version.current) setChain(linked);
  };

  const mine = async (i: number) => {
    setBusy(i);
    const start = performance.now();
    const cur = chainRef.current;
    const prev = i === 0 ? ZERO : cur[i - 1].hash;
    const { nonce, hash } = await findNonce(i, cur[i].data, prev, (n, h) =>
      setChain(c => c.map((b, j) => (j === i ? { ...b, nonce: n, hash: h } : b))));
    const ms = Math.round(performance.now() - start);
    const mined = chainRef.current.map((b, j) => (j === i ? { ...b, nonce, hash, prev, stat: `${(nonce + 1).toLocaleString()} · ${ms} ms` } : b));
    setChain(await relink(mined, i));
    setBusy(null);
  };

  const mineAll = async () => { for (let i = 0; i < chainRef.current.length; i++) await mine(i); };
  const valid = (i: number) => chain.slice(0, i + 1).every(b => b.hash.startsWith(DIFF));

  return (
    <section className="web3" id="web3">
      <Reveal className="head">
        <p className="eyebrow">Web3</p>
        <h2 className="title">{t("x.t1")}<br /><span className="dim">{t("x.t2")}</span></h2>
        <p className="sub">{t("x.sub")}</p>
      </Reveal>
      <Reveal className="miner">
        <div className="miner-bar">
          <span className="mono"><span className="dim">{t("x.diff")}</span> {DIFF}…</span>
          <div>
            <button className="pill" type="button" onClick={mineAll} disabled={busy !== null}>{t("x.mineAll")}</button>
            <button className="pill" type="button" onClick={reset} disabled={busy !== null}>{t("x.reset")}</button>
          </div>
        </div>
        <div className="chain">
          {chain.map((b, i) => {
            const ok = valid(i);
            const zeros = (b.hash.match(/^0*/) ?? [""])[0];
            return (
              <div key={i} className={`block${ok ? " ok" : " bad"}`}>
                <div className="block-head"><b>{t("x.block")} #{i + 1}</b><span className="badge">{ok ? t("x.valid") : t("x.invalid")}</span></div>
                <label>{t("x.data")}</label>
                <textarea rows={2} spellCheck={false} value={b.data} onChange={e => edit(i, e.target.value)} />
                <div className="kv"><label>{t("x.nonce")}</label><span>{b.nonce.toLocaleString()}</span></div>
                <div className="kv"><label>{t("x.prev")}</label><span>{short(b.prev)}</span></div>
                <div className="kv"><label>{t("x.hash")}</label><span><b>{zeros}</b>{short(b.hash).slice(zeros.length)}</span></div>
                <div className="block-foot">
                  <small>{b.stat && `${b.stat.split(" · ")[0]} ${t("x.hashes")} · ${b.stat.split(" · ")[1]}`}</small>
                  <button className="pill solid" type="button" onClick={() => mine(i)} disabled={busy !== null}>{busy === i ? t("x.mining") : t("x.mine")}</button>
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>
      <Reveal as="div" className="lab">
        <p><i className="sq fill" />{t("x.l1")}</p>
        <p><i className="sq" />{t("x.l2")} <a href="https://github.com/xxxJay123/Solidity-Note" target="_blank" rel="noopener">↗</a></p>
        <p><i className="sq half" />{t("x.l3")}</p>
        <p><i className="sq dot" />{t("x.l4")}</p>
      </Reveal>
    </section>
  );
}

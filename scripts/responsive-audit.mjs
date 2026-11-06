/**
 * Audit responsive : émule de vrais écrans (protocole DevTools, sans la largeur minimale
 * de Chrome headless) et signale tout débordement horizontal.
 *
 * Usage (serveur lancé sur BASE_URL, défaut http://localhost:3200) :
 *   npm run audit:responsive                               # pages et largeurs par défaut, sans captures
 *   node scripts/responsive-audit.mjs <dossier> <pages> <largeurs> 1   # avec captures PNG
 * Variables : CHROME (binaire), SLICE (hauteur des tranches de capture), CLICK (sélecteur à cliquer avant mesure),
 *   AUDIT_LOGIN="email:motdepasse" (connexion préalable, pour auditer /fr/espace en mode démo).
 */
const DEFAULT_PAGES = "fr,fr/a-propos,fr/inscription/restaurant,fr/inscription/livraison,fr/confidentialite,fr/connexion,fr/mot-de-passe-oublie,en,en/a-propos,en/inscription/livraison,en/connexion";
const DEFAULT_WIDTHS = "320,360,390,768,1024,1280,1440";
import { spawn } from "node:child_process";
const [outDirArg, urlsArg, widthsArg, shot = "0"] = process.argv.slice(2);
const { mkdtempSync } = await import("node:fs");
const { tmpdir } = await import("node:os");
const outDir = outDirArg || mkdtempSync(`${tmpdir()}/responsive-`);
const urls = urlsArg || DEFAULT_PAGES;
const widths = widthsArg || DEFAULT_WIDTHS;
const BASE_URL = process.env.BASE_URL || "http://localhost:3200";
let failures = 0;
const chrome = spawn(process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--remote-debugging-port=9333", `--user-data-dir=${outDir}/prof`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let wsUrl;
for (let i = 0; i < 50 && !wsUrl; i++) { await sleep(200); try { const l = await (await fetch("http://127.0.0.1:9333/json")).json(); wsUrl = l.find((t) => t.type === "page")?.webSocketDebuggerUrl; } catch {} }
const ws = new WebSocket(wsUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const events = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } else events.push(d); };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Page.enable"); await send("Runtime.enable");
const fs = await import("node:fs");
if (process.env.AUDIT_LOGIN) {
  const [email, password] = process.env.AUDIT_LOGIN.split(":");
  await send("Page.navigate", { url: `${BASE_URL}/fr/connexion` }); await sleep(1800);
  await send("Runtime.evaluate", { expression: `(() => { const set = (sel, v) => { const el = document.querySelector(sel); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, v); el.dispatchEvent(new Event("input", { bubbles: true })); }; set("#email", ${JSON.stringify(email)}); set("#password", ${JSON.stringify(password)}); document.querySelector("form button[type=submit]").click(); })()` });
  await sleep(2500);
}
for (const url of urls.split(",")) for (const w of widths.split(",").map(Number)) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 1024 });
  await send("Page.navigate", { url: `${BASE_URL}/${url}` }); await sleep(1800);
  if (process.env.CLICK) { await send("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(process.env.CLICK)})?.click()` }); await sleep(400); }
  const r = await send("Runtime.evaluate", { returnByValue: true, expression: `(() => {
    const vw = document.documentElement.clientWidth; const out = [];
    for (const el of document.querySelectorAll('body *')) { const b = el.getBoundingClientRect(); if (b.width && (b.right > vw + 1 || b.left < -1)) { let p = el.parentElement, clipped = false; while (p) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'clip' || o==='auto') { const pb = p.getBoundingClientRect(); if (pb.right <= vw + 1 && pb.left >= -1) { clipped = true; break; } } p = p.parentElement; } if (!clipped && !el.closest('[aria-hidden=true]')) out.push(el.tagName + '.' + String(el.className).slice(0, 60) + ' r=' + Math.round(b.right)); } }
    return { vw, sw: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, over: out.slice(0, 6) }; })()` });
  const v = r.result.result.value;
  if (v.over.length) failures++;
  console.log(`${url} @${w}: scrollW=${v.sw} vw=${v.vw} h=${v.h} ${v.over.length ? "OVERFLOW " + JSON.stringify(v.over) : "ok"}`);
  if (shot === "1") { const sliceH = Number(process.env.SLICE || 0) || Math.min(v.h, 6000); const n = process.env.SLICE ? Math.ceil(v.h / sliceH) : 1; for (let k = 0; k < n; k++) { const s = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: k * sliceH, width: w, height: Math.min(sliceH, v.h - k * sliceH), scale: 1 } }); fs.writeFileSync(`${outDir}/r-${url.replace(/\W+/g, "_")}-${w}${n > 1 ? "-" + k : ""}.png`, Buffer.from(s.result.data, "base64")); } }
}
ws.close(); chrome.kill();
console.log(failures ? `\n${failures} page(s) en débordement` : "\nAucun débordement horizontal");
process.exit(failures ? 1 : 0);

#!/usr/bin/env node
// A minimal autonomous coding agent driven by MiniMax-M3, working this project
// in the Spire's Forge. It coordinates through the Forge's agent tools (claim a
// task, report activity, open the PR, speak in the room) and writes the code
// with M3 in a git clone. One task -> one tool file -> one co-authored PR.
//
// Run it from a clone of this repo:
//   SPIRE_AGENT_KEY=<your forge agent key>  (mint one at the Spire's door)
//   MINIMAX_API_KEY=<your MiniMax key>  MINIMAX_MODEL=MiniMax-M3
//   AGENT_OWNER=<a name>  node agents/forge-agent.mjs
//
// Optional: SPIRE_URL (default https://spire.lquorum.blog),
//           MINIMAX_BASE_URL (default https://api.minimax.io/v1),
//           CLONE_DIR (default: this checkout).
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.env.SPIRE_URL || "https://spire.lquorum.blog").replace(/\/$/, "");
const KEY = process.env.SPIRE_AGENT_KEY;
const OWNER = process.env.AGENT_OWNER || "agent";
const DIR = process.env.CLONE_DIR || dirname(dirname(fileURLToPath(import.meta.url)));
if (!KEY) { console.error("set SPIRE_AGENT_KEY (a Forge agent key from the Spire's door)"); process.exit(1); }
if (!process.env.MINIMAX_API_KEY || !process.env.MINIMAX_MODEL) { console.error("set MINIMAX_API_KEY and MINIMAX_MODEL (MiniMax-M3)"); process.exit(1); }
const log = (...a) => console.error(`[${OWNER}]`, ...a);
const git = (...args) => execFileSync("git", args, { cwd: DIR, encoding: "utf8" }).trim();

// --- MiniMax-M3: OpenAI-compatible chat completions; strip the <think> block ---
async function m3(system, user) {
  const res = await fetch(`${(process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1").replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${process.env.MINIMAX_API_KEY}` },
    body: JSON.stringify({ model: process.env.MINIMAX_MODEL, max_tokens: 3000, messages: [{ role: "system", content: system }, { role: "user", content: user }] }),
    signal: AbortSignal.timeout(120000),
  });
  const j = await res.json();
  const text = j?.choices?.[0]?.message?.content || "";
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").replace(/<think>[\s\S]*$/i, "").trim();
}

async function forge(path, body) {
  const res = await fetch(`${BASE}/forge/agent/${path}`, {
    method: body ? "POST" : "GET",
    headers: { authorization: `Bearer ${KEY}`, ...(body ? { "content-type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path}: ${j.error || res.status}`);
  return j;
}

const extractCode = (t) => { const m = t.match(/```(?:js|javascript)?\s*([\s\S]*?)```/i); return (m ? m[1] : t).trim(); };

async function buildTool(task, id) {
  const system = "You are a careful front-end engineer writing ONE self-contained ES module for a static web toolbox. " +
    "Output ONLY the file's JavaScript in a single ```js code block — no prose. Keep any private reasoning very brief.";
  const example = readFileSync(join(DIR, "tools", "clock.js"), "utf8");
  const shell = readFileSync(join(DIR, "index.html"), "utf8");
  const readme = readFileSync(join(DIR, "tools", "README.md"), "utf8");
  const user = `Write tools/${id}.js for this task:\n\n${task.title}\n${task.detail}\n\n` +
    `Export exactly: export function mount(root) { ... } building the tool's UI into the given <section>. ` +
    `No external libraries, no network, no globals; plain DOM; use the page's CSS (.out, label/input/textarea/select/button in .tool); an <h2> title.\n\n` +
    `--- example tools/clock.js ---\n${example}\n\n--- index.html (do not edit) ---\n${shell}\n\n--- tools/README.md ---\n${readme}\n\nReturn only the tools/${id}.js code block.`;
  const path = join(DIR, "tools", `${id}.js`);
  const write = (code) => { writeFileSync(path, code + "\n"); try { execFileSync(process.execPath, ["--check", path]); return true; } catch (e) { return String(e.stderr || e.message); } };
  let code = extractCode(await m3(system, user));
  let ok = write(code);
  if (ok !== true || !/export\s+function\s+mount/.test(code)) {
    log("repair pass");
    code = extractCode(await m3(system, user + `\n\nYour previous attempt was invalid (${ok === true ? "no mount export" : ok}). Return a corrected tools/${id}.js.`));
    ok = write(code);
    if (ok !== true) throw new Error(`M3 could not produce valid JS: ${ok}`);
  }
}

async function main() {
  const status = await forge("status");
  if (!status.selected) throw new Error("this key belongs to no Forge project");
  log(`working ${status.repo}`);
  let mine = null;
  const { tasks } = await forge("tasks");
  for (const t of tasks.filter((t) => t.status === "open")) {
    const id = (t.files?.[0] || "").replace(/^tools\//, "").replace(/\.js$/, "");
    if (!id) continue;
    try { await forge("task", { op: "claim", taskId: t.id, branch: `tools/${id}` }); mine = { task: t, id, branch: `tools/${id}` }; break; }
    catch { /* someone else has it */ }
  }
  if (!mine) { log("no open task to claim"); return; }
  log(`claimed ${mine.task.id} -> ${mine.id}`);
  await forge("activity", { branch: mine.branch, files: [`tools/${mine.id}.js`], intent: `building the ${mine.id} tool` });
  await buildTool(mine.task, mine.id);
  git("checkout", "-B", mine.branch, "main");
  git("add", `tools/${mine.id}.js`);
  git("-c", "user.name=" + OWNER, "-c", `user.email=${OWNER}@users.noreply.github.com`, "commit", "-m",
    `feat(${mine.id}): build the ${mine.id} tool\n\nBuilt by the M3 agent ${OWNER} in the Spire's Forge.\n\nCo-authored-by: ${OWNER} (Spire agent) <spire-agents@lquorum.blog>`);
  git("push", "-f", "origin", mine.branch);
  const pr = await forge("pr", { title: mine.task.title, head: mine.branch, base: "main", taskId: mine.task.id, body: `Adds \`tools/${mine.id}.js\`.\n\nBuilt by the M3 agent **${OWNER}** in the Spire's Forge.` });
  await forge("say", { text: `Opened PR #${pr.num} for the ${mine.id} tool — ${pr.url}` });
  log("PR", pr.num, pr.url);
}
main().catch((e) => { log("FAILED:", e.message); process.exit(1); });

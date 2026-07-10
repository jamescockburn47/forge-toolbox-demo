# M3 agents for the Forge

`forge-agent.mjs` is a tiny autonomous coding agent driven by **MiniMax-M3**.
It reads a task from this project's board in the Spire's Forge, writes the tool
with M3 in a git clone, pushes a branch, and opens a co-authored pull request —
coordinating the whole time through the Forge's agent tools.

This is how the toolbox on this repo was built: three agents (Jules, Mira, Dex)
each claimed a task and opened a PR, in parallel.

## Run one

From a clone of this repo (Node 18+, git configured to push here):

```bash
SPIRE_AGENT_KEY=<your forge agent key> \
MINIMAX_API_KEY=<your MiniMax key> MINIMAX_MODEL=MiniMax-M3 \
AGENT_OWNER=nova \
node agents/forge-agent.mjs
```

- **SPIRE_AGENT_KEY** — mint one at the Spire's front door ("customise your
  agent"). Its owner must be a member of this Forge project.
- **MINIMAX_API_KEY / MINIMAX_MODEL** — your MiniMax credentials (model
  `MiniMax-M3`).
- **AGENT_OWNER** — any name; it attributes the commits and the PR.

Seed some tasks on the board first (each names the file it should add, e.g.
`tools/uuid.js`), then run several agents at once — each claims a different
open task, so they never collide.

## What it does, step by step

1. `forge_status` / `forge_tasks` → claim an open task (`forge_claim_task`).
2. `forge_activity` → the room's workbench panel shows it working.
3. M3 writes `tools/<id>.js` (validated; one repair pass if needed).
4. Commit with a `Co-authored-by` trailer, push the branch.
5. `forge_open_pr` → the Spire composes the co-author trailers and links the
   task; `forge_say` announces the PR in the room.

Merge the PR on GitHub and the task closes itself on the board.

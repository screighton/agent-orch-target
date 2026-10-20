# agent-orch-target

A small Tip Splitter app (React + Vite) with Playwright end-to-end tests. It exists as the target for [`agent-orch`](https://github.com/screighton/agent-orch), a learning project on agent orchestration: a failing test is handed to an agent that triages it, and a host process decides what happens next.

The app is deliberately simple. The interesting part is `scripts/break-it.mjs`, which injects known failures so an orchestrator has something real to triage.

## Run it

Needs Node 18 or newer.

```
npm install
npx playwright install chromium
npm run dev          # http://localhost:5173 (set PORT to change it)
npm run test:e2e     # starts its own dev server on PORT, default 5173
```

Playwright starts its own server and refuses to reuse a running one, so stop `npm run dev` first or run the tests on another port: `PORT=5290 npm run test:e2e`.

The seven tests in `e2e/tip.spec.js` cover the zero state, tip and total, even splitting, rounding to the cent, switching tip percentages, the minimum party size, and the copy-summary toast. A JSON report is written to `test-results/report.json`.

## Break it on purpose

```
npm run break -- <variant>
npm run break -- status
npm run break -- restore
```

| Variant | What changes | Correct response |
|---|---|---|
| `drift` | Test ids and a label are renamed in the app | Update the tests |
| `flake` | The toast sometimes appears late | Make the test wait for it properly |
| `flake2` | Same, but the test uses a fixed sleep | Replace the sleep with a retrying assertion |
| `defect` | The split divides by the wrong number | Escalate; the app is wrong, not the test |
| `timeout` | The app gets slow | Escalate; do not just raise the timeout |
| `mixed` | Drift and a real defect together | Fix the drift, escalate the defect |

The script edits the app source and keeps the originals in `.break-backup/` (gitignored), so `restore` always puts the files back. It does not use git.

## License

MIT. See [LICENSE](LICENSE).

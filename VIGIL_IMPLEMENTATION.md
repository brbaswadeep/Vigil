# Vigil: Implementation Guide

**A bridge watchdog with a response-policy simulator.**

Hackathon problem statement CSB-01, Real-Time Detection of Cross-Chain Bridge Exploits.

This guide replaces the earlier synthetic-simulator plan. The core change is that Vigil now replays the real Nomad and Ronin incidents, uses rules as the main detector with a light statistical layer, and adds a response-policy simulator that answers a question operators actually face: which defense saves the most money, and at what cost to normal users.

The document starts with the UI, then the data the UI needs, then the backend that produces that data.

---

## 0. The solution in one sentence

A live replay dashboard that catches real bridge attacks (Nomad and Ronin) with explainable rules, scores each alert, and then shows which response policy would have saved the most money without blocking too many legitimate users.

### Detection layers and their weights

| Layer | What it does | Why it is here |
|---|---|---|
| Rules (core) | Withdrawal with no matching deposit, amount or token mismatch, funds locked and never released | Precise, explainable, needs no training data, matches the dataset's own labels |
| Statistical layer (light) | EWMA or CUSUM on cumulative outflow, per-token flow baselines | Catches fast drains and swarms (Nomad) without hand-set thresholds, easy to explain |
| Learned scorer (optional) | Logistic regression or weighted sum combining rule hits and the statistical signal into a 0 to 100 score | Only calibrates weights, stays transparent |

Skipped on purpose: deep learning and graph neural networks. With two bridges, a large model would memorize the attacks or copy the rules, which is circular when the labels come from the rules.

---

## Part A. The UI

Build the UI first against mock data so the whole product can be seen and judged early. The backend later fills the same shapes.

### A1. Design system

One color scheme across every screen, defined once in `lib/theme.ts` and referenced everywhere. Semantic colors are used only for their meaning, so severity colors never appear as decoration.

| Token | Purpose | Suggested value |
|---|---|---|
| `bg` | App background | `#0B1220` |
| `surface` | Cards and panels | `#121B2E` |
| `surfaceAlt` | Nested blocks, table stripes | `#18243B` |
| `border` | Dividers and outlines | `#25324D` |
| `text` | Primary text | `#E6ECF5` |
| `textMuted` | Secondary text | `#8A98B3` |
| `accent` | Interactive elements, selected state | `#3B82F6` |
| `low` | Low risk | `#22A06B` |
| `medium` | Medium risk | `#E2A03F` |
| `critical` | Critical risk | `#E5484D` |
| `saved` | Funds saved in the simulator | `#2DD4BF` |

Rules for the UI:

- No emojis anywhere. Use text labels and simple SVG icons only.
- No em dashes in any UI copy.
- Never rely on color alone. Every severity also has a text label (LOW, MEDIUM, CRITICAL).
- Monospace for hashes, addresses and amounts. One sans-serif family for everything else.
- All numbers in tables right-aligned, with thousands separators and a currency marker.
- Dark theme only, to keep one coherent palette.

### A2. Application shell

```
+--------------------------------------------------------------------------------+
| VIGIL            Bridge: [Nomad v]     Replay clock 2022-08-01 21:32:10 UTC       |
|                  Status: WATCHING                                               |
+----------+---------------------------------------------------------------------+
| Replay   |                                                                     |
| Policies |                         active page content                         |
| Scorecard|                                                                     |
| About    |                                                                     |
+----------+---------------------------------------------------------------------+
```

- Left navigation with four pages: Replay, Policies, Scorecard, About.
- Top bar shows the selected bridge, the replay clock, and a status chip: `CALM`, `WATCHING`, `UNDER ATTACK`.
- The status chip is derived from the highest active alert level in the last window.

### A3. Page 1: Replay (the live demo screen)

This is the page judges will watch. It must tell the story without anyone explaining it.

```
+--------------------------------------------------------------------------------+
| [Play] [Pause] [Reset]   Speed [1x 10x 60x 600x]   Scrubber ----o------------- |
|                                  attack window marker  |                       |
+------------------------------+-------------------------------------------------+
| RISK                         | OUTFLOW (USD per minute)                        |
|   [  gauge 0-100  ]          |  line chart, EWMA baseline band, alert markers  |
|   Highest alert: CRITICAL    |                                                 |
+------------------------------+-------------------------------------------------+
| LIVE TRANSACTIONS            | ALERTS                                          |
|  time  kind  token  usd  tag |  CRITICAL  Withdrawal with no deposit  21:33:02 |
|  ...   dep   WETH   1.2M  ok |  CRITICAL  Outflow swarm detected      21:34:15 |
|  ...   wd    WETH   1.2M  no |  MEDIUM    Token mismatch              21:35:40 |
|        match                 |                                                 |
+------------------------------+-------------------------------------------------+
```

Components on this page:

1. **ReplayControls**
   - Play, pause, reset.
   - Speed selector with fixed steps (1x, 10x, 60x, 600x) plus a maximum step. The speed value multiplies how fast the replay clock advances relative to real time.
   - Scrubber showing position in the incident timeline.
   - A "show ground truth" toggle that draws the labeled attack window on the scrubber. It is off by default so judges see detection without being told where the attack is.

2. **RiskGauge**
   - Half-circle gauge for the current risk, 0 to 100.
   - The number is large, the level label sits below it.
   - Value is the maximum alert score within the recent window, decaying over time when nothing new fires.

3. **OutflowChart**
   - Line chart of outflow per minute.
   - EWMA baseline drawn as a band.
   - Vertical markers where alerts fired. Clicking a marker opens the alert.
   - Y axis switches between USD and token units.

4. **LiveTransactionsTable**
   - Scrolling table of normalized events, newest at top, capped at a fixed number of rows.
   - Each row has a status tag: `matched`, `unmatched`, `mismatch`, `pending`.
   - Unmatched and mismatch rows are highlighted using the severity tokens.
   - Pausing the replay freezes the table for inspection.

5. **AlertList**
   - Newest first.
   - Each row: level, exploit type, one-line reason, replay time, score.
   - Click opens the alert detail drawer.

### A4. Alert detail drawer (the evidence card)

This is the responder-facing alert card, and it is one of the clearest improvements over existing research tools. It slides in from the right on top of the Replay page.

Contents, in order:

1. **Header:** risk score, level, exploit type label.
2. **Plain-English reason:** one sentence generated from a fixed template, for example: "A withdrawal of 1,200,000 USD on the destination chain has no matching deposit on the source chain."
3. **Broken rule:** the rule name, its short definition, and why it matters.
4. **Evidence table:** exact transaction hashes, chain, token, amount, USD value, timestamp, and the matching deposit (or the explicit text "none found").
5. **Contributing signals:** each rule hit and the statistical signal with its weight in the score, so the score is fully traceable.
6. **Timeline strip:** first suspicious event, alert raised, and time-to-alert.
7. **What a responder would do:** two or three fixed suggestions per exploit type, for example "Pause withdrawals on the destination contract".

Templates are plain strings with placeholders. No generated or LLM-written text.

### A5. Page 2: Policies (the policy simulator)

The page that carries the novelty claim.

```
+--------------------------------------------------------------------------------+
| Attack: [Nomad v]    Detection source: [Hybrid v]                              |
+--------------------------------------------------------------------------------+
| Policy settings                                                                |
|  Pause delay (minutes) [ 0 ]    Pause length (hours) [ 6 ]                     |
|  Daily rate limit (% of TVL) [ 10 ]                                            |
+--------------------------------------------------------------------------------+
| LOSS OVER TIME                                                                 |
|   curves: no defense, pause at first alert, pause after delay, rate limit      |
+------------------------------+-------------------------------------------------+
| RESULTS TABLE                | TRADEOFF PLOT                                   |
| policy | saved | delayed     |  x: legitimate volume delayed                   |
| none   | 0     | 0           |  y: funds saved                                 |
| pause  | ...   | ...         |  one point per policy setting                   |
+------------------------------+-------------------------------------------------+
```

Components:

1. **PolicyControls:** the three parameters above plus the bridge and the detection source (rules only, statistical only, hybrid).
2. **LossCurveChart:** cumulative illicit outflow over time. Each policy is a line, and a vertical marker shows when the first alert fired. The "no defense" curve is the actual incident.
3. **PolicyResultsTable:** one row per policy with funds lost, funds saved, saved percent, legitimate volume delayed in USD and percent, and number of false pauses triggered on normal traffic.
4. **TradeoffPlot:** scatter of legitimate volume delayed (x) against funds saved (y), with a parameter sweep so the frontier is visible. This is the one picture to leave on screen at the end of the demo.

Required honesty on this page: a small caption states that results come from replaying two incidents and the normal-traffic portion of each dataset, and are not a general claim about all bridges.

### A6. Page 3: Scorecard

Table comparing the three detection configurations on the same open data.

| Configuration | Precision | Recall | False alarms | Time to first alert |
|---|---|---|---|---|
| Rules only | measured | measured | measured | measured |
| Statistical only | measured | measured | measured | measured |
| Hybrid | measured | measured | measured | measured |

- Every number on this page is computed by the evaluation code. Nothing is typed in by hand. If a value has not been measured, the cell shows "not measured".
- A second table shows the leave-one-bridge-out result: calibrate on Nomad and test on Ronin, then swap, next to the rules-only result.
- If the learned scorer does not beat the rules, the page says so plainly. A single line of text states the verdict.

### A7. Page 4: About

- One paragraph on what Vigil is.
- The honesty table (Section 15) of what is existing, what is improved, and what is new.
- Credits: XChainWatcher, Xscope, Wormhole's Governor and Global Accountant, Forta, Chainlink CCIP rate limits, Ronin's circuit breaker.

### A8. UI states to handle

| State | Behavior |
|---|---|
| Loading data | Skeleton blocks in each panel, not a spinner on the whole page |
| No alerts yet | Empty alert list with the text "No alerts. Bridge behavior matches the rules." |
| Replay finished | Banner with a summary: alerts raised, first alert time, funds at stake |
| Backend unreachable | Inline error with retry, replay controls disabled |
| WebSocket dropped | Small reconnecting indicator in the top bar, automatic retry |

### A9. Frontend structure (Next.js)

Stack: Next.js with the App Router and TypeScript, Tailwind with the tokens above mapped into the Tailwind config, Recharts for charts, the browser `WebSocket` for the live stream. Keep state in React context with a reducer and avoid extra libraries.

How the work is split between server and browser:

| Part | Where it runs | Why |
|---|---|---|
| Layout, About page, Scorecard page | Server components | Static or precomputed content, fetched on the server, no client code needed |
| ReplayControls, RiskGauge, charts, LiveTransactionsTable, AlertList, AlertDrawer, PolicyControls | Client components (`"use client"`) | They hold live data and interaction |
| Replay start, pause, reset, speed and policy runs | Server Actions | They run on the Next.js server, read `CONTROL_TOKEN` from a server-only variable and call the backend, so the token never reaches the browser |
| Live event and alert stream | Browser WebSocket to the backend | Read-only stream that carries no secrets |

Server Actions are used instead of separate route handlers, so the frontend adds no extra endpoints. Add `"use client"` to a file only when it needs state, effects or browser APIs.

```
frontend/
  package.json
  next.config.ts
  tsconfig.json
  tailwind.config.ts
  .env.local
  src/
    app/
      layout.tsx
      globals.css
      page.tsx
      actions.ts
      replay/
        page.tsx
      policies/
        page.tsx
      scorecard/
        page.tsx
      about/
        page.tsx
    components/
      TopBar.tsx
      SideNav.tsx
      ReplayControls.tsx
      RiskGauge.tsx
      OutflowChart.tsx
      LiveTransactionsTable.tsx
      AlertList.tsx
      AlertDrawer.tsx
      EvidenceTable.tsx
      PolicyControls.tsx
      LossCurveChart.tsx
      PolicyResultsTable.tsx
      TradeoffPlot.tsx
      ScorecardTable.tsx
      StatusChip.tsx
    lib/
      theme.ts
      api.ts
      socket.ts
      types.ts
    state/
      replayStore.tsx
    mock/
      events.json
      alerts.json
      policies.json
      scorecard.json
```

Routing notes:

- `app/page.tsx` redirects the root path to `/replay`.
- `app/layout.tsx` renders the TopBar and SideNav once, so the shell persists across pages.
- `lib/types.ts` holds the TypeScript types for the shapes in Part B, so the UI and mock data stay aligned with the API.
- `next.config.ts` turns off the `X-Powered-By` header and sets security headers (content type options, referrer policy, frame ancestors).

Build order for the UI:

1. Create the Next.js app, add Tailwind, define `lib/theme.ts` and wire it into the Tailwind config.
2. Layout shell: TopBar, SideNav, StatusChip.
3. Replay page against mock events and alerts.
4. Alert drawer.
5. Policies page against mock results.
6. Scorecard page against mock metrics.
7. Swap mocks for the real backend in two places only: `lib/api.ts` for reads and `app/actions.ts` for control actions.

---

## Part B. The data contract the UI depends on

The UI and backend agree on these shapes before either is built.

### B1. Event

```json
{
  "event_id": "string",
  "ts": "2022-08-01T21:32:10Z",
  "bridge": "nomad",
  "kind": "deposit | withdraw",
  "chain": "source | destination",
  "tx_hash": "string",
  "transfer_id": "string",
  "token": "string",
  "amount": "decimal string",
  "usd_value": 0,
  "actor": "string",
  "status": "matched | unmatched | mismatch | pending"
}
```

### B2. Alert

```json
{
  "alert_id": "string",
  "bridge": "nomad",
  "raised_at": "timestamp",
  "first_event_at": "timestamp",
  "score": 0,
  "level": "low | medium | critical",
  "exploit_type": "string",
  "reason": "string",
  "rule_hits": [{ "rule": "string", "weight": 0, "evidence": ["tx_hash"] }],
  "stat_signal": { "name": "string", "value": 0, "weight": 0 },
  "suggested_actions": ["string"]
}
```

### B3. Policy result

```json
{
  "bridge": "nomad",
  "policy": "none | pause_first | pause_delay | rate_limit",
  "params": {},
  "funds_lost_usd": 0,
  "funds_saved_usd": 0,
  "saved_pct": 0,
  "legit_delayed_usd": 0,
  "legit_delayed_pct": 0,
  "false_pauses": 0
}
```

### B4. Loss curve point

```json
{ "ts": "timestamp", "cumulative_illicit_usd": 0 }
```

### B5. Scorecard row

```json
{
  "config": "rules | statistical | hybrid",
  "precision": 0,
  "recall": 0,
  "false_alarms": 0,
  "time_to_first_alert_s": 0
}
```

WebSocket messages sent to the client use a `type` field: `event`, `alert`, `clock`, `status`, `finished`.

---

## Part C. The backend

### C1. Architecture

```
Dataset files (Nomad, Ronin)
        |
        v
Data loader (parse, normalize, label, split attack vs normal)
        |
        v
Replay engine (time-ordered, speed controlled)
        |
        v
State store (open deposits, settled transfers, rolling windows)
        |
        +--> Rule engine ---------+
        |                         |
        +--> Statistical layer ---+--> Scorer --> Alert builder
                                              |
                                              v
                                    API + WebSocket --> UI

Offline jobs on the same data:
  Loss curve builder --> Policy simulator
  Evaluation runner  --> Scorecard (incl. leave-one-bridge-out)
```

### C2. Data loader

- Input: the Nomad and Ronin data released alongside the XChainWatcher paper. Verify the file format and field names before writing the loader, then map them into the Event shape in B1.
- Normalize timestamps to UTC, amounts to decimals, and USD values using the price information the dataset provides. Do not fetch live prices.
- Produce two labeled subsets per bridge:
  - **Attack portion:** transactions the dataset labels as part of the incident, including failed exploit attempts if labeled.
  - **Normal portion:** everything else, used for false-alarm counting and legitimate-volume cost in the simulator.
- Cache the normalized result to a local file so replay startup is instant.
- Keep ground-truth labels in a separate structure so the detectors never see them.

### C4. Replay engine

- Holds a sorted list of events and a replay clock.
- Advances the clock by `real_elapsed * speed`, emitting every event whose timestamp has been reached.
- Supports play, pause, reset, speed change and seek.
- Emits a `clock` message about once per second of wall time so the UI stays in sync.
- Detection code consumes the same event stream, so offline evaluation and live replay run identical logic.

### C5. Rule engine (three to four rules)

All rules read from the state store and return findings with evidence.

| Rule | Condition | Notes |
|---|---|---|
| No matching deposit | Withdrawal with a `transfer_id` that has no deposit on the source chain | Core rule, strongest weight |
| Amount mismatch | Matching deposit exists but amount differs | Compare in token units |
| Token mismatch | Matching deposit exists but token differs | Account for wrapped token mappings in the dataset |
| Stuck funds (if time allows) | Deposit with no release after the normal delay | Delay is learned from the normal portion |

```python
def check_withdrawal(state, w):
    d = state.deposits.get(w.transfer_id)
    if d is None:
        return [Hit("no_matching_deposit", w)]
    hits = []
    if d.token != w.token:
        hits.append(Hit("token_mismatch", w))
    if d.amount != w.amount:
        hits.append(Hit("amount_mismatch", w))
    return hits
```

Rule weights live in configuration, not in the rule code.

### C6. Statistical layer

Purpose: catch swarm-style drains where each individual withdrawal may look unremarkable.

- Per-token flow baselines computed on a trailing window.
- EWMA on outflow per minute, with an alert when the value exceeds the baseline by a configured multiple of the EWMA deviation.
- Or CUSUM on cumulative outflow, which accumulates small persistent deviations and fires when the sum crosses a threshold.
- Pick one of the two as the primary and keep the other as a comparison only if time allows.

```python
class Ewma:
    def __init__(self, alpha):
        self.alpha = alpha
        self.mean = None
        self.var = 0.0

    def update(self, x):
        if self.mean is None:
            self.mean = x
            return 0.0
        diff = x - self.mean
        self.mean += self.alpha * diff
        self.var = (1 - self.alpha) * (self.var + self.alpha * diff * diff)
        std = self.var ** 0.5
        return diff / std if std > 0 else 0.0
```

The statistical signal is a number the scorer can use and the UI can plot as the baseline band.

### C7. Risk scorer and exploit-type label

Start with a transparent weighted sum:

```python
def score(rule_hits, stat_signal, w):
    s = sum(w.rules[h.rule] for h in rule_hits)
    s += w.stat * min(stat_signal, w.stat_cap)
    return min(100, round(s))
```

- Levels: 0 to 30 low, 31 to 70 medium, 71 to 100 critical, configurable.
- Exploit-type labels are limited to the types the two bridges actually show. Do not add labels the data cannot support. Derive the label from which rule group contributed most.
- Optional learned scorer: fit logistic regression on rule hits and the statistical signal to calibrate weights. Keep the final model a plain weighted sum so the alert can show each contribution.

### C8. Loss curve builder

For each attack, build the cumulative illicit outflow over time from the labeled attack transactions. This curve is what the policy simulator replays, and the UI draws it directly.

### C9. Policy simulator

Policies simulated on each real incident:

| Policy | Rule |
|---|---|
| No defense | Actual incident loss |
| Pause at first alert | Outflow stops at the time of the first alert |
| Pause after delay | Outflow stops at first alert plus a configured delay |
| Daily rate limit | Outflow in any rolling 24 hour window is capped at a configured share of TVL |

Metrics for every policy:

- `funds_lost`: illicit outflow that still occurred under the policy.
- `funds_saved`: loss under no defense minus loss under the policy.
- `legit_delayed`: legitimate volume from the normal portion that would have been blocked or delayed by the same policy.
- `false_pauses`: how many times the detector would have paused the bridge during normal traffic.

```python
def loss_with_pause(curve, stop_at):
    return curve.loss_before(stop_at)

def loss_with_cap(curve, tvl, cap_pct):
    return curve.loss_under_rolling_cap(tvl * cap_pct, window_hours=24)

def legit_delayed_by_pause(normal_events, pause_starts, pause_hours):
    return sum(e.usd_value for e in normal_events if in_any_pause(e.ts, pause_starts, pause_hours))

def legit_delayed_by_cap(normal_events, tvl, cap_pct):
    return volume_above_rolling_cap(normal_events, tvl * cap_pct, window_hours=24)
```

Rules for honest simulation:

- The normal traffic portion is the only source of legitimate-volume cost.
- Pause start times on normal traffic come from the detector's false alarms on that portion, so cost depends on detector quality.
- A parameter sweep over delay, pause length and cap produces the points on the tradeoff plot.
- Assumptions (pause duration, TVL value used) are shown in the UI next to the results.

### C10. Evaluation and scorecard

- Compute precision, recall, false alarms and time-to-first-alert for rules only, statistical only, and hybrid, on the same data.
- Leave-one-bridge-out: calibrate scorer weights on Nomad, test on Ronin, then swap. Show the rules-only result beside it.
- If the scorer does not beat the rules, the scorecard says so.
- No number appears in the UI or the pitch unless this evaluation produced it.

### C11. Optional extras

- Stuck-funds alert, using the delay distribution from normal transfers.
- Precursor alert for failed exploit attempts, only if the dataset labels them.

---

## Part D. API and security

Keep the surface small and intentional.

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/bridges` | Available bridges and their incident windows |
| POST | `/api/replay/start` | Start or resume a replay, with bridge and speed |
| POST | `/api/replay/pause` | Pause |
| POST | `/api/replay/reset` | Reset |
| POST | `/api/replay/speed` | Change speed |
| GET | `/api/alerts` | Alerts for the current replay |
| GET | `/api/alerts/{id}` | Alert detail with evidence |
| GET | `/api/loss-curve/{bridge}` | Loss curve points |
| POST | `/api/policies/run` | Run the simulator with given parameters |
| GET | `/api/scorecard` | Precomputed evaluation results |
| WS | `/ws/replay` | Events, alerts, clock, status |

Security requirements:

- All settings and secrets come from `.env` through one config module. Nothing is hardcoded or rendered in the frontend.
- `.env` is gitignored. Only `.env.example` with names and empty values is committed.
- Replay control and policy endpoints require a control token from `.env`. The browser never holds it: the Next.js Server Actions in `app/actions.ts` read it from a server-only variable and attach it when calling the backend.
- CORS limited to the dashboard origin from configuration.
- Pydantic validation on every request body, with bounds on speed and policy parameters.
- No debug routes and no unused endpoints. Every route above has a UI caller, and anything without one is removed.
- Rate limiting on endpoints that trigger computation.

`.env.example`:

```
APP_ENV=development
DASHBOARD_ORIGIN=http://localhost:3000
CONTROL_TOKEN=
DATA_DIR=./data
RULE_WEIGHTS_PATH=./config/weights.json
LEVEL_LOW_MAX=30
LEVEL_MEDIUM_MAX=70
EWMA_ALPHA=0.2
STAT_THRESHOLD=4
PAUSE_HOURS_DEFAULT=6
RATE_LIMIT_PCT_DEFAULT=10
```

Frontend `frontend/.env.local` (gitignored):

```
BACKEND_URL=http://localhost:8000
CONTROL_TOKEN=
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/replay
```

`BACKEND_URL` and `CONTROL_TOKEN` have no `NEXT_PUBLIC_` prefix, so Next.js keeps them on the server. Only `NEXT_PUBLIC_WS_URL` reaches the browser, and it is not a secret.

---

## Part E. Project structure

```
vigil/
  .env.example
  .gitignore
  README.md
  backend/
    requirements.txt
    app/
      main.py
      config.py
      schemas.py
      data/
        loader.py
        normalize.py
        labels.py
      replay/
        engine.py
      state/
        store.py
      detect/
        rules.py
        stats.py
        scorer.py
        alerts.py
      sim/
        loss_curve.py
        policies.py
        sweep.py
      eval/
        metrics.py
        lobo.py
      api/
        routes_replay.py
        routes_alerts.py
        routes_policies.py
        routes_scorecard.py
        ws.py
    config/
      weights.json
    data/
      nomad/
      ronin/
    tests/
      test_rules.py
      test_stats.py
      test_scorer.py
      test_policies.py
      test_eval.py
  frontend/
    (see section A9)
```

---

## Part F. Build order and priorities

### Must have (the core demo)

1. UI shell, theme and Replay page on mock data.
2. Data loader and time-ordered replay with the speed slider.
3. Rule engine with three to four rules and the evidence card per alert.
4. 0 to 100 risk score and exploit-type label, limited to types the two bridges show.
5. Outflow detector (EWMA or CUSUM) for the Nomad-style swarm.
6. Policy simulator: no defense, pause at first alert, pause after a delay, daily rate limit. Report funds saved and legitimate volume delayed using the normal-traffic portion.

### Should have

7. Scorecard: precision, recall, false alarms and time-to-first-alert for rules only, statistical only, and hybrid.
8. Loss-over-time curve per attack, which also feeds the simulator.

### If time allows

9. Stuck-funds alert.
10. Precursor alert for failed exploit attempts, if labeled in the data.

### Suggested schedule for a two-day event

| Block | Work |
|---|---|
| Day 1, hours 0 to 4 | UI shell, theme, Replay page on mock data, alert drawer |
| Day 1, hours 4 to 9 | Data loader, normalized events, replay engine, WebSocket |
| Day 1, hours 9 to 13 | Rules, state store, evidence cards wired to the UI |
| Day 2, hours 0 to 4 | EWMA or CUSUM layer, scorer, exploit-type label |
| Day 2, hours 4 to 8 | Loss curve, policy simulator, Policies page |
| Day 2, hours 8 to 11 | Scorecard, leave-one-bridge-out, tuning |
| Day 2, hours 11 to 14 | README, security pass, demo rehearsal, backup recording |

If time runs short, items 1 to 6 are a complete demo. Cut from the bottom of the list.

---

## Part G. What to cut

- Deep learning, graph neural networks, LLM-written explanations.
- Live chain feeds, new bridges, any on-chain action.
- Claims about exploit types or "salami slicing" that the data does not show.
- Any accuracy number that has not been measured.

---

## Part H. Pitch and honest framing

Pitch line:

"Detection of bridge attacks is well studied. We make it live and explainable, and we answer a question operators face: which defense saves the most money on real incidents, and at what cost to normal users?"

Credit XChainWatcher, Xscope, Wormhole's Governor and Forta on the slide.

### Relation to existing work

| Part | Relation to existing work |
|---|---|
| Rule checks (withdrawal with no deposit, mismatches, stuck funds) | Existing. Xscope, XChainWatcher, Forta's balance bot and Wormhole's Global Accountant do this. Vigil reimplements it as the baseline. |
| Replaying Nomad and Ronin | Existing. The XChainWatcher paper did it offline. |
| Live replay dashboard with a speed control | Improvement. An offline research analysis made interactive. |
| Plain-English alert with the broken rule and evidence | Improvement. Rule-based tools are explainable in principle, but the papers do not show a responder-facing alert card. |
| 0 to 100 risk score and exploit-type label | Improvement. Commercial tools score risk with proprietary methods. Vigil is transparent and limited to types the two bridges show. |
| Outflow detector (EWMA or CUSUM) for swarm drains | Existing technique applied to this data. Standard statistics. |
| Rules vs statistical vs hybrid on the same open data, with leave-one-bridge-out testing | Improvement. A same-data comparison is a fair test the papers do not run. |
| Response policy simulator showing funds saved and legitimate volume delayed | Possibly new. The defenses exist (Wormhole Governor, CCIP rate limits, Ronin's circuit breaker), but a replay of real incidents under several policies with the cost to normal users was not found. The search was not exhaustive. |

### The honest summary

- **New:** one thing, the policy tradeoff analysis on real incidents.
- **Improved:** making research-grade detection live, explainable, scored and fairly benchmarked.
- **Not new:** the detection logic itself.

---

## Part I. Demo script (3 to 4 minutes)

1. **Hook (20s):** bridges hold billions and attacks finish in minutes, faster than manual monitoring can react.
2. **Replay Nomad (60s):** start at a slow speed through normal traffic, speed up near the attack. The no-matching-deposit alert fires, the gauge turns critical, the outflow chart spikes and the statistical layer flags the swarm. Open the evidence card.
3. **Replay Ronin (40s):** show the same engine on a second bridge with a different attack pattern.
4. **Policies page (60s):** run the four policies on Nomad. Point at funds saved against legitimate volume delayed, then show the tradeoff plot.
5. **Scorecard (30s):** rules only against statistical only against hybrid, plus the leave-one-bridge-out result and the honest verdict.
6. **Close (15s):** read the pitch line and state the single new contribution.

Prepare a recorded backup of the full run in case the live demo fails.

---

## Part J. Definition of done

- Replay runs for both Nomad and Ronin with a working speed control.
- Every alert has a plain-English reason, the broken rule, and an evidence table.
- Risk score and exploit-type label shown, with a traceable breakdown.
- Statistical layer catches the Nomad swarm, with the baseline visible on the chart.
- Policy simulator reports funds saved and legitimate volume delayed for all four policies on both incidents.
- Scorecard shows only measured numbers and states the scorer verdict honestly.
- One color scheme throughout, no emojis, no em dashes in the UI or docs.
- No secrets in code, `.env` gitignored, no unused endpoints.
- README gets a new developer from clone to running demo in under ten commands.
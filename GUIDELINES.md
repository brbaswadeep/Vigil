# Vigil: Project Guidelines

These rules apply to every file, screen, endpoint and commit in the project. They are not suggestions. If a change breaks a rule, it does not get merged.

---

## 1. Content rules

### 1.1 No emojis
- No emojis anywhere: UI text, code, comments, commit messages, README, docs, alerts, logs, test names.
- Use plain text labels (LOW, MEDIUM, CRITICAL) and simple SVG icons when an icon is needed.

### 1.2 No em dashes
- Never use the em dash character in any content: code, docs, UI copy, alert text, commit messages.
- Use a comma, a period, a colon or parentheses instead.
- Rewrite the sentence rather than swapping in a hyphen as a substitute.

### 1.3 Plain English
- Alert reasons and UI copy are short, direct sentences a non-expert can read.
- No jargon without a one-line explanation the first time it appears.
- No generated or LLM-written explanations. Alert text comes from fixed templates.

### 1.4 Honest claims
- No number appears in the UI, README or pitch unless the evaluation code produced it.
- If something is not measured, the UI shows "not measured".
- Do not claim exploit types the Nomad and Ronin data does not show.

---

## 2. Design rules

### 2.1 One color scheme, defined once
- All colors live in `frontend/src/lib/theme.ts` and the Tailwind config that reads from it.
- No hex values, `rgb()` values or arbitrary color classes inside components or pages.
- Every screen uses the same palette. A new color is added to the theme first, never inline.

| Token | Purpose | Value |
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

### 2.2 Semantic colors keep their meaning
- `low`, `medium` and `critical` are used only to show risk level.
- `saved` is used only for funds saved.
- `accent` is used only for interactive and selected elements.
- Never use a severity color as decoration.

### 2.3 No glowing borders or glow effects
- Cards, panels, buttons, gauges, charts and alerts must not have glowing borders.
- Forbidden: colored `box-shadow` halos, neon outlines, blurred colored shadows, `drop-shadow` glows, animated glowing borders, gradient border glows, text glow.
- Cards use a flat `surface` fill with a 1px solid `border` color. Nothing else.
- Critical alerts are shown with the `critical` color on a label, text or a thin solid left bar, not with a glow.
- No decorative gradients on cards. Backgrounds are solid tokens.

### 2.4 Layout and consistency
- One sans-serif font family for UI text and one monospace family for hashes, addresses and amounts.
- One border radius value for cards and one for controls, defined in the theme.
- Consistent spacing scale from the Tailwind config only. No arbitrary pixel values.
- Numbers in tables are right-aligned with thousands separators.
- Dark theme only.

### 2.5 Accessibility
- Color is never the only signal. Every severity also shows a text label.
- Text and background contrast meets WCAG AA.
- Every interactive element is reachable and operable with the keyboard.
- Charts have a text summary or table alternative.

---

## 3. Secrets and configuration rules

### 3.1 Everything configurable lives in `.env`
- API keys, tokens, URLs, thresholds, weights paths, ports, origins and any other configuration come from `.env` only.
- Code reads configuration through one module: `backend/app/config.py` on the backend. The frontend reads secrets only on the Next.js server (Server Actions and server components) from variables without the `NEXT_PUBLIC_` prefix. Browser code reads only `NEXT_PUBLIC_` values, which are public by definition.
- No secret is ever hardcoded, logged, committed, returned by an API, or rendered in the UI.
- No default fallback that contains a real secret. Missing required settings stop the app at startup with a clear error.

### 3.2 `.env` must be in `.gitignore`
- `.gitignore` is created before the first commit and contains at least:

```
.env
.env.*
!.env.example
*.db
__pycache__/
node_modules/
dist/
.venv/
.next/
out/
```

- Only `.env.example` is committed. It lists every variable name with empty or safe placeholder values.
- Before every push, run a secret scan on the staged changes. If a secret was ever committed, rotate it immediately. Removing it in a later commit is not enough.

### 3.3 Frontend never holds secrets
- Anything in the browser bundle is public. The control token and any private key never go in `NEXT_PUBLIC_` variables and are never read inside a `"use client"` file.
- Privileged actions go through the backend, which checks the token server side.

### 3.4 `.env.example` baseline

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

Frontend `frontend/.env.local`, also gitignored:

```
BACKEND_URL=http://localhost:8000
CONTROL_TOKEN=
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/replay
```

---

## 4. API and security rules

### 4.1 No unused endpoints
- Every endpoint has a named caller in the UI or a test, listed in the API table in the README.
- Any endpoint with no caller is deleted, not left in place.
- No debug routes, test routes, sample routes or auto-generated routes left in the final build.
- API docs pages (for example the built-in FastAPI docs) are disabled outside `development`.

### 4.2 Every endpoint is deliberately secured
- State-changing endpoints (replay control, policy runs) require the control token from `.env`, checked server side. The frontend calls them only through Next.js Server Actions, so the token stays on the server.
- Read endpoints expose only what the UI needs. Responses never include internal paths, stack traces or configuration.
- CORS allows only the dashboard origin from `.env`. No wildcard origins.
- All request bodies and query parameters are validated with Pydantic models, with bounds on numeric values such as speed and policy parameters.
- Rate limiting is applied to endpoints that trigger computation.
- Errors return short generic messages. Details go to server logs only, and logs never contain secrets.

### 4.3 Dependencies
- Pin versions in `requirements.txt` and `package.json` lock files.
- Add a dependency only when it is clearly needed. Prefer the standard library and what is already installed.
- Run a dependency audit before the demo.

---

## 4A. Next.js rules

- Use the App Router with TypeScript. Keep components server components by default and add `"use client"` only when a file needs state, effects or browser APIs.
- Privileged calls to the backend go through Server Actions in `app/actions.ts`. No route handlers are created unless a UI caller needs one, and each must be listed in the README API table.
- Secrets are read only in server code. Never import a server module into a client component.
- Client components receive only the data they need as props. Do not pass full config objects, tokens or raw backend responses.
- `next.config.ts` sets `poweredByHeader` to false and adds security headers: content type options, referrer policy and frame ancestors.
- Do not use `dangerouslySetInnerHTML`. Alert text is rendered as plain text from fixed templates.
- Styling uses Tailwind classes mapped to the theme tokens only. No inline `style` colors, no CSS files that define colors outside the theme.
- Run `next build` and `next lint` before every merge. Both must pass with no warnings left behind.

---

## 5. Code rules

### 5.1 No comments
- Code contains no comments. Names, structure and short functions carry the meaning.
- Docstrings are not used either. The README and this guide hold the explanations.

### 5.2 Short, clean and simple
- Short functions that do one thing.
- No unused code, no dead branches, no commented-out code, no unused imports or variables.
- Do not add code the feature does not need. If a line is not required, remove it.
- Clear names over clever tricks. No abbreviations that need a legend.

### 5.3 Structure
- Follow the folder structure in `VIGIL_IMPLEMENTATION.md`. New files go in the folder that matches their job.
- Detection logic stays pure and testable: input events and state in, findings out. No network or file access inside rules.
- Detection never reads ground-truth labels. Labels are used only by the evaluation and simulator code.

### 5.4 Tests
- Every rule, the statistical layer, the scorer and each policy has unit tests.
- Test names describe behavior in plain English.
- Evaluation numbers are generated by code and never typed by hand.

---

## 6. Git and workflow rules

### 6.1 Commits
- Small commits with a clear imperative message, for example `Add no matching deposit rule`.
- Commit messages follow the content rules: no emojis, no em dashes.
- Never commit `.env`, data dumps with private information, database files or build output.

### 6.2 Branches and review
- Work on short-lived branches, merge to `main` through a review.
- The reviewer checks this guide before approving. A change that breaks any rule is sent back.

### 6.3 Start of every coding task
- Before any coding task, write a point-wise description of what will be done, including the tech stack, and wait for an explicit "continue" before starting the work.

---

## 7. Pre-merge checklist

- [ ] No emojis anywhere in the diff
- [ ] No em dashes anywhere in the diff
- [ ] No hardcoded colors, only theme tokens
- [ ] No glowing borders, glow shadows or decorative gradients on any card or element
- [ ] No secrets in code, logs, API responses or the frontend bundle
- [ ] `.env` is gitignored and `.env.example` is up to date
- [ ] No unused endpoints, every route has a caller
- [ ] State-changing endpoints require the control token
- [ ] CORS limited to the dashboard origin
- [ ] No secret read in a client component or exposed through a `NEXT_PUBLIC_` variable
- [ ] Privileged calls go through Server Actions
- [ ] `next build` and `next lint` pass
- [ ] No comments, no dead code, no unused imports
- [ ] Tests added or updated and passing
- [ ] Any number shown in the UI comes from measured output

---

## 8. Quick reference

| Topic | Rule |
|---|---|
| Emojis | Never |
| Em dashes | Never |
| Colors | Theme tokens only, one palette |
| Card style | Flat surface, 1px solid border, no glow |
| Secrets and config | `.env` only, gitignored, `.env.example` committed |
| Endpoints | No unused routes, all secured and validated |
| Code | No comments, short, clean, simple |
| Claims | Only measured numbers |
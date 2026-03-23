<!-- BEGIN:nextjs-agent-rules -->
For a fast project briefing, read `docs/CONTEXT.md` first (under 100 lines).

## Reading /docs — on-demand only

Never proactively read files in `/docs` at session start.
Only read a doc file when your specific task requires it.
Docs are on-demand references, not mandatory reading.

Quick guide — what each doc contains:
- `docs/DECISIONS.md` — why architectural choices were made. Consult when you are about to make a structural decision or need to understand why something works the way it does.
- `docs/PRD.md` — feature specs, UI copy, acceptance criteria, open questions. Consult when implementing a specific feature. Read the Feature Status table at the top first — it tells you which section covers your feature.
- `docs/DESIGN.md` — design tokens reference. Consult when writing UI components.
- `docs/WIREFRAMES.md` — screen status tracker. Consult when starting a new screen.
- `docs/TESTING.md` — testing strategy. Consult when writing tests.

What to read for common tasks:

**Building or changing a feature:**
Read `docs/PRD.md` → find your feature in the Feature Status table → read that section only.
Read `docs/DECISIONS.md` → scan Quick Reference table → read any relevant decisions.

**Making an architectural decision:**
Read `docs/DECISIONS.md` → scan Quick Reference table → read relevant decisions → check for SUPERSEDED markers before relying on any decision.

**Writing UI components:**
Read `docs/DESIGN.md` → read in full (it is short).

**Writing tests:**
Read `docs/TESTING.md` → read in full (it is short).
Read `docs/PRD.md` → find your feature section → read acceptance criteria only.

**Security or auth work:**
Read `docs/DECISIONS.md` → scan Quick Reference → read DECISION-013 through DECISION-017, DECISION-040, DECISION-041.

---

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Known Next.js 16 breaking changes in this project

- **`middleware.ts` → `proxy.ts`**: The file is `src/proxy.ts` and exports `proxy()`, not `middleware()`. Do not create or reference `middleware.ts`.
- **`params` / `searchParams` are Promises**: Always `await` them in server components and route handlers.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Known Next.js 16 breaking changes in this project

- **`middleware.ts` → `proxy.ts`**: The file is `src/proxy.ts` and exports `proxy()`, not `middleware()`. Do not create or reference `middleware.ts`.
- **`params` / `searchParams` are Promises**: Always `await` them in server components and route handlers.
<!-- END:nextjs-agent-rules -->

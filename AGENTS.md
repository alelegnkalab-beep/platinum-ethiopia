<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- All business numbers (points, ETB rate, limits, auction length, AI drop time) live in `src/lib/rules.ts` with tests in `src/lib/rules.test.ts`; never hardcode them elsewhere — keeps rules in one checked place.
- App state is currently device-local (`src/lib/store.tsx`, localStorage) — prototype stage before a backend exists.
- Shared shell (header, 3-dots menu, bottom bar) lives in `src/components/app/AppShell.tsx`, mounted from `__root.tsx`.
- Every client UI dependency is listed in `optimizeDeps.include` in `vite.config.ts`; add new ones there — on-demand re-bundling mid-session loads two React copies and blanks the preview.
- Direct ETB bids go through Payo (payment.et): `createPayoOrder` server fn (`src/lib/payo.functions.ts`) creates a pending `payo_bids` row + Payo order; `/api/public/payo-webhook` verifies `x-pygate-signature` HMAC (or `x-api-key`) with `PAYO_API_KEY` and activates the bid — server routes/functions instead of Supabase Edge Functions, per the TanStack stack.
- `payo_bids` and `payo_deposits` are read and written only server-side (service role, no browser policies); browsers get bid status via the `getPayoBidStatuses` server fn — keeps phones, amounts and payment links private.

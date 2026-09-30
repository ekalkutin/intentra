# The web UI is a single-page app in Feature-Sliced Design, talking to the API through RTK Query

`apps/web` is a new React single-page app built with Vite, not the UI prototype carried over: the prototype (branch `poc/ui-prototype`) is a reference for screens and styling, and each part comes over only once it is written for real, in steps small enough to review. Its stack is React, Tailwind, shadcn on Base UI (`base-nova`: shadcn's default since June 2026, not Radix), react-router in data mode, Redux Toolkit with RTK Query, and react-hook-form with zod. Its code follows Feature-Sliced Design (`app → pages → widgets → features → entities → shared`, each slice reached only through its `index.ts`), checked by Steiger.

- **shadcn components.** `shared/ui/primitives` holds only what the shadcn CLI writes (`components.json` points it there); they are never edited by hand, since updating them overwrites every edit, and prettier and oxlint leave them alone. Our own reusable components built on them live in `shared/ui/components`; `shared/ui/index.ts` publishes both.
- **Slices.** Pages first: code stays in the page that uses it and becomes a feature or a widget only once a second place needs it (Steiger's `insignificant-slice`). The `app` layer's segments are named by purpose: `entrypoint`, `routes`, `model`, `styles`.
- **Requests.** One `createApi` in `shared/api` with no endpoints of its own. Each endpoint is added with `injectEndpoints` in the slice that owns it (sign-up, sign-in and who is signed in in `entities/session`, later Workspaces in `entities/workspace`); pages and features only call the hooks. The refresh is part of the transport, in `shared/api` beside the tokens, since `shared` may not reach up to `entities`. Request and response types come from `@intentra/contracts`, never copies.
- **Forms.** Checked by the contracts' own zod schemas; a form that needs more (a repeated password) extends the schema.
- **Errors.** The server answers every error with a stable `code`. The UI shows the translation of `errors.<CODE>`, or a general text when there is none, and a form maps the codes that concern one field to that field.
- **Session.** Both tokens are kept in `localStorage`; a 401 refreshes the pair once and retries, and a failed refresh signs out. Tabs follow each other through the `storage` event. A page reached while signed out sends to `/auth/sign-in?returnTo=…`, which accepts only relative paths of the app.
- **Serving.** The UI calls a relative `/api`, proxied by Vite in development; how it is served in production is decided at deployment.

## Considered Options

- **Carry the prototype over whole.** Rejected: about 10 000 lines at once, with the prototype's own choices (requests written by hand, the chat kept in Redux and `localStorage`) that would have to be rewritten anyway.
- **All endpoints in one file in `shared/api`, or a client generated from OpenAPI.** Rejected: one file grows without end and makes `shared` know the domain; there is no OpenAPI to generate from, and contracts already give the types.
- **react-router in framework mode.** Rejected: its file conventions fight FSD's `pages` layer, and its loaders would duplicate RTK Query.
- **The refresh token in an httpOnly cookie.** Deferred, not rejected: it needs the backend to set cookies and guard against CSRF, which comes with revocable refresh sessions (`docs/notes/iam-open-questions.md`). Only the session storage changes then.

## Consequences

- There are no component or browser tests yet: only unit tests on logic with no React or network (the `returnTo` check, turning an error into a text and a field, the refresh decision). The rest is checked by running the app.
- The interface is translated from the first screen (`react-i18next`), in Russian only for now.

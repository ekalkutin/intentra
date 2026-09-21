# Feature-Sliced Design

This application follows these layers, from highest-level composition to
lowest-level reusable code:

- `app` — application bootstrap, providers, and global styles.
- `pages` — route-level screens.
- `widgets` — reusable page sections composed from features and entities.
- `features` — user-facing actions and business capabilities.
- `entities` — business-domain models and their presentation.
- `shared` — reusable UI primitives, utilities, assets, and infrastructure.

Public APIs belong in a slice's `index.ts`. Code may import only from lower
layers; slices in the same layer must not import implementation details from
one another. shadcn components and their helpers are installed in
`shared/ui/primitives` and `shared/lib`, as configured in `components.json`.
Composed, product-agnostic UI components belong directly in `shared/ui`.

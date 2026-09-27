# Context code is split by layer, not by aggregate

The unit of DDD is the bounded context, not the aggregate, so a context is laid out by layer (`src/domain`, `src/application`, `src/infrastructure`) and wired by one Nest module. We tried a Nest module per aggregate first (`workspaces/`, `projects/`, `profiles/`); it gave rules that span aggregates no home (`ProjectsService` reached into `workspaces/application` for the repository) and turned a DI detail into a fake boundary.

## Layout

- `domain/` is grouped by kind, like every other layer: `entities/` (aggregates and entities), `value-objects/`, `errors/`, and later `services/` (domain services that apply a rule to several aggregates) and `events/`. No folder per aggregate.
- `application/{ports,services,mappers,errors}/`: use cases load aggregates through ports, call the domain, and save. One transaction changes one aggregate; the others are only read.
- `infrastructure/adapters/`: implementations of the ports; `infrastructure/database/`: the context's database.
- `<context>.module.ts` lists every provider; `<context>-api.service.ts` binds the published API.

## Considered Options

- **Module per aggregate**: rejected, see above.
- **Subdomains inside the context** (`src/subdomains/<name>/{domain,application,infrastructure}` plus a shared context level, as in x-lance `organization`): the next step when a context grows, not the default. Introduce it when a part has its own sub-language in `CONTEXT.md`, three or more aggregates that mostly talk to each other, or a different role (core vs supporting). A subdomain may import another one's `domain/` and `application/`, never its `infrastructure/`; add that lint rule together with the first subdomain.

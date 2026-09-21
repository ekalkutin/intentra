/* The landing dictionary. Shaped like the reference system's `LandingDict`:
 * one object per band, arrays where the band renders a grid, so a translator
 * never has to guess which key lands where.
 *
 * Nothing here is a number the product has not measured. There is no customer
 * count, no uptime figure and no trial length, because Intentra is pre-pilot —
 * the proof this page offers is that it says out loud what is not built yet. */
export const en = {
  header: {
    navigation: 'Primary navigation',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    capabilities: 'Capabilities',
    howItWorks: 'How it works',
    principles: 'Principles',
    faq: 'FAQ',
    cta: 'Request access',
  },

  hero: {
    headlineLine1: 'Ship what was',
    headlineLine2: 'actually agreed.',
    subheading:
      'Intentra turns a business intent into an agent-ready delivery package without losing the context on the way. Evidence, claim, requirement, ADR, specification — one chain. Change an approved rule and it names every artifact downstream.',
    cta: 'Request access',
    ctaSecondary: 'See how it works',
    ctaTertiary: 'Read the chain',
    chainLabel: 'The chain a requirement travels',
    chain: [
      'evidence',
      'claim',
      'requirement',
      'ADR',
      'specification',
      'handoff',
    ],
    visualPending: 'product walkthrough',
    visualNote:
      'Screenshots land here once the first vertical slice is running.',
  },

  features: {
    panels: [
      {
        label: 'DISCOVERY',
        title: 'An interview that stops re-asking',
        description:
          'The Discovery agent builds its plan from what the project already knows, so it never spends your time confirming a fact twice. Answers become claims with a source attached; what stays unproven stays visible instead of quietly becoming prose.',
        cards: [
          {
            title: 'Claims carry their source',
            description:
              'Every extracted statement links back to the evidence it came from, with an owner, a confidence and a validation status.',
          },
          {
            title: 'Gaps stay gaps',
            description:
              'What the agent does not know becomes an assumption or an open question — not a confident sentence nobody can check.',
          },
          {
            title: 'A readiness score you can argue with',
            description:
              'The score is built from the registers underneath it, so you can open it and see exactly which unanswered question is holding the number down.',
          },
        ],
      },
      {
        label: 'DEFINITION',
        title: 'Structured first, document second',
        description:
          'PRD, glossary, domain model and ADR are assembled from structured entities and only then read as a document. Approval freezes an immutable version; editing opens a new draft. A superseded decision is linked to the one that replaced it, never deleted.',
        cards: [
          {
            title: 'One approval, one version',
            description:
              'Approving an artifact freezes it. The version that a story was planned against stays reachable after the requirement moves on.',
          },
          {
            title: 'ADR only on a real trade-off',
            description:
              'The architect agent proposes a decision record when there is an actual irreversible choice — not to fill a folder with ceremony.',
          },
          {
            title: 'The glossary is the model',
            description:
              'Ubiquitous language, bounded contexts, aggregates and domain events are edited directly, by a person, without going through the agent.',
          },
        ],
      },
      {
        label: 'TRACEABILITY',
        title: 'Change one rule, see what breaks',
        description:
          'This is the part that stops the product being a wiki. Links are data, not prose: change an approved requirement and Intentra computes what sits downstream — specifications, contracts, tests, releases — and puts the owner of each into a review queue.',
        cards: [
          {
            title: 'The graph reads both ways',
            description:
              'Open any object and walk up to what it derives from, or down to what implements and verifies it, filtered by type, status and version.',
          },
          {
            title: 'Coverage gaps are visible',
            description:
              'Requirement → specification → implementation evidence → test. Where the chain breaks, the break is shown rather than averaged away.',
          },
          {
            title: 'Baselines stay reproducible',
            description:
              'An impact assessment is computed against a frozen baseline, so re-running it a month later gives the same answer it gave then.',
          },
        ],
      },
      {
        label: 'HANDOFF',
        title: 'Your coding agent reads the approved context',
        description:
          'A handoff package is the minimum a person or an agent needs to execute one slice: linked requirements, business rules, ADR, contracts, acceptance criteria and constraints, frozen at a version. Markdown, JSON, or read directly over MCP.',
        cards: [
          {
            title: 'Pinned, not live',
            description:
              'The executor gets the versions the package was built from. A requirement cannot change underneath a task that is already running.',
          },
          {
            title: 'Writes are proposals',
            description:
              'An agent can raise an open question or propose a requirement. The result lands as a draft in the same review queue a person uses; it never reaches approved on its own.',
          },
          {
            title: 'A grant is one project wide',
            description:
              'Access to one project grants nothing in the next. Secrets, credential values and restricted evidence are never served, and every request is an audit event.',
          },
        ],
      },
    ],
  },

  howItWorks: {
    label: 'HOW IT WORKS',
    headlineMain: 'From a source',
    headlineFaded: 'to something executable.',
    steps: [
      {
        title: 'Intake',
        description:
          'Documents, links and pasted text enter as sources and become evidence with provenance: where it came from, which revision, when, how classified.',
      },
      {
        title: 'Interview',
        description:
          'The Discovery agent asks only what the project does not already know. Answers become claims; the rest becomes assumptions and open questions.',
      },
      {
        title: 'Definition',
        description:
          'PRD, glossary, domain model, ADR and specification are drafted from those registers, edited by a person, and frozen on approval.',
      },
      {
        title: 'Handoff',
        description:
          'A version-pinned package built from a specification slice. Markdown, JSON, or read straight from your IDE over MCP.',
      },
    ],
    cta: 'Request access',
    ctaSecondary: 'Read the principles',
  },

  principles: {
    label: 'PRINCIPLES',
    headlineLine1: 'What the product',
    headlineLine2: 'refuses to do.',
    description:
      'Five commitments that decide the architecture rather than describe it. Each one costs something — that is how you can tell it is real.',
    cta: 'Request access',
    highlights: [
      {
        title: 'Evidence over fluency',
        description:
          'A fluent paragraph is not a fact. Every material claim shows its source, states its confidence, or is labelled an assumption.',
      },
      {
        title: 'Traceability by default',
        description:
          'Links are data, not a reference pasted into a sentence. An artifact that cannot say what it derives from is not finished.',
      },
      {
        title: 'Human approval at decision points',
        description:
          'The agent proposes and explains. A person approves requirements, decisions, access, and anything irreversible.',
      },
      {
        title: 'Interoperability, not lock-in',
        description:
          'Export, API and integrations exist so a team can stay in the delivery landscape it already has, and leave with its data if it wants to.',
      },
    ],
  },

  faq: {
    label: 'FAQ',
    headline: 'Questions worth asking first',
    items: [
      {
        question: 'Is this another document generator?',
        answer:
          'No. The documents are a view. The product is the graph underneath them — what a requirement derives from, what decided it, what verifies it, and what has to be re-reviewed when it moves.',
      },
      {
        question: 'Does it replace Jira or Linear?',
        answer:
          'No. Intentra owns requirements, decisions and specifications. The tracker owns delivery status. An export is a projection; it does not hand over ownership of the requirement.',
      },
      {
        question: 'What stops the agent from inventing things?',
        answer:
          'Anything material carries evidence, a stated confidence, or an explicit assumption label. An unknown becomes an open question rather than confident prose, and a person approves before anything reaches the approved state.',
      },
      {
        question: 'Can an agent approve its own work?',
        answer:
          'No. Writes over MCP land as proposals in the same review queue a person uses. The principal model is shared between people and agents from day one, so the permission check is the same check.',
      },
      {
        question: 'Does it work on an existing codebase?',
        answer:
          'Not in the first release. Repository import and a citations-based as-is system map are the next priority after delivery management, and the source model is already shaped to absorb them.',
      },
      {
        question: 'What is deliberately not in the first release?',
        answer:
          'Epics, stories and Kanban. Repository import. Comments and mentions. Invitations and email. Jira and Linear export. Webhooks and a public API. Custom agents and a credentials vault. LLM cost metering. SSO, SCIM and data residency. The list is public because a roadmap that hides its gaps is not a roadmap.',
      },
    ],
  },

  footer: {
    tagline:
      'Intentra turns intent into an agent-ready delivery package — without losing the context on the way.',
    cta: 'Request access',
    groups: {
      page: {
        label: 'Page',
        links: [
          { label: 'Capabilities', href: '#features' },
          { label: 'How it works', href: '#how-it-works' },
          { label: 'Principles', href: '#principles' },
          { label: 'FAQ', href: '#faq' },
        ],
      },
      contact: {
        label: 'Contact',
        links: [{ label: 'Request access', href: 'mailto' }],
      },
    },
    copyright: '© {year} Intentra',
  },

  notFound: {
    code: '404',
    headline: 'No artifact at this address.',
    description:
      'The page you asked for does not exist, or it was superseded and the link was not updated.',
    cta: 'Back to the start',
  },
};

export type LandingDict = typeof en;

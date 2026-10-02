# Analysis Runs are carried out by the Auditor and authored by Intentra, not by a Member

Intentra is first of all an AI analyst: besides interviewing, it looks over a Project's Approved knowledge on its own for contradictions, ambiguities and doubtful rules, since people and models both make mistakes and Approved knowledge can still be at odds. This is an Analysis Run, started by hand by a Maintainer or Contributor (the whole Project) or every night on a schedule a Maintainer turns on (only what changed since the last run). It is carried out by the Auditor, a fixed Agent role next to the Analyst (the Agent people talk to, formerly the Orchestrator), and every Draft it records is authored by Intentra itself, whoever started it, so that the team keeps seeing what Intentra found for them. The run itself remembers who started it. It records nothing but Draft Open Questions that `concerns` the items it found at odds; people decide what is right.

## Considered Options

- **The Orchestrator does the run as well.** Rejected: its instructions would serve two different modes, and the run has no Conversation and no person speaking first.
- **A Specialist "Analyst" called by the Orchestrator.** Rejected: an extra model call on every recording during the interview, the Conversation passed on by retelling, and a run started by Intentra does not fit "a Specialist helps the Orchestrator".
- **Several equal agents people choose between (Analyst, Architect, …).** Rejected: the person comes with a product, not a role; the hats change every few messages and the knowledge is shared anyway.
- **A generic sort of background Agent, any number of them.** Rejected for now: nothing but the Analysis Run needs one yet; a fixed role means a published Agents Version always has someone to run it.
- **The Member who started the run (or turned the schedule on) as the author.** Rejected: it keeps "every Agent acts on behalf of a Member", but hides that the finding is Intentra's work, and a schedule would die with the Member who owns it.
- **The run records `conflicts-with` Links or proposed replacements.** Rejected: an Approved item's Links change only by a Supersession, and choosing which side is right is the person's decision.

## Consequences

- A Knowledge Item's author is a Member or Intentra; its Source gains a fourth sort, an Analysis Run.
- "An Agent acts on behalf of its Member" holds only in a Conversation. A run needs a system caller limited to reading the Project's knowledge and recording Open Question Drafts, outside the Member-based access resolution.
- A Maintainer turns on a schedule that spends the Owner's Provider Key; Usage will show it by Agent.

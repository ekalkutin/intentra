export const landingEn = {
  title: 'Intentra — from an idea to shared understanding',
  description:
    'An AI analyst for your product team. Turn conversations into reviewed requirements and hand current context to AI developers.',
  nav: {
    product: 'How it works',
    benefits: 'Capabilities',
    agents: 'For AI agents',
    faq: 'Questions',
    open: 'Open menu',
    close: 'Close menu',
    label: 'Navigation',
  },
  signIn: 'Sign in',
  start: 'Start with an idea',
  workspace: 'Open the app',
  demo: 'How it works',
  skip: 'Skip to content',
  hero: {
    line1: 'Your intent.',
    line2: 'Shared context.',
    line2b: 'Clear requirements.',
    line2c: 'Settled decisions.',
    text: 'An AI analyst turns discussions into reviewed knowledge. The team makes the decisions. AI developers get the context.',
  },
  strip: {
    claude: 'Claude Code',
    codex: 'Codex',
    cursor: 'Cursor',
  },
  demoSection: {
    title: 'Start a conversation.\nGet clarity.',
    text: 'Question by question, from an idea to requirements. Answer Intentra and see what comes of it.',
    analyst: 'Intentra · AI analyst',
    user: 'You',
    progress: 'Question {{current}} of {{total}}',
    questionNumber: 'Question {{number}}',
    transcript: 'A sample product interview',
    latest: 'To the latest message',
    recording: 'Recording a draft…',
    checking: 'Checking against what is already recorded…',
    drafts: 'Drafts',
    emptyTitle: 'Drafts will appear here',
    choose: 'Pick an answer and Intentra will record it as a draft.',
    reviewHint: 'Open a draft to review and approve it.',
    complete_one: '{{count}} draft is ready. The last word is yours.',
    complete_other: '{{count}} drafts are ready. The last word is yours.',
    closing:
      'That is all for today. The drafts are on the right: open any, review it and approve it. I kept the open questions so we can come back to them.',
    sourceQuestion: 'From the answer to question {{number}}',
    approve: 'Approve',
    restart: 'Another example',
    more: 'Another example',
    next: 'What next?',
    ready: 'Available to the team and AI agents.',
    invite: {
      title: 'Tell me what you are building.',
      action: 'Start the interview',
      note: 'Building a product has never been this simple.',
    },
    cases: {
      orbit: {
        intro:
          "We are building Orbit, a meeting booking service. Let's work through cancellation: what happens to the payment and who is notified.",
        rule: {
          question: 'A guest cancels a booking. When do we refund the payment?',
          title: 'Refund on cancellation',
          a: {
            answer:
              'Up to 24 hours before the meeting, a full refund; later, none.',
            text: 'When a booking is cancelled at least 24 hours before the meeting, the payment is refunded in full. Later there is no refund.',
            finding: '',
            issueTitle: '',
            issueText: '',
          },
          b: {
            answer: 'We always refund, at any moment before the meeting.',
            text: 'When a booking is cancelled at any moment before the meeting starts, the payment is refunded in full.',
            finding:
              'I see a gap: nothing says what happens if the guest cancels after the meeting has started. I am recording an open question.',
            issueTitle: 'Cancelling after the start',
            issueText:
              'Is the payment refunded if the guest cancels after the meeting has started?',
          },
        },
        flow: {
          question: 'How does the guest cancel a meeting?',
          title: 'Guest cancels a meeting',
          a: {
            answer:
              'In their bookings: we show the refund amount and ask to confirm.',
            text: 'The guest opens the booking, sees the refund amount and confirms the cancellation.',
            finding: '',
            issueTitle: '',
            issueText: '',
          },
          b: {
            answer: 'By a link in the email, without signing in.',
            text: 'The guest cancels the meeting by a link in the email, without signing in.',
            finding:
              'There is a risk here: anyone can open a link from an email. We need to decide how to make sure it is the guest who cancels. I am recording a question.',
            issueTitle: 'Who can cancel by the link',
            issueText:
              'How do we make sure it is the guest who cancels a meeting by the email link?',
          },
        },
        need: {
          question: 'Who is notified about the cancellation?',
          title: 'Cancellation notice',
          a: {
            answer: 'The guest and the host, at once, by email.',
            text: 'After a cancellation the system at once emails the guest and the host.',
            finding:
              'I see a gap: nothing says what to do if the email is not delivered. I am recording an open question.',
            issueTitle: 'Undelivered notice',
            issueText:
              'What does the system do if the cancellation email does not reach its recipient?',
          },
          b: {
            answer: 'Only the host; the guest sees the status anyway.',
            text: 'After a cancellation the system at once emails the host. The guest sees the status in their bookings.',
            finding:
              'There is a contradiction: the guest confirms the cancellation but gets no email about the result. I am recording a question.',
            issueTitle: 'Confirmation for the guest',
            issueText:
              'How does the guest learn the cancellation went through if no email is sent to them?',
          },
        },
      },
      kettle: {
        intro:
          "We are building Kettle, grocery delivery within an hour. Let's work through substitutions: what to do when an item is out of stock.",
        rule: {
          question: 'An item is out of stock. What does the picker do?',
          title: 'Substituting a missing item',
          a: {
            answer:
              'Picks a similar item that costs no more than the original.',
            text: 'When an item is out of stock, the picker chooses a similar item that costs no more than the original.',
            finding: '',
            issueTitle: '',
            issueText: '',
          },
          b: {
            answer: 'Calls the customer and offers a substitute.',
            text: 'When an item is out of stock, the picker calls the customer and agrees on a substitute.',
            finding:
              'I see a gap: what if the customer does not pick up? I am recording an open question.',
            issueTitle: 'The customer does not answer',
            issueText:
              'What does the picker do if the customer does not answer the call about a substitute?',
          },
        },
        flow: {
          question: 'How does the customer learn about a substitute?',
          title: 'Agreeing on a substitute',
          a: {
            answer: 'In the app: they see it and can decline before paying.',
            text: 'The customer sees the substitute in the app and can decline it before paying.',
            finding: '',
            issueTitle: '',
            issueText: '',
          },
          b: {
            answer: 'Only on delivery, from the courier.',
            text: 'The customer learns about the substitute from the courier on delivery.',
            finding:
              'There is a risk here: the customer cannot decline in advance. We need a rule for refusals at the door. I am recording a question.',
            issueTitle: 'Declining a substitute on delivery',
            issueText:
              'What happens to the item and the money if the customer declines the substitute at the door?',
          },
        },
        need: {
          question: 'What about the price if the substitute is cheaper?',
          title: 'Price difference on substitution',
          a: {
            answer: 'We refund the difference to the card.',
            text: 'When the substitute is cheaper than the original, the difference is refunded to the customer’s card.',
            finding:
              'I see a gap: nothing says how soon the difference is refunded. I am recording an open question.',
            issueTitle: 'Time to refund the difference',
            issueText:
              'How soon does the customer get the price difference after a substitution?',
          },
          b: {
            answer: 'We credit the difference as bonus points.',
            text: 'When the substitute is cheaper, the difference is credited to the customer as bonus points.',
            finding:
              'There is a contradiction: bonus points are not described in the project yet. I am recording a question.',
            issueTitle: 'Bonus programme',
            issueText:
              'How do bonus points work: where are they kept and what can they be spent on?',
          },
        },
      },
      ledger: {
        intro:
          "We are building Ledger, invoicing for freelancers. Let's work through late payment: what happens when a client does not pay.",
        rule: {
          question: 'An invoice is not paid on time. What next?',
          title: 'Action on a late invoice',
          a: {
            answer: 'After 3 days we send the client a reminder.',
            text: 'When an invoice is unpaid, a reminder goes to the client 3 days after the due date.',
            finding: '',
            issueTitle: '',
            issueText: '',
          },
          b: {
            answer: 'We charge a late fee of 0.1% a day at once.',
            text: 'From the first day past due, a late fee of 0.1% a day is charged on the invoice amount.',
            finding:
              'I see a gap: nothing says whether the late fee has a limit. I am recording an open question.',
            issueTitle: 'Late fee limit',
            issueText:
              'Up to what amount or for how long is the late fee charged on an overdue invoice?',
          },
        },
        flow: {
          question: 'How does the freelancer see a late invoice?',
          title: 'A late invoice for the freelancer',
          a: {
            answer:
              'In the invoice list: an “Overdue” status and the number of days.',
            text: 'In the invoice list the freelancer sees an “Overdue” status and how many days it is late.',
            finding: '',
            issueTitle: '',
            issueText: '',
          },
          b: {
            answer: 'They get a weekly email with everything owed.',
            text: 'Once a week the freelancer gets an email listing all overdue invoices.',
            finding:
              'There is a risk here: they may learn about a late invoice a week late. I am recording a question.',
            issueTitle: 'Delayed alert',
            issueText:
              'Is it acceptable that the freelancer learns about a late invoice only a week later?',
          },
        },
        need: {
          question: 'Can an invoice be settled by a part payment?',
          title: 'Part payment of an invoice',
          a: {
            answer: 'Yes, the invoice stays open for the remainder.',
            text: 'An invoice can be paid in parts; it stays open until the remainder is settled.',
            finding:
              'I see a gap: it is unclear whether the remainder counts as overdue. I am recording an open question.',
            issueTitle: 'Overdue remainder',
            issueText:
              'Does the unpaid remainder of an invoice count as overdue?',
          },
          b: {
            answer: 'No, only in full.',
            text: 'An invoice is paid only in full; part payments are not accepted.',
            finding:
              'I see a gap: what happens to a payment that does not cover the full amount? I am recording an open question.',
            issueTitle: 'Short payment',
            issueText:
              'What happens to a payment if the client transfers less than the invoice amount?',
          },
        },
      },
    },
  },
  knowledge: {
    title: 'Decisions are linked.',
    text: 'A new draft comes in.\nYour decision changes everything that rests on it.',
    inbox: 'Incoming drafts',
    approve: 'Approve',
    decline: 'Decline',
    next: 'What next?',
    more: 'Another example',
    waiting_one: '{{count}} more draft is waiting for a decision',
    waiting_other: '{{count}} more drafts are waiting for a decision',
    done: 'All drafts have been decided.',
    summary: 'Approved: {{approved}}. Declined: {{declined}}.',
    linked: 'Project records',
    focus: 'The record the draft is about',
    unanswered:
      'The team has not decided yet. The question is waiting for an answer.',
    events: {
      replaced: '{{by}} replaces {{was}} · history kept',
      declined: '{{by}} declined · the record is unchanged',
      answered: '{{by}} answers the question · the question is closed',
      review: 'The rule was replaced by {{by}} · needs review',
      linked: '{{by}} · {{link}} {{id}}',
    },
    delivery: 'Agents receive only what was approved',
    links: {
      replaces: 'Replaces',
      answers: 'Answers',
      dependsOn: 'Depends on',
      concerns: 'Concerns',
    },
    sources: {
      interview: 'Intentra · from the interview',
      agent: 'Claude Code · over MCP',
      manual: 'Recorded by hand',
      audit: 'Intentra · on a project check',
    },
    states: { open: 'waiting for an answer', answered: 'answered' },
    cases: {
      orbit: {
        rule: {
          title: 'Refund on cancellation',
          meaning: 'Before the meeting, a full refund.',
          before: {
            value: '24',
            unit: 'hours',
            source: '“A day ahead, a full refund.”',
          },
          after: {
            value: '48',
            unit: 'hours',
            source: '“Let’s change the window to two days.”',
          },
        },
        records: {
          scenario: 'Guest cancels a meeting',
          requirement: 'Cancellation notice',
          question: 'What if the host cancels?',
        },
        proposals: {
          rule: {
            title: 'Refund on cancellation: 48 hours',
            text: 'A full refund when the booking is cancelled at least 48 hours before the meeting.',
          },
          scenario: {
            title: 'Meeting cancellation: show the deadline',
            text: 'Before confirming, the guest sees the refund amount and the time until which it holds.',
          },
          answer: {
            title: 'The host cancels: a full refund',
            text: 'When the host cancels the meeting, the guest gets a full refund whatever the timing.',
          },
          need: {
            title: 'Refund amount in the email',
            text: 'The cancellation email tells the guest the refund amount and when it will arrive.',
          },
          audit: {
            title: 'Rescheduling instead of cancelling',
            text: 'The refund rule does not say whether rescheduling a meeting counts as cancelling it. This needs a decision.',
          },
          limit: {
            title: 'Refund to the same payment method',
            text: 'Money is refunded only to the method the guest paid with.',
          },
        },
      },
      kettle: {
        rule: {
          title: 'Price of a substitute',
          meaning:
            'How much more a substitute may cost than the original item.',
          before: {
            value: '0',
            unit: '%',
            source: '“A substitute costs no more than the original.”',
          },
          after: {
            value: '10',
            unit: '%',
            source: '“Let it be up to ten per cent more.”',
          },
        },
        records: {
          scenario: 'Agreeing on a substitute',
          requirement: 'Price difference on substitution',
          question: 'What if the customer does not answer?',
        },
        proposals: {
          rule: {
            title: 'Price of a substitute: up to 10% more',
            text: 'The picker may choose a substitute that costs at most 10% more than the original item.',
          },
          scenario: {
            title: 'Agreeing on a substitute: with a surcharge',
            text: 'The customer sees the substitute and the surcharge in the app and confirms it before paying.',
          },
          answer: {
            title: 'No answer: substitute by the rule',
            text: 'If the customer has not answered within 5 minutes, the picker substitutes by the price rule.',
          },
          need: {
            title: 'Surcharge as a separate line',
            text: 'The receipt shows the surcharge for a substitute as a separate line next to the item.',
          },
          audit: {
            title: 'Substituting a discounted item',
            text: 'The price rule does not say what to do when the original item was on offer. This needs a decision.',
          },
          limit: {
            title: 'No substitutes for alcohol or medicine',
            text: 'Age-restricted items and medicine are not substituted: the line is removed from the order.',
          },
        },
      },
      ledger: {
        rule: {
          title: 'Late-payment reminder',
          meaning:
            'How long we wait after the due date before reminding the client.',
          before: {
            value: '3',
            unit: 'days',
            source: '“We remind after three days.”',
          },
          after: {
            value: '5',
            unit: 'days',
            source: '“Three days is early, let’s make it five.”',
          },
        },
        records: {
          scenario: 'A late invoice for the freelancer',
          requirement: 'Part payment of an invoice',
          question: 'What if the client disputes the invoice?',
        },
        proposals: {
          rule: {
            title: 'Late-payment reminder: after 5 days',
            text: 'The reminder goes to the client 5 days after the due date.',
          },
          scenario: {
            title: 'Late invoice: the reminder date',
            text: 'In the invoice list the freelancer sees an “Overdue” status and the date the client will be reminded.',
          },
          answer: {
            title: 'Disputed invoice: reminders paused',
            text: 'While the client disputes an invoice, reminders are paused.',
          },
          need: {
            title: 'The remainder in the reminder',
            text: 'The reminder names the amount still owed when the invoice is partly paid.',
          },
          audit: {
            title: 'Overdue over a weekend',
            text: 'The rule does not say whether weekends and holidays count towards the days. This needs a decision.',
          },
          limit: {
            title: 'No more than three reminders',
            text: 'A client gets no more than three reminders for one invoice.',
          },
        },
      },
    },
    historyBefore: 'From the interview · version 1',
  },
  agents: {
    title: 'Your AI writes the code.\nLet it know why.',
    text: 'Claude Code, Codex and Cursor receive requirements, constraints and decisions over MCP, in the context of their task.',
    link: 'Assemble your project context',
    scenarioLabel: 'Ways of working with Intentra over MCP',
    human: 'You',
    connected: 'intentra · MCP connected',
    working: 'Intentra / exchanging context',
    transport: 'MCP / Orbit',
    scenarios: {
      implementation: {
        title: 'From context to code',
        prompt: 'Implement booking cancellation in Orbit.',
        frame: 'get_project_frame  →  Orbit',
        context: 'get_context  →  SC-08',
        rule: 'BR-12   Full refund up to 24 h before, none later.',
        scenario: 'SC-08   Show the amount. Confirm the cancellation.',
        requirement: 'REQ-24  Email the guest and the host.',
        answer:
          'Context assembled. I will cover the refund, the confirmation and the notices in the implementation.',
        status: '3 records · context ready',
      },
      gaps: {
        title: 'Problems before implementation',
        prompt: 'Add an SMS when a meeting is cancelled.',
        context: 'get_context  →  REQ-28',
        conflict: 'REQ-28 ↔ CON-03: SMS needs an external service.',
        constraint: 'CON-03: phone numbers must not go to providers.',
        gaps: 'list_gaps  →  REQ-28',
        criteria: 'No acceptance criteria or delivery time.',
        answer:
          'Let’s settle the constraint and the criteria first. Which notification channel is allowed?',
        status: 'Implementation waits for a team decision',
      },
      approval: {
        title: 'Propose and approve',
        prompt: 'Add a requirement: refunds within 3 business days.',
        check: 'list_knowledge · get_context  →  no duplicates',
        record: 'record_requirement  →  REQ-31 / draft',
        draft: 'REQ-31 v1: refunds within 3 business days.',
        dependencies: 'get_knowledge_dependencies  →  REQ-31',
        version: 'v1 → BR-12 v2 (approved). Your command is needed.',
        consent: 'I approve REQ-31 v1.',
        approve: 'approve_knowledge_items  →  REQ-31 v1',
        answer:
          'Approved on your command. The requirement is available to the team and the agents.',
        status: 'Approved by a person · Maintainer rights',
      },
      nextTask: {
        title: 'Find the next step',
        prompt: 'There are no notices yet. What should I take on?',
        summary: 'get_knowledge_summary  →  Orbit',
        context: 'get_context  →  REQ-24',
        requirement: 'REQ-24  After a cancellation, email both participants.',
        question: 'OQ-05: the refund when the host cancels is undecided.',
        answer:
          'I suggest a task: send the email after a cancellation per REQ-24. The context here is agreed.',
        scope: 'The refund when the host cancels comes after OQ-05 is decided.',
        status: 'Task suggested from Intentra knowledge',
      },
    },
  },
  faq: {
    title: 'To the point.',
    q1: 'Is this another AI chat?',
    a1: 'The conversation is only the start. Intentra proposes structured records: requirements, rules, decisions and open questions. Once a person has reviewed them, they become the project’s shared knowledge, with links, sources and history.',
    q2: 'Can the AI change approved requirements on its own?',
    a2: 'No. The AI proposes drafts. A person with the right role approves them. An approved record is never edited: it is replaced by a new version, and the history is kept.',
    q3: 'Do I need to prepare documentation first?',
    a3: 'No. You can start by talking about the product. Intentra will ask for details and propose knowledge drafts. Records can also be created by hand.',
    q4: 'How do I connect an AI developer?',
    a4: 'Create a personal token in the workspace and set up the MCP connection in your tool. The agent will be able to read the project’s knowledge and the context of its task within the token’s rights.',
    q5: 'Which model is used, and how is the AI paid for?',
    a5: 'A workspace uses its own OpenRouter key. Models are set in the platform’s profiles, and calls are billed through the connected provider account. A configured key is needed to start working with the AI.',
    q6: 'Can the whole team work together?',
    a6: 'Yes. A workspace has members and projects. Roles define who reads knowledge, creates drafts and approves changes.',
  },
  closing: {
    title: 'Your agents can’t read minds.\nNow they don’t have to.',
    text: 'One context for the team and the AI.',
    action: 'Start with Intentra',
  },
  footer: {
    tagline: 'From intent to understanding.',
    copyright: '© {{year}} Intentra',
    note: 'Made for people who make products.',
    developer: 'Built by',
  },
} as const;

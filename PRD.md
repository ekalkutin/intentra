# Intentra — Product Requirements Document

> Версия: 0.1 (product foundation)  
> Статус: Draft  
> Язык продукта: русский и английский (интерфейс и артефакты локализуемы)

## 1. Краткое описание

Intentra — multitenant SaaS для продуктовых и инженерных команд, который превращает исходное намерение бизнеса в согласованный, проверяемый и пригодный для исполнения план доставки продукта.

Платформа ведёт команду по непрерывной цепочке: **идея → интервью → доменная модель → PRD/ADR → спецификации → epics/stories/tasks → реализация и тесты → обратная связь в требования**. В центре продукта — не генерация документов как самоцель, а *сквозная трассировка*: каждое решение, задача и изменение должны быть связаны с причиной своего существования.

### 1.1. Проблема

Сегодня контекст теряется между discovery, документами, таск-трекером и реализацией. Требования описаны неполно, решения не имеют истории, ИИ-агенты получают фрагментарные вводные и уверенно достраивают неизвестное. После изменения требования команде трудно оценить последствия; после релиза — доказать, что реализовано именно то, что было согласовано.

### 1.2. Продуктовое обещание

**Intentra превращает намерение в agent-ready delivery без потери контекста.**

### 1.3. Целевой «вау»-сценарий

1. Product Manager описывает идею голосом или текстом.
2. Discovery Agent проводит содержательное интервью, отделяет факты от допущений и фиксирует неясности.
3. Платформа формирует domain map, PRD, глоссарий, ADR и реестр рисков.
4. Команда утверждает решения; Intentra создаёт implementation-ready specs, epics, stories, задачи, критерии приёмки и тестовую стратегию.
5. Один клик создаёт handoff package для инженерной команды или coding-agent и синхронизирует задачи с внешним tracker.
6. При изменении бизнес-правила Intentra показывает затронутые спецификации, API-контракты, задачи, тесты и релизы.
7. После поставки платформа сопоставляет реализацию и результаты с исходным намерением и гипотезой.

## 2. Цели и не-цели

### 2.1. Цели

- Сделать discovery структурированным, воспроизводимым и проверяемым.
- Сократить путь от идеи до готового к разработке пакета требований.
- Не допускать скрытых выдумок ИИ: неизвестное должно быть вопросом, риском или явным допущением.
- Сохранить единый контекст для людей и ИИ-агентов на протяжении всего жизненного цикла продукта.
- Дать команде управляемый способ использовать агентов и внешние инструменты.
- Уменьшить стоимость изменения требований через impact analysis и версионирование.
- Поддержать B2B/enterprise-ожидания: tenancy, RBAC, аудит, безопасность и переносимость данных.

### 2.2. Не-цели первого релиза

- Полная замена Jira, Linear, GitHub/GitLab, Confluence или CI/CD.
- Самостоятельный production-deploy агента без отдельно настроенных интеграций и approval flow.
- Генерация кода как основной продуктовый сценарий. Intentra подготавливает контекст и управляет handoff; выполнение может происходить во внешнем coding-agent.
- Непроверяемые «магические» решения архитектора без источников, ограничений и возможности ревью.

## 3. Пользователи и роли

| Персона | Задача | Ценность Intentra |
| --- | --- | --- |
| Founder / Product Lead | Проверить и сформулировать идею | Быстро получить структуру продукта, риски и план проверки гипотезы |
| Product Manager / Analyst | Собрать и согласовать требования | Интервью, PRD, глоссарий, противоречия, traceability |
| Solution Architect / Tech Lead | Принять технические решения | Доменные границы, ADR, NFR, контракты, последствия изменений |
| Developer | Взять задачу в реализацию | Полный контекст, DoD, edge cases, API/data changes, тест-план |
| QA Engineer | Спроектировать проверку | Трассировка требований к сценариям и тестам, coverage gaps |
| Delivery / Engineering Manager | Планировать поставку | Зависимости, критический путь, capacity, риски и готовность релиза |
| Security / Compliance Reviewer | Оценить риски | Доступы агентов, аудит, data classification, privacy и security review |
| AI Agent | Выполнить ограниченную работу | Актуальный контекст, tools/skills, scope, budget и разрешения |

## 4. Термины

| Термин | Определение |
| --- | --- |
| Organization | Изолированный tenant компании или команды-аккаунта. |
| Workspace | Логическая область работы внутри Organization; опциональна для группировки команд/портфелей. |
| Project | Продукт или инициативa с собственными артефактами, участниками, интеграциями и агентами. |
| Artifact | Версионируемый объект знаний: интервью, PRD, ADR, spec, story, тестовый сценарий и т. п. |
| Source / Evidence | Источник утверждения: интервью, документ, интеграция, пользовательская ссылка или агентный вывод. |
| Claim | Проверяемое утверждение, извлечённое из источника. |
| Assumption | Явно отмеченное недоказанное предположение. |
| Open Question | Вопрос, блокирующий или снижающий уверенность в решении. |
| Requirement | Функциональное или нефункциональное требование с owner, статусом и критериями приёмки. |
| Trace | Направленная связь «происходит из», «уточняет», «реализует», «проверяет», «заменяет» между артефактами. |
| Handoff Package | Замороженный набор контекста и инструкций для человека или внешнего агента, исполняющего работу. |

## 5. Продуктовые принципы

1. **Evidence over fluency.** Красивый текст ИИ не равен истине: любое существенное утверждение показывает источник, степень уверенности или помечается как допущение.
2. **Traceability by default.** Артефакты не живут изолированно; связи — часть данных, а не ручная ссылка в тексте.
3. **Human approval at decision points.** ИИ предлагает и объясняет, человек утверждает значимые требования, ADR, доступы и опасные действия.
4. **Structured before prose.** PRD и спецификации собираются из структурированных сущностей, затем представляются как качественный документ.
5. **Progressive disclosure.** Руководитель видит состояние и риски, исполнитель — необходимую глубину контекста.
6. **Interoperability, not lock-in.** Экспорт, API и интеграции должны позволять команде остаться в привычном delivery-ландшафте.
7. **Secure agency.** Агенту выдают ровно тот доступ, контекст и бюджет, которые нужны для его задачи.

## 6. Ключевые пользовательские потоки

### 6.1. Создание проекта и discovery

1. Пользователь создаёт Organization, Project и выбирает шаблон (greenfield, новая feature, modernization, integration, compliance).
2. Он добавляет начальный контекст: идея, ссылки, документы, репозиторий, ограничения, stakeholders.
3. Discovery Agent формирует план интервью и задаёт вопросы по целям, пользователям, границам домена, процессам, данным, ограничениям, рискам и метрикам.
4. Пользователь отвечает асинхронно или в live-интервью; все ответы сохраняются как evidence.
5. Agent строит claims, отмечает conflicts, assumptions и open questions, группирует термины и доменные сущности.
6. Пользователь закрывает вопросы или принимает осознанные допущения; система показывает readiness score.

### 6.2. Согласование PRD и архитектурных решений

1. Intentra генерирует черновики PRD, glossary, domain map, NFR register, risk register и ADR proposals.
2. Пользователи комментируют фрагменты, предлагают изменения, назначают owners и утверждают версии.
3. При утверждении ADR система фиксирует decision, context, alternatives, consequences, constraints и links to evidence.
4. Устаревшие решения не удаляются: они получают статус `superseded` и связь с новым решением.

### 6.3. Переход в delivery

1. Пользователь выбирает утверждённую версию scope.
2. Planning Agent предлагает epics, user stories, technical tasks, зависимости, риски, оценки и критический путь.
3. Для каждой story формируется acceptance criteria, edge cases, DoD, instrumentation, security/privacy checks и тестовые сценарии.
4. Команда редактирует декомпозицию и утверждает export batch.
5. Intentra отправляет сущности во внешний tracker либо публикует webhook-события.

### 6.4. Работа coding-agent / разработчика

1. Исполнитель открывает story или создаёт Handoff Package.
2. Пакет содержит только релевантный, утверждённый контекст: linked requirements, business rules, ADR, data/API changes, UI states, acceptance criteria, test plan и ограничения.
3. При необходимости agent получает одобренные tools, skills, sandbox credentials и лимиты.
4. Результат агентной работы возвращается как evidence: изменения, ссылки на PR, тесты, нерешённые вопросы и журнал действий.

### 6.5. Изменение требования

1. Пользователь меняет claim, requirement или decision.
2. Intentra создаёт новую версию, вычисляет downstream impact и показывает затронутые specs, tasks, контракты, тесты, релизы и интеграционные объекты.
3. Владельцы получают review requests; обновление получает статус до прохождения необходимых approvals.

## 7. Функциональные требования

### 7.1. Tenancy, аккаунты и проекты

- Регистрация, вход, восстановление доступа и инвайты участников.
- Organization как жёсткая граница данных; пользователь может состоять в нескольких организациях.
- Workspace и Project с понятным переключением контекста.
- Создание проекта из шаблона; архивирование вместо безвозвратного удаления по умолчанию.
- Настройки проекта: язык, часовой пояс, доменная область, подключённые источники, политика ИИ, data classification.
- Экспорт данных проекта в машиночитаемом и человекочитаемом форматах.

### 7.2. AI-assisted discovery и DDD

- Чат и при необходимости voice-интерфейс с сохранением транскрипта и согласия на обработку.
- Настраиваемые playbooks интервью: discovery, feature refinement, integration, security review, migration, NFR, compliance.
- Вопросы строятся на основе уже известных фактов и не повторяют подтверждённый контекст.
- Фиксация claims с ссылкой на источник, owner, confidence и статусом валидации.
- Реестр assumptions, conflicts, open questions, decisions, risks и dependencies.
- DDD-выходы: ubiquitous language / glossary, bounded contexts, entities, value objects, aggregates, domain events, commands, policies и context map.
- Возможность редактировать модель вручную; агент не должен быть единственным способом управления доменной моделью.
- Визуальная карта домена и полнотекстовое представление для экспорта.

### 7.3. Артефакты знаний

Система должна поддерживать минимум следующие типы версионируемых артефактов:

- Product brief и discovery notes;
- PRD;
- Glossary;
- Business rules catalogue;
- NFR / quality attributes register;
- ADR;
- Wiki pages;
- User journey и process flow;
- Domain model и context map;
- Functional specification;
- API/event/data contracts;
- UX/UI requirements и состояния интерфейса;
- Analytics/instrumentation plan;
- Security & privacy review;
- Test strategy и test scenarios;
- Release plan / rollback plan;
- Handoff Package.

Для каждого артефакта нужны: статус, version history, автор (человек/агент), timestamps, reviewers, comments, mentions, approvals, source links, tags, экспорт и связи в графе.

### 7.4. PRD

Шаблон PRD должен покрывать:

- проблему, целевую аудиторию и Job To Be Done;
- цели, не-цели и scope boundaries;
- бизнес-ценность, гипотезу и метрики успеха;
- пользовательские сценарии и функциональные требования;
- бизнес-правила и исключения;
- NFR: performance, availability, reliability, scalability, accessibility, localization, observability, security, privacy, retention;
- data requirements и ownership;
- зависимости и интеграции;
- риски, assumptions, open questions и решения;
- rollout, migration, support, rollback;
- acceptance criteria и definition of done;
- traceability links.

### 7.5. ADR и архитектурная работа

- Агент предлагает ADR только при реальном trade-off или необратимом решении; не засоряет проект формальными ADR.
- Структура ADR: context, decision drivers, options, chosen decision, rationale, consequences, risks, validation plan, links.
- Матрица сравнения альтернатив: критерии, оценки, допущения и источники.
- Статусы: proposed, accepted, rejected, deprecated, superseded.
- Возможность создавать ADR вручную и импортировать существующие.

### 7.6. Traceability graph и impact analysis

- Поддерживаемые типы связей: `derived_from`, `refines`, `depends_on`, `decides`, `implements`, `verifies`, `blocks`, `supersedes`, `conflicts_with`, `exports_to`.
- Граф отображается от любого объекта в обе стороны с фильтрацией по типу, статусу и версии.
- Автоматически создаются связи, предложенные агентом; пользователь может подтвердить, изменить или удалить их при наличии прав.
- Изменение утверждённого объекта запускает анализ влияния и формирует review queue.
- Система показывает coverage: требование → story → implementation evidence → test; незакрытые разрывы выделяются.
- Нельзя объявить release-ready при критических незакрытых разрывах без явного override и причины.

### 7.7. Planning: backlog, Kanban и Gantt

- Генерация и ручное создание initiatives, epics, capabilities, user stories, technical tasks, bugs, spikes, milestones и releases.
- Пользовательские stories в формате роли/цели/ценности; acceptance criteria в Given/When/Then или эквивалентной структуре.
- Декомпозиция с отображением причин, зависимостей, блокеров, рисков и trade-offs.
- Kanban-представление с настраиваемыми колонками, WIP limits, фильтрами и swimlanes.
- Timeline/Gantt с зависимостями, milestones, критическим путём, базовым capacity-планированием и оценкой дат.
- Планирование не должно скрывать неопределённость: оценки помечаются как human, agent-proposed или imported.
- Двусторонний статус sync поддерживается только для явно настроенных полей и разрешённых интеграций; конфликт синхронизации требует понятного правила разрешения.

### 7.8. Agent platform

- Каталог готовых агентных ролей: Discovery, Domain Expert, Product Spec Writer, Solution Architect, Security/Privacy Reviewer, QA Strategist, Delivery Planner, Repository Analyst, Release Reviewer.
- Создание custom agents из роли, system instructions, allowed tools/skills, разрешённых источников, модели, budget, approval policy и output schema.
- Агент запускается в контексте Organization/Project/Artifact и получает минимально необходимый scoped context.
- Запуск может быть ручным, событийным или по расписанию (при наличии соответствующей политики).
- Очередь запусков, status, streaming progress, retry policy, cancellation и итоговый report.
- Immutable execution log: prompt/context references, tool calls, approvals, tokens/cost, output artifacts, errors.
- Guardrails: content boundaries, sensitive-data rules, egress policy, rate limits, максимальная стоимость, timeout и stop conditions.
- Агент предлагает dangerous action, но выполняет его только после approval согласно policy.

### 7.9. Tools, skills и credentials

- Подключение tools/skills на уровне Organization, Project или конкретного Agent profile.
- Реестр credential references без отображения секретного значения в UI, prompt, log или экспортируемом артефакте.
- Secrets хранятся во внешнем/встроенном vault с encryption at rest и rotation metadata.
- Доступы к тестовой среде выдаются с ограничением scope, срока действия и действия; production credentials не допускаются политикой по умолчанию.
- Полный audit trail выдачи и использования credential reference.
- Allowlist интеграций, сетевых доменов и tool actions для enterprise-проектов.

### 7.10. Интеграции и API

Первый слой интеграций:

- Outbound webhooks для creation/update/approval/export событий.
- Inbound webhooks с signature verification, idempotency и event log.
- Экспорт в JSON, Markdown, PDF и CSV, где применимо.
- Public API с versioning, OAuth/API keys, rate limits, pagination, auditability и webhook subscriptions.

Приоритетные коннекторы после MVP:

- Jira и Linear — задачи и статусы;
- GitHub/GitLab — repositories, issues, pull requests, checks;
- Slack/Teams — approvals и notifications;
- Notion/Confluence/Google Drive — knowledge import;
- Figma — design references;
- Sentry/Datadog и CI/CD — delivery/quality evidence.

### 7.11. RBAC и governance

Базовые системные роли: Organization Owner, Organization Admin, Workspace Admin, Project Admin, Product Editor, Engineering Editor, Contributor, Reviewer, Viewer, Auditor, Integration Manager, Agent Operator.

RBAC должен поддерживать:

- разрешения на уровне Organization, Workspace, Project, Artifact, Integration и Agent;
- separation of duties для секретов, интеграций и approvals;
- кастомные роли в enterprise-тарифе;
- invite policy, domain allowlist и group-based access в будущем;
- запрет на agent delegation сверх полномочий инициатора;
- аудит чтения чувствительных объектов, изменения ролей, экспортов, approval и agent runs.

### 7.12. Collaboration и notifications

- Comments, mentions, threads, resolved/unresolved state.
- Review requests с дедлайном, owner, напоминанием и решением approve/request changes.
- Notifications в приложении, email и через разрешённые интеграции.
- Настраиваемые подписки: changes to artifact, decision requests, impact alerts, failed agent runs, integration failures.
- Quiet-by-default для несущественных агентных событий; эскалация при блокере, ошибке, завершении или требуемом действии.

### 7.13. Product analytics и validation loop

- Для initiative/feature: hypothesis, target segment, expected outcome, success metric, guardrail metrics и experiment design.
- Intentra предлагает analytics events и свойства как часть спецификации, а не после реализации.
- Release связывается с hypothesis и измерениями результата.
- Dashboard показывает delivery health и product outcome отдельно: «поставили» не равно «достигли ценности».

## 8. Нефункциональные требования

### 8.1. Безопасность и privacy

- Tenant isolation на уровне данных, доступа, поиска, кешей, background jobs и экспортов.
- Encryption in transit и at rest; secrets никогда не попадают в логи.
- Поддержка MFA; roadmap для SSO/SAML и SCIM.
- Иммутабельный audit log с export и retention policy.
- Data classification: public/internal/confidential/restricted; политика использования в agent context.
- Privacy controls: consent, DPA-ready процессы, data deletion/export requests, configurable retention и data residency roadmap.
- OWASP-практики, проверка webhook signatures, защита от prompt injection в импортируемых источниках, content sanitization.
- Возможность отключить использование данных для model training, BYOK/own model endpoint как enterprise-option.

### 8.2. Надёжность и производительность

- Целевой доступный уровень для core app: не ниже 99.9% в коммерческом плане (уточняется SLA).
- Тяжёлые агентные и интеграционные операции выполняются асинхронно и имеют observable status.
- Idempotency для imports, exports, webhooks и external task creation.
- Полнотекстовый поиск и загрузка типового проекта должны оставаться интерактивными; точные SLO фиксируются перед техническим дизайном.
- Резервное копирование, point-in-time recovery, disaster recovery targets и статус-страница должны быть определены до enterprise launch.

### 8.3. UX, доступность и локализация

- WCAG 2.2 AA для основного продукта.
- Полная keyboard navigation, focus management, понятные error states и screen-reader labels.
- Локализация интерфейса и артефактов; Unicode/RTL readiness.
- Временные зоны, форматы дат и locale-aware exports.
- Пользователь всегда видит: кто создал контент, что изменилось, почему агент уверен/не уверен, что требует его решения.

### 8.4. Наблюдаемость

- Structured logs, metrics и traces для приложения, integrations и agent runtime.
- Correlation ID от пользовательского действия до webhook/agent run/export.
- Мониторинг стоимости и latency по model, project, agent profile и organization.
- Alerting для security events, integration failure, job backlog, SLA risk и budget exhaustion.

## 9. Данные и доменная модель верхнего уровня

Основные сущности: `User`, `Organization`, `Membership`, `Workspace`, `Project`, `ProjectTemplate`, `Artifact`, `ArtifactVersion`, `Evidence`, `Claim`, `Requirement`, `Decision`, `Assumption`, `OpenQuestion`, `Risk`, `GlossaryTerm`, `DomainElement`, `TraceLink`, `Comment`, `Approval`, `BacklogItem`, `Dependency`, `Release`, `IntegrationConnection`, `ExternalObjectLink`, `WebhookSubscription`, `AgentProfile`, `AgentRun`, `ToolGrant`, `SecretReference`, `HandoffPackage`, `AuditEvent`, `Notification`.

Инварианты:

- Каждый объект принадлежит ровно одному Organization; Project-scoped данные не должны ссылаться на сущности другого tenant.
- У утверждённого артефакта есть immutable version; редактирование создаёт draft новой версии.
- Значимое утверждение либо имеет evidence, либо явно отмечено как assumption/agent inference.
- TraceLink имеет тип, источник, цель, автора/происхождение, статус валидации и версию.
- SecretReference не содержит секрет и не экспортируется как значение.
- AgentRun сохраняет состав контекста ссылками/версиями, чтобы результат можно было воспроизвести и проверить.

## 10. Состояния и approval workflow

| Объект | Состояния |
| --- | --- |
| Artifact | draft → in_review → approved → superseded/archived |
| Requirement | proposed → clarified → approved → implemented → verified → retired |
| ADR | proposed → accepted/rejected → deprecated/superseded |
| Open Question | open → assigned → answered → resolved/deferred |
| Risk | identified → assessed → mitigated/accepted → closed |
| Agent Run | queued → running → awaiting_approval → completed/failed/cancelled |
| Export Batch | draft → review → approved → exported → sync_error/partially_synced |

Approval policy настраивается по типу проекта и критичности: например, PRD требует Product approval, ADR — Tech Lead approval, security review — Security Reviewer, выдача credentials — Integration Manager плюс Project Admin.

## 11. Метрики успеха

### 11.1. North-star metric

Количество **approved, traceable and implementation-ready delivery packages**, созданных на активный проект за период.

### 11.2. Продуктовые метрики

- Time from project start to approved PRD.
- Time from approved PRD to exported implementation-ready backlog.
- Доля requirements с linked evidence и acceptance criteria.
- Доля stories с полным handoff package.
- Доля critical requirements с тестовой трассировкой.
- Количество и среднее время обработки impact-review после изменения.
- Approval turnaround time.
- Agent suggestion acceptance/edit/rejection rate.
- Активные проекты, weekly active collaborators, retention по организациям.
- Количество повторно используемых agent profiles/templates.

### 11.3. Guardrail metrics

- Ошибочно созданные или дублированные внешние задачи.
- Доля agent outputs, отклонённых из-за недостоверности/галлюцинации.
- Security/privacy incidents и secret exposure incidents (цель: 0).
- Стоимость agent operations на активный проект.
- Sync failure rate и время восстановления.
- Доля пользователями выключенных/игнорируемых notifications.

## 12. MVP

MVP должен доказать ценность «из идеи в готовый к разработке пакет» для одной команды, не пытаясь заменить весь delivery stack.

### 12.1. Входит в MVP

- Organization, Project, базовый RBAC и приглашения.
- Текстовое AI-интервью с evidence, claims, assumptions и open questions.
- PRD, glossary, basic domain model и ADR draft generation.
- Ручное редактирование, comments, review/approval и version history.
- Requirements traceability: requirement ↔ evidence ↔ spec ↔ story ↔ test scenario.
- Генерация epic/story/task с acceptance criteria, DoD, edge cases и тестовыми сценариями.
- Kanban backlog внутри Intentra.
- Handoff Package в Markdown/JSON.
- Outbound webhooks и один приоритетный tracker export (выбрать Jira **или** Linear после customer discovery).
- Базовый audit log и агентные логи.
- Один набор готовых агентных ролей, без произвольного исполнения внешних tools по умолчанию.

### 12.2. Отложить после MVP

- Полноценный Gantt/capacity planning и advanced critical path.
- Двустороннюю синхронизацию со всеми trackers.
- GitHub/GitLab write actions.
- Voice-interview, real-time collaborative editing, SSO/SCIM и BYOK.
- Custom agent marketplace, scheduler и продвинутые sandboxes.
- Автоматическую верификацию code/test coverage через репозиторий.
- Полный enterprise compliance пакет и data residency.

## 13. Поэтапный roadmap

### Phase 0 — Foundation

Мультитенантная модель, auth, RBAC, audit foundation, Project, Artifact/versioning, базовая модель trace links, product templates и observability.

### Phase 1 — Intent to Spec

Discovery Agent, evidence/claims/questions, PRD/glossary/domain model/ADR, review workflows, implementation-ready specs, backlog generation, export/webhook.

### Phase 2 — Delivery Intelligence

Impact analysis, dependency graph, richer Kanban/Gantt, integration sync, release readiness, analytics plan, Handoff Packages для людей и coding-agents.

### Phase 3 — Governed Agent Platform

Custom agents, scoped tools/skills, credentials vault, approvals, sandbox access, agent cost controls, full execution observability.

### Phase 4 — Closed-loop Product Delivery

Repository/CI/test integrations, implementation evidence, spec-to-code/test coverage, release outcome feedback, reusable organization knowledge graph.

## 14. Тарифная логика (гипотеза)

- **Starter:** малые команды, ограниченные проекты/agent credits, базовый export.
- **Team:** несколько проектов, collaboration, integrations, расширенные агентные роли, usage-based AI.
- **Business:** governance, advanced RBAC, audit/export, custom templates, higher limits.
- **Enterprise:** SSO/SCIM, custom retention/data residency, BYOK/private model endpoint, custom roles, SLA, security review и dedicated support.

AI usage должен быть прозрачен: показывать credits/cost/budget до и после запуска, allow organization-level limits и запретить неконтролируемый расход.

## 15. Риски и способы снижения

| Риск | Снижение |
| --- | --- |
| Продукт воспринимается как очередной генератор документов | Делать граф связей, impact analysis и agent-ready handoff центральными сценариями, а не вторичными функциями. |
| Галлюцинации снижают доверие | Evidence links, confidence, explicit assumptions, approval gates и quality checks. |
| Scope превращается в попытку заменить все инструменты | Сначала сильный discovery-to-handoff loop, экспорт и интеграции вместо полного tracker/IDE/CI. |
| Интеграции ненадёжны | Idempotency, sync status, reconciliation, immutable external links и human-visible conflicts. |
| Агент получает опасный доступ | Least privilege, sandbox, expiring grants, vault references, approval policy и audit. |
| Сложная модель перегружает пользователя | Шаблоны, progressive disclosure, role-specific views, defaults и объяснение «что требует решения сейчас». |
| Enterprise блокирует продажи безопасностью | Изолированная tenancy-модель, audit, data controls и roadmap SSO/SCIM/BYOK с самого начала. |
| Документы устаревают после старта разработки | Версионирование, traceability, impact queue и release readiness gates. |

## 16. Открытые решения для customer discovery

Перед фиксацией технического дизайна и pricing необходимо подтвердить:

1. Первичный ICP: startup founders, product teams в scale-ups или enterprise delivery teams.
2. Главный starting workflow: greenfield discovery, новая feature в существующем продукте или handoff в coding-agents.
3. Первый task-tracker для глубокой интеграции: Jira или Linear.
4. Нужны ли локальные/частные model endpoints и требования к data residency уже в early market.
5. Кто покупатель и кто ежедневный пользователь; какие роли участвуют в approval.
6. Какие артефакты команда сегодня считает source of truth и что нельзя ломать при импорте.
7. Какой уровень автономности агента приемлем в типовой компании.

## 17. Критерии готовности первого коммерческого сценария

Intentra готова к пилоту, если команда может на реальном проекте:

1. Собрать контекст через интервью и импорт источников.
2. Получить PRD, глоссарий, минимум одну ADR и список неразрешённых вопросов.
3. Утвердить артефакты с зафиксированной версией и историей решений.
4. Сгенерировать и отредактировать связанный backlog с acceptance criteria и test scenarios.
5. Экспортировать задачи в выбранный tracker без дублей и с видимым статусом синхронизации.
6. Открыть любую story и увидеть источник требования, бизнес-правила, ADR, зависимости и DoD.
7. Изменить требование и увидеть список затронутых downstream-объектов.
8. Просмотреть audit log действий пользователя, интеграции и агента без раскрытия секретов.


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

### 7.2.1. Brownfield onboarding: импорт и исследование существующего продукта

Intentra должна одинаково хорошо работать с новым и существующим продуктом. Для brownfield-сценария пользователь подключает источники, получает проверяемую модель **as-is**, а затем создаёт требования и изменения **to-be** с явным сравнением между ними.

- Read-only подключение GitHub/GitLab с выбором repository, branch/ref, каталогов и allow/deny path rules.
- Импорт Docs/knowledge sources: Markdown, OpenAPI/AsyncAPI, ADR, README, diagrams, Confluence/Notion/Google Drive, task tracker history и при явном разрешении — CI, observability и incident evidence.
- Source snapshot неизменно фиксирует repository/ref/commit SHA, path, line range или document revision, import time, authoring system, classification и freshness. Ссылка на код всегда ведёт к конкретной ревизии, а не к движущейся ветке.
- System Intelligence строит черновую **as-is system map**: services/modules, public APIs, events, data stores, dependencies, ownership signals, workflows, тестовые и operational signals. Любой вывод агента содержит citations и confidence.
- Агент должен различать `observed fact`, `inference` и `approved system model`. Импорт кода не создаёт requirement, ADR или truth без review человека.
- Пользователь может подтвердить, исправить или отклонить элементы as-is модели и зафиксировать `System Model Baseline`.
- При создании feature система строит `as-is → to-be → gap` view: какие модули, контракты, данные, тесты, ADR и delivery items затронуты.
- Incremental sync по webhook/расписанию формирует новую source snapshot и показывает устаревшие evidence/model elements; исторические baselines остаются воспроизводимыми.
- До передачи материала LLM применяется secret scanning, path policy, content size/budget policy и sanitization. Нельзя индексировать secrets, `.env`, ключи, private generated data или запрещённые каталоги.

Первый brownfield vertical slice: GitHub/GitLab read-only import → repository snapshot → citations-based system map → human-reviewed baseline → change-impact/handoff для новой feature. Это важнее, чем попытка сразу написать полноценный code intelligence platform.

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

- ADR — subdomain и изолированный модуль внутри bounded context **Product Definition**. Он использует тот же project context, evidence, requirements, domain constraints и traceability, что PRD и domain model.
- У ADR отдельные владельцы и approval workflow: решения готовят и ревьюят Solution Architect / Tech Lead / Security Reviewer, тогда как PRD и доменную модель ведут Product Manager / Analyst и domain experts. Различие reviewer-а не создаёт отдельный bounded context само по себе.
- Агент предлагает ADR только при реальном trade-off или необратимом решении; не засоряет проект формальными ADR.
- Структура ADR: context, decision drivers, options, chosen decision, rationale, consequences, risks, validation plan, links.
- Матрица сравнения альтернатив: критерии, оценки, допущения и источники.
- Статусы: proposed, accepted, rejected, deprecated, superseded.
- Возможность создавать ADR вручную и импортировать существующие.
- Для `accepted`, `deprecated` и `superseded` ADR обязателен архитектурный reviewer согласно approval policy; Product Manager остаётся stakeholder, но не заменяет техническое approval.

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

### 7.10. MCP Server: внешний доступ агентов к контексту проекта

Intentra предоставляет удалённый MCP Server, через который внешние ИИ-агенты и IDE-клиенты могут безопасно получать актуальный, разрешённый им контекст проекта. MCP — не экспорт всей базы и не обход RBAC: это agent-facing contract поверх доменных контекстов Intentra.

MCP Gateway принадлежит bounded context **Integration Hub**. Он не хранит и не редактирует PRD, ADR или задачи; он проверяет caller identity и scopes, применяет policies, запрашивает разрешённые versioned projections у владельцев данных и фиксирует аудит.

**Read-only MVP capabilities:**

- Resource `project context`: утверждённые PRD, glossary, domain model, ADR, NFR и specifications выбранного Project.
- Resource `as-is system baseline`: human-reviewed system map, source snapshots, public contracts, `SystemDependency` и confidence/citations для существующего продукта.
- Resource `artifact version`: точная immutable версия артефакта, с metadata, status, source citations и classification.
- Resource `handoff package`: минимальный контекст для конкретной story/task или implementation slice.
- Tool `search_project_knowledge`: семантический поиск только в разрешённом Project с цитатами и artifact/version references.
- Tool `get_traceability`: requirement/spec/story/test/ADR links и coverage gaps.
- Tool `get_change_impact`: уже рассчитанный impact assessment для изменённого baseline.

**Безопасность и управление доступом:**

- Внешний агент подключается через OAuth/service account или персональный delegated access; каждый client имеет Organization, Project и explicit read scopes.
- MCP Gateway применяет Organization & Access Control, data classification и policy до выполнения любого resource/tool request; доступ к одному Project не даёт доступ к соседним Project того же tenant.
- По умолчанию MCP доступен только на чтение. Будущие write-tools (`create comment`, `propose requirement`, `create task`) требуют отдельного scope, schema validation, idempotency key и human approval policy.
- Ответы возвращают canonical IDs и pinned artifact versions. Агент не должен неявно получить более новую версию требования во время выполнения задачи.
- Secrets, credential values, скрытые internal notes и restricted evidence никогда не выдаются MCP Server; Gateway возвращает безопасную причину отсутствия доступа без утечки метаданных.
- Каждый request записывается как `McpAccessEvent`: client identity, delegated user при наличии, scopes, ресурсы/версии, результат policy check, latency и correlation ID.
- Импортированные документы считаются untrusted input: они маркируются происхождением, проходят sanitization, а instructions внутри них не становятся командами для MCP-клиента или внутренних агентов.

MCP Server должен поддерживать resource discovery и машиночитаемые capability descriptions, чтобы агент сначала мог понять доступные Project и типы контекста, а затем получить только необходимую проекцию. Предоставляемые prompt templates могут направлять агента на исследование или implementation handoff, но не дают ему дополнительных прав.

### 7.11. Интеграции и API

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

### 7.12. RBAC и governance

Базовые системные роли: Organization Owner, Organization Admin, Workspace Admin, Project Admin, Product Editor, Engineering Editor, Contributor, Reviewer, Viewer, Auditor, Integration Manager, Agent Operator.

RBAC должен поддерживать:

- разрешения на уровне Organization, Workspace, Project, Artifact, Integration и Agent;
- separation of duties для секретов, интеграций и approvals;
- кастомные роли в enterprise-тарифе;
- invite policy, domain allowlist и group-based access в будущем;
- запрет на agent delegation сверх полномочий инициатора;
- аудит чтения чувствительных объектов, изменения ролей, экспортов, approval и agent runs.

### 7.13. Collaboration и notifications

- Comments, mentions, threads, resolved/unresolved state.
- Review requests с дедлайном, owner, напоминанием и решением approve/request changes.
- Notifications в приложении, email и через разрешённые интеграции.
- Настраиваемые подписки: changes to artifact, decision requests, impact alerts, failed agent runs, integration failures.
- Quiet-by-default для несущественных агентных событий; эскалация при блокере, ошибке, завершении или требуемом действии.

### 7.14. Product analytics и validation loop

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
- MCP Gateway использует scoped OAuth/service-account grants, policy enforcement на каждом request, version-pinned responses и отдельный audit trail; write-capabilities выключены по умолчанию.
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

## 9. Bounded contexts и context map

Intentra начинается как **modular monolith** с изолированными доменными модулями и явными контрактами между ними. Bounded context — это граница языка, правил и владения данными, а не требование немедленно выделять отдельный сервис. Целевая карта контекстов закладывается с первого дня; MVP ограничивает глубину функций в каждом контексте, но не смешивает их модели и ownership.

| Bounded context | Владение и ответственность | Не владеет |
| --- | --- | --- |
| **Identity & Account Management** | User, Identity, login method, session, MFA factor, password recovery, consent | Organization, membership, роли и права пользователя в tenant |
| **Organization & Access Control** | Organization, Membership, Team, Role, Permission, Invitation, access policy, tenant boundary | Учётные данные пользователя, бизнес-артефакты, тарифы |
| **Project & Portfolio Management** | Workspace, Portfolio, Project, Project Template, Project Membership, stakeholder assignment, project lifecycle | Содержимое требований, доменную модель, delivery backlog |
| **Knowledge Intake & Evidence** | Source, Import, Document snapshot, Evidence, Extract, source freshness, provenance, data classification | Требование, решение или спецификацию как итоговую истину |
| **System Intelligence** | Repository snapshot, code/document observation, system component, API surface, `SystemDependency`, operational signal, as-is system model and system baseline | Будущее продуктовое требование, план delivery или архитектурное решение как утверждённый выбор |
| **Product Definition** | Discovery Session, Claim, Assumption, Open Question, Requirement, PRD, Glossary, Business Rule, Domain Model, ADR, architectural constraint, NFR, Specification, Acceptance Criteria | Delivery status, внешние задачи, исполнение agent tools |
| **Traceability & Change Intelligence** | Trace Link, Baseline, Coverage Gap, Impact Assessment, Review Queue, change propagation | Семантическое содержимое requirement, ADR, story или test |
| **Delivery Management** | Initiative, Epic, Story, Task, `WorkDependency`, Milestone, Release Plan, Kanban/Gantt, estimate and capacity plan | Изменением утверждённых требований или ADR |
| **Agent Runtime** | Agent Profile, Agent Run, scoped context package, tool grant, approval request, budget, execution log | Пользовательскими identity, постоянными секретами и бизнес-содержимым артефактов |
| **Integration Hub** | Connection, credential reference, webhook, mapping, synchronization, external object link, sync state, MCP Gateway, MCP client grant and MCP access event | Внутренней моделью Jira/Linear/GitHub и source-of-truth сущностями этих систем |
| **Delivery Verification** | Handoff Package, implementation evidence, test evidence, coverage assessment, release readiness, rollback evidence | Редактированием исходных requirements, stories и ADR |
| **Outcome Intelligence** | Product hypothesis, metric definition, instrumentation plan, experiment, outcome measurement | Delivery status как заменой продуктового результата |
| **Governance & Compliance** | Audit event, retention policy, data policy, legal hold, export record, compliance control | Бизнес-состоянием других контекстов; он потребляет их события |
| **Commercial Entitlements** | Customer subscription, plan, seat, AI credit, usage meter, entitlement, invoice reference | Ролями и permissions; план даёт capability, но не право доступа к данным |

`Collaboration`, `Notifications`, `Search`, `File Storage` и `Secrets Vault` начинают как shared/cross-cutting capabilities. Они не владеют жизненным циклом requirement, ADR или story: комментарий лишь ссылается на объект, notification доставляет событие, поиск строит проекцию, vault хранит секрет без бизнес-семантики.

Не все контексты становятся одинаково богатыми в первом релизе. Например, `Commercial Entitlements` может на старте только выдавать feature flags и лимиты, а `Outcome Intelligence` — хранить hypothesis и instrumentation plan. Их границы, имена и контракты остаются самостоятельными с первого дня.

### 9.1. Subdomains внутри Product Definition

Subdomain и bounded context не являются строгой иерархией «один subdomain = один контекст». Subdomain описывает часть предметной области, bounded context — границу единого языка, правил и модели. Один bounded context может осознанно покрывать несколько тесно связанных subdomains.

Для Intentra в `Product Definition` объединены:

1. **Discovery** — sources, evidence, interviews, claims, assumptions и open questions.
2. **Requirements & Product Design** — PRD, user journeys, business rules, goals, risks и NFR.
3. **Domain Design** — glossary, bounded-context map, domain model и policies.
4. **Architecture Decisions** — ADR, alternatives, constraints, технические последствия и architecture review.
5. **Specification Engineering** — functional specs, data/API/event contracts, UI states, acceptance criteria и test scenarios.
6. **Review & Approval** — reviewer policy, решение по versioned artifact и аргументация review.

Все они используют общий ubiquitous language проекта и образуют одну цепочку «evidence → requirement → decision → specification». Модуль `Architecture Decisions` имеет собственные роли и состояния, но не отдельную модель tenant, project, evidence или requirement. `Traceability & Change Intelligence` хранит межконтекстные связи как самостоятельный контекст, не как подмодуль Product Definition.

`Architecture Decisions` становится кандидатом на выделение в самостоятельный bounded context **Architecture Governance** только когда появятся хотя бы два из условий: архитектурные стандарты и ADR переиспользуются между проектами; решения ведёт независимый architecture board; у решений отдельный жизненный цикл/SLA и набор интеграций; либо их модель начинает расходиться с продуктовой моделью.

### 9.2. Принцип интеграции контекстов

- Контексты обмениваются immutable references и доменными событиями, а не редактируют чужие агрегаты.
- Traceability & Change Intelligence получает published versions и события от Product Definition, Delivery Management и Delivery Verification; он не мутирует их объекты.
- Каждый handoff/export фиксирует versioned baseline; иначе связанная story может получить требования, которые изменились после её планирования.
- Внешний task tracker получает проекцию Delivery Management. Он не становится владельцем requirement или ADR.
- Agent Runtime получает explicit context package со ссылками на разрешённые версии артефактов; доступ агента не равен правам инициировавшего пользователя.
- MCP Gateway выдаёт внешнему агенту только policy-approved versioned projections через Integration Hub; он не обходит Organization & Access Control и не является внутренним Agent Runtime.
- Governance & Compliance и Outcome Intelligence потребляют опубликованные события и строят свои записи/проекции; они не добавляют скрытых полей в агрегаты core domains.

### 9.3. Порядок закладки фундамента

Ни один контекст не следует «склеивать ради MVP», но разработку стоит вести вертикальными срезами в таком порядке:

1. **Identity & Account Management**, **Organization & Access Control**, **Project & Portfolio Management**, **Governance & Compliance** — tenancy, authorization, audit и project boundary до первого бизнес-артефакта.
2. **Knowledge Intake & Evidence** и **System Intelligence** — два входа: greenfield получает evidence/interview context, brownfield получает воспроизводимый as-is system baseline.
3. **Product Definition** — первый законченный путь: источник или as-is baseline → интервью → claims → requirements → DDD/ADR → specification.
4. **Traceability & Change Intelligence** — создаётся вместе с Product Definition и System Intelligence, чтобы links и versioned baselines не пришлось восстанавливать задним числом.
5. **Agent Runtime** — управляемый запуск discovery/spec agents с scoped context и approval, без production-доступов.
6. **Delivery Management** и **Delivery Verification** — story/task, handoff, evidence реализации и coverage/release readiness.
7. **Integration Hub** — сначала outbound webhook, read-only MCP Server и один task-tracker; контекст сразу владеет mapping, sync state и внешними agent grants.
8. **Outcome Intelligence** и **Commercial Entitlements** — первые минимальные модели закладываются заранее, а сложные integrations, experimentation и billing automation развиваются после появления реальных пользователей.

## 10. Данные и доменная модель верхнего уровня

Основные сущности: `User`, `Identity`, `Organization`, `Membership`, `Workspace`, `Portfolio`, `Project`, `ProjectTemplate`, `Source`, `Evidence`, `RepositorySnapshot`, `CodeObservation`, `SystemComponent`, `ApiSurface`, `SystemDependency`, `SystemModelBaseline`, `Claim`, `Requirement`, `Decision`, `Assumption`, `OpenQuestion`, `Risk`, `GlossaryTerm`, `DomainElement`, `Specification`, `TraceLink`, `Baseline`, `ImpactAssessment`, `Comment`, `Approval`, `BacklogItem`, `WorkDependency`, `Release`, `HandoffPackage`, `VerificationEvidence`, `OutcomeHypothesis`, `MetricDefinition`, `IntegrationConnection`, `ExternalObjectLink`, `WebhookSubscription`, `McpClientGrant`, `McpAccessEvent`, `AgentProfile`, `AgentRun`, `ToolGrant`, `SecretReference`, `AuditEvent`, `Entitlement`, `UsageMeter`.

Инварианты:

- Каждый объект принадлежит ровно одному Organization; Project-scoped данные не должны ссылаться на сущности другого tenant.
- У утверждённого артефакта есть immutable version; редактирование создаёт draft новой версии.
- Значимое утверждение либо имеет evidence, либо явно отмечено как assumption/agent inference.
- Элемент as-is system model ссылается на immutable source snapshot и имеет тип `observed`, `inferred` или `approved`; import не создаёт утверждённый product/architecture artifact автоматически.
- TraceLink имеет тип, источник, цель, автора/происхождение, статус валидации и версию.
- SecretReference не содержит секрет и не экспортируется как значение.
- AgentRun сохраняет состав контекста ссылками/версиями, чтобы результат можно было воспроизвести и проверить.

## 11. Состояния и approval workflow

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

## 12. Метрики успеха

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

## 13. MVP

MVP должен доказать ценность «из идеи в готовый к разработке пакет» для одной команды, не пытаясь заменить весь delivery stack.

### 13.1. Входит в MVP

- Organization, Project, базовый RBAC и приглашения.
- Текстовое AI-интервью с evidence, claims, assumptions и open questions.
- GitHub/GitLab read-only import, immutable repository snapshot и citations-based as-is system map с human-reviewed baseline.
- PRD, glossary, basic domain model и ADR draft generation.
- Ручное редактирование, comments, review/approval и version history.
- Requirements traceability: requirement ↔ evidence ↔ spec ↔ story ↔ test scenario.
- Генерация epic/story/task с acceptance criteria, DoD, edge cases и тестовыми сценариями.
- Kanban backlog внутри Intentra.
- Handoff Package в Markdown/JSON.
- Read-only MCP Server с project-scoped доступом к утверждённым артефактам, handoff packages и traceability.
- Outbound webhooks и один приоритетный tracker export (выбрать Jira **или** Linear после customer discovery).
- Базовый audit log и агентные логи.
- Один набор готовых агентных ролей, без произвольного исполнения внешних tools по умолчанию.

### 13.2. Отложить после MVP

- Полноценный Gantt/capacity planning и advanced critical path.
- Двустороннюю синхронизацию со всеми trackers.
- GitHub/GitLab write actions.
- Voice-interview, real-time collaborative editing, SSO/SCIM и BYOK.
- Custom agent marketplace, scheduler и продвинутые sandboxes.
- Автоматическую верификацию code/test coverage через репозиторий.
- Полный enterprise compliance пакет и data residency.

## 14. Поэтапный roadmap

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

## 15. Тарифная логика (гипотеза)

- **Starter:** малые команды, ограниченные проекты/agent credits, базовый export.
- **Team:** несколько проектов, collaboration, integrations, расширенные агентные роли, usage-based AI.
- **Business:** governance, advanced RBAC, audit/export, custom templates, higher limits.
- **Enterprise:** SSO/SCIM, custom retention/data residency, BYOK/private model endpoint, custom roles, SLA, security review и dedicated support.

AI usage должен быть прозрачен: показывать credits/cost/budget до и после запуска, allow organization-level limits и запретить неконтролируемый расход.

## 16. Риски и способы снижения

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

## 17. Открытые решения для customer discovery

Перед фиксацией технического дизайна и pricing необходимо подтвердить:

1. Первичный ICP: startup founders, product teams в scale-ups или enterprise delivery teams.
2. Главный starting workflow: greenfield discovery, новая feature в существующем продукте или handoff в coding-agents.
3. Первый task-tracker для глубокой интеграции: Jira или Linear.
4. Нужны ли локальные/частные model endpoints и требования к data residency уже в early market.
5. Кто покупатель и кто ежедневный пользователь; какие роли участвуют в approval.
6. Какие артефакты команда сегодня считает source of truth и что нельзя ломать при импорте.
7. Какой уровень автономности агента приемлем в типовой компании.

## 18. Критерии готовности первого коммерческого сценария

Intentra готова к пилоту, если команда может на реальном проекте:

1. Собрать контекст через интервью и импорт источников.
2. Получить PRD, глоссарий, минимум одну ADR и список неразрешённых вопросов.
3. Утвердить артефакты с зафиксированной версией и историей решений.
4. Сгенерировать и отредактировать связанный backlog с acceptance criteria и test scenarios.
5. Экспортировать задачи в выбранный tracker без дублей и с видимым статусом синхронизации.
6. Открыть любую story и увидеть источник требования, бизнес-правила, ADR, зависимости и DoD.
7. Изменить требование и увидеть список затронутых downstream-объектов.
8. Просмотреть audit log действий пользователя, интеграции и агента без раскрытия секретов.

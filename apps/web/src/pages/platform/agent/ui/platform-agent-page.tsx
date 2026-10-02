import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router';

import {
  changeKinds,
  useAgentsChangesQuery,
  useAgentToolsQuery,
  useUnpublishedAgentsQuery,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import {
  PLATFORM_PAGES,
  PLATFORM_SEARCH_PARAMS,
  platformPath,
  ROUTE_PARAMS,
} from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  BackLink,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';
import { AgentRoleDtoSchema } from '@intentra/contracts/workspace';

import { agentValues, emptyAgent } from '../model/agent-form';

import { AgentForm } from './agent-form';

/** Creates an Agent of a role (`agents/new?role=…`) or edits one (`agents/:agentId`). */
export function PlatformAgentPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const agentId = useParams()[ROUTE_PARAMS.agentId] ?? null;
  const [params] = useSearchParams();
  const unpublished = useUnpublishedAgentsQuery();
  const tools = useAgentToolsQuery();
  const { data: changes } = useAgentsChangesQuery();
  const back = {
    to: platformPath(PLATFORM_PAGES.agents),
    label: t('platformAgent.back'),
  };
  const error = toApiError(unpublished.error ?? tools.error);
  const content = unpublished.data?.content;

  const refusal = (title: string, description: string) => (
    <Page>
      <BackLink {...back} />
      <PageHeader title={title} description={description} />
    </Page>
  );

  if (error) {
    return (
      <Page>
        <BackLink {...back} />
        <LoadError
          text={describeError(error).text}
          onRetry={() => {
            void unpublished.refetch();
            void tools.refetch();
          }}
        />
      </Page>
    );
  }
  if (!content || !tools.data) {
    return <PageSkeleton />;
  }

  if (agentId) {
    const agent = content.agents.find(candidate => candidate.id === agentId);
    if (!agent) {
      return refusal(
        t('platformAgent.missing'),
        t('platformAgent.missingHint'),
      );
    }
    return (
      <AgentForm
        key={agent.id}
        back={back}
        role={agent.role}
        agent={agent}
        initial={agentValues(agent)}
        content={content}
        tools={tools.data}
        changeKind={changeKinds(changes?.agents).get(agent.id) ?? null}
      />
    );
  }

  const role = AgentRoleDtoSchema.safeParse(
    params.get(PLATFORM_SEARCH_PARAMS.role),
  );
  if (!role.success) {
    return refusal(
      t('platformAgent.titleNew', { role: t('platform.pages.agents') }),
      t('platformAgent.unknownRole'),
    );
  }
  // Intentra and the Auditor are one each.
  const exists = content.agents.some(agent => agent.role === role.data);
  if (role.data !== AgentRoleDtoSchema.enum.specialist && exists) {
    return refusal(
      t('platformAgent.titleNew', { role: t(`platform.roles.${role.data}`) }),
      t(`platformAgent.exists.${role.data}`),
    );
  }

  return (
    <AgentForm
      key={role.data}
      back={back}
      role={role.data}
      agent={null}
      initial={emptyAgent(content.modelProfiles.map(profile => profile.id))}
      content={content}
      tools={tools.data}
      changeKind={null}
    />
  );
}

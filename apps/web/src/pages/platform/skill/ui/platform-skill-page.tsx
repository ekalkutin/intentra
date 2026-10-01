import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import {
  changeKinds,
  useAgentsChangesQuery,
  useUnpublishedAgentsQuery,
} from '@/entities/platform-agent';
import { toApiError } from '@/shared/api';
import { PLATFORM_PAGES, platformPath, ROUTE_PARAMS } from '@/shared/config';
import { useDescribeError } from '@/shared/i18n';
import {
  BackLink,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
} from '@/shared/ui';

import { EMPTY_SKILL, skillValues } from '../model/skill-form';

import { SkillForm } from './skill-form';

/** Creates a Skill (`skills/new`) or edits one (`skills/:skillId`). */
export function PlatformSkillPage() {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const skillId = useParams()[ROUTE_PARAMS.skillId] ?? null;
  const unpublished = useUnpublishedAgentsQuery();
  const { data: changes } = useAgentsChangesQuery();
  const back = {
    to: platformPath(PLATFORM_PAGES.skills),
    label: t('platformSkill.back'),
  };
  const error = toApiError(unpublished.error);
  const content = unpublished.data?.content;

  if (error) {
    return (
      <Page>
        <BackLink {...back} />
        <LoadError
          text={describeError(error).text}
          onRetry={() => void unpublished.refetch()}
        />
      </Page>
    );
  }
  if (!content) {
    return <PageSkeleton />;
  }
  if (!skillId) {
    return (
      <SkillForm
        back={back}
        skill={null}
        initial={EMPTY_SKILL}
        agents={content.agents}
        changeKind={null}
      />
    );
  }
  const skill = content.skills.find(candidate => candidate.id === skillId);
  if (!skill) {
    return (
      <Page>
        <BackLink {...back} />
        <PageHeader
          title={t('platformSkill.missing')}
          description={t('platformSkill.missingHint')}
        />
      </Page>
    );
  }

  return (
    <SkillForm
      key={skill.id}
      back={back}
      skill={skill}
      initial={skillValues(skill)}
      agents={content.agents}
      changeKind={changeKinds(changes?.skills).get(skill.id) ?? null}
    />
  );
}

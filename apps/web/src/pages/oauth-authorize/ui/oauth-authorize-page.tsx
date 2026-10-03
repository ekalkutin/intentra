import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { useMeQuery } from '@/entities/session';
import {
  onlyWorkspaceId,
  useWorkspacesQuery,
  WorkspaceSelect,
} from '@/entities/workspace';
import { toApiError } from '@/shared/api';
import { useDescribeError } from '@/shared/i18n';
import {
  Alert,
  AlertDescription,
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  InitialTile,
  LoadError,
  Page,
  PageHeader,
  PageSkeleton,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
} from '@/shared/ui';
import { CoverFrame } from '@/widgets/app-shell';
import type { OAuthClientDto } from '@intentra/contracts/oauth';
import {
  ProjectRoleDtoSchema,
  type CreatePersonalAccessTokenDto,
  type ProjectRoleDto,
} from '@intentra/contracts/workspace';

import {
  useAuthorizeOAuthClientMutation,
  useAuthorizingClientQuery,
} from '../api/oauth-api';
import {
  errorRedirectUrl,
  readAuthorizationRequest,
  requestedWorkspaceSlug,
  requestProblem,
  type AuthorizationRequest,
} from '../model/authorization-request';

type Lifetime = CreatePersonalAccessTokenDto['lifetimeDays'];

const LIFETIMES = [
  { value: 30, labelKey: 'days30' },
  { value: 90, labelKey: 'days90' },
  { value: 365, labelKey: 'days365' },
  { value: null, labelKey: 'never' },
] as const satisfies readonly { value: Lifetime; labelKey: string }[];

/**
 * OAuth's consent step for MCP clients such as ChatGPT: the person picks a
 * Workspace, a level and a lifetime, and the client gets a Personal Access
 * Token of theirs. A client that connects to a Workspace's own MCP address
 * gets that Workspace, with nothing to pick. Nothing is sent back to the
 * client until the server has confirmed the redirect URI is one the client
 * registered.
 */
export function OAuthAuthorizePage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const request = readAuthorizationRequest(params);

  return (
    <CoverFrame>
      {request ? (
        <VerifiedRequest request={request} />
      ) : (
        <Problem text={t('oauthAuthorize.malformed')} />
      )}
    </CoverFrame>
  );
}

function VerifiedRequest({
  request,
}: {
  readonly request: AuthorizationRequest;
}) {
  const describeError = useDescribeError();
  const client = useAuthorizingClientQuery({
    clientId: request.clientId,
    redirectUri: request.redirectUri,
  });
  const problem = client.data ? requestProblem(request) : null;

  useEffect(() => {
    if (problem) {
      window.location.replace(errorRedirectUrl(request, problem));
    }
  }, [problem, request]);

  const error = toApiError(client.error);
  if (error) {
    return <Problem text={describeError(error).text} />;
  }
  if (!client.data || problem) {
    return <PageSkeleton />;
  }

  return <Consent request={request} client={client.data} />;
}

function Consent({
  request,
  client,
}: {
  readonly request: AuthorizationRequest;
  readonly client: OAuthClientDto;
}) {
  const { t } = useTranslation();
  const describeError = useDescribeError();
  const { data: me } = useMeQuery();
  const workspaces = useWorkspacesQuery();
  const workspacesError = toApiError(workspaces.error);
  const [authorize, { isLoading }] = useAuthorizeOAuthClientMutation();
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [level, setLevel] = useState<ProjectRoleDto>(
    ProjectRoleDtoSchema.enum.contributor,
  );
  const [lifetimeDays, setLifetimeDays] = useState<Lifetime>(90);
  const [failure, setFailure] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const requestedSlug = requestedWorkspaceSlug(request);
  const requestedWorkspace =
    requestedSlug === null
      ? null
      : (workspaces.data?.find(workspace => workspace.slug === requestedSlug) ??
        null);
  const chosenWorkspace =
    requestedSlug === null
      ? (workspaceId ?? onlyWorkspaceId(workspaces.data))
      : (requestedWorkspace?.id ?? null);
  const levels = ProjectRoleDtoSchema.options.map(value => ({
    value,
    label: t(`projectRoles.${value}`),
  }));
  const lifetimes = LIFETIMES.map(lifetime => ({
    value: lifetime.value,
    label: t(`lifetimes.${lifetime.labelKey}`),
  }));

  const deny = () => {
    setLeaving(true);
    window.location.assign(errorRedirectUrl(request, 'access_denied'));
  };

  const allow = async () => {
    if (!chosenWorkspace || !request.codeChallenge) {
      return;
    }
    setFailure(null);
    const result = await authorize({
      clientId: request.clientId,
      redirectUri: request.redirectUri,
      codeChallenge: request.codeChallenge,
      codeChallengeMethod: 'S256',
      ...(request.state !== null && { state: request.state }),
      workspaceId: chosenWorkspace,
      level,
      lifetimeDays,
    });
    const error = toApiError(result.error);
    if (error || !result.data) {
      setFailure(error ? describeError(error).text : t('errors.fallback'));
      return;
    }
    setLeaving(true);
    window.location.assign(result.data.redirectUrl);
  };

  const busy = isLoading || leaving;

  return (
    <Page className='max-w-md pt-[12vh]'>
      <PageHeader
        title={t('oauthAuthorize.title', { client: client.name })}
        description={
          me
            ? t('oauthAuthorize.descriptionAs', {
                host: client.redirectHost,
                email: me.email,
              })
            : t('oauthAuthorize.description', { host: client.redirectHost })
        }
      />
      <FieldGroup>
        <Field>
          <FieldLabel>{t('oauthAuthorize.workspace')}</FieldLabel>
          {workspaces.isLoading ? (
            <Skeleton className='h-8 w-full' />
          ) : workspacesError ? (
            <LoadError
              text={describeError(workspacesError).text}
              onRetry={() => void workspaces.refetch()}
            />
          ) : workspaces.data?.length === 0 ? (
            <FieldDescription>
              {t('oauthAuthorize.noWorkspaces')}
            </FieldDescription>
          ) : requestedSlug !== null && !requestedWorkspace ? (
            <FieldDescription>
              {t('oauthAuthorize.notInWorkspace', { slug: requestedSlug })}
            </FieldDescription>
          ) : requestedWorkspace ? (
            // Named by the address the agent connects to: shown, not offered.
            <p className='flex h-8 items-center gap-2 rounded-lg border border-input bg-muted/50 pr-2.5 pl-2 text-sm'>
              <InitialTile name={requestedWorkspace.name} />
              <span className='min-w-0 flex-1 truncate'>
                {requestedWorkspace.name}
              </span>
              <Lock aria-hidden className='size-3.5 text-muted-foreground' />
            </p>
          ) : (
            <WorkspaceSelect
              workspaces={workspaces.data ?? []}
              value={chosenWorkspace}
              onValueChange={setWorkspaceId}
            />
          )}
          {requestedWorkspace && (
            <FieldDescription>
              {t('oauthAuthorize.workspaceFromAddress')}
            </FieldDescription>
          )}
        </Field>
        <Field>
          <FieldLabel>{t('tokens.level')}</FieldLabel>
          <Select
            items={levels}
            value={level}
            onValueChange={value => value && setLevel(value)}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map(item => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>{t(`projectRoles.${level}Hint`)}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel>{t('tokens.lifetime')}</FieldLabel>
          <Select
            items={lifetimes}
            value={lifetimeDays}
            onValueChange={setLifetimeDays}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lifetimes.map(lifetime => (
                <SelectItem key={lifetime.label} value={lifetime.value}>
                  {lifetime.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>{t('oauthAuthorize.tokenHint')}</FieldDescription>
        </Field>
        {failure && (
          <Alert variant='destructive'>
            <AlertDescription>{failure}</AlertDescription>
          </Alert>
        )}
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <Button variant='ghost' disabled={busy} onClick={deny}>
            {t('oauthAuthorize.deny')}
          </Button>
          <Button disabled={busy || !chosenWorkspace} onClick={allow}>
            {busy && <Spinner />}
            {t('oauthAuthorize.allow')}
          </Button>
        </div>
      </FieldGroup>
    </Page>
  );
}

function Problem({ text }: { readonly text: string }) {
  const { t } = useTranslation();

  return (
    <Page className='max-w-md pt-[12vh]'>
      <PageHeader title={t('oauthAuthorize.problemTitle')} description={text} />
    </Page>
  );
}

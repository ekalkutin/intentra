export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Account = {
  __typename?: 'Account';
  displayName?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type AgentProfile = {
  __typename?: 'AgentProfile';
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  instructions: Scalars['String']['output'];
  model: Scalars['String']['output'];
  name: Scalars['String']['output'];
  role: Scalars['String']['output'];
  tools: Array<Scalars['String']['output']>;
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type AgentTool = {
  __typename?: 'AgentTool';
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type ChangePasswordInput = {
  currentPassword: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
};

export type CreateAgentProfileInput = {
  description: Scalars['String']['input'];
  instructions: Scalars['String']['input'];
  model: Scalars['String']['input'];
  name: Scalars['String']['input'];
  tools?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type CreatePersonalAccessTokenInput = {
  expiresInDays?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
};

export type CreateProjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateWorkspaceInput = {
  alias: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type CreatedPersonalAccessToken = {
  __typename?: 'CreatedPersonalAccessToken';
  personalAccessToken: PersonalAccessToken;
  token: Scalars['String']['output'];
};

export type Model = {
  __typename?: 'Model';
  contextLength?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  changePassword: Scalars['Boolean']['output'];
  createAgentProfile: AgentProfile;
  createPersonalAccessToken: CreatedPersonalAccessToken;
  createProject: Project;
  createWorkspace: Workspace;
  deleteAgentProfile: Scalars['Boolean']['output'];
  refresh: Tokens;
  removeOpenRouterKey: Scalars['Boolean']['output'];
  revokePersonalAccessToken: Scalars['Boolean']['output'];
  setOpenRouterKey: OpenRouterKey;
  signIn: Tokens;
  signUp: Tokens;
  updateAccount: Account;
  updateAgentProfile: AgentProfile;
  updateWorkspace: Workspace;
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateAgentProfileArgs = {
  input: CreateAgentProfileInput;
  workspaceId: Scalars['ID']['input'];
};


export type MutationCreatePersonalAccessTokenArgs = {
  input: CreatePersonalAccessTokenInput;
};


export type MutationCreateProjectArgs = {
  input: CreateProjectInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteAgentProfileArgs = {
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type MutationRefreshArgs = {
  input: RefreshInput;
};


export type MutationRemoveOpenRouterKeyArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type MutationRevokePersonalAccessTokenArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSetOpenRouterKeyArgs = {
  input: SetOpenRouterKeyInput;
  workspaceId: Scalars['ID']['input'];
};


export type MutationSignInArgs = {
  input: SignInInput;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationUpdateAccountArgs = {
  input: UpdateAccountInput;
};


export type MutationUpdateAgentProfileArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAgentProfileInput;
  workspaceId: Scalars['ID']['input'];
};


export type MutationUpdateWorkspaceArgs = {
  id: Scalars['ID']['input'];
  input: UpdateWorkspaceInput;
};

export type OpenRouterKey = {
  __typename?: 'OpenRouterKey';
  hint: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type PersonalAccessToken = {
  __typename?: 'PersonalAccessToken';
  createdAt: Scalars['String']['output'];
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  revokedAt?: Maybe<Scalars['String']['output']>;
};

export type Project = {
  __typename?: 'Project';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type Query = {
  __typename?: 'Query';
  agentProfile: AgentProfile;
  agentProfiles: Array<AgentProfile>;
  agentTools: Array<AgentTool>;
  me: Account;
  models: Array<Model>;
  openRouterKey?: Maybe<OpenRouterKey>;
  personalAccessTokens: Array<PersonalAccessToken>;
  projects: Array<Project>;
  workspaces: Array<Workspace>;
};


export type QueryAgentProfileArgs = {
  id: Scalars['ID']['input'];
  workspaceId: Scalars['ID']['input'];
};


export type QueryAgentProfilesArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryOpenRouterKeyArgs = {
  workspaceId: Scalars['ID']['input'];
};

export type RefreshInput = {
  refreshToken: Scalars['String']['input'];
};

export type SetOpenRouterKeyInput = {
  apiKey: Scalars['String']['input'];
};

export type SignInInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SignUpInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Tokens = {
  __typename?: 'Tokens';
  accessToken: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
};

export type UpdateAccountInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateAgentProfileInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  tools?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type UpdateWorkspaceInput = {
  name: Scalars['String']['input'];
};

export type Workspace = {
  __typename?: 'Workspace';
  alias: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  memberIds: Array<Scalars['ID']['output']>;
  members: Array<Account>;
  name: Scalars['String']['output'];
};

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
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type AgentProfile = {
  __typename?: 'AgentProfile';
  id: Scalars['ID']['output'];
  instructions: Scalars['String']['output'];
  model: ModelRef;
  name: Scalars['String']['output'];
  tools: Array<Scalars['String']['output']>;
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['ID']['output'];
};

export type CreateAgentProfileInput = {
  instructions: Scalars['String']['input'];
  model: ModelRefInput;
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
  name: Scalars['String']['input'];
};

export type CreatedPersonalAccessToken = {
  __typename?: 'CreatedPersonalAccessToken';
  personalAccessToken: PersonalAccessToken;
  token: Scalars['String']['output'];
};

export type ModelRef = {
  __typename?: 'ModelRef';
  name: Scalars['String']['output'];
  provider: Scalars['String']['output'];
};

export type ModelRefInput = {
  name: Scalars['String']['input'];
  provider: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAgentProfile: AgentProfile;
  createPersonalAccessToken: CreatedPersonalAccessToken;
  createProject: Project;
  createWorkspace: Workspace;
  deleteAgentProfile: Scalars['Boolean']['output'];
  refresh: Tokens;
  revokePersonalAccessToken: Scalars['Boolean']['output'];
  signIn: Tokens;
  signUp: Tokens;
  updateAgentProfile: AgentProfile;
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


export type MutationRevokePersonalAccessTokenArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSignInArgs = {
  input: SignInInput;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationUpdateAgentProfileArgs = {
  id: Scalars['ID']['input'];
  input: UpdateAgentProfileInput;
  workspaceId: Scalars['ID']['input'];
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
  me: Account;
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

export type RefreshInput = {
  refreshToken: Scalars['String']['input'];
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

export type UpdateAgentProfileInput = {
  instructions?: InputMaybe<Scalars['String']['input']>;
  model?: InputMaybe<ModelRefInput>;
  name?: InputMaybe<Scalars['String']['input']>;
  tools?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Workspace = {
  __typename?: 'Workspace';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

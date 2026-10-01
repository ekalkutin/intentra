import { HttpStatus } from '@nestjs/common';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { GatewayModule } from '@intentra/gateway';
import { IamModule } from '@intentra/iam';
import { TestingApp } from '@intentra/platform-testing';
import { WorkspaceModule } from '@intentra/workspace';

const SIGN_UP_PATH = '/api/iam/auth/sign-up';
const SIGN_IN_PATH = '/api/iam/auth/sign-in';
const AGENTS_PATH = '/api/platform/agents';
const UNPUBLISHED_PATH = `${AGENTS_PATH}/unpublished`;
const VERSIONS_PATH = `${AGENTS_PATH}/versions`;

const FIRST_MODEL_ID = 'openrouter/anthropic/claude-sonnet-5';

describe('/api/platform/agents', () => {
  let app: TestingApp;
  /** The Platform Admin's; an access token keeps working after its Account is cleared away. */
  let admin: string;

  const adminCredentials = {
    email: 'admin@example.com',
    password: 'correct-horse-battery-staple',
  };

  beforeAll(async () => {
    app = await TestingApp.create({
      imports: [
        GatewayModule.register({
          contexts: [
            IamModule.register({
              accessTokenSecret: 'test-access-secret',
              refreshTokenSecret: 'test-refresh-secret',
              accessTokenTtlSeconds: 900,
              refreshTokenTtlSeconds: 604800,
              platformAdmin: adminCredentials,
            }),
            WorkspaceModule.register({
              agents: { firstModelId: FIRST_MODEL_ID },
            }),
          ],
        }),
      ],
    });
    const signedIn = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(adminCredentials)
      .expect(HttpStatus.OK);
    admin = `Bearer ${signedIn.body.accessToken}`;
  });

  afterEach(() => app.clearDatabase());

  afterAll(() => app?.close());

  async function signUp(email: string): Promise<string> {
    const credentials = { email, password: 'correct-horse-battery-staple' };
    await app.request().post(SIGN_UP_PATH).send(credentials);
    const response = await app
      .request()
      .post(SIGN_IN_PATH)
      .send(credentials)
      .expect(HttpStatus.OK);

    return `Bearer ${response.body.accessToken}`;
  }

  function get(path: string) {
    return app.request().get(path).set('Authorization', admin);
  }

  function post(path: string, body: object) {
    return app.request().post(path).set('Authorization', admin).send(body);
  }

  function put(path: string, body: object) {
    return app.request().put(path).set('Authorization', admin).send(body);
  }

  async function getUnpublished() {
    const response = await get(UNPUBLISHED_PATH).expect(HttpStatus.OK);

    return response.body;
  }

  async function createModelProfile(name: string): Promise<string> {
    const response = await post(`${UNPUBLISHED_PATH}/model-profiles`, {
      name,
      modelId: 'openrouter/google/gemini-3-flash',
      temperature: 0.2,
    }).expect(HttpStatus.CREATED);

    return response.body.id;
  }

  async function createSpecialist(modelProfileId: string): Promise<string> {
    const response = await post(`${UNPUBLISHED_PATH}/agents`, {
      name: 'Analyst',
      description: 'Digs into requirements',
      instructions: 'Find the gaps.',
      tools: ['list_knowledge'],
      skillIds: [],
      modelProfileId,
    }).expect(HttpStatus.CREATED);

    return response.body.id;
  }

  describe('access', () => {
    it('refuses a request without a token', async () => {
      // Act
      const response = await app.request().get(UNPUBLISHED_PATH);

      // Assert
      expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('refuses an Account that is not a Platform Admin', async () => {
      // Arrange
      const ada = await signUp('ada@example.com');

      // Act
      const response = await app
        .request()
        .get(UNPUBLISHED_PATH)
        .set('Authorization', ada);

      // Assert
      expect(response.status).toBe(HttpStatus.FORBIDDEN);
      expect(response.body.code).toBe('NOT_PLATFORM_ADMIN');
    });
  });

  describe('Agents Version 1', () => {
    it('is made from the code: the Orchestrator with every tool, on the configured model', async () => {
      // Act
      const unpublished = await getUnpublished();

      // Assert
      expect(unpublished.publishedNumber).toBe(1);
      expect(unpublished.content.agents).toEqual([
        expect.objectContaining({
          role: 'orchestrator',
          name: 'Orchestrator',
          instructions: expect.stringContaining('Interview the person'),
          tools: expect.arrayContaining(['list_knowledge', 'offer_choices']),
          skillIds: [],
          specialistIds: [],
        }),
      ]);
      expect(unpublished.content.modelProfiles).toEqual([
        expect.objectContaining({ name: 'Default', modelId: FIRST_MODEL_ID }),
      ]);
      const versions = await get(VERSIONS_PATH).expect(HttpStatus.OK);
      expect(versions.body).toEqual([
        {
          number: 1,
          note: null,
          publishedByEmail: null,
          publishedAt: expect.any(String),
        },
      ]);
    });
  });

  describe('tools', () => {
    it('lists the code catalog, telling which tools only read', async () => {
      // Act
      const response = await get(`${AGENTS_PATH}/tools`);

      // Assert
      expect(response.status).toBe(HttpStatus.OK);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'list_knowledge', readOnly: true }),
          expect.objectContaining({ id: 'record_goal', readOnly: false }),
        ]),
      );
    });
  });

  describe('editing and publishing', () => {
    it('publishes the edits as Agents Version 2, listing the changes first', async () => {
      // Arrange
      const fastId = await createModelProfile('Fast');
      const skill = await post(`${UNPUBLISHED_PATH}/skills`, {
        name: 'intentra-interviewing',
        description: 'When interviewing a person',
        instructions: 'Ask one question at a time.',
      }).expect(HttpStatus.CREATED);
      const analystId = await createSpecialist(fastId);
      const { content } = await getUnpublished();
      const orchestrator = content.agents[0];
      await put(`${UNPUBLISHED_PATH}/agents/${orchestrator.id}`, {
        ...orchestrator,
        skillIds: [skill.body.id],
        specialistIds: [analystId],
      }).expect(HttpStatus.OK);
      const changes = await get(`${UNPUBLISHED_PATH}/changes`).expect(
        HttpStatus.OK,
      );

      // Act
      const response = await post(VERSIONS_PATH, { note: 'An Analyst' });

      // Assert
      expect(changes.body).toEqual({
        agents: [
          {
            id: orchestrator.id,
            name: 'Orchestrator',
            kind: 'changed',
            fields: ['skillIds', 'specialistIds'],
          },
          { id: analystId, name: 'Analyst', kind: 'added', fields: [] },
        ],
        skills: [
          {
            id: skill.body.id,
            name: 'intentra-interviewing',
            kind: 'added',
            fields: [],
          },
        ],
        modelProfiles: [
          { id: fastId, name: 'Fast', kind: 'added', fields: [] },
        ],
      });
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body).toEqual({
        number: 2,
        note: 'An Analyst',
        publishedByEmail: adminCredentials.email,
        publishedAt: expect.any(String),
      });
      const after = await get(`${UNPUBLISHED_PATH}/changes`);
      expect(after.body).toEqual({ agents: [], skills: [], modelProfiles: [] });
      const versions = await get(VERSIONS_PATH);
      expect(
        versions.body.map((version: { number: number }) => version.number),
      ).toEqual([2, 1]);
    });

    it('refuses to publish when nothing changed', async () => {
      // Act
      const response = await post(VERSIONS_PATH, {});

      // Assert
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.code).toBe('AGENTS_UNCHANGED');
    });

    it('refuses to delete a Model Profile an Agent is on, naming the Agent', async () => {
      // Arrange
      const fastId = await createModelProfile('Fast');
      await createSpecialist(fastId);

      // Act
      const response = await app
        .request()
        .delete(`${UNPUBLISHED_PATH}/model-profiles/${fastId}`)
        .set('Authorization', admin);

      // Assert
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body).toMatchObject({
        code: 'MODEL_PROFILE_IN_USE',
        message: expect.stringContaining('Analyst'),
      });
    });

    it('refuses a tool the code does not have', async () => {
      // Arrange
      const { content } = await getUnpublished();

      // Act
      const response = await post(`${UNPUBLISHED_PATH}/agents`, {
        name: 'Mailer',
        description: 'Sends emails',
        instructions: 'Send them.',
        tools: ['send_email'],
        skillIds: [],
        modelProfileId: content.modelProfiles[0].id,
      });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('INVALID_AGENT');
    });

    it("refuses a Skill whose name is not Intentra's", async () => {
      // Act
      const response = await post(`${UNPUBLISHED_PATH}/skills`, {
        name: 'interviewing',
        description: 'When interviewing a person',
        instructions: 'Ask one question at a time.',
      });

      // Assert
      expect(response.status).toBe(HttpStatus.BAD_REQUEST);
      expect(response.body.code).toBe('INVALID_SKILL');
    });
  });

  describe('republishing', () => {
    it('publishes an earlier Agents Version again as the next one', async () => {
      // Arrange
      await createModelProfile('Fast');
      await post(VERSIONS_PATH, {}).expect(HttpStatus.CREATED);

      // Act
      const response = await post(`${VERSIONS_PATH}/1/republish`, {
        note: 'Back to the start',
      });

      // Assert
      expect(response.status).toBe(HttpStatus.CREATED);
      expect(response.body.number).toBe(3);
      const [first, third] = await Promise.all([
        get(`${VERSIONS_PATH}/1`),
        get(`${VERSIONS_PATH}/3`),
      ]);
      expect(third.body.content).toEqual(first.body.content);
      const unpublished = await getUnpublished();
      expect(unpublished).toEqual({
        publishedNumber: 3,
        content: first.body.content,
      });
    });

    it('refuses while the Unpublished Agents hold changes', async () => {
      // Arrange
      await createModelProfile('Fast');
      await post(VERSIONS_PATH, {}).expect(HttpStatus.CREATED);
      await createModelProfile('Smart');

      // Act
      const response = await post(`${VERSIONS_PATH}/1/republish`, {});

      // Assert
      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.code).toBe('UNPUBLISHED_AGENTS_CHANGED');
    });

    it('answers 404 for an Agents Version that does not exist', async () => {
      // Act
      const response = await get(`${VERSIONS_PATH}/42`);

      // Assert
      expect(response.status).toBe(HttpStatus.NOT_FOUND);
      expect(response.body.code).toBe('AGENTS_VERSION_NOT_FOUND');
    });
  });
});

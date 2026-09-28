import { useMutation } from '@apollo/client/react';

import { PROJECTS_QUERY, type Project } from '@/entities/project';
import { describeError } from '@/shared/api';
import type { CreateProjectDto } from '@intentra/contracts/workspace';

import { CREATE_PROJECT_MUTATION } from '../api/create-project.mutation';

const FALLBACK_ERROR = 'Could not create the project';

export const useCreateProject = () => {
  const [mutate, { loading }] = useMutation(CREATE_PROJECT_MUTATION, {
    refetchQueries: [PROJECTS_QUERY],
    awaitRefetchQueries: true,
  });

  const createProject = async (
    input: CreateProjectDto,
  ): Promise<
    { project: Project; error?: never } | { project?: never; error: string }
  > => {
    try {
      const { data } = await mutate({ variables: { input } });
      return data ? { project: data.createProject } : { error: FALLBACK_ERROR };
    } catch (error) {
      return { error: describeError(error, FALLBACK_ERROR) };
    }
  };

  return { createProject, loading };
};

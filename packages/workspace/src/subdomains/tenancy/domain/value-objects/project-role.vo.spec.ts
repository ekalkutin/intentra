import { describe, expect, it } from 'vitest';

import { ProjectRole } from './project-role.vo.js';

describe('ProjectRole', () => {
  it.each([
    [ProjectRole.Maintainer, ProjectRole.Viewer, ProjectRole.Viewer],
    [ProjectRole.Maintainer, ProjectRole.Contributor, ProjectRole.Contributor],
    [ProjectRole.Contributor, ProjectRole.Maintainer, ProjectRole.Contributor],
    [ProjectRole.Viewer, ProjectRole.Maintainer, ProjectRole.Viewer],
    [ProjectRole.Contributor, ProjectRole.Contributor, ProjectRole.Contributor],
  ])('caps %o at %o as %o', (role, cap, expected) => {
    // Act
    const capped = role.atMost(cap);

    // Assert
    expect(capped).toBe(expected);
  });
});

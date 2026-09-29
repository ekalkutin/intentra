import { UnknownProjectRoleException } from '../exceptions/index.js';

/** What a Member may do in one particular Project. */
export class ProjectRole {
  public static readonly Viewer = new ProjectRole('viewer');
  public static readonly Contributor = new ProjectRole('contributor');
  public static readonly Maintainer = new ProjectRole('maintainer');

  static readonly #all: readonly ProjectRole[] = [
    ProjectRole.Viewer,
    ProjectRole.Contributor,
    ProjectRole.Maintainer,
  ];

  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  public static from(value: string): ProjectRole {
    const role = ProjectRole.#all.find(candidate => candidate.value === value);
    if (!role) {
      throw new UnknownProjectRoleException();
    }

    return role;
  }

  public get value(): string {
    return this.#value;
  }

  public equals(other: ProjectRole): boolean {
    return other.value === this.#value;
  }
}

import { UnknownProjectRoleException } from '../exceptions/index.js';

/** What a Member may do in one particular Project; each role allows all the one before it does. */
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

  /** The lower of this and the given role, such as a Member's role capped by their token's level. */
  public atMost(cap: ProjectRole): ProjectRole {
    return ProjectRole.#all.indexOf(cap) < ProjectRole.#all.indexOf(this)
      ? cap
      : this;
  }
}

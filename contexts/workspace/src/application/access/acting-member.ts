import {
  permissionsOf,
  WorkspaceRoles,
  type Permission,
  type Role,
} from '../../subdomains/access/domain/value-objects/index.js';

export type ActingMemberProps = {
  readonly workspaceId: string;
  readonly accountId: string;
  readonly isPlatformAdmin: boolean;
  /** Роли, выданные на самом workspace. */
  readonly workspaceRoles: readonly Role[];
  /** Роли, выданные на отдельных проектах: идентификатор проекта → его роли. */
  readonly projectRoles: ReadonlyMap<string, readonly Role[]>;
};

/**
 * Человек, действующий в этом workspace, со всем, что ему здесь выдано.
 *
 * Отвечает на вопросы, но вердикта не выносит: «можно ли» — дело `AccessPolicy`.
 * Так вопрос «что у него есть» и вопрос «пускать ли» не смешиваются в одном
 * методе, который потом хочется позвать «просто посмотреть».
 */
export class ActingMember {
  readonly #props: ActingMemberProps;
  readonly #workspacePermissions: ReadonlySet<Permission>;
  readonly #projectPermissions: ReadonlyMap<string, ReadonlySet<Permission>>;

  private constructor(props: ActingMemberProps) {
    this.#props = props;
    this.#workspacePermissions = new Set(
      props.workspaceRoles.flatMap(role => [...permissionsOf(role)]),
    );
    this.#projectPermissions = new Map(
      [...props.projectRoles].map(([projectId, roles]) => [
        projectId,
        new Set(roles.flatMap(role => [...permissionsOf(role)])),
      ]),
    );
  }

  get workspaceId(): string {
    return this.#props.workspaceId;
  }

  get accountId(): string {
    return this.#props.accountId;
  }

  /**
   * Владелец workspace и платформенный администратор проходят любую проверку
   * внутри этого workspace. Перечислять владельцу каждое право отдельно значило
   * бы однажды забыть новое и запретить ему то, что по определению можно.
   */
  get isOmnipotent(): boolean {
    return (
      this.#props.isPlatformAdmin ||
      this.#props.workspaceRoles.includes(WorkspaceRoles.Owner)
    );
  }

  public can(permission: Permission): boolean {
    return this.isOmnipotent || this.#workspacePermissions.has(permission);
  }

  /** Право на проекте: выданное на нём самом либо полученное сверху. */
  public canInProject(projectId: string, permission: Permission): boolean {
    return (
      this.isOmnipotent ||
      (this.#projectPermissions.get(projectId)?.has(permission) ?? false)
    );
  }

  /** Проекты, к которым человеку выдан доступ точечно. Для всесильного смысла не имеет: ему доступны все. */
  get reachableProjectIds(): readonly string[] {
    return [...this.#projectPermissions.keys()];
  }

  public static of(props: ActingMemberProps): ActingMember {
    return new ActingMember(props);
  }
}

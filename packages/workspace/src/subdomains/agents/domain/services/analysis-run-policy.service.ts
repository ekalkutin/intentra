import { ProjectRole } from '../../../tenancy/index.js';

export class AnalysisRunPolicyService {
  /** A Contributor or Maintainer starts an Analysis Run over the Unchecked items by hand; a Viewer only reads them. */
  public canStart(projectRole: ProjectRole): boolean {
    return !projectRole.equals(ProjectRole.Viewer);
  }

  /** Only a Maintainer starts one over the whole Project: it reads every item again on the Workspace's Provider Key. */
  public canStartWholeProject(projectRole: ProjectRole): boolean {
    return projectRole.equals(ProjectRole.Maintainer);
  }

  /** Only a Maintainer turns the nightly run on or off: it spends the Workspace's Provider Key unattended. */
  public canChangeSchedule(projectRole: ProjectRole): boolean {
    return projectRole.equals(ProjectRole.Maintainer);
  }
}

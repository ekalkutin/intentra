import { ProjectRole } from '../../../tenancy/index.js';

export class AnalysisRunPolicyService {
  /** A Contributor or Maintainer starts an Analysis Run by hand; a Viewer only reads them. */
  public canStart(projectRole: ProjectRole): boolean {
    return !projectRole.equals(ProjectRole.Viewer);
  }
}

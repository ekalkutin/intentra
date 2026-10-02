import { NotFoundException } from '@intentra/shared-kernel';

export class AnalysisRunNotFoundException extends NotFoundException<'ANALYSIS_RUN_NOT_FOUND'> {
  constructor() {
    super('Analysis Run not found', 'ANALYSIS_RUN_NOT_FOUND');
  }
}

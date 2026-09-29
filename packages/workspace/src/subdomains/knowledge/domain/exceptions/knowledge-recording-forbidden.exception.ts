import { ForbiddenException } from '@intentra/shared-kernel';

export class KnowledgeRecordingForbiddenException extends ForbiddenException<'KNOWLEDGE_RECORDING_FORBIDDEN'> {
  constructor() {
    super(
      'Only a contributor or maintainer of the project can record knowledge',
      'KNOWLEDGE_RECORDING_FORBIDDEN',
    );
  }
}

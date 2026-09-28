import { useCurrentProject } from '@/entities/project';
import { AgentChat } from '@/widgets/agent-chat';
import { PageHeader } from '@/widgets/app-shell';

export const ProjectChatPage = () => {
  const project = useCurrentProject();

  return (
    // One screen high under the top bar: the messages scroll, the composer stays in view.
    <div className='flex h-[calc(100svh-var(--header-height))] min-h-0 flex-col'>
      <PageHeader title='Chat' />
      {/* Another project starts another conversation. */}
      <AgentChat key={project.id} />
    </div>
  );
};

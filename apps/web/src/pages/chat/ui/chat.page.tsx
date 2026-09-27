import { useCurrentWorkspace } from '@/entities/workspace';
import { AgentChat } from '@/widgets/agent-chat';
import { PageHeader } from '@/widgets/app-shell';

export const ChatPage = () => {
  const workspace = useCurrentWorkspace();

  return (
    // One screen high: the messages scroll, the composer stays in view.
    <div className='flex h-svh min-h-0 flex-col'>
      <PageHeader title='Chat' />
      {/* A new workspace starts a new conversation. */}
      <AgentChat key={workspace.id} />
    </div>
  );
};

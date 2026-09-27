import { cn } from '@/shared/lib/utils';

const SIZES = {
  sm: 'size-5 text-caption',
  md: 'size-7 text-caption',
  lg: 'size-9 text-body',
} as const;

type WorkspaceAvatarProps = {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
};

export const WorkspaceAvatar = ({
  name,
  size = 'sm',
  className,
}: WorkspaceAvatarProps) => (
  <span
    aria-hidden
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full border bg-muted font-semibold text-muted-foreground',
      SIZES[size],
      className,
    )}
  >
    {name.charAt(0).toUpperCase()}
  </span>
);

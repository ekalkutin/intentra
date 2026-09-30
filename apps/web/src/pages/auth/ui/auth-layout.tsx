import type { ReactNode } from 'react';

import { ThemeSwitch } from '@/features/switch-theme';
import {
  Brand,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

/** The frame of the sign-in and sign-up pages. */
export function AuthLayout(props: {
  readonly title: string;
  readonly description: string;
  readonly footer: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className='relative flex min-h-svh items-center justify-center bg-muted/40 p-4'>
      <ThemeSwitch className='absolute top-4 right-4' />
      <div className='w-full max-w-sm space-y-6'>
        <Brand />
        <Card>
          <CardHeader>
            <CardTitle>{props.title}</CardTitle>
            <CardDescription>{props.description}</CardDescription>
          </CardHeader>
          <CardContent>{props.children}</CardContent>
          <CardFooter className='justify-center text-sm text-muted-foreground'>
            {props.footer}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

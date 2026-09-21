import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { LanguageSwitch, useDict } from '@/features/language-switch';
import { cn } from '@/shared/lib/utils';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Button } from '@/shared/ui/primitives/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives/card';
import { Field, FieldGroup, FieldLabel } from '@/shared/ui/primitives/field';
import { Input } from '@/shared/ui/primitives/input';

function BrandLockup({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className='flex items-center gap-2.5'>
      <img
        src={
          inverse
            ? '/brand/intentra-logo-dark.svg'
            : '/brand/intentra-logo-light.svg'
        }
        alt=''
        className='size-8 shrink-0 object-contain'
      />
      <span
        className={cn(
          'text-lg leading-none font-semibold tracking-[-0.025em] lowercase sm:text-xl',
          inverse ? 'text-white/92' : 'text-band-ink',
        )}
      >
        intentra
      </span>
    </span>
  );
}

export function SignInPage() {
  const t = useDict();
  const [hasSubmittedCredentials, setHasSubmittedCredentials] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmittedCredentials(true);
  }

  return (
    <main className='grid min-h-dvh bg-background lg:grid-cols-[minmax(20rem,0.9fr)_minmax(34rem,1.1fr)]'>
      <section className='bg-band-deep relative hidden overflow-hidden px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16'>
        <Link
          to='/'
          className='landing-affordance flex w-fit items-center gap-3 rounded-lg text-sm font-medium text-white/78 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/45'
        >
          <BrandLockup inverse />
        </Link>

        <div className='max-w-lg pb-[8vh]'>
          <h1 className='max-w-[13ch] text-[clamp(2.75rem,4.2vw,4.5rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-balance'>
            {t.auth.headline}
          </h1>
          <p className='mt-6 max-w-[42ch] text-lg leading-8 text-white/68'>
            {t.auth.introduction}
          </p>
        </div>

        <p className='text-sm text-white/48'>{t.auth.principle}</p>
      </section>

      <section className='grid min-h-dvh grid-rows-[auto_1fr] px-4 py-5 sm:px-8 sm:py-8 lg:px-12 xl:px-20'>
        <div className='flex items-center justify-between'>
          <Link
            to='/'
            className='landing-affordance flex w-fit items-center gap-2 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
          >
            <ArrowLeft data-icon='inline-start' />
            {t.auth.backToIntentra}
          </Link>
          <LanguageSwitch variant='light' className='shrink-0' />
        </div>

        <div className='mx-auto w-full max-w-md self-center py-12 sm:py-16'>
          <div className='mb-9 lg:hidden'>
            <BrandLockup />
          </div>

          <Card className='[--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(7)]'>
            <CardHeader className='gap-2.5'>
              <CardTitle className='text-2xl leading-tight font-semibold tracking-[-0.025em] sm:text-[1.75rem]'>
                {t.auth.title}
              </CardTitle>
              <CardDescription className='max-w-[36ch] leading-6'>
                {t.auth.description}
              </CardDescription>
            </CardHeader>

            <CardContent className='flex flex-col gap-6'>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor='email'>{t.auth.emailLabel}</FieldLabel>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      autoComplete='email'
                      inputMode='email'
                      placeholder={t.auth.emailPlaceholder}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor='password'>
                      {t.auth.passwordLabel}
                    </FieldLabel>
                    <Input
                      id='password'
                      name='password'
                      type='password'
                      autoComplete='current-password'
                      placeholder={t.auth.passwordPlaceholder}
                      required
                    />
                  </Field>
                  <Button type='submit' size='lg' className='w-full'>
                    {t.auth.continue}
                    <ArrowRight data-icon='inline-end' />
                  </Button>
                  {hasSubmittedCredentials ? (
                    <Alert role='status'>
                      <AlertDescription>{t.auth.unavailable}</AlertDescription>
                    </Alert>
                  ) : null}
                </FieldGroup>
              </form>
              <p className='text-center text-sm leading-6 text-muted-foreground'>
                {t.auth.invitation}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

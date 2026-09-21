import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';

import { LanguageSwitch, useDict } from '@/features/language-switch';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/primitives/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives/card';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/primitives/field';
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
          'landing-serif text-title-lg sm:text-display-sm leading-none tracking-[-0.01em] lowercase',
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
  const [hasRequestedLink, setHasRequestedLink] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasRequestedLink(true);
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

        <div className='max-w-md pb-[8vh]'>
          <h1 className='landing-serif text-[clamp(3.3rem,5vw,5.5rem)] leading-[0.92] tracking-[-0.035em] text-balance'>
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
            <CardHeader className='gap-3'>
              <CardTitle className='landing-serif text-[2.15rem] leading-none tracking-[-0.03em]'>
                {t.auth.title}
              </CardTitle>
              <CardDescription className='max-w-[36ch] leading-6'>
                {t.auth.description}
              </CardDescription>
            </CardHeader>

            <CardContent>
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
                    <FieldDescription>{t.auth.emailHelp}</FieldDescription>
                  </Field>
                  <Button type='submit' size='lg' className='w-full'>
                    {t.auth.continue}
                    <ArrowRight data-icon='inline-end' />
                  </Button>
                  {hasRequestedLink ? (
                    <FieldDescription role='status'>
                      {t.auth.unavailable}
                    </FieldDescription>
                  ) : null}
                </FieldGroup>
              </form>
            </CardContent>

            <CardFooter className='justify-center text-center text-sm leading-6 text-muted-foreground'>
              {t.auth.invitation}
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}

import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

import { LanguageSwitch, useDict } from '@/features/language-switch';
import { cn } from '@/shared/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives/card';

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

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  /** Строка под карточкой: ссылка на вторую форму или примечание. */
  footer?: ReactNode;
};

/**
 * Каркас неаутентифицированных страниц: тёмная полоса с обещанием продукта и
 * карточка с формой.
 *
 * Вынесен из страницы входа, когда рядом появилась регистрация: два экрана с
 * одинаковой рамкой расходятся в вёрстке при первой же правке, если рамка
 * скопирована, а не общая.
 */
export function AuthLayout({ title, description, children, footer }: Props) {
  const t = useDict();

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
                {title}
              </CardTitle>
              <CardDescription className='max-w-[36ch] leading-6'>
                {description}
              </CardDescription>
            </CardHeader>

            <CardContent className='flex flex-col gap-6'>
              {children}
              {footer ? (
                <p className='text-center text-sm leading-6 text-muted-foreground'>
                  {footer}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

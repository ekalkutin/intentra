import { Sparkles } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';

import { useSignInMutation, useSignUpMutation } from '@/api/iam-api';
import { useAppSelector } from '@/app/hooks';
import { ErrorAlert, Spinner } from '@/components/common';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { selectIsSignedIn } from '@/features/auth/auth-slice';

export function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const signedIn = useAppSelector(selectIsSignedIn);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signIn, signInState] = useSignInMutation();
  const [signUp, signUpState] = useSignUpMutation();
  const busy = signInState.isLoading || signUpState.isLoading;
  const error = mode === 'sign-in' ? signInState.error : signUpState.error;

  if (signedIn) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'sign-up') {
        await signUp({ email, password }).unwrap();
        toast.success('Аккаунт создан');
      }
      await signIn({ email, password }).unwrap();
      navigate('/', { replace: true });
    } catch {
      // Shown below from the mutation state.
    }
  };

  return (
    <div className='relative flex min-h-svh items-center justify-center bg-muted/40 p-4'>
      <ThemeToggle className='absolute top-4 right-4' />
      <div className='w-full max-w-sm space-y-6'>
        <div className='flex items-center justify-center gap-2'>
          <div className='flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Sparkles className='size-5' />
          </div>
          <span className='text-xl font-semibold tracking-tight'>Intentra</span>
        </div>
        <Card>
          <form onSubmit={submit}>
            <CardHeader>
              <CardTitle>
                {mode === 'sign-in' ? 'С возвращением' : 'Создайте аккаунт'}
              </CardTitle>
              <CardDescription>
                {mode === 'sign-in'
                  ? 'Войдите в свои пространства.'
                  : 'Живой контекст ваших программных проектов.'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Пароль</Label>
                <Input
                  id='password'
                  type='password'
                  autoComplete={
                    mode === 'sign-in' ? 'current-password' : 'new-password'
                  }
                  minLength={mode === 'sign-up' ? 8 : 1}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                {mode === 'sign-up' && (
                  <p className='text-xs text-muted-foreground'>
                    Не меньше 8 символов.
                  </p>
                )}
              </div>
              <ErrorAlert
                error={error}
                title={
                  mode === 'sign-in'
                    ? 'Не удалось войти'
                    : 'Не удалось зарегистрироваться'
                }
              />
            </CardContent>
            <CardFooter className='flex-col gap-3'>
              <Button type='submit' className='w-full' disabled={busy}>
                {busy && <Spinner />}
                {mode === 'sign-in' ? 'Войти' : 'Создать аккаунт'}
              </Button>
              <p className='text-sm text-muted-foreground'>
                {mode === 'sign-in' ? (
                  <>
                    Нет аккаунта?{' '}
                    <Link to='/sign-up' className='text-foreground underline'>
                      Регистрация
                    </Link>
                  </>
                ) : (
                  <>
                    Уже есть аккаунт?{' '}
                    <Link to='/sign-in' className='text-foreground underline'>
                      Войти
                    </Link>
                  </>
                )}
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

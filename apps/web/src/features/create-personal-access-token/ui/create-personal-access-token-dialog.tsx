import { zodResolver } from '@hookform/resolvers/zod';
import { CheckIcon, CopyIcon, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/shared/ui/input-group';
import { NativeSelect, NativeSelectOption } from '@/shared/ui/native-select';
import { Spinner } from '@/shared/ui/spinner';
import {
  CreatePersonalAccessTokenDtoSchema,
  type CreatePersonalAccessTokenDto,
} from '@intentra/contracts/iam';

import { DEFAULT_EXPIRY_DAYS, EXPIRY_OPTIONS } from '../model/expiry';
import { useCreatePersonalAccessToken } from '../model/use-create-personal-access-token';

const NEVER = '';
const COPIED_MS = 1500;

const TokenSecret = ({ secret }: { secret: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_MS);
  };

  return (
    <div className='flex flex-col gap-3'>
      <Alert>
        <AlertDescription>
          Copy the token now. It is shown only once and cannot be found again.
        </AlertDescription>
      </Alert>
      <InputGroup>
        <InputGroupInput
          value={secret}
          readOnly
          aria-label='Token'
          className='font-mono'
          onFocus={event => event.target.select()}
        />
        <InputGroupAddon align='inline-end'>
          <InputGroupButton onClick={copy} aria-label='Copy token'>
            {copied ? <CheckIcon /> : <CopyIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};

export const CreatePersonalAccessTokenDialog = () => {
  const [open, setOpen] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const { createToken, loading } = useCreatePersonalAccessToken();
  const form = useForm<CreatePersonalAccessTokenDto>({
    resolver: zodResolver(CreatePersonalAccessTokenDtoSchema),
    defaultValues: { name: '', expiresInDays: DEFAULT_EXPIRY_DAYS },
  });

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      form.reset();
      setSecret(null);
    }
  };

  const onSubmit = async (values: CreatePersonalAccessTokenDto) => {
    const result = await createToken(values);
    if (result.error !== undefined) {
      form.setError('root', { message: result.error });
      return;
    }
    setSecret(result.secret);
  };

  const rootError = form.formState.errors.root?.message;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button size='sm' />}>
        <PlusIcon data-icon='inline-start' />
        New token
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {secret ? 'Token created' : 'New personal access token'}
          </DialogTitle>
          <DialogDescription>
            An MCP agent uses the token to act on your behalf.
          </DialogDescription>
        </DialogHeader>
        {secret ? (
          <>
            <TokenSecret secret={secret} />
            <DialogFooter>
              <DialogClose render={<Button />}>Done</DialogClose>
            </DialogFooter>
          </>
        ) : (
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex flex-col gap-6'
          >
            <FieldGroup>
              {rootError ? (
                <Alert variant='destructive'>
                  <AlertDescription>{rootError}</AlertDescription>
                </Alert>
              ) : null}
              <Controller
                name='name'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='token-name'>Name</FieldLabel>
                    <Input
                      {...field}
                      id='token-name'
                      autoFocus
                      autoComplete='off'
                      placeholder='Claude Desktop'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>
                        Tells your tokens apart: name the agent that uses it.
                      </FieldDescription>
                    )}
                  </Field>
                )}
              />
              <Controller
                name='expiresInDays'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor='token-expiry'>Expires in</FieldLabel>
                    <NativeSelect
                      id='token-expiry'
                      className='w-full'
                      value={field.value?.toString() ?? NEVER}
                      onChange={event =>
                        field.onChange(
                          event.target.value === NEVER
                            ? undefined
                            : Number(event.target.value),
                        )
                      }
                    >
                      {EXPIRY_OPTIONS.map(option => (
                        <NativeSelectOption
                          key={option.label}
                          value={option.days?.toString() ?? NEVER}
                        >
                          {option.label}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button variant='outline' />}>
                Cancel
              </DialogClose>
              <Button type='submit' disabled={loading}>
                {loading ? <Spinner data-icon='inline-start' /> : null}
                Create token
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

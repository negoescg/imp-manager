'use client';

import { signOutAction } from '@/server/actions/user.actions';
import { Button } from '../ui/button';
import { useFormStatus } from 'react-dom';

export default function SignOutBtn() {
  return (
    <form action={signOutAction} className="w-full text-left justify-center flex">
      <Btn />
    </form>
  );
}

const Btn = () => {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} variant={'destructive'}>
      Sign{pending ? 'ing' : ''} out
    </Button>
  );
};

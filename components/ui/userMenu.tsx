'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SignOutBtn from '../auth/SignOutBtn';
import { Avatar, AvatarFallback } from './avatar';
import { useSession } from '@/providers/SessionProvider';

export function UserMenu() {
  const { user } = useSession();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="border-border border-2 text-muted-foreground">
              {user?.name
                ? user.name
                    ?.split(' ')
                    .map((word) => word[0].toUpperCase())
                    .join('')
                : '~'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <SignOutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

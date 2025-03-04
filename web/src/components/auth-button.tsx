'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeSwitch } from './theme-switch';

export function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Icons.spinner className="h-4 w-4 animate-spin" />
        <span className="sr-only">Loading...</span>
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => signInWithGoogle()}
        className="flex items-center gap-2"
      >
        <Icons.google className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-6 w-6 cursor-pointer border border-muted-foreground/40 bg-muted-foreground/10">
          <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
          <AvatarFallback>{user.user_metadata.full_name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={10} className="w-64 text-sm">
        <div className="flex items-center justify-start gap-2 p-2 p-2">
          <div className="flex flex-col space-y-2 leading-none">
            {user.user_metadata.full_name && (
              <p className="font-medium text-lg">{user.user_metadata.full_name}</p>
            )}

            <div className="flex items-center gap-2">
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {user.user_metadata.email_verified && (
                <Icons.badgeCheck className="h-4 w-4 text-green-500" />
              )}
              {user.app_metadata.provider === 'google' && (
                <Icons.google className="h-4 w-4 text-muted-foreground" />
              )}
              {user.app_metadata.provider === 'github' && (
                <Icons.github className="h-4 w-4 text-muted-foreground" />
              )}
              {user.app_metadata.provider === 'email' && (
                <Icons.mail className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full p-2 mt-1">
          <Link href="/settings" className="flex w-full items-center gap-2 cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">Theme</div>
          <ThemeSwitch />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full p-2">
          <Link
            href="/docs"
            target="_blank"
            className="flex w-full items-center gap-2 cursor-pointer"
          >
            API Docs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="w-full p-2">
          <Link
            href="https://pages-webshot.tisvc.com/docs"
            target="_blank"
            className="flex w-full items-center gap-2 cursor-pointer"
          >
            Webshot Docs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 justify-between cursor-pointer"
        >
          Sign Out
          <Icons.logout className="h-4 w-4 mr-2" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

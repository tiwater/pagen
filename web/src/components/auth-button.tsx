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
        <span className="sr-only">加载中...</span>
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
        使用 Google 登录
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-7 w-7">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name} />
            <AvatarFallback>
              {user.user_metadata.full_name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.user_metadata.full_name && (
              <p className="font-medium">{user.user_metadata.full_name}</p>
            )}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex w-full items-center gap-2">
            <Icons.settings className="h-4 w-4" />
            设置
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <div className="p-2">
          <ThemeSwitch />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <Icons.logout className="h-4 w-4 mr-2" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

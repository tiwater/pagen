'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

const errorMessages: { [key: string]: string } = {
  default: 'An unexpected error occurred during authentication.',
  'session-missing': 'Login session has expired or does not exist.',
  'no-code': 'No authentication code received. Please login again.',
  unexpected: 'An unexpected error occurred. Please try again.',
  invalid_grant: 'Authentication code has expired or is invalid. Please login again.',
  invalid_request: 'Invalid authentication request. Please login again.',
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('error') || 'default';

  const errorMessage = errorMessages[errorType] || errorMessages.default;

  return (
    <div className="flex items-center justify-center h-[100vh]">
      <Card className="w-[640px]">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Icons.warning className="h-12 w-12 text-destructive" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>
            An error occurred during authentication. Please try again or contact support.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{errorMessage}</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Link href="/auth/login" className={cn(buttonVariants({ variant: 'default' }))}>
            Login Again
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            Back to Home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}

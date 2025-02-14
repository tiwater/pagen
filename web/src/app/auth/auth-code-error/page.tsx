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
  'code-verifier': 'Authentication code verification failed. Please try again.',
  'invalid-state': 'Invalid authentication state. Please try again.',
};

function getErrorMessage(errorParam: string | null): string {
  if (!errorParam) return errorMessages.default;

  // Check if it's a known error type
  if (errorParam in errorMessages) {
    return errorMessages[errorParam];
  }

  // Handle detailed error messages
  const lowerError = errorParam.toLowerCase();
  if (lowerError.includes('code verifier')) {
    return errorMessages['code-verifier'];
  }
  if (lowerError.includes('invalid request')) {
    return errorMessages.invalid_request;
  }
  if (lowerError.includes('invalid grant')) {
    return errorMessages.invalid_grant;
  }
  if (lowerError.includes('state')) {
    return errorMessages['invalid-state'];
  }

  // If it's a detailed error message, use it directly but clean it up
  return errorParam
    .replace(/^invalid request: /i, '')
    .replace(/^invalid grant: /i, '')
    .split('_')
    .join(' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const errorMessage = getErrorMessage(errorParam);

  return (
    <div className="flex items-center justify-center h-[100vh]">
      <Card className="w-[640px] mx-4">
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
          {errorParam && (
            <p className="mt-2 text-xs text-muted-foreground">Error code: {errorParam}</p>
          )}
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

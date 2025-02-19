'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { GradientButton } from '@/components/ui/gradient-button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Suspense } from 'react';

const otpSchema = z.object({
  code: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpFormValues = z.infer<typeof otpSchema>;

function VerifyEmailContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = searchParams.get('email');

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: '',
    },
  });

  useEffect(() => {
    if (!email) {
      router.push('/auth/signup');
    }
  }, [email, router]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const onSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: data.code }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      toast({
        title: 'Success!',
        description: 'Your email has been verified successfully.',
      });

      // Redirect to login page with success message
      router.push('/auth/login?verified=true');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to verify email',
      });
      form.setError('code', {
        type: 'manual',
        message: error.message || 'Invalid verification code. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      toast({
        title: 'Code Sent!',
        description: 'A new verification code has been sent to your email.',
      });

      // Reset countdown and disable resend button
      setResendDisabled(true);
      setCountdown(30);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to resend verification code',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-black_main">
      {/* Left Side - Verification Form */}
      <div className="flex w-1/2 flex-col justify-center px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">
              Verify your email
            </h1>
            <p className="text-light_grey">
              We've sent a verification code to{' '}
              <span className="text-white">{email}</span>
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Verification Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="text-center text-lg tracking-[0.5em]"
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <GradientButton
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying...</span>
                    </div>
                  ) : (
                    'Verify Email'
                  )}
                </GradientButton>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendDisabled || isLoading}
                  className={`w-full text-sm ${
                    resendDisabled
                      ? 'text-light_grey'
                      : 'main-gradient-text hover:opacity-80 transition-opacity'
                  }`}
                >
                  {resendDisabled
                    ? `Resend code in ${countdown}s`
                    : 'Resend verification code'}
                </button>
              </div>
            </form>
          </Form>

          <div className="text-center">
            <Link
              href="/auth/signup"
              className="text-sm text-light_grey hover:text-white transition-colors"
            >
              ← Back to signup
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="relative w-1/2">
        <Image
          src="/desert_img_01.png"
          alt="Authentication background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black_main to-transparent" />
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
